export default defineNuxtRouteMiddleware(async (_to: any) => {
  // Consistencia con el resto del proyecto: correr en cliente
  if (!process.client) return

  // Usar estado local de auth para evitar consultas
  const { user, checkAuth } = useAuth()
  let role = user.value?.role as any
  let active: any = true

  if (!role) {
    const ok = await checkAuth()
    role = ok ? (user.value?.role as any) : null
  }

  if (!role) return navigateTo('/login')
  if (role !== 'user' && role !== 'customer') return navigateTo('/unauthorized')
})




