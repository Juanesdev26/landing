import { serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  // Solo aplicar a navegación de páginas (no APIs ni assets)
  const url = getRequestURL(event)
  const path = url.pathname || '/'

  // Allowlist explícita para páginas públicas
  const isPublic = (): boolean => {
    if (path === '/' || path === '/about' || path === '/login' || path === '/unauthorized' || path === '/callback') return true
    // Páginas de tienda públicas (excepto carrito)
    if (path === '/shop') return true
    if (path.startsWith('/shop/category/')) return true
    if (path.startsWith('/shop/product/')) return true
    // Archivos públicos
    if (path === '/robots.txt' || path === '/favicon.ico') return true
    return false
  }
  if (isPublic()) return

  // Ignorar APIs y recursos
  if (path.startsWith('/api') || path.startsWith('/_nuxt') || path.startsWith('/public') || path.startsWith('/favicon') || path.startsWith('/__nuxt')) return

  try {
    const user = await serverSupabaseUser(event as any)
    if (!user) {
      return sendRedirect(event, '/login')
    }
  } catch (_e) {
    return sendRedirect(event, '/login')
  }
})


