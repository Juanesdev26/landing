import { serverSupabaseClient } from '#supabase/server'
import { requireAdmin, respondError, respondSuccess } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const method = getMethod(event)
  const supabase = await serverSupabaseClient(event)
  const id = getRouterParam(event, 'id')
  if (method !== 'PATCH') return respondError('Método no permitido')
  if (!id) return respondError('ID de reserva requerido')
  try {
    await requireAdmin(event)
    const { data, error } = await (supabase as any)
      .from('reservations')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('id_reservation', id)
      .eq('status', 'pending')
      .select()
      .single()
    if (error) return respondError('Error cancelando reserva', error.message)
    return respondSuccess(data, 'Reserva cancelada')
  } catch (e) {
    return respondError('Error interno del servidor')
  }
})




