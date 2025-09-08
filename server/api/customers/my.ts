import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { requireAuth, respondError, respondSuccess } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const method = getMethod(event)
  const supabase = await serverSupabaseClient(event)
  if (method !== 'GET') return respondError('Método no permitido')

  try {
    await requireAuth(event)
    const authUser = await serverSupabaseUser(event)
    if (!authUser) return respondError('No autenticado')

    // Buscar customer existente por user_id
    const { data: existing } = await supabase
      .from('customers')
      .select('*')
      .eq('user_id', authUser.id)
      .single()

    if (existing) return respondSuccess(existing)

    // Si no existe, crear a partir del perfil
    const { data: profile } = await supabase
      .from('profiles')
      .select('first_name, last_name, email, phone, address, city, state, postal_code, country')
      .eq('id', authUser.id)
      .single()

    const payload: any = {
      user_id: authUser.id,
      first_name: (profile as any)?.first_name || 'Cliente',
      last_name: (profile as any)?.last_name || 'N/A',
      email: (profile as any)?.email || authUser.email,
      phone: (profile as any)?.phone || null,
      address: (profile as any)?.address || null,
      city: (profile as any)?.city || null,
      state: (profile as any)?.state || null,
      postal_code: (profile as any)?.postal_code || null,
      country: (profile as any)?.country || 'México',
      is_active: true
    }

    const { data: created, error } = await supabase
      .from('customers')
      .insert(payload)
      .select()
      .single()

    if (error) return respondError('Error creando cliente', error.message)
    return respondSuccess(created)
  } catch (error) {
    console.error('Error en GET /api/customers/my:', error)
    return respondError('Error interno del servidor')
  }
})



