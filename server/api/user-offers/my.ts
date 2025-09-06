import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { requireAuth, respondSuccess, respondError } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const method = getMethod(event)
  const supabase = await serverSupabaseClient(event)

  if (method !== 'GET') {
    return respondError('Método no permitido')
  }

  try {
    await requireAuth(event)
    const user = await serverSupabaseUser(event)
    if (!user) return respondError('No autenticado')

    const nowIso = new Date().toISOString()
    const { data, error } = await supabase
      .from('user_offers')
      .select(`
        *,
        product:products(id_product, name, sku, price, image_url)
      `)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .or(`valid_from.is.null,valid_from.lte.${nowIso}`)
      .or(`valid_to.is.null,valid_to.gte.${nowIso}`)

    if (error) return respondError('Error obteniendo mis ofertas', error.message)
    return respondSuccess(data)
  } catch (error) {
    console.error('Error en GET /api/user-offers/my:', error)
    return respondError('Error interno del servidor')
  }
})
