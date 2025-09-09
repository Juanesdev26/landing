export default defineNuxtRouteMiddleware(async (_to: any) => {
  // Consistencia con el resto del proyecto: correr en cliente
  if (!process.client) return

  const supabase = useSupabaseClient<any>()

  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return navigateTo('/login')

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role, is_active')
      .eq('id', session.user.id)
      .single()

    const role = (profile as any)?.role
    const active = (profile as any)?.is_active

    if (error || !role || active === false || role !== 'user') {
      return navigateTo('/unauthorized')
    }
  } catch (_e) {
    return navigateTo('/login')
  }
})




