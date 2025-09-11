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
  
  // Escuchar cambios en la autenticación (incluye sesión inicial)
  supabase.auth.onAuthStateChange(async (event, session) => {
    console.log('🔄 Cambio de estado de autenticación:', event)
    
    if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session) {
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
      // Limpiar estado local en caso de que no se haya usado useAuth().logout()
      try {
        const auth = useAuth() as any
        // limpiar estado usando la API pública
        await auth.logout?.()
      } catch (_e) {}
      // Redirigir a login una sola vez, esperando router y estilos
      try {
        try { await router.isReady() } catch {}
        if (document.readyState !== 'complete') {
          await new Promise<void>((resolve) => window.addEventListener('load', () => resolve(), { once: true }))
        }
        await nextTick()
        if (router.currentRoute.value.path !== '/login') await router.replace('/login')
      } catch (_e) {}
    }
  })
})


