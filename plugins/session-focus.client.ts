export default defineNuxtPlugin(() => {
  if (!process.client) return
  
  const supabase = useSupabaseClient<any>()
  const router = useRouter()
  
  let isChecking = false
  let lastCheck = 0
  const CHECK_COOLDOWN = 2000 // 2 segundos entre verificaciones

  const protectedPath = (p: string) => p.startsWith('/admin') || p.startsWith('/user') || p.startsWith('/shop/cart')

  const check = async () => {
    // Evitar verificaciones múltiples simultáneas
    if (isChecking) return
    
    const now = Date.now()
    if (now - lastCheck < CHECK_COOLDOWN) return
    
    isChecking = true
    lastCheck = now
    
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      const current = router.currentRoute.value.path
      
      if (error) {
        console.warn('Session check error:', error)
        return
      }
      
      if (!session && protectedPath(current)) {
        console.log('No session for protected path, redirecting to login')
        await router.replace('/login')
      }
    } catch (error) {
      console.warn('Session focus check failed:', error)
    } finally {
      isChecking = false
    }
  }

  // Eventos de reactivación con throttling
  window.addEventListener('focus', check, { passive: true })
  document.addEventListener('visibilitychange', () => { 
    if (document.visibilityState === 'visible') check() 
  }, { passive: true })
})


