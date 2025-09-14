/**
 * Plugin para manejar errores de API durante la precarga
 * Evita que los errores de autenticación aparezcan en la consola
 */

export default defineNuxtPlugin(() => {
  // Interceptar fetch requests para manejar errores silenciosamente
  const originalFetch = window.fetch
  
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    try {
      const response = await originalFetch(input, init)
      
      // Si es un error de autenticación durante precarga, no mostrar error
      if (!response.ok && response.status === 401) {
        const url = typeof input === 'string' ? input : input.toString()
        
        // Solo silenciar errores de APIs que se precargan
        if (url.includes('/api/orders/recent') || 
            url.includes('/api/orders/my') || 
            url.includes('/api/customers/my') ||
            url.includes('/api/dashboard')) {
          // Crear una respuesta fake para evitar errores
          return new Response('{"error": "Auth required"}', {
            status: 401,
            statusText: 'Unauthorized',
            headers: { 'Content-Type': 'application/json' }
          })
        }
      }
      
      return response
    } catch (error) {
      // Silenciar errores de red durante precarga
      const url = typeof input === 'string' ? input : input.toString()
      if (url.includes('/api/') && init?.method === 'HEAD') {
        // Ignorar errores de HEAD requests durante precarga
        return new Response('{}', {
          status: 200,
          statusText: 'OK',
          headers: { 'Content-Type': 'application/json' }
        })
      }
      
      throw error
    }
  }
  
  // Restaurar fetch original al desmontar
  onUnmounted(() => {
    window.fetch = originalFetch
  })
})
