import { serverSupabaseClient } from '#supabase/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdmin, respondSuccess, respondError } from '~/server/utils/auth'

type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'

interface OrderCustomer {
  id_customer: string
  first_name: string
  last_name: string
  email: string
  phone: string
}

interface OrderItemWithProduct {
  id_order_item: string
  quantity: number
  unit_price: number
  total_price: number
  product: {
    id_product: string
    name: string
    sku: string
    image_url: string
  }
}

interface OrderRow {
  id_order: string
  status: OrderStatus
  total_amount: number | null
  subtotal: number | null
  customer?: OrderCustomer | null
  order_items?: OrderItemWithProduct[] | null
}

export default defineEventHandler(async (event) => {
  const method = getMethod(event)
  const supabase = await serverSupabaseClient(event)

  if (method === 'GET') {
    try {
      // Solo admins y usar service role para evitar bloqueos por RLS en joins
      await requireAdmin(event)
      const config = useRuntimeConfig()
      const adminClient = createClient(
        config.public.supabaseUrl,
        config.supabaseServiceKey,
        { auth: { persistSession: false } }
      ) as any

      // Obtener todos los pedidos con información relacionada
      const { data: orders, error } = await adminClient
        .from('orders')
        .select(`
          *,
          customer:customers(
            id_customer,
            first_name,
            last_name,
            email,
            phone
          ),
          order_items:order_items(
            id_order_item,
            quantity,
            unit_price,
            total_price,
            product:products(
              id_product,
              name,
              sku,
              image_url,
              price
            )
          )
        `)
        .order('created_at', { ascending: false })
        .limit(500)

      if (error) {
        console.error('Error obteniendo pedidos:', error)
        return {
          data: {
            success: false,
            error: 'Error obteniendo pedidos',
            details: error.message
          }
        }
      }

      // Procesar los pedidos para incluir información adicional
      const processedOrders = (orders as unknown as OrderRow[]).map(order => ({
        ...(order as any),
        customer_name: order.customer ? `${order.customer.first_name} ${order.customer.last_name}` : 'Cliente no encontrado',
        customer_email: order.customer?.email || 'N/A',
        customer_phone: order.customer?.phone || 'N/A',
        items_count: (order.order_items || []).reduce((n, it: any) => n + Number(it.quantity || 0), 0),
        total_amount: Number(order.total_amount || (order.order_items || []).reduce((s, it: any) => s + Number(it.total_price || (Number(it.quantity || 0) * Number(it.unit_price || 0))), 0)),
        subtotal: Number(order.subtotal || 0)
      }))

      return respondSuccess(processedOrders)

    } catch (error) {
      console.error('Error en GET /api/orders:', error)
      return respondError('Error interno del servidor')
    }
  }

  if (method === 'POST') {
    try {
      await requireAdmin(event)
      const body = await readBody<any>(event)
      
      // Validar campos requeridos
      if (!body.customer_id || !body.order_items || body.order_items.length === 0) {
        return respondError('El cliente y al menos un item son requeridos')
      }

      // Verificar que el cliente existe
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .select('id_customer, is_active')
        .eq('id_customer', body.customer_id)
        .single()

      if (customerError || !customer) {
        return respondError('Cliente no encontrado')
      }

      if (!(customer as any).is_active) {
        return respondError('El cliente está inactivo')
      }

      // Calcular totales
      let subtotal = 0
      const orderItems: Array<{ product_id: string; quantity: number; unit_price: number; total_price: number }> = []

      for (const item of body.order_items as any[]) {
        if (!item.product_id || !item.quantity || !item.unit_price) {
          return respondError('Todos los items deben tener product_id, quantity y unit_price')
        }

        // Verificar que el producto existe y tiene stock
        const { data: product, error: productError } = await supabase
          .from('products')
          .select('id_product, name, stock_quantity, price')
          .eq('id_product', item.product_id)
          .single()

        if (productError || !product) {
          return respondError(`Producto ${item.product_id} no encontrado`)
        }

        if ((product as any).stock_quantity < item.quantity) {
          return respondError(`Stock insuficiente para ${(product as any).name}. Disponible: ${(product as any).stock_quantity}, Solicitado: ${item.quantity}`)
        }

        const totalPrice = Number(item.quantity) * Number(item.unit_price)
        subtotal += totalPrice

        orderItems.push({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: totalPrice
        })
      }

      // Calcular totales finales
      const taxAmount = body.tax_amount || 0
      const shippingAmount = body.shipping_amount || 0
      const totalAmount = subtotal + taxAmount + shippingAmount

      // Crear el pedido (admin origin)
      const newOrder: any = {
        customer_id: body.customer_id,
        total_amount: totalAmount,
        subtotal: subtotal,
        tax_amount: taxAmount,
        shipping_amount: shippingAmount,
        status: body.status || 'pending',
        shipping_address: body.shipping_address || null,
        billing_address: body.billing_address || null,
        payment_method: body.payment_method || null,
        payment_status: body.payment_status || 'pending',
        tracking_number: body.tracking_number || null,
        notes: body.notes || null,
        order_source: 'admin',
        assigned_user_id: body.assigned_user_id || null
      }

      const orderRes = await (supabase as any)
        .from('orders')
        .insert(newOrder)
        .select()
        .single()
      const orderData = (orderRes as any).data
      const orderError = (orderRes as any).error

      if (orderError) {
        console.error('Error creando pedido:', orderError)
        return respondError('Error creando pedido', orderError.message)
      }

      // Crear los items del pedido
      const orderItemsWithOrderId = orderItems.map(item => ({
        ...item,
        order_id: orderData.id_order
      }))

      const { error: itemsError } = await (supabase as any)
        .from('order_items')
        .insert(orderItemsWithOrderId)

      if (itemsError) {
        console.error('Error creando items del pedido:', itemsError)
        // Intentar eliminar el pedido si falla la creación de items
        await supabase.from('orders').delete().eq('id_order', orderData.id_order)
        return respondError('Error creando items del pedido', itemsError.message)
      }

      // Actualizar stock de productos
      for (const item of orderItems) {
        const { error: stockError } = await (supabase as any)
          .from('products')
          .update({ 
            stock_quantity: (supabase as any).raw(`stock_quantity - ${item.quantity}`),
            updated_at: new Date().toISOString()
          })
          .eq('id_product', item.product_id)

        if (stockError) {
          console.error('Error actualizando stock:', stockError)
        }
      }

      // Obtener el pedido completo con items para retornar
      const { data: completeOrder, error: fetchError } = await supabase
        .from('orders')
        .select(`
          *,
          customer:customers(
            id_customer,
            first_name,
            last_name,
            email,
            phone
          ),
          order_items:order_items(
            id_order_item,
            quantity,
            unit_price,
            total_price,
            product:products(
              id_product,
              name,
              sku,
              image_url
            )
          )
        `)
        .eq('id_order', orderData.id_order)
        .single()

      if (fetchError) {
        console.error('Error obteniendo pedido completo:', fetchError)
      }

      return respondSuccess(completeOrder || orderData, 'Pedido creado exitosamente')

    } catch (error) {
      console.error('Error en POST /api/orders:', error)
      return respondError('Error interno del servidor')
    }
  }

  return respondError('Método no permitido')
})
