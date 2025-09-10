export default defineNuxtPlugin(() => {
  if (!process.client) return
  
  const supabase = useSupabaseClient<any>()
  const router = useRouter()
  
  let isChecking = false
  let lastCheck = 0
  const CHECK_COOLDOWN = 15000 // 15 segundos entre verificaciones
  let lastCheckedPath = ''

  const protectedPath = (p: string) => p.startsWith('/admin') || p.startsWith('/user') || p.startsWith('/shop/cart')

  const check = async () => {
    // Evitar verificaciones múltiples simultáneas
    if (isChecking) return
    
    const now = Date.now()
    const currentPath = router.currentRoute.value.path
    if (now - lastCheck < CHECK_COOLDOWN && currentPath === lastCheckedPath) return
    
    isChecking = true
    lastCheck = now
    
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      const current = currentPath
      
      if (error) {
        console.warn('Session check error:', error)
        return
      }
      
      if (!session && protectedPath(current)) {
        console.log('No session for protected path, redirecting to login')
        await router.replace('/login')
      }
      lastCheckedPath = current
    } catch (error) {
      console.warn('Session focus check failed:', error)
    } finally {
      isChecking = false
    }
  }

  // Eventos de reactivación con throttling (solo visibilidad; quitamos focus para reducir ruido)
  document.addEventListener('visibilitychange', () => { 
    if (document.visibilityState === 'visible') {
      setTimeout(() => { check() }, 300)
    }
  }, { passive: true })
})


