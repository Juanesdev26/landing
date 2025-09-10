export default defineNuxtRouteMiddleware(async (_to: any) => {
  // Consistencia con el resto del proyecto: correr en cliente
  if (!process.client) return

  const supabase = useSupabaseClient<any>()
  
  let isChecking = false
  
  // Evitar verificaciones múltiples simultáneas
  if (isChecking) return
  isChecking = true

  try {
    // Verificar sesión con timeout
    const sessionPromise = supabase.auth.getSession()
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Session timeout')), 3000)
    )
    
    const { data: { session }, error: sessionError } = await Promise.race([sessionPromise, timeoutPromise]) as any
    
    if (sessionError || !session) {
      console.log('No session found, redirecting to login')
      return navigateTo('/login')
    }

    // Verificar perfil con timeout
    const profilePromise = supabase
      .from('profiles')
      .select('role, is_active')
      .eq('id', session.user.id)
      .single()
      
    const profileTimeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Profile timeout')), 3000)
    )

    const { data: profile, error } = await Promise.race([profilePromise, profileTimeoutPromise]) as any

    const role = (profile as any)?.role
    const active = (profile as any)?.is_active

    if (error || !role || active === false || role !== 'user') {
      console.log('User not authorized, redirecting to unauthorized')
      return navigateTo('/unauthorized')
    }
    
    console.log('User middleware passed successfully')
    
  } catch (error) {
    console.warn('User middleware error:', error)
    return navigateTo('/login')
  } finally {
    isChecking = false
  }
})




