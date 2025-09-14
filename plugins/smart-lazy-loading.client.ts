/**
 * Plugin de Lazy Loading Inteligente
 * Optimiza la carga de imágenes con Intersection Observer y precarga inteligente
 */

interface LazyImageOptions {
  src: string
  alt: string
  placeholder?: string
  priority?: boolean
  quality?: number
  sizes?: string
}

interface LazyImageElement extends HTMLImageElement {
  _lazyOptions?: LazyImageOptions
  _lazyObserver?: IntersectionObserver
  _lazyLoaded?: boolean
}

export default defineNuxtPlugin(() => {
  // Cache de imágenes precargadas
  const imageCache = new Map<string, Promise<boolean>>()
  const loadedImages = new Set<string>()
  
  // Configuración del Intersection Observer
  const observerOptions: IntersectionObserverInit = {
    root: null,
    rootMargin: '50px 0px 50px 0px', // Cargar 50px antes de que sea visible
    threshold: 0.01
  }

  // Observer para lazy loading
  let lazyObserver: IntersectionObserver | null = null

  // Función para precargar imagen con cache inteligente
  const preloadImage = (src: string, quality = 80): Promise<boolean> => {
    if (loadedImages.has(src)) {
      return Promise.resolve(true)
    }

    if (imageCache.has(src)) {
      return imageCache.get(src)!
    }

    const promise = new Promise<boolean>((resolve) => {
      const img = new Image()
      
      // Optimización de calidad según el dispositivo
      const optimizedSrc = optimizeImageSrc(src, quality)
      
      img.onload = () => {
        loadedImages.add(src)
        resolve(true)
      }
      
      img.onerror = () => {
        console.warn(`Failed to load image: ${src}`)
        resolve(false)
      }
      
      // Timeout para evitar imágenes que nunca cargan
      setTimeout(() => {
        if (!loadedImages.has(src)) {
          console.warn(`Image load timeout: ${src}`)
          resolve(false)
        }
      }, 10000)
      
      img.src = optimizedSrc
    })

    imageCache.set(src, promise)
    return promise
  }

  // Función para optimizar URL de imagen
  const optimizeImageSrc = (src: string, quality = 80): string => {
    // Si es una imagen externa, agregar parámetros de optimización
    if (src.includes('http')) {
      const url = new URL(src)
      
      // Agregar parámetros de optimización para servicios comunes
      if (url.hostname.includes('unsplash.com') || url.hostname.includes('picsum.photos')) {
        url.searchParams.set('w', '800')
        url.searchParams.set('q', quality.toString())
        url.searchParams.set('auto', 'format')
      }
      
      return url.toString()
    }
    
    return src
  }

  // Función para crear placeholder SVG
  const createPlaceholder = (width = 400, height = 300): string => {
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f3f4f6"/>
        <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#9ca3af" font-family="system-ui, sans-serif" font-size="14">
          Cargando...
        </text>
      </svg>
    `
    return `data:image/svg+xml;base64,${btoa(svg)}`
  }

  // Función para aplicar lazy loading a una imagen
  const setupLazyImage = (img: LazyImageElement) => {
    if (img._lazyLoaded || !img._lazyOptions) return

    const { src, alt, placeholder, priority } = img._lazyOptions
    
    // Configurar atributos básicos
    img.alt = alt || ''
    img.loading = priority ? 'eager' : 'lazy'
    
    // Establecer placeholder
    if (placeholder) {
      img.src = placeholder
    } else {
      img.src = createPlaceholder()
    }

    // Agregar clases de transición
    img.style.transition = 'opacity 0.3s ease, filter 0.3s ease'
    img.style.opacity = '0.7'
    img.style.filter = 'blur(2px)'

    // Función de carga
    const loadImage = async () => {
      try {
        const success = await preloadImage(src, img._lazyOptions?.quality)
        
        if (success) {
          img.src = src
          img.style.opacity = '1'
          img.style.filter = 'none'
          img._lazyLoaded = true
          
          // Remover del observer
          if (img._lazyObserver) {
            img._lazyObserver.unobserve(img)
          }
        }
      } catch (error) {
        console.error('Error loading lazy image:', error)
      }
    }

    // Cargar inmediatamente si es prioritaria o si está cerca del viewport
    if (priority) {
      loadImage()
      return
    }

    // Configurar observer
    if (!lazyObserver) {
      lazyObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as LazyImageElement
            loadImage()
          }
        })
      }, observerOptions)
    }

    lazyObserver.observe(img)
    img._lazyObserver = lazyObserver
  }

  // Función para precargar imágenes críticas
  const preloadCriticalImages = () => {
    // Precargar imágenes del hero y above-the-fold
    const criticalImages = document.querySelectorAll('img[data-priority="true"]')
    criticalImages.forEach((img) => {
      const src = img.getAttribute('src') || img.getAttribute('data-src')
      if (src) {
        preloadImage(src, 90) // Mayor calidad para imágenes críticas
      }
    })
  }

  // Función para precargar imágenes en hover
  const setupHoverPreload = () => {
    const hoverElements = document.querySelectorAll('[data-hover-preload]')
    
    hoverElements.forEach(element => {
      const preloadSrc = element.getAttribute('data-hover-preload')
      if (preloadSrc) {
        element.addEventListener('mouseenter', () => {
          preloadImage(preloadSrc, 70)
        }, { once: true })
      }
    })
  }

  // Función para optimizar imágenes existentes
  const optimizeExistingImages = () => {
    const images = document.querySelectorAll('img:not([data-lazy-processed])')
    
    images.forEach(img => {
      const src = img.getAttribute('src')
      if (src && !src.startsWith('data:') && !loadedImages.has(src)) {
        img.setAttribute('data-lazy-processed', 'true')
        
        // Aplicar lazy loading a imágenes no críticas
        if (!img.hasAttribute('data-priority')) {
          img.setAttribute('loading', 'lazy')
        }
        
        // Precargar imagen
        preloadImage(src)
      }
    })
  }

  // Función para limpiar cache
  const cleanupCache = () => {
    // Limpiar cache cada 5 minutos
    setInterval(() => {
      if (imageCache.size > 100) {
        imageCache.clear()
        loadedImages.clear()
      }
    }, 5 * 60 * 1000)
  }

  // Inicializar cuando el DOM esté listo
  const init = () => {
    // Precargar imágenes críticas inmediatamente
    preloadCriticalImages()
    
    // Configurar precarga en hover
    setupHoverPreload()
    
    // Optimizar imágenes existentes
    optimizeExistingImages()
    
    // Limpiar cache periódicamente
    cleanupCache()
    
    // Observer para nuevos elementos agregados dinámicamente
    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element
            
            // Buscar imágenes lazy
            const lazyImages = element.querySelectorAll('[data-lazy]') as NodeListOf<LazyImageElement>
            lazyImages.forEach(setupLazyImage)
            
            // Buscar imágenes con precarga en hover
            const hoverElements = element.querySelectorAll('[data-hover-preload]')
            hoverElements.forEach(el => {
              const preloadSrc = el.getAttribute('data-hover-preload')
              if (preloadSrc) {
                el.addEventListener('mouseenter', () => {
                  preloadImage(preloadSrc, 70)
                }, { once: true })
              }
            })
          }
        })
      })
    })

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true
    })
  }

  // Inicializar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }

  // Limpiar observers al desmontar
  onUnmounted(() => {
    if (lazyObserver) {
      lazyObserver.disconnect()
    }
    imageCache.clear()
    loadedImages.clear()
  })

  // Exponer funciones globalmente para uso en componentes
  return {
    provide: {
      lazyImage: {
        preload: preloadImage,
        optimize: optimizeImageSrc,
        createPlaceholder,
        setup: setupLazyImage
      }
    }
  }
})
