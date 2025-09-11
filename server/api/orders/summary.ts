import { createClient } from '@supabase/supabase-js'
import { requireAdmin, respondError, respondSuccess } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const method = getMethod(event)
  if (method !== 'GET') return respondError('Método no permitido')

  try {
    await requireAdmin(event)

    // Usar service role para contar sin restricciones de RLS
    const config = useRuntimeConfig()
    const admin = createClient(
      config.public.supabaseUrl,
      config.supabaseServiceKey,
      { auth: { persistSession: false } }
    ) as any

    const [
      { count: total },
      { count: pending },
      { count: delivered },
      { count: cancelled },
      { count: paid },
      { count: pendingReservations },
      { count: cancelledReservations }
    ] = await Promise.all([
      admin.from('orders').select('id_order', { count: 'exact', head: true }),
      admin.from('orders').select('id_order', { count: 'exact', head: true }).eq('status', 'pending'),
      admin.from('orders').select('id_order', { count: 'exact', head: true }).eq('status', 'delivered'),
      admin.from('orders').select('id_order', { count: 'exact', head: true }).eq('status', 'cancelled'),
      admin.from('orders').select('id_order', { count: 'exact', head: true }).eq('payment_status', 'paid'),
      admin.from('reservations').select('id_reservation', { count: 'exact', head: true }).eq('status', 'pending'),
      admin.from('reservations').select('id_reservation', { count: 'exact', head: true }).eq('status', 'cancelled')
    ])

    const totalOrders = total || 0
    const pendingOrders = pending || 0
    const deliveredOrders = delivered || 0
    const cancelledOrders = cancelled || 0
    const paidOrders = paid || 0
    const pendingRes = pendingReservations || 0
    const cancelledRes = cancelledReservations || 0

    // Métrica combinada para tarjetas del listado (incluye reservas pendientes como pedidos en espera)
    return respondSuccess({
      total: totalOrders + pendingRes,
      pending: pendingOrders + pendingRes,
      delivered: deliveredOrders,
      cancelled: cancelledOrders + cancelledRes,
      paid: paidOrders
    })
  } catch (e) {
    console.error('GET /api/orders/summary error:', e)
    return respondError('Error interno del servidor')
  }
})


