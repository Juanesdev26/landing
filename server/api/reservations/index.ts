import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { requireAdmin, requireAuth, respondError, respondSuccess } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const method = getMethod(event)
  const supabase = await serverSupabaseClient(event)

  if (method === 'GET') {
    try {
      await requireAdmin(event)
      // Auto-cancelar vencidas
      const nowIso = new Date().toISOString()
      await (supabase as any)
        .from('reservations')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .lte('expires_at', nowIso)
        .eq('status', 'pending')

      const { data, error } = await supabase
        .from('reservations')
        .select(`
          *,
          user:profiles(id, email, first_name, last_name),
          product:products(id_product, name, sku, image_url)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
      if (error) return respondError('Error obteniendo reservas', error.message)
      return respondSuccess(data)
    } catch (e) {
      return respondError('Error interno del servidor')
    }
  }

  if (method === 'POST') {
    try {
      await requireAuth(event)
      const user = await serverSupabaseUser(event)
      if (!user) return respondError('No autenticado')
      const body = await readBody<any>(event)
      if (!body.product_id || !body.quantity) return respondError('product_id y quantity son requeridos')

      const expiresAt = new Date(Date.now() + 1000 * 60 * 30).toISOString() // 30 min
      const payload: any = {
        user_id: user.id,
        product_id: body.product_id,
        quantity: Number(body.quantity),
        status: 'pending',
        notes: body.notes || null,
        expires_at: body.expires_at || expiresAt
      }

      const { data, error } = await supabase
        .from('reservations')
        .insert(payload)
        .select()
        .single()
      if (error) return respondError('Error creando reserva', error.message)
      return respondSuccess(data, 'Reserva creada')
    } catch (e) {
      return respondError('Error interno del servidor')
    }
  }

  return respondError('Método no permitido')
})


