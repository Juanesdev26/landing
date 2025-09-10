/**
 * Plugin de autenticación
 * Se ejecuta solo en el cliente para inicializar el estado de autenticación
 */

export default defineNuxtPlugin(async () => {
  const supabase = useSupabaseClient()
  const { checkAuth } = useAuth()
  const { user } = useAuth()
  const router = useRouter()
  
  if (import.meta.env.DEV) console.log('🔐 Plugin de autenticación iniciado')
  
  // Verificar sesión de Supabase al cargar la aplicación
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('❌ Error obteniendo sesión:', error)
      return
    }
    
    if (session) {
      if (import.meta.env.DEV) console.log('✅ Sesión encontrada para usuario:', session.user.email)
      const isAuthenticated = await checkAuth()
      if (isAuthenticated) {
        try {
          const role = (user.value?.role as unknown as string)
          if (router.currentRoute.value.path === '/' || router.currentRoute.value.path === '/login') {
            // Evitar forzar layout antes de que carguen estilos: esperar a que el router y la página estén listos
            try { await router.isReady() } catch {}
            if (document.readyState !== 'complete') {
              await new Promise<void>((resolve) => window.addEventListener('load', () => resolve(), { once: true }))
            }
            await nextTick()
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
  
  // Escuchar cambios en la autenticación
  supabase.auth.onAuthStateChange(async (event, session) => {
    console.log('🔄 Cambio de estado de autenticación:', event)
    
    if (event === 'SIGNED_IN' && session) {
      if (import.meta.env.DEV) console.log('✅ Usuario inició sesión:', session.user.email)
      // Upsert/upgrade profile to role 'user' after third-party login
      try {
        await $fetch('/api/auth/upsert-profile', { method: 'POST' })
      } catch (e) {
        console.warn('No se pudo actualizar perfil tras login', e)
      }
      await checkAuth()
      // Redirección por rol tras login
      try {
        const role = (user.value?.role as unknown as string)
        try { await router.isReady() } catch {}
        if (document.readyState !== 'complete') {
          await new Promise<void>((resolve) => window.addEventListener('load', () => resolve(), { once: true }))
        }
        await nextTick()
        if (role === 'admin') await router.replace('/dashboard')
        else if (role === 'user') await router.replace('/user')
      } catch (_e) {}
    } else if (event === 'SIGNED_OUT') {
      if (import.meta.env.DEV) console.log('🚪 Usuario cerró sesión')
      // Redirigir a inicio una sola vez, esperando router y estilos
      try {
        try { await router.isReady() } catch {}
        if (document.readyState !== 'complete') {
          await new Promise<void>((resolve) => window.addEventListener('load', () => resolve(), { once: true }))
        }
        await nextTick()
        if (router.currentRoute.value.path !== '/') await router.replace('/')
      } catch (_e) {}
    }
  })
})


