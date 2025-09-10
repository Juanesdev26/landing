export default defineNuxtPlugin(() => {
  if (!process.client) return
  if (!import.meta.env.DEV) return

  const originalWarn = console.warn.bind(console)
  const originalError = console.error.bind(console)
  const originalInfo = console.info.bind(console)

  const shouldSilence = (args: unknown[]): boolean => {
    try {
      const text = args
        .map((a) => {
          if (typeof a === 'string') return a
          if (a && typeof a === 'object' && 'message' in (a as any)) return String((a as any).message)
          return ''
        })
        .join(' ')

      if (!text) return false
      const patterns = [
        'El diseño se forzó antes de que la página se cargara completamente',
        'Layout was forced before the page was fully loaded'
      ]
      return patterns.some((p) => text.includes(p))
    } catch {
      return false
    }
  }

  console.warn = (...args: unknown[]) => {
    if (shouldSilence(args)) return
    originalWarn(...args as any)
  }

  console.error = (...args: unknown[]) => {
    if (shouldSilence(args)) return
    originalError(...args as any)
  }

  console.info = (...args: unknown[]) => {
    if (shouldSilence(args)) return
    originalInfo(...args as any)
  }
})


