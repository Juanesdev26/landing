import { serverSupabaseClient } from '#supabase/server'
import { requireAdmin, respondSuccess, respondError } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const method = getMethod(event)
  const supabase = await serverSupabaseClient(event)
  if (method !== 'GET') return respondError('Método no permitido')

  try {
    await requireAdmin(event)
    // últimas 10 órdenes
    const { data, error } = await supabase
      .from('orders')
      .select('id_order, total_amount, status, created_at, customer:customers(first_name, last_name)')
      .order('created_at', { ascending: false })
      .limit(10)
    if (error) return respondError('Error obteniendo actividad', error.message)

    const activity = (data || []).map((o: any) => ({
      type: 'order',
      title: 'Nueva orden recibida',
      description: `Orden #${o.id_order} por $${o.total_amount}`,
      time: o.created_at,
      status: o.status,
      customer: o.customer ? `${o.customer.first_name} ${o.customer.last_name}` : null
    }))

    return respondSuccess(activity)
  } catch (e) {
    console.error('GET /api/orders/recent error:', e)
    return respondError('Error interno del servidor')
  }
})


