import { serverSupabaseClient } from '#supabase/server'
import { requireAdmin, respondSuccess, respondError } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const method = getMethod(event)
  const supabase = await serverSupabaseClient(event)
  if (method !== 'GET') return respondError('Método no permitido')

  try {
    await requireAdmin(event)
    const sevenDaysAgoIso = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

    const { count: totalProducts, error: totalError } = await supabase
      .from('products')
      .select('id_product', { count: 'exact', head: true })
    if (totalError) return respondError('Error obteniendo productos', totalError.message)

    const { count: newProducts, error: newError } = await supabase
      .from('products')
      .select('id_product', { count: 'exact', head: true })
      .gte('created_at', sevenDaysAgoIso)
    if (newError) return respondError('Error obteniendo productos nuevos', newError.message)

    return respondSuccess({ totalProducts: totalProducts || 0, newProducts: newProducts || 0 })
  } catch (e) {
    console.error('GET /api/products/stats error:', e)
    return respondError('Error interno del servidor')
  }
})


