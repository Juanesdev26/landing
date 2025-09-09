/**
 * Plugin de autenticación
 * Se ejecuta solo en el cliente para inicializar el estado de autenticación
 */

export default defineNuxtPlugin(async () => {
  const supabase = useSupabaseClient()
  const { checkAuth } = useAuth()
  const { user } = useAuth()
  const router = useRouter()
  
  console.log('🔐 Plugin de autenticación iniciado')
  
  // Verificar sesión de Supabase al cargar la aplicación
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('❌ Error obteniendo sesión:', error)
      return
    }
    
    if (session) {
      console.log('✅ Sesión encontrada para usuario:', session.user.email)
      
      // Usar el método checkAuth del composable para manejar la autenticación
      const isAuthenticated = await checkAuth()
      
      if (isAuthenticated) {
        console.log('✅ Usuario autenticado como admin')
        // Redirección por rol en carga inicial
        try {
          const role = (user.value?.role as unknown as string)
          if (role === 'admin') {
            if (router.currentRoute.value.path === '/' || router.currentRoute.value.path === '/login') {
              await router.replace('/dashboard')
            }
          } else if (role === 'user') {
            if (router.currentRoute.value.path === '/' || router.currentRoute.value.path === '/login') {
              await router.replace('/user')
            }
          }
        } catch (_e) {}
      } else {
        console.log('❌ Usuario no es admin o error en autenticación')
      }
    } else {
      console.log('ℹ️ No hay sesión activa')
    }
  } catch (error) {
    console.error('❌ Error verificando sesión:', error)
  }
  
  // Escuchar cambios en la autenticación
  supabase.auth.onAuthStateChange(async (event, session) => {
    console.log('🔄 Cambio de estado de autenticación:', event)
    
    if (event === 'SIGNED_IN' && session) {
      console.log('✅ Usuario inició sesión:', session.user.email)
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
        if (role === 'admin') await router.replace('/dashboard')
        else if (role === 'user') await router.replace('/user')
      } catch (_e) {}
    } else if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
      console.log('🚪 Usuario cerró sesión')
      // Limpiar estado local si es necesario
      try {
        // Forzar navegación limpia al home para resetear vistas cacheadas
        // Usar nextTick para evitar colisiones con otras navegaciones
        await nextTick()
        if (router.currentRoute.value.path !== '/') await router.replace('/')
      } catch (_e) {}
    }
  })
})


