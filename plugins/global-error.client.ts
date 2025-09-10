export default defineNuxtPlugin((nuxtApp) => {
  if (!process.client) return

  // Captura de errores globales del navegador
  window.addEventListener('error', (event: ErrorEvent) => {
    const msg = event?.error?.message || event?.message || 'Unknown error'
    const stack = event?.error?.stack
    console.error('[global error]', msg, { stack })
  })

  // Captura de promesas no manejadas
  window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
    const reason: any = event?.reason
    const msg = (reason && (reason.message || reason.toString())) || 'Unhandled rejection'
    const stack = reason && reason.stack
    console.error('[unhandledrejection]', msg, { stack })
  })

  // Captura de errores de Vue
  nuxtApp.vueApp.config.errorHandler = (err: unknown, instance, info: string) => {
    try {
      const name = (instance as any)?.$options?.name || (instance as any)?.type?.name || 'AnonymousComponent'
      console.error('[vue error]', (err as any)?.message || String(err), { info, name, stack: (err as any)?.stack })
    } catch (e) {
      console.error('[vue error]', err)
    }
  }
})


