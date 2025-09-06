import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { requireAuth, respondSuccess, respondError } from '~/server/utils/auth'

// Endpoint para que un rol 'user' cree pedidos con sus ofertas asignadas
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

    const body = await readBody<any>(event)

    if (!body.customer_id || !body.order_items || body.order_items.length === 0) {
      return respondError('El cliente y al menos un item son requeridos')
    }

    // Verificar que el usuario autenticado es rol 'user'
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, role, is_active')
      .eq('id', authUser.id)
      .single()

    if (profileError || !profile) return respondError('Perfil no encontrado')
    if ((profile as any).role !== 'user') return respondError('Solo usuarios con rol user pueden crear aquí')
    if ((profile as any).is_active === false) return respondError('Usuario inactivo')

    // Verificar cliente
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('id_customer, is_active')
      .eq('id_customer', body.customer_id)
      .single()
    if (customerError || !customer) return respondError('Cliente no encontrado')
    if ((customer as any).is_active === false) return respondError('El cliente está inactivo')

    // Calcular totales con aplicación de ofertas del usuario si existen
    let subtotal = 0
    const orderItems: Array<{ product_id: string; quantity: number; unit_price: number; total_price: number }> = []

    // Pre-cargar ofertas globales activas y vigentes
    const nowIso = new Date().toISOString()
    const { data: offers } = await supabase
      .from('offers')
      .select('product_id, discount_percent, is_active, valid_from, valid_to')
      .eq('is_active', true)

    const offerMap = new Map<string, number>()
    for (const o of ((offers as Array<{ product_id: string; discount_percent: number; valid_from: string | null; valid_to: string | null }>) || [])) {
      const validFromOk = !o.valid_from || (o.valid_from <= nowIso)
      const validToOk = !o.valid_to || (o.valid_to >= nowIso)
      if (validFromOk && validToOk) {
        offerMap.set(o.product_id, Number(o.discount_percent))
      }
    }

    for (const item of body.order_items as any[]) {
      if (!item.product_id || !item.quantity) {
        return respondError('Todos los items deben tener product_id y quantity')
      }
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('id_product, name, stock_quantity, price')
        .eq('id_product', item.product_id)
        .single()
      if (productError || !product) return respondError(`Producto ${item.product_id} no encontrado`)
      if ((product as any).stock_quantity < item.quantity) {
        return respondError(`Stock insuficiente para ${(product as any).name}. Disponible: ${(product as any).stock_quantity}, Solicitado: ${item.quantity}`)
      }

      const basePrice = Number((product as any).price)
      const discount = offerMap.get(item.product_id) || 0
      const unitPrice = Math.round(basePrice * (1 - discount / 100) * 100) / 100
      const totalPrice = Number(item.quantity) * unitPrice
      subtotal += totalPrice

      orderItems.push({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: unitPrice,
        total_price: totalPrice
      })
    }

    const taxAmount = body.tax_amount || 0
    const shippingAmount = body.shipping_amount || 0
    const totalAmount = subtotal + taxAmount + shippingAmount

    const newOrder: any = {
      customer_id: body.customer_id,
      total_amount: totalAmount,
      subtotal: subtotal,
      tax_amount: taxAmount,
      shipping_amount: shippingAmount,
      status: 'pending',
      shipping_address: body.shipping_address || null,
      billing_address: body.billing_address || null,
      payment_method: body.payment_method || null,
      payment_status: 'pending',
      tracking_number: null,
      notes: body.notes || null,
      order_source: 'user',
      assigned_user_id: authUser.id
    }

    const orderRes = await (supabase as any)
      .from('orders')
      .insert(newOrder)
      .select()
      .single()
    const orderData = (orderRes as any).data
    const orderError = (orderRes as any).error
    if (orderError) return respondError('Error creando pedido', orderError.message)

    const orderItemsWithOrderId = orderItems.map(i => ({ ...i, order_id: orderData.id_order }))
    const { error: itemsError } = await (supabase as any)
      .from('order_items')
      .insert(orderItemsWithOrderId)
    if (itemsError) {
      await supabase.from('orders').delete().eq('id_order', orderData.id_order)
      return respondError('Error creando items del pedido', itemsError.message)
    }

    // Actualizar stock de productos
    for (const item of orderItems) {
      // No usar .raw; calcular stock de forma segura
      const { data: p } = await supabase
        .from('products')
        .select('stock_quantity')
        .eq('id_product', item.product_id)
        .single()
      const newStock = Math.max(0, (p as any).stock_quantity - item.quantity)
      const { error: stockError } = await (supabase
        .from('products') as any)
        .update({ stock_quantity: newStock, updated_at: new Date().toISOString() })
        .eq('id_product', item.product_id)
      if (stockError) console.error('Error actualizando stock:', stockError)
    }

    return respondSuccess(orderData, 'Pedido creado exitosamente')
  } catch (error) {
    console.error('Error en POST /api/orders/create-from-user:', error)
    return respondError('Error interno del servidor')
  }
})


