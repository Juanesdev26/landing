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
    
    console.log('🔄 Reactivando página tras inactividad...')
    
    try {
      // 1. Verificar sesión de Supabase
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) {
        console.warn('⚠️ Error verificando sesión:', error)
        return
      }
      
      // 2. Forzar re-renderizado de la página actual
      const currentRoute = router.currentRoute.value
      
      // Usar un query param temporal para forzar re-render
      const tempQuery = { ...currentRoute.query, _reactivate: Date.now().toString() }
      
      await router.replace({
        path: currentRoute.path,
        query: tempQuery
      })
      
      // Limpiar el query param después de un tick
      await nextTick()
      
      setTimeout(async () => {
        const { _reactivate, ...cleanQuery } = tempQuery
        
        await router.replace({
          path: currentRoute.path,
          query: Object.keys(cleanQuery).length > 0 ? cleanQuery : undefined
        })
      }, 100)
      
      // 3. Reinicializar estado de actividad
      isInactive = false
      lastActivity = Date.now()
      
      console.log('✅ Página reactivada correctamente')
      
    } catch (error) {
      console.error('❌ Error reactivando página:', error)
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
