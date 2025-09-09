export default defineNuxtPlugin(() => {
  const router = useRouter()

  // Solo registrar y no forzar redirects agresivos
  router.onError((err) => {
    console.error('[router error]', err)
  })

  router.afterEach((_to, _from, failure) => {
    if (failure) {
      console.warn('[router failure]', failure)
    }
  })
})


