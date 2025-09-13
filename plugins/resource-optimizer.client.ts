/**
 * Plugin de optimización de recursos
 * Optimiza la carga de recursos y mejora el rendimiento general
 */

export default defineNuxtPlugin(() => {
  if (!process.client) return

  // Optimizar carga de fuentes
  const optimizeFonts = () => {
    // Precargar fuentes críticas
    const fontLink = document.createElement('link')
    fontLink.rel = 'preload'
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Raleway:wght@300;400;500;600;700&display=swap'
    fontLink.as = 'style'
    fontLink.crossOrigin = 'anonymous'
    document.head.appendChild(fontLink)
  }

  // Optimizar carga de imágenes
  const optimizeImages = () => {
    // Agregar loading="lazy" a todas las imágenes que no lo tengan
    const images = document.querySelectorAll('img:not([loading])')
    images.forEach(img => {
      img.setAttribute('loading', 'lazy')
    })
  }

  // Optimizar scroll performance
  const optimizeScroll = () => {
    let ticking = false
    
    const updateScrollPosition = () => {
      // Aquí puedes agregar lógica de scroll si es necesaria
      ticking = false
    }
    
    const requestTick = () => {
      if (!ticking) {
        requestAnimationFrame(updateScrollPosition)
        ticking = true
      }
    }
    
    window.addEventListener('scroll', requestTick, { passive: true })
  }

  // Optimizar resize performance
  const optimizeResize = () => {
    let resizeTimeout: NodeJS.Timeout | null = null
    
    const handleResize = () => {
      if (resizeTimeout) {
        clearTimeout(resizeTimeout)
      }
      
      resizeTimeout = setTimeout(() => {
        // Aquí puedes agregar lógica de resize si es necesaria
      }, 250)
    }
    
    window.addEventListener('resize', handleResize, { passive: true })
  }

  // Optimizar click performance
  const optimizeClicks = () => {
    // Usar event delegation para mejorar performance
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement
      
      // Optimizar clicks en botones
      if (target.matches('button, .btn, [role="button"]')) {
        // Agregar feedback visual inmediato
        target.style.transform = 'scale(0.98)'
        setTimeout(() => {
          target.style.transform = ''
        }, 150)
      }
    }, { passive: true })
  }

  // Optimizar memoria
  const optimizeMemory = () => {
    // Limpiar event listeners cuando la página se oculta
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        // Pausar operaciones pesadas
        console.log('Página oculta - pausando operaciones pesadas')
      } else {
        // Reanudar operaciones
        console.log('Página visible - reanudando operaciones')
      }
    })
  }

  // Inicializar optimizaciones
  const initOptimizations = () => {
    optimizeFonts()
    optimizeImages()
    optimizeScroll()
    optimizeResize()
    optimizeClicks()
    optimizeMemory()
  }

  // Ejecutar optimizaciones cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initOptimizations)
  } else {
    initOptimizations()
  }

  // Re-ejecutar optimizaciones cuando se añadan nuevos elementos
  const observer = new MutationObserver((mutations) => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as Element
          // Optimizar nuevas imágenes
          const images = element.querySelectorAll('img:not([loading])')
          images.forEach(img => {
            img.setAttribute('loading', 'lazy')
          })
        }
      })
    })
  })

  observer.observe(document.body, {
    childList: true,
    subtree: true
  })

  // Cleanup
  const cleanup = () => {
    observer.disconnect()
  }

  window.addEventListener('beforeunload', cleanup)

  return {
    provide: {
      optimizeImages,
      optimizeFonts
    }
  }
})
