import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { respondError, respondSuccess } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const method = getMethod(event)
  const supabase = await serverSupabaseClient(event)
  if (method !== 'GET') return respondError('Método no permitido')

  try {
    const user = await serverSupabaseUser(event)
    if (!user) return respondSuccess([])

    const { data, error } = await supabase
      .from('reservations')
      .select(`
        id_reservation,
        product_id,
        quantity,
        status,
        expires_at,
        created_at,
        updated_at
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) return respondError('Error obteniendo mis reservas', error.message)
    return respondSuccess(data || [])
  } catch (e) {
    console.error('GET /api/reservations/my error:', e)
    return respondError('Error interno del servidor')
  }
})


