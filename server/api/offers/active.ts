import { serverSupabaseClient } from '#supabase/server'
import { respondSuccess, respondError } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const method = getMethod(event)
  const supabase = await serverSupabaseClient(event)
  if (method !== 'GET') return respondError('Método no permitido')

  try {
    const nowIso = new Date().toISOString()
    const { data, error } = await supabase
      .from('offers')
      .select(`
        *,
        product:products(id_product, name, sku, price, image_url)
      `)
      .eq('is_active', true)
      .or(`valid_from.is.null,valid_from.lte.${nowIso}`)
      .or(`valid_to.is.null,valid_to.gte.${nowIso}`)
    if (error) return respondError('Error obteniendo ofertas', error.message)
    return respondSuccess(data)
  } catch (e) {
    console.error('GET /api/offers/active error:', e)
    return respondError('Error interno del servidor')
  }
})



