import { isNavigationFailure, NavigationFailureType } from 'vue-router'

export default defineNuxtPlugin(() => {
  const router = useRouter()
  const { user, checkAuth } = useAuth()

  // Solo registrar y no forzar redirects agresivos
  router.onError((err) => {
    const msg = String((err as any)?.message || '')
    if (msg.includes('Avoided redundant navigation')) return
    console.error('[router error]', err)
  })

  router.afterEach((_to, _from, failure) => {
    if (!failure) return
    if (isNavigationFailure(failure, NavigationFailureType.duplicated)) return
    const msg = String((failure as any)?.message || '')
    if (msg.includes('Avoided redundant navigation')) return
    console.warn('[router failure]', failure)
  })

  // Evitar quedarse en /login si ya hay sesión (después de OAuth) y prevenir estados intermedios
  router.beforeEach(async (to, _from) => {
    if (to.path === '/login') {
      let role = user.value?.role as any
      if (!role) {
        const ok = await checkAuth()
        role = ok ? (user.value?.role as any) : null
      }
      if (role === 'admin') return '/dashboard'
      if (role === 'user' || role === 'customer') return '/user'
    }
  })
})


