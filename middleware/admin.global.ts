export default defineNuxtRouteMiddleware(async (to: any) => {
  // Solo proteger rutas del área de administración
  if (!to.path.startsWith('/admin')) return

  // Ejecutar únicamente en el cliente para mantenerse consistente con el resto del proyecto
  if (!process.client) return

  // Usar estado local si ya existe para evitar roundtrips
  const { user, checkAuth } = useAuth()
  let role = user.value?.role as any
  
  if (!role) {
    const ok = await checkAuth()
    role = ok ? (user.value?.role as any) : null
  }

  if (!role) return navigateTo('/login')
  if (role !== 'admin') return navigateTo('/unauthorized')
})


