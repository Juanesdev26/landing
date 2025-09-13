/**
 * Plugin para deshabilitar temporalmente el plugin de autenticación durante logout
 */

export default defineNuxtPlugin(() => {
  if (!process.client) return

  // Variable global para deshabilitar auth
  let isAuthDisabled = false

  // Interceptar el cliente de Supabase
  const supabase = useSupabaseClient()
  const originalGetSession = supabase.auth.getSession
  const originalOnAuthStateChange = supabase.auth.onAuthStateChange

  // Sobrescribir getSession para retornar sesión vacía cuando está deshabilitado
  supabase.auth.getSession = function(...args) {
    if (isAuthDisabled) {
      console.log('🚫 Auth deshabilitado - retornando sesión vacía')
      return Promise.resolve({ data: { session: null }, error: null })
    }
    return originalGetSession.apply(this, args)
  }

  // Sobrescribir onAuthStateChange para no ejecutar callbacks cuando está deshabilitado
  supabase.auth.onAuthStateChange = function(callback, ...args) {
    const wrappedCallback = (event: any, session: any) => {
      if (isAuthDisabled) {
        console.log('🚫 Auth deshabilitado - ignorando evento:', event)
        return
      }
      return callback(event, session)
    }
    return originalOnAuthStateChange.call(this, wrappedCallback, ...args)
  }

  // Función para deshabilitar auth
  const disableAuth = () => {
    isAuthDisabled = true
    console.log('🚫 Autenticación deshabilitada')
    
    // Rehabilitar después de 10 segundos
    setTimeout(() => {
      isAuthDisabled = false
      console.log('✅ Autenticación rehabilitada')
    }, 10000)
  }

  // Exponer función globalmente
  ;(window as any).disableAuth = disableAuth

  return {
    provide: {
      disableAuth
    }
  }
})
