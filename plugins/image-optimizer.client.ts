/**
 * Plugin de optimización de imágenes
 * Lazy loading y optimización de imágenes para mejorar el rendimiento
 */

export default defineNuxtPlugin(() => {
  if (!process.client) return

  // Intersection Observer para lazy loading
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement
        const src = img.dataset.src
        if (src) {
          img.src = src
          img.removeAttribute('data-src')
          imageObserver.unobserve(img)
        }
      }
    })
  }, {
    rootMargin: '50px 0px',
    threshold: 0.01
  })

  // Función para observar imágenes
  const observeImages = () => {
    const images = document.querySelectorAll('img[data-src]')
    images.forEach(img => imageObserver.observe(img))
  }

  // Observar imágenes cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', observeImages)
  } else {
    observeImages()
  }

  // Observar nuevas imágenes cuando se añadan al DOM
  const mutationObserver = new MutationObserver((mutations) => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as Element
          const images = element.querySelectorAll('img[data-src]')
          images.forEach(img => imageObserver.observe(img))
        }
      })
    })
  })

  mutationObserver.observe(document.body, {
    childList: true,
    subtree: true
  })

  // Cleanup
  const cleanup = () => {
    imageObserver.disconnect()
    mutationObserver.disconnect()
  }

  window.addEventListener('beforeunload', cleanup)

  return {
    provide: {
      observeImages
    }
  }
})
