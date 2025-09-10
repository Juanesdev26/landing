export default defineNuxtPlugin(() => {
  const router = useRouter()

  // Solo registrar y no forzar redirects agresivos
  router.onError((err) => {
    const msg = String((err as any)?.message || '')
    if (msg.includes('Avoided redundant navigation')) return
    console.error('[router error]', err)
  })

  router.afterEach((_to, _from, failure) => {
    if (!failure) return
    const msg = String((failure as any)?.message || '')
    if (msg.includes('Avoided redundant navigation')) return
    console.warn('[router failure]', failure)
  })
})


