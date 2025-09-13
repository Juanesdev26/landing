/**
 * Plugin de autenticación
 * Se ejecuta solo en el cliente para inicializar el estado de autenticación
 */

export default defineNuxtPlugin(() => {
  const supabase = useSupabaseClient()
  const { checkAuth } = useAuth()
  const { user } = useAuth()
  const router = useRouter()
  
  if (import.meta.env.DEV) console.log('🔐 Plugin de autenticación iniciado')
  
  // Helper: esperar hasta que el perfil exista y tenga rol
  const waitForProfileRole = async (userId: string, maxMs = 3000) => {
    const start = Date.now()
    let lastRole: string | null = null
    while (Date.now() - start < maxMs) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', userId)
          .maybeSingle()
        const roleVal = (data as { role?: string } | null)?.role
        if (!error && roleVal) {
          lastRole = String(roleVal)
          break
        }
      } catch {}
      await new Promise(r => setTimeout(r, 120))
    }
    return lastRole
  }
  
  // Verificar sesión de Supabase al cargar la aplicación
  const initAuth = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('❌ Error obteniendo sesión:', error)
      return
    }
    
    if (session) {
      if (import.meta.env.DEV) console.log('✅ Sesión encontrada para usuario:', session.user.email)
      // Asegurar que el rol esté listo antes de redirigir
      let ok = await checkAuth()
      if (!ok) {
        const roleReady = await waitForProfileRole(session.user.id)
        if (roleReady) {
          // refrescar auth para poblar estado
          ok = await checkAuth()
        }
      }
      if (ok) {
        try {
          const role = (user.value?.role as unknown as string)
          if (router.currentRoute.value.path === '/' || router.currentRoute.value.path === '/login') {
        try { await router.isReady() } catch {}
        if (document.readyState !== 'complete') {
          await new Promise<void>((resolve) => window.addEventListener('load', () => resolve(), { once: true }))
        }
        await nextTick()
        
        // Verificar si estamos haciendo logout antes de redirigir
        if (isLoggingOut) {
          console.log('🚫 Ignorando redirección inicial por logout en progreso')
          return
        }
        
        // No redirigir si estamos en /login
        if (router.currentRoute.value.path === '/login') {
          console.log('🚫 Ignorando redirección inicial porque estamos en /login')
          return
        }
        
        if (role === 'admin') await router.replace('/dashboard')
        else if (role === 'user') await router.replace('/user')
          }
        } catch (_e) {}
      }
    } else {
      if (import.meta.env.DEV) console.log('ℹ️ No hay sesión activa')
    }
    } catch (error) {
      console.error('❌ Error verificando sesión:', error)
    }
  }
  
  // Ejecutar inicialización
  initAuth()
  
  // Flag para controlar redirecciones automáticas
  let isLoggingOut = false

  // Escuchar cambios en la autenticación (incluye sesión inicial)
  supabase.auth.onAuthStateChange(async (event, session) => {
    console.log('🔄 Cambio de estado de autenticación:', event)
    
    if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session) {
      // No redirigir si estamos en proceso de logout
      if (isLoggingOut) {
        console.log('🚫 Ignorando redirección por logout en progreso')
        return
      }
      
      // No redirigir si estamos en la página de login
      if (typeof window !== 'undefined' && window.location.pathname === '/login') {
        console.log('🚫 Ignorando redirección porque estamos en /login')
        return
      }
      
      if (import.meta.env.DEV) console.log('✅ Usuario inició sesión:', session.user.email)
      // Upsert/upgrade profile to role 'user' after third-party login
      try {
        await $fetch('/api/auth/upsert-profile', { method: 'POST' })
      } catch (e) {
        console.warn('No se pudo actualizar perfil tras login', e)
      }
      // Esperar a que el perfil tenga rol y luego redirigir
      try {
        const role = (await waitForProfileRole(session.user.id)) || (user.value?.role as unknown as string)
        await checkAuth()
        
        // Verificar nuevamente si estamos haciendo logout antes de redirigir
        if (isLoggingOut) {
          console.log('🚫 Ignorando redirección por logout en progreso (después de checkAuth)')
          return
        }
        
        try { await router.isReady() } catch {}
        if (document.readyState !== 'complete') {
          await new Promise<void>((resolve) => window.addEventListener('load', () => resolve(), { once: true }))
        }
        await nextTick()
        if (role === 'admin') await router.replace('/dashboard')
        else if (role === 'user' || role === 'customer') await router.replace('/user')
      } catch (_e) {}
    } else if (event === 'SIGNED_OUT') {
      if (import.meta.env.DEV) console.log('🚪 Usuario cerró sesión')
      isLoggingOut = false // Reset flag
      
      // Solo limpiar localStorage si no se hizo desde useAuth().logout()
      const currentUser = user.value
      if (currentUser && typeof window !== 'undefined') {
        localStorage.removeItem('user')
        localStorage.removeItem('isAuthenticated')
      }
      
      // No redirigir automáticamente, dejar que el componente maneje la redirección
    }
  })

  // Exponer flag para control desde componentes
  return {
    provide: {
      setLoggingOut: (value: boolean) => { isLoggingOut = value }
    }
  }
})


