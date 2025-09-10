/**
 * Composable para manejar la reactivación de páginas tras inactividad
 * Centraliza la lógica de detección de inactividad y reactivación
 */

export const usePageReactivation = () => {
  const router = useRouter()
  const refreshKey = ref(0)
  
  let lastActivity = Date.now()
  let inactivityTimer: NodeJS.Timeout | null = null
  
  // Configuración
  const INACTIVITY_TIMEOUT = 5 * 60 * 1000 // 5 minutos
  const CHECK_INTERVAL = 60 * 1000 // 1 minuto
  
  // Estado de inactividad
  const isInactive = computed(() => {
    return Date.now() - lastActivity > INACTIVITY_TIMEOUT
  })
  
  // Función para forzar re-renderizado
  const forceRefresh = () => {
    refreshKey.value++
    lastActivity = Date.now()
    console.log('🔄 Página forzada a re-renderizar')
  }
  
  // Función para registrar actividad del usuario
  const recordActivity = () => {
    lastActivity = Date.now()
    
    // Reiniciar timer de inactividad
    if (inactivityTimer) {
      clearTimeout(inactivityTimer)
    }
    
    inactivityTimer = setTimeout(() => {
      console.log('💤 Usuario inactivo detectado')
    }, INACTIVITY_TIMEOUT)
  }
  
  // Función para verificar y reactivar si es necesario
  const checkAndReactivate = () => {
    if (isInactive.value) {
      forceRefresh()
    }
  }
  
  // Función para inicializar los event listeners
  const initializeListeners = () => {
    if (!process.client) return
    
    // Eventos de actividad del usuario
    const activityEvents = ['click', 'mousemove', 'keydown', 'scroll', 'touchstart']
    activityEvents.forEach(event => {
      document.addEventListener(event, recordActivity, { passive: true })
    })
    
    // Eventos de reactivación
    window.addEventListener('focus', () => {
      console.log('👀 Ventana recuperó el foco')
      forceRefresh()
    }, { passive: true })
    
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        console.log('👀 Página se volvió visible')
        forceRefresh()
      }
    }, { passive: true })
    
    // Verificación periódica
    setInterval(checkAndReactivate, CHECK_INTERVAL)
    
    // Inicializar timer de inactividad
    recordActivity()
  }
  
  // Función para limpiar listeners (opcional)
  const cleanup = () => {
    if (inactivityTimer) {
      clearTimeout(inactivityTimer)
      inactivityTimer = null
    }
  }
  
  return {
    refreshKey: readonly(refreshKey),
    isInactive: readonly(isInactive),
    forceRefresh,
    recordActivity,
    initializeListeners,
    cleanup
  }
}
