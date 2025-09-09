import type { RouteLocationNormalized } from 'vue-router'

// Middleware global: exige sesión en TODAS las páginas (sin importar el rol)
export default defineNuxtRouteMiddleware(async (to: RouteLocationNormalized) => {
  const path = String(to?.path || '/')

  // Rutas públicas (coincide con server middleware)
  const isPublic = (): boolean => {
    if (path === '/' || path === '/about' || path === '/login' || path === '/unauthorized' || path === '/callback') return true
    if (path === '/shop') return true
    if (path.startsWith('/shop/category/')) return true
    if (path.startsWith('/shop/product/')) return true
    if (path === '/robots.txt' || path === '/favicon.ico') return true
    if (path.startsWith('/_nuxt') || path.startsWith('/public') || path.startsWith('/favicon')) return true
    return false
  }
  if (isPublic()) return

  // Cliente: verificar sesión
  if (process.client) {
    try {
      const supabase = useSupabaseClient<any>()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        return navigateTo('/login')
      }
    } catch (_e) {
      return navigateTo('/login')
    }
  }

  // Nota: evitamos importar '#supabase/server' aquí para no romper Vite en cliente.
  // La verificación en SSR la realiza el middleware 'auth.ts' existente para prefijos críticos.
})


