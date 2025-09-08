import { serverSupabaseClient } from '#supabase/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdmin, respondError, respondSuccess } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const method = getMethod(event)
  const supabase = await serverSupabaseClient(event)
  const id = getRouterParam(event, 'id')
  if (method !== 'POST') return respondError('Método no permitido')
  if (!id) return respondError('ID de reserva requerido')

  try {
    await requireAdmin(event)
    // Service client to bypass RLS when creating customers/orders for other users
    const config = useRuntimeConfig()
    const adminClient = createClient(
      config.public.supabaseUrl,
      config.supabaseServiceKey,
      { auth: { persistSession: false } }
    ) as any

    // Obtener reserva
    const res = await supabase
      .from('reservations')
      .select(`*, user:profiles(id, email, first_name, last_name), product:products(id_product, name, price, sku, stock_quantity)`) 
      .eq('id_reservation', id)
      .single()
    const reservationError = (res as any).error
    const reservation = (res as any).data as any
    if (reservationError || !reservation) return respondError('Reserva no encontrada')
    if (reservation.status !== 'pending') return respondError('La reserva no está pendiente')

    const quantity = Number(reservation.quantity)
    const unitPrice = Number(reservation.product?.price || 0)

    // Verificar stock
    if (Number(reservation.product?.stock_quantity || 0) < quantity) {
      return respondError('Stock insuficiente para aprobar el pedido')
    }

    // Obtener o crear customer por user_id
    const customerRes = await adminClient
      .from('customers')
      .select('id_customer')
      .eq('user_id', reservation.user_id)
      .single()
    let customerId = (customerRes as any).data?.id_customer as string | undefined
    if (!(customerRes as any).data || (customerRes as any).error) {
      const profile = reservation.user
      const safeEmail = (profile?.email || 'no-email@local')
      // 1) intentar vincular por email si ya existe
      const existingByEmail = await adminClient
        .from('customers')
        .select('id_customer')
        .eq('email', safeEmail)
        .single()
      const existingEmailErr = (existingByEmail as any).error
      const existingEmail = (existingByEmail as any).data as any
      if (existingEmail && !existingEmailErr) {
        const upd = await adminClient
          .from('customers')
          .update({ user_id: reservation.user_id, is_active: true, updated_at: new Date().toISOString() })
          .eq('id_customer', existingEmail.id_customer)
          .select('id_customer')
          .single()
        if ((upd as any).error) return respondError('Error vinculando cliente', (upd as any).error.message)
        customerId = (upd as any).data.id_customer
      } else {
        // 2) crear nuevo
        const createCust = await adminClient
          .from('customers')
          .insert({
            user_id: reservation.user_id,
            first_name: profile?.first_name || 'Cliente',
            last_name: profile?.last_name || 'N/A',
            email: safeEmail,
            is_active: true
          })
          .select('id_customer')
          .single()
        if ((createCust as any).error) return respondError('Error creando cliente', (createCust as any).error.message)
        customerId = (createCust as any).data.id_customer
      }
    }
    if (!customerId) return respondError('No fue posible obtener/crear el cliente')

    const subtotal = unitPrice * quantity
    const newOrder: any = {
      customer_id: customerId,
      total_amount: subtotal,
      subtotal,
      tax_amount: 0,
      shipping_amount: 0,
      status: 'confirmed',
      shipping_address: null,
      billing_address: null,
      payment_method: null,
      payment_status: 'paid',
      tracking_number: null,
      notes: `Aprobado desde reserva ${id}`,
      order_source: 'admin',
      assigned_user_id: null
    }

    // Crear pedido
    const orderRes = await adminClient
      .from('orders')
      .insert(newOrder)
      .select()
      .single()
    if ((orderRes as any).error) return respondError('Error creando pedido', (orderRes as any).error.message)
    const orderData = (orderRes as any).data

    // Crear item
    const item = {
      order_id: orderData.id_order,
      product_id: reservation.product_id,
      quantity,
      unit_price: unitPrice,
      total_price: unitPrice * quantity
    }
    const itemsRes = await adminClient
      .from('order_items')
      .insert(item)
    if ((itemsRes as any).error) {
      await supabase.from('orders').delete().eq('id_order', orderData.id_order)
      return respondError('Error creando items del pedido', (itemsRes as any).error.message)
    }

    // Descontar stock via RPC
    const rpcRes = await adminClient.rpc('adjust_product_stock', { p_id_product: reservation.product_id, p_delta: -Number(quantity) })
    const stockError = (rpcRes as any).error
    if (stockError) console.error('Error descontando stock via RPC:', stockError)

    // Marcar reserva convertida
    await adminClient
      .from('reservations')
      .update({ status: 'converted', updated_at: new Date().toISOString() })
      .eq('id_reservation', id)

    return respondSuccess(orderData, 'Pedido aprobado desde reserva')
  } catch (e) {
    console.error('Error en POST /api/reservations/[id]/approve:', e)
    return respondError('Error interno del servidor')
  }
})


