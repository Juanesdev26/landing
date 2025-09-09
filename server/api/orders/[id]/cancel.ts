import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { respondError, respondSuccess } from '~/server/utils/auth'

// Cancela un pedido sólo si pertenece al usuario autenticado y está en estado pending
export default defineEventHandler(async (event) => {
  const method = getMethod(event)
  if (method !== 'POST') return respondError('Método no permitido')

  try {
    const supabase = await serverSupabaseClient(event)
    const user = await serverSupabaseUser(event)
    if (!user) return respondError('No autenticado')

    const id = getRouterParam(event, 'id')
    if (!id) return respondError('ID de pedido requerido')

    // Verificar que el pedido pertenece al usuario (por customer vinculado)
    const { data: order, error } = await supabase
      .from('orders')
      .select('id_order, status, customer_id, customers!inner(user_id)')
      .eq('id_order', id)
      .maybeSingle()

    if (error || !order) return respondError('Pedido no encontrado')
    if ((order as any).customers?.user_id !== user.id) return respondError('No autorizado')
    if ((order as any).status !== 'pending') return respondError('Solo se puede cancelar si está pendiente')

    const updRes = await (supabase as any)
      .from('orders')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() } as any)
      .eq('id_order', id)
    const updErr = (updRes as any).error

    if (updErr) return respondError('No se pudo cancelar el pedido', updErr.message)

    return respondSuccess(null, 'Pedido cancelado')
  } catch (e) {
    console.error('POST /api/orders/[id]/cancel error:', e)
    return respondError('Error interno del servidor')
  }
})




