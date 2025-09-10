/**
 * Plugin para manejar reactivación de páginas tras inactividad
 * Soluciona el problema de botones que dejan de funcionar después de inactividad
 */

export default defineNuxtPlugin(() => {
  if (!process.client) return
  
  const router = useRouter()
  const supabase = useSupabaseClient<any>()
  
  let isInactive = false
  let inactivityTimer: NodeJS.Timeout | null = null
  let lastActivity = Date.now()
  let reactivationInProgress = false
  
  // Configuración
  const INACTIVITY_TIMEOUT = 5 * 60 * 1000 // 5 minutos
  const HEARTBEAT_INTERVAL = 30 * 1000 // 30 segundos
  
  // Función para detectar si necesitamos reactivar
  const needsReactivation = () => {
    return isInactive || (Date.now() - lastActivity > INACTIVITY_TIMEOUT)
  }
  
  // Función para reactivar la página
  const reactivatePage = async () => {
    if (!needsReactivation()) return
    if (reactivationInProgress) return
    reactivationInProgress = true
    
    console.log('🔄 Reactivando página tras inactividad...')
    
    // Helper para reemplazos seguros sin spamear errores por navegación redundante
    const safeReplace = async (location: any) => {
      try {
        await router.replace(location)
      } catch (err: any) {
        const msg = String(err?.message || '')
        if (msg.includes('Avoided redundant navigation')) return
        console.warn('router.replace error:', err)
      }
    }
    
    try {
      // 1. Verificar sesión de Supabase (no bloquear si falla)
      try {
        await supabase.auth.getSession()
      } catch (e) {
        console.warn('⚠️ Error verificando sesión:', e)
      }
      
      // 2. Forzar re-renderizado de la página actual
      const currentRoute = router.currentRoute.value
      
      // Usar un query param temporal para forzar re-render solo si no existe
      const hasReactivation = '_reactivate' in (currentRoute.query || {})
      const tempQuery = { ...currentRoute.query, _reactivate: Date.now().toString() }
      
      if (!hasReactivation) {
        await safeReplace({ path: currentRoute.path, query: tempQuery })
        // Limpiar el query param después de un tick
        await nextTick()
      }
      
      setTimeout(async () => {
        try {
          const routeNow = router.currentRoute.value
          if ('_reactivate' in (routeNow.query || {})) {
            const { _reactivate, ...cleanQuery } = routeNow.query as Record<string, string>
            await safeReplace({
              path: routeNow.path,
              query: Object.keys(cleanQuery).length > 0 ? cleanQuery : undefined
            })
          }
        } finally {
          // 3. Reinicializar estado de actividad
          isInactive = false
          lastActivity = Date.now()
          reactivationInProgress = false
          console.log('✅ Página reactivada correctamente')
        }
      }, 100)
      
    } catch (error) {
      console.error('❌ Error reactivando página:', error)
      reactivationInProgress = false
    }
  }
  
  // Función para resetear timer de inactividad
  const resetInactivityTimer = () => {
    lastActivity = Date.now()
    
    if (inactivityTimer) {
      clearTimeout(inactivityTimer)
    }
    
    inactivityTimer = setTimeout(() => {
      isInactive = true
      console.log('💤 Usuario inactivo detectado')
    }, INACTIVITY_TIMEOUT)
  }
  
  // Eventos para detectar actividad del usuario
  const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
  
  activityEvents.forEach(event => {
    document.addEventListener(event, resetInactivityTimer, { passive: true })
  })
  
  // Evento para cuando la ventana recupera el foco
  window.addEventListener('focus', async () => {
    console.log('👀 Ventana recuperó el foco')
    await reactivatePage()
  })
  
  // Evento para cuando la página se vuelve visible
  document.addEventListener('visibilitychange', async () => {
    if (document.visibilityState === 'visible') {
      console.log('👀 Página se volvió visible')
      await reactivatePage()
    }
  })
  
  // Heartbeat para mantener la sesión activa
  const startHeartbeat = () => {
    setInterval(async () => {
      try {
        // Solo hacer heartbeat si el usuario está activo
        if (!needsReactivation()) {
          await supabase.auth.getSession()
        }
      } catch (error) {
        console.warn('💓 Heartbeat error:', error)
      }
    }, HEARTBEAT_INTERVAL)
  }
  
  // Interceptar errores de navegación y reactivar
  router.onError(async (error) => {
    console.warn('🚨 Error de navegación detectado:', error)
    await reactivatePage()
  })
  
  // Interceptar cambios de ruta para resetear estado
  router.afterEach(() => {
    resetInactivityTimer()
  })
  
  // Inicializar
  resetInactivityTimer()
  startHeartbeat()
  
  console.log('🚀 Plugin de reactivación de páginas iniciado')
})
