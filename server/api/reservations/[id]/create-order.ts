import { serverSupabaseClient } from '#supabase/server'
import { requireAdmin, respondError, respondSuccess } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const method = getMethod(event)
  const supabase = await serverSupabaseClient(event)
  const id = getRouterParam(event, 'id')
  if (method !== 'POST') return respondError('Método no permitido')
  if (!id) return respondError('ID de reserva requerido')

  try {
    await requireAdmin(event)

    // Obtener reserva con user y product
    const res = await supabase
      .from('reservations')
      .select(`
        *,
        user:profiles(id, email, first_name, last_name, is_active),
        product:products(id_product, name, price, sku)
      `)
      .eq('id_reservation', id)
      .single()
    const reservationError = (res as any).error
    const reservation = (res as any).data as any
    if (reservationError || !reservation) return respondError('Reserva no encontrada')
    if (reservation.status !== 'pending') return respondError('La reserva no está pendiente')

    // Buscar o crear customer por user_id
    const customerRes = await supabase
      .from('customers')
      .select('id_customer')
      .eq('user_id', reservation.user_id)
      .single()
    let customerId = (customerRes as any).data?.id_customer as string | undefined
    if (!(customerRes as any).data || (customerRes as any).error) {
      const profile = reservation.user
      const createCust = await (supabase as any)
        .from('customers')
        .insert({
          user_id: reservation.user_id,
          first_name: profile?.first_name || 'Cliente',
          last_name: profile?.last_name || 'N/A',
          email: profile?.email || null,
          is_active: true
        })
        .select('id_customer')
        .single()
      if ((createCust as any).error) return respondError('Error creando cliente')
      customerId = (createCust as any).data.id_customer
    }

    if (!customerId) return respondError('No fue posible obtener/crear el cliente')

    // Crear pedido pendiente (no descuenta stock)
    const quantity = Number(reservation.quantity)
    const unitPrice = Number(reservation.product?.price || 0)
    const subtotal = unitPrice * quantity
    const newOrder: any = {
      customer_id: customerId,
      total_amount: subtotal,
      subtotal,
      tax_amount: 0,
      shipping_amount: 0,
      status: 'pending',
      shipping_address: null,
      billing_address: null,
      payment_method: null,
      payment_status: 'pending',
      tracking_number: null,
      notes: `Creado desde reserva ${id}`,
      order_source: 'admin',
      assigned_user_id: null
    }

    const orderRes = await (supabase as any)
      .from('orders')
      .insert(newOrder)
      .select()
      .single()
    if ((orderRes as any).error) return respondError('Error creando pedido', (orderRes as any).error.message)
    const orderData = (orderRes as any).data

    const item = {
      order_id: orderData.id_order,
      product_id: reservation.product_id,
      quantity,
      unit_price: unitPrice,
      total_price: unitPrice * quantity
    }
    const itemsRes = await (supabase as any)
      .from('order_items')
      .insert(item)
    if ((itemsRes as any).error) {
      await supabase.from('orders').delete().eq('id_order', orderData.id_order)
      return respondError('Error creando items del pedido', (itemsRes as any).error.message)
    }

    // Marcar reserva como convertida
    await (supabase as any)
      .from('reservations')
      .update({ status: 'converted', updated_at: new Date().toISOString() })
      .eq('id_reservation', id)

    return respondSuccess(orderData, 'Pedido creado desde reserva')
  } catch (e) {
    console.error('Error en POST /api/reservations/[id]/create-order:', e)
    return respondError('Error interno del servidor')
  }
})






