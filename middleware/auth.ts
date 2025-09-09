/**
 * Middleware de autenticación
 * Sistema adaptado para usar profiles + auth.users de Supabase
 */
import type { RouteLocationNormalized } from 'vue-router'

export default defineNuxtRouteMiddleware(async (to: RouteLocationNormalized) => {
  // Ejecutar solo en el cliente; la verificación SSR la realiza server/middleware/require-auth.ts
  if (process.client) {
    // Rutas públicas que no requieren autenticación
    const publicRoutes = ['/', '/login', '/register', '/about', '/shop', '/shop/category/*']
    const isPublicRoute = publicRoutes.some(route => {
      if (route.endsWith('*')) {
        return to.path.startsWith(route.slice(0, -1))
      }
      return to.path === route
    })
    
    // Si es una ruta pública, permitir acceso
    if (isPublicRoute) {
      return
    }
    
    // Para rutas protegidas, verificar autenticación
    const supabase = useSupabaseClient()
    
    try {
      // Verificar sesión de Supabase
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error || !session) {
        console.log('No hay sesión activa, redirigiendo al login')
        return navigateTo('/login')
      }
      
      // Obtener perfil del usuario para verificar rol
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single()
      
      if (profileError || !profile) {
        console.log('Perfil no encontrado, redirigiendo al login')
        return navigateTo('/login')
      }
      
      // Rutas por rol
      const role = (profile as { role?: 'admin' | 'user' } | null)?.role

      // Reglas de acceso por prefijo
      const path = to.path
      const isAdminArea = path.startsWith('/admin')
      const isUserPortal = path.startsWith('/user')

      if (isAdminArea && role !== 'admin') return navigateTo('/unauthorized')
      if (isUserPortal && role !== 'user') return navigateTo('/unauthorized')
      
      // Para el resto de rutas protegidas: cualquier rol autenticado
      
    } catch (error) {
      console.error('Error en middleware de autenticación:', error)
      return navigateTo('/login')
    }
  }
})
