import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { requireAuth, respondSuccess, respondError } from '~/server/utils/auth'
import { MercadoPagoConfig, Preference } from 'mercadopago'

// Configurar MercadoPago
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || 'TEST-...',
  options: { timeout: 5000 }
})

const preference = new Preference(client)

export default defineEventHandler(async (event) => {
  const method = getMethod(event)
  const supabase = await serverSupabaseClient(event)

  if (method !== 'POST') {
    return respondError('Método no permitido')
  }

  try {
    await requireAuth(event)
    const authUser = await serverSupabaseUser(event)
    if (!authUser) return respondError('No autenticado')

    const body = await readBody<{
      customer_id: string
      order_items: Array<{ product_id: string; quantity: number; unit_price: number; name: string }>
      tax_amount?: number
      shipping_amount?: number
      shipping_address?: any
      customer_info?: any
    }>(event)

    if (!body.customer_id || !body.order_items || body.order_items.length === 0) {
      return respondError('El cliente y al menos un item son requeridos')
    }

    // Verificar que el perfil es 'customer' o 'user'
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, role, is_active')
      .eq('id', authUser.id)
      .single()
    if (profileError || !profile) return respondError('Perfil no encontrado')
    if (!['customer', 'user'].includes((profile as any).role)) return respondError('Solo clientes o usuarios pueden crear pedidos')
    if ((profile as any).is_active === false) return respondError('Usuario inactivo')

    // Verificar cliente
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('id_customer, name, email, phone, is_active')
      .eq('id_customer', body.customer_id)
      .single()
    if (customerError || !customer) return respondError('Cliente no encontrado')
    if ((customer as any).is_active === false) return respondError('El cliente está inactivo')

    // Calcular totales y validar productos
    let subtotal = 0
    const items: any[] = []

    for (const item of body.order_items) {
      if (!item.product_id || !item.quantity) {
        return respondError('Todos los items deben tener product_id y quantity')
      }

      const { data: product, error: productError } = await supabase
        .from('products')
        .select('id_product, name, stock_quantity, price, image_url')
        .eq('id_product', item.product_id)
        .single()
      
      if (productError || !product) return respondError(`Producto ${item.product_id} no encontrado`)
      if ((product as any).stock_quantity < item.quantity) {
        return respondError(`Stock insuficiente para ${(product as any).name}. Disponible: ${(product as any).stock_quantity}, Solicitado: ${item.quantity}`)
      }

      const unitPrice = Number((product as any).price)
      const totalPrice = Number(item.quantity) * unitPrice
      subtotal += totalPrice

      // Agregar item a MercadoPago
      items.push({
        id: item.product_id,
        title: (product as any).name,
        description: `SKU: ${(product as any).sku || item.product_id}`,
        category_id: "fashion",
        quantity: item.quantity,
        currency_id: "COP",
        unit_price: unitPrice,
        picture_url: (product as any).image_url || undefined
      })
    }

    const taxAmount = body.tax_amount || 0
    const shippingAmount = body.shipping_amount || 0
    const totalAmount = subtotal + taxAmount + shippingAmount

    // Crear el pedido en la base de datos primero
    const newOrder: any = {
      customer_id: body.customer_id,
      total_amount: totalAmount,
      subtotal: subtotal,
      tax_amount: taxAmount,
      shipping_amount: shippingAmount,
      status: 'pending',
      shipping_address: body.shipping_address || null,
      billing_address: body.shipping_address || null,
      payment_method: 'mercadopago',
      payment_status: 'pending',
      tracking_number: null,
      notes: 'Pago pendiente con MercadoPago',
      order_source: 'customer',
      assigned_user_id: null
    }

    const orderRes = await (supabase as any)
      .from('orders')
      .insert(newOrder)
      .select()
      .single()
    const orderData = (orderRes as any).data
    const orderError = (orderRes as any).error
    if (orderError) return respondError('Error creando pedido', orderError.message)

    // Crear items del pedido
    const orderItems = body.order_items.map(i => ({ 
      product_id: i.product_id, 
      quantity: i.quantity, 
      unit_price: i.unit_price,
      total_price: i.quantity * i.unit_price,
      order_id: orderData.id_order 
    }))
    
    const { error: itemsError } = await (supabase as any)
      .from('order_items')
      .insert(orderItems)
    if (itemsError) {
      await supabase.from('orders').delete().eq('id_order', orderData.id_order)
      return respondError('Error creando items del pedido', itemsError.message)
    }

    // Crear preferencia de pago en MercadoPago
    const preferenceData = {
      items: items,
      payer: {
        name: (customer as any).name || 'Cliente',
        email: (customer as any).email || authUser.email || '',
        phone: {
          number: (customer as any).phone || ''
        }
      },
      back_urls: {
        success: `${process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/checkout/success?order_id=${orderData.id_order}`,
        failure: `${process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/shop/cart?error=payment_failed`,
        pending: `${process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/checkout/pending?order_id=${orderData.id_order}`
      },
      auto_return: 'approved',
      notification_url: `${process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/mercadopago/webhook`,
      external_reference: orderData.id_order,
      metadata: {
        order_id: orderData.id_order,
        customer_id: body.customer_id
      }
    }

    const preferenceResult = await preference.create({ body: preferenceData })

    // Actualizar el pedido con el preference_id
    await (supabase as any)
      .from('orders')
      .update({ 
        payment_reference: preferenceResult.id,
        notes: `MercadoPago Preference: ${preferenceResult.id}` 
      })
      .eq('id_order', orderData.id_order)

    return respondSuccess({
      preference_id: preferenceResult.id,
      init_point: preferenceResult.init_point,
      sandbox_init_point: preferenceResult.sandbox_init_point,
      order_id: orderData.id_order
    }, 'Preferencia de pago creada exitosamente')

  } catch (error: any) {
    console.error('Error en POST /api/mercadopago/create-preference:', error)
    return respondError('Error interno del servidor', error.message || 'Error desconocido')
  }
})

