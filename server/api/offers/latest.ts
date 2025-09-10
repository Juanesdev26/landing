import { serverSupabaseClient } from '#supabase/server'
import { respondSuccess, respondError } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const method = getMethod(event)
  const supabase = await serverSupabaseClient(event)
  if (method !== 'GET') return respondError('Método no permitido')

  try {
    const { data, error } = await supabase
      .from('offers')
      .select('id_offer, title, discount_percent, used_count, total_count, created_at')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (error) return respondError('Error obteniendo última oferta', error.message)
    return respondSuccess(data)
  } catch (e) {
    console.error('GET /api/offers/latest error:', e)
    return respondError('Error interno del servidor')
  }
})


