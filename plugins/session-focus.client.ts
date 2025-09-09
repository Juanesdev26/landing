export default defineNuxtPlugin(() => {
  if (!process.client) return
  const supabase = useSupabaseClient<any>()
  const router = useRouter()

  const protectedPath = (p: string) => p.startsWith('/admin') || p.startsWith('/user') || p.startsWith('/shop/cart')

  const check = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const current = router.currentRoute.value.path
      if (!session && protectedPath(current)) await router.replace('/login')
    } catch {}
  }

  window.addEventListener('focus', check)
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') check() })
})


