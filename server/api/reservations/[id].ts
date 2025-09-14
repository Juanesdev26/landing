import { serverSupabaseClient } from '#supabase/server'
import { requireAdmin, respondError, respondSuccess } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const method = getMethod(event)
  const supabase = await serverSupabaseClient(event)
  const id = getRouterParam(event, 'id')
  if (!id) return respondError('ID de reserva requerido')

  if (method === 'DELETE') {
    try {
      await requireAdmin(event)
      const { error } = await supabase
        .from('reservations')
        .delete()
        .eq('id_reservation', id)
      if (error) return respondError('Error eliminando reserva', error.message)
      return respondSuccess(null, 'Reserva eliminada')
    } catch (e) {
      return respondError('Error interno del servidor')
    }
  }

  return respondError('Método no permitido')
})








