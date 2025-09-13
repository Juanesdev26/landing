/**
 * Plugin para forzar el logout y prevenir redirecciones automáticas
 */

export default defineNuxtPlugin(() => {
  if (!process.client) return

  // Variable global para controlar logout
  let isForceLogout = false

  // Interceptar todas las redirecciones cuando estamos haciendo logout
  const originalPush = window.history.pushState
  const originalReplace = window.history.replaceState

  window.history.pushState = function(...args) {
    if (isForceLogout) {
      console.log('🚫 Bloqueando pushState durante logout')
      return
    }
    return originalPush.apply(this, args)
  }

  window.history.replaceState = function(...args) {
    if (isForceLogout) {
      console.log('🚫 Bloqueando replaceState durante logout')
      return
    }
    return originalReplace.apply(this, args)
  }

  // Interceptar router push/replace
  const router = useRouter()
  const originalRouterPush = router.push
  const originalRouterReplace = router.replace

  router.push = function(...args) {
    if (isForceLogout) {
      console.log('🚫 Bloqueando router.push durante logout')
      return Promise.resolve()
    }
    return originalRouterPush.apply(this, args)
  }

  router.replace = function(...args) {
    if (isForceLogout) {
      console.log('🚫 Bloqueando router.replace durante logout')
      return Promise.resolve()
    }
    return originalRouterReplace.apply(this, args)
  }

  // Función para forzar logout
  const forceLogout = () => {
    isForceLogout = true
    console.log('🚫 Activando bloqueo de redirecciones')

    // Limpiar todo inmediatamente
    if (typeof window !== 'undefined') {
      // 1. Limpiar localStorage completamente
      localStorage.clear()
      sessionStorage.clear()
      console.log('🧹 Almacenamiento local completamente limpiado')

      // 2. Limpiar cookies relacionadas con Supabase
      document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
      })
      console.log('🍪 Cookies limpiadas')

      // 3. Redireccionar forzadamente
      window.location.replace('/login')
    }

    // Reset después de 10 segundos
    setTimeout(() => {
      isForceLogout = false
      console.log('✅ Desactivando bloqueo de redirecciones')
    }, 10000)
  }

  // Exponer función globalmente
  ;(window as any).forceLogout = forceLogout

  return {
    provide: {
      forceLogout
    }
  }
})
