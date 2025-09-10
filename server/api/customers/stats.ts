import { serverSupabaseClient } from '#supabase/server'
import { requireAdmin, respondSuccess, respondError } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const method = getMethod(event)
  const supabase = await serverSupabaseClient(event)
  if (method !== 'GET') return respondError('Método no permitido')

  try {
    await requireAdmin(event)
    const { count: totalCustomers, error: customersError } = await supabase
      .from('customers')
      .select('id_customer', { count: 'exact', head: true })
    if (customersError) return respondError('Error obteniendo clientes', customersError.message)

    // últimos 10 clientes
    const { data: recentCustomers, error: recentError } = await supabase
      .from('customers')
      .select('id_customer, first_name, last_name, email, created_at')
      .order('created_at', { ascending: false })
      .limit(10)
    if (recentError) return respondError('Error obteniendo clientes recientes', recentError.message)

    return respondSuccess({ totalCustomers: totalCustomers || 0, recentCustomers })
  } catch (e) {
    console.error('GET /api/customers/stats error:', e)
    return respondError('Error interno del servidor')
  }
})


