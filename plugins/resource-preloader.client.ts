/**
 * Plugin de Precarga de Recursos Críticos
 * Optimiza la carga de recursos críticos para mejorar el rendimiento
 */

interface PreloadResource {
  href: string
  as: 'script' | 'style' | 'image' | 'font' | 'fetch'
  crossorigin?: boolean
  type?: string
  media?: string
}

interface PreloadConfig {
  critical: PreloadResource[]
  deferred: PreloadResource[]
  onHover: PreloadResource[]
}

export default defineNuxtPlugin(() => {
  const router = useRouter()
  const route = useRoute()
  
  // Cache de recursos precargados
  const preloadedResources = new Set<string>()
  const preloadPromises = new Map<string, Promise<boolean>>()

  // Configuración de recursos críticos
  const getCriticalResources = (): PreloadResource[] => {
    const baseUrl = window.location.origin
    
    return [
      // Fuentes críticas
      {
        href: 'https://fonts.googleapis.com/css2?family=Raleway:wght@300;400;500;600;700&display=swap',
        as: 'style',
        type: 'text/css'
      },
      // API endpoints críticos
      {
        href: `${baseUrl}/api/categories`,
        as: 'fetch',
        crossorigin: true
      },
      {
        href: `${baseUrl}/api/products`,
        as: 'fetch',
        crossorigin: true
      }
    ]
  }

  // Configuración de recursos diferidos
  const getDeferredResources = (): PreloadResource[] => {
    const baseUrl = window.location.origin
    
    return [
      // APIs no críticas
      {
        href: `${baseUrl}/api/offers/active`,
        as: 'fetch',
        crossorigin: true
      },
      {
        href: `${baseUrl}/api/orders/recent`,
        as: 'fetch',
        crossorigin: true
      }
    ]
  }

  // Configuración de recursos para hover
  const getHoverResources = (): PreloadResource[] => {
    const baseUrl = window.location.origin
    
    return [
      // Páginas que probablemente se visiten
      {
        href: `${baseUrl}/shop`,
        as: 'fetch',
        crossorigin: true
      },
      {
        href: `${baseUrl}/user`,
        as: 'fetch',
        crossorigin: true
      }
    ]
  }

  // Función para precargar un recurso
  const preloadResource = (resource: PreloadResource): Promise<boolean> => {
    const key = `${resource.href}-${resource.as}`
    
    if (preloadedResources.has(key)) {
      return Promise.resolve(true)
    }

    if (preloadPromises.has(key)) {
      return preloadPromises.get(key)!
    }

    const promise = new Promise<boolean>((resolve) => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.href = resource.href
      link.as = resource.as

      if (resource.crossorigin) {
        link.crossOrigin = 'anonymous'
      }

      if (resource.type) {
        link.type = resource.type
      }

      if (resource.media) {
        link.media = resource.media
      }

      link.onload = () => {
        preloadedResources.add(key)
        resolve(true)
      }

      link.onerror = () => {
        console.warn(`Failed to preload resource: ${resource.href}`)
        resolve(false)
      }

      // Timeout para evitar recursos que nunca cargan
      setTimeout(() => {
        if (!preloadedResources.has(key)) {
          console.warn(`Preload timeout for: ${resource.href}`)
          resolve(false)
        }
      }, 10000)

      document.head.appendChild(link)
    })

    preloadPromises.set(key, promise)
    return promise
  }

  // Función para precargar múltiples recursos
  const preloadResources = async (resources: PreloadResource[]): Promise<boolean[]> => {
    const promises = resources.map(preloadResource)
    return Promise.allSettled(promises).then(results => 
      results.map(result => result.status === 'fulfilled' && result.value)
    )
  }

  // Función para precargar recursos críticos
  const preloadCriticalResources = () => {
    const criticalResources = getCriticalResources()
    return preloadResources(criticalResources)
  }

  // Función para precargar recursos diferidos
  const preloadDeferredResources = () => {
    // Precargar después de que la página esté cargada
    if (document.readyState === 'complete') {
      const deferredResources = getDeferredResources()
      return preloadResources(deferredResources)
    }

    window.addEventListener('load', () => {
      setTimeout(() => {
        const deferredResources = getDeferredResources()
        preloadResources(deferredResources)
      }, 1000) // Esperar 1 segundo después del load
    })
  }

  // Función para precargar recursos en idle
  const preloadOnIdle = () => {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        const hoverResources = getHoverResources()
        preloadResources(hoverResources)
      }, { timeout: 5000 })
    } else {
      setTimeout(() => {
        const hoverResources = getHoverResources()
        preloadResources(hoverResources)
      }, 3000)
    }
  }

  // Función para precargar página basada en hover
  const setupHoverPreloading = () => {
    // Precargar páginas cuando se hace hover en enlaces
    const links = document.querySelectorAll('a[href^="/"]')
    
    links.forEach(link => {
      link.addEventListener('mouseenter', () => {
        const href = link.getAttribute('href')
        if (href && !preloadedResources.has(`prefetch-${href}`)) {
          // Crear link de prefetch
          const prefetchLink = document.createElement('link')
          prefetchLink.rel = 'prefetch'
          prefetchLink.href = href
          document.head.appendChild(prefetchLink)
          
          preloadedResources.add(`prefetch-${href}`)
        }
      }, { once: true })
    })
  }

  // Función para precargar API basada en navegación
  const preloadAPIForRoute = (routePath: string) => {
    const baseUrl = window.location.origin
    const apiEndpoints: Record<string, string[]> = {
      '/shop': [`${baseUrl}/api/categories`, `${baseUrl}/api/products`],
      '/user': [`${baseUrl}/api/orders/my`, `${baseUrl}/api/customers/my`],
      '/admin': [`${baseUrl}/api/dashboard`, `${baseUrl}/api/orders/stats`],
      '/admin/products': [`${baseUrl}/api/products`, `${baseUrl}/api/categories`],
      '/admin/orders': [`${baseUrl}/api/orders`, `${baseUrl}/api/orders/stats`],
      '/admin/customers': [`${baseUrl}/api/customers`, `${baseUrl}/api/customers/stats`]
    }

    const endpoints = apiEndpoints[routePath]
    if (endpoints) {
      const resources = endpoints.map(href => ({
        href,
        as: 'fetch' as const,
        crossorigin: true
      }))
      
      preloadResources(resources)
    }
  }

  // Función para optimizar carga de fuentes
  const optimizeFonts = () => {
    // Precargar fuentes críticas
    const fontUrls = [
      'https://fonts.gstatic.com/s/raleway/v28/1Ptxg8zYS_SKggPN4iEgvn6vRKz7x1jQ.woff2',
      'https://fonts.gstatic.com/s/raleway/v28/1Ptxg8zYS_SKggPNyCgvn6vRKz7x1jQ.woff2'
    ]

    fontUrls.forEach(url => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.href = url
      link.as = 'font'
      link.type = 'font/woff2'
      link.crossOrigin = 'anonymous'
      document.head.appendChild(link)
    })
  }

  // Función para precargar componentes críticos
  const preloadCriticalComponents = () => {
    // Precargar componentes que se usan en la página actual
    const currentRoute = route.path
    
    if (currentRoute.includes('/admin')) {
      // Precargar componentes de admin
      import('~/components/admin/products/ProductModal.vue').catch(() => {})
      import('~/components/admin/orders/OrderModal.vue').catch(() => {})
    }
    
    if (currentRoute.includes('/shop')) {
      // Precargar componentes de shop
      import('~/components/common/Toast.vue').catch(() => {})
    }
  }

  // Función principal de inicialización
  const init = () => {
    // 1. Precargar recursos críticos inmediatamente
    preloadCriticalResources()
    
    // 2. Optimizar fuentes
    optimizeFonts()
    
    // 3. Precargar componentes críticos
    preloadCriticalComponents()
    
    // 4. Configurar precarga en hover
    setupHoverPreloading()
    
    // 5. Precargar recursos diferidos
    preloadDeferredResources()
    
    // 6. Precargar recursos en idle
    preloadOnIdle()
  }

  // Escuchar cambios de ruta para precargar APIs
  router.afterEach((to) => {
    preloadAPIForRoute(to.path)
  })

  // Inicializar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }

  // Limpiar al desmontar
  onUnmounted(() => {
    preloadedResources.clear()
    preloadPromises.clear()
  })

  // Exponer funciones globalmente
  return {
    provide: {
      preloader: {
        preloadResource,
        preloadResources,
        preloadCriticalResources,
        preloadAPIForRoute
      }
    }
  }
})
