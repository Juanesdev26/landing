import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { createClient } from '@supabase/supabase-js'
import { respondError, respondSuccess, requireAuth } from '~/server/utils/auth'

// Ensures a profile row exists for the authenticated user and upgrades role to 'user'
export default defineEventHandler(async (event) => {
  const method = getMethod(event)
  if (method !== 'POST') return respondError('Método no permitido')

  try {
    await requireAuth(event)
    const user = await serverSupabaseUser(event)
    if (!user) return respondError('No autenticado')

    const config = useRuntimeConfig()
    const adminClient = createClient(
      config.public.supabaseUrl,
      config.supabaseServiceKey,
      { auth: { persistSession: false } }
    ) as any

    // Upsert profile with role 'user' (if role already admin, keep admin)
    const { data: existing } = await adminClient
      .from('profiles')
      .select('id, role, email, first_name, last_name')
      .eq('id', user.id)
      .maybeSingle()

    const payload: any = {
      id: user.id,
      email: user.email,
      role: existing?.role === 'admin' ? 'admin' : 'user',
      updated_at: new Date().toISOString()
    }

    // Keep names if we have metadata
    if (user.user_metadata?.full_name) {
      const parts = String(user.user_metadata.full_name).split(' ')
      payload.first_name = parts[0] || existing?.first_name || null
      payload.last_name = parts.slice(1).join(' ') || existing?.last_name || null
    }
    // Ensure required 'name' column exists (fallback to full_name or email)
    payload.name = existing?.name || user.user_metadata?.full_name || user.email

    const upsertRes = await adminClient
      .from('profiles')
      .upsert(payload, { onConflict: 'id' })
      .select()
      .maybeSingle()
    if (upsertRes.error) return respondError('Error guardando perfil', upsertRes.error.message)

    return respondSuccess(upsertRes.data || payload, 'Perfil actualizado')
  } catch (e) {
    console.error('POST /api/auth/upsert-profile error:', e)
    return respondError('Error interno del servidor')
  }
})


