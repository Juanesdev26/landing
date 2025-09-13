/**
 * Plugin para matar completamente la sesión de Supabase
 */

export default defineNuxtPlugin(() => {
  if (!process.client) return

  // Función para matar la sesión completamente
  const killSession = () => {
    console.log('💀 Matando sesión completamente...')
    
    try {
      // 1. Obtener cliente de Supabase
      const supabase = useSupabaseClient()
      
      // 2. Cerrar sesión de Supabase
      supabase.auth.signOut().then(() => {
        console.log('✅ Supabase signOut completado')
      }).catch(error => {
        console.warn('⚠️ Error en Supabase signOut:', error)
      })
      
      // 3. Limpiar todo el almacenamiento
      localStorage.clear()
      sessionStorage.clear()
      console.log('🧹 Almacenamiento limpiado')
      
      // 4. Limpiar cookies
      document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
      })
      console.log('🍪 Cookies limpiadas')
      
      // 5. Limpiar IndexedDB (si existe)
      if ('indexedDB' in window) {
        try {
          indexedDB.deleteDatabase('supabase')
          console.log('🗄️ IndexedDB limpiado')
        } catch (e) {
          console.warn('⚠️ Error limpiando IndexedDB:', e)
        }
      }
      
      // 6. Forzar redirección
      setTimeout(() => {
        console.log('🔄 Forzando redirección a /login')
        window.location.replace('/login')
      }, 100)
      
    } catch (error) {
      console.error('💥 Error matando sesión:', error)
      // Fallback: redirección directa
      window.location.replace('/login')
    }
  }

  // Exponer función globalmente
  ;(window as any).killSession = killSession

  return {
    provide: {
      killSession
    }
  }
})
