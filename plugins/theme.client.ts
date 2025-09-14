/**
 * Plugin de tema para inicialización automática
 * Se ejecuta solo en el cliente para configurar el tema
 */

export default defineNuxtPlugin(() => {
  const { initTheme, watchSystemTheme } = useTheme()
  
  // Inicializar tema inmediatamente
  initTheme()
  
  // Escuchar cambios en la preferencia del sistema
  const cleanup = watchSystemTheme()
  
  // Cleanup al desmontar
  if (cleanup) {
    window.addEventListener('beforeunload', cleanup)
  }
  
  return {
    provide: {
      initTheme,
      watchSystemTheme
    }
  }
})