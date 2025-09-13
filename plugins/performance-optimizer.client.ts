/**
 * Plugin de optimización de rendimiento
 * Reduce memory leaks y mejora el rendimiento general de la aplicación
 */

export default defineNuxtPlugin(() => {
  if (!process.client) return

  // Cleanup global para prevenir memory leaks
  const cleanupFunctions: (() => void)[] = []

  // Optimizar localStorage operations
  const originalSetItem = localStorage.setItem
  const originalGetItem = localStorage.getItem
  
  // Debounce localStorage writes para prevenir bloqueos
  let localStorageWriteQueue = new Map<string, string>()
  let localStorageWriteTimeout: NodeJS.Timeout | null = null
  
  const debouncedLocalStorageWrite = () => {
    if (localStorageWriteTimeout) {
      clearTimeout(localStorageWriteTimeout)
    }
    
    localStorageWriteTimeout = setTimeout(() => {
      try {
        localStorageWriteQueue.forEach((value, key) => {
          originalSetItem.call(localStorage, key, value)
        })
        localStorageWriteQueue.clear()
      } catch (e) {
        console.warn('localStorage write error:', e)
      }
    }, 100) // 100ms debounce
  }

  // Intercept localStorage.setItem para debounce
  localStorage.setItem = function(key: string, value: string) {
    localStorageWriteQueue.set(key, value)
    debouncedLocalStorageWrite()
  }

  // Optimizar scroll events
  let scrollTimeout: NodeJS.Timeout | null = null
  const optimizedScrollHandler = () => {
    if (scrollTimeout) {
      clearTimeout(scrollTimeout)
    }
    scrollTimeout = setTimeout(() => {
      // Solo ejecutar scroll handlers si es necesario
      window.dispatchEvent(new CustomEvent('optimized-scroll'))
    }, 16) // ~60fps
  }

  window.addEventListener('scroll', optimizedScrollHandler, { passive: true })
  cleanupFunctions.push(() => {
    window.removeEventListener('scroll', optimizedScrollHandler)
  })

  // Optimizar resize events
  let resizeTimeout: NodeJS.Timeout | null = null
  const optimizedResizeHandler = () => {
    if (resizeTimeout) {
      clearTimeout(resizeTimeout)
    }
    resizeTimeout = setTimeout(() => {
      window.dispatchEvent(new CustomEvent('optimized-resize'))
    }, 250) // 250ms debounce
  }

  window.addEventListener('resize', optimizedResizeHandler, { passive: true })
  cleanupFunctions.push(() => {
    window.removeEventListener('resize', optimizedResizeHandler)
  })

  // Cleanup function
  const cleanup = () => {
    cleanupFunctions.forEach(fn => {
      try { fn() } catch (e) { console.error('Performance cleanup error:', e) }
    })
    
    // Restore original localStorage methods
    localStorage.setItem = originalSetItem
    localStorage.getItem = originalGetItem
    
    // Clear timeouts
    if (localStorageWriteTimeout) clearTimeout(localStorageWriteTimeout)
    if (scrollTimeout) clearTimeout(scrollTimeout)
    if (resizeTimeout) clearTimeout(resizeTimeout)
  }

  // Register cleanup
  window.addEventListener('beforeunload', cleanup)
  cleanupFunctions.push(() => {
    window.removeEventListener('beforeunload', cleanup)
  })

  // Cleanup on page hide
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      // Pause heavy operations when tab is hidden
      if (localStorageWriteTimeout) {
        clearTimeout(localStorageWriteTimeout)
        // Flush remaining writes
        localStorageWriteQueue.forEach((value, key) => {
          try {
            originalSetItem.call(localStorage, key, value)
          } catch (e) {
            console.warn('localStorage flush error:', e)
          }
        })
        localStorageWriteQueue.clear()
      }
    }
  })

  // Provide optimized events to the app
  return {
    provide: {
      optimizedScroll: () => window.addEventListener('optimized-scroll', () => {}),
      optimizedResize: () => window.addEventListener('optimized-resize', () => {})
    }
  }
})
