/**
 * Plugin de Precarga de Páginas
 * Precarga páginas y componentes basado en patrones de navegación del usuario
 */

interface PreloadConfig {
  routes: string[]
  components: string[]
  priority: 'high' | 'medium' | 'low'
  trigger: 'hover' | 'idle' | 'visibility'
}

interface NavigationPattern {
  from: string
  to: string
  frequency: number
  lastVisit: number
}

export default defineNuxtPlugin(() => {
  // Plugin deshabilitado temporalmente para evitar errores
  console.log('📄 Page preloader deshabilitado temporalmente')
  return {}
  const router = useRouter()
  const route = useRoute()
  
  // Cache de páginas precargadas
  const preloadedPages = new Set<string>()
  const preloadedComponents = new Set<string>()
  
  // Patrones de navegación del usuario
  const navigationPatterns = new Map<string, NavigationPattern>()
  
  // Configuración de precarga (solo rutas, sin componentes problemáticos)
  const preloadConfigs: Record<string, PreloadConfig> = {
    '/': {
      routes: ['/shop', '/about', '/login'],
      components: [], // Deshabilitado temporalmente
      priority: 'high',
      trigger: 'hover'
    },
    '/shop': {
      routes: ['/shop/cart', '/user'],
      components: [], // Deshabilitado temporalmente
      priority: 'high',
      trigger: 'hover'
    },
    '/user': {
      routes: ['/shop', '/user/orders'],
      components: [], // Deshabilitado temporalmente
      priority: 'medium',
      trigger: 'hover'
    },
    '/admin': {
      routes: ['/admin/products', '/admin/orders', '/admin/customers'],
      components: [], // Deshabilitado temporalmente
      priority: 'high',
      trigger: 'hover'
    }
  }

  // Función para precargar una ruta
  const preloadRoute = async (routePath: string): Promise<boolean> => {
    if (preloadedPages.has(routePath)) {
      return true
    }

    try {
      // Usar router.resolve para precargar la ruta
      const resolved = await router.resolve(routePath)
      
      if (resolved && resolved.matched.length > 0) {
        // Precargar los componentes de la ruta (simplificado)
        // Los componentes se precargan automáticamente por Nuxt
        
        preloadedPages.add(routePath)
        return true
      }
    } catch (error) {
      console.warn(`Failed to preload route: ${routePath}`, error)
    }

    return false
  }

  // Función para precargar un componente
  const preloadComponent = async (componentPath: string): Promise<boolean> => {
    if (preloadedComponents.has(componentPath)) {
      return true
    }

    try {
      // Importar el componente
      await import(/* @vite-ignore */ componentPath)
      preloadedComponents.add(componentPath)
      return true
    } catch (error) {
      console.warn(`Failed to preload component: ${componentPath}`, error)
    }

    return false
  }

  // Función para precargar múltiples rutas
  const preloadRoutes = async (routes: string[]): Promise<boolean[]> => {
    const promises = routes.map(preloadRoute)
    return Promise.allSettled(promises).then(results =>
      results.map(result => result.status === 'fulfilled' && result.value)
    )
  }

  // Función para precargar múltiples componentes
  const preloadComponents = async (components: string[]): Promise<boolean[]> => {
    const promises = components.map(preloadComponent)
    return Promise.allSettled(promises).then(results =>
      results.map(result => result.status === 'fulfilled' && result.value)
    )
  }

  // Función para precargar basado en configuración
  const preloadByConfig = async (config: PreloadConfig): Promise<void> => {
    const { routes, components, priority } = config

    // Precargar rutas
    if (routes.length > 0) {
      await preloadRoutes(routes)
    }

    // Precargar componentes
    if (components.length > 0) {
      await preloadComponents(components)
    }
  }

  // Función para precargar en idle
  const preloadOnIdle = (config: PreloadConfig): void => {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        preloadByConfig(config)
      }, { timeout: 5000 })
    } else {
      setTimeout(() => {
        preloadByConfig(config)
      }, 3000)
    }
  }

  // Función para precargar en hover
  const setupHoverPreloading = (): void => {
    const links = document.querySelectorAll('a[href^="/"]')
    
    links.forEach(link => {
      link.addEventListener('mouseenter', () => {
        const href = link.getAttribute('href')
        if (href && !preloadedPages.has(href)) {
          preloadRoute(href)
        }
      }, { once: true })
    })
  }

  // Función para actualizar patrones de navegación
  const updateNavigationPattern = (from: string, to: string): void => {
    const key = `${from}->${to}`
    const existing = navigationPatterns.get(key)
    
    if (existing) {
      existing.frequency += 1
      existing.lastVisit = Date.now()
    } else {
      navigationPatterns.set(key, {
        from,
        to,
        frequency: 1,
        lastVisit: Date.now()
      })
    }
  }

  // Función para precargar basado en patrones
  const preloadByPatterns = (): void => {
    const currentTime = Date.now()
    const oneWeek = 7 * 24 * 60 * 60 * 1000
    
    // Encontrar patrones frecuentes y recientes
    const frequentPatterns = Array.from(navigationPatterns.values())
      .filter(pattern => 
        pattern.frequency >= 3 && 
        (currentTime - pattern.lastVisit) < oneWeek
      )
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 5) // Top 5 patrones

    // Precargar rutas de patrones frecuentes
    frequentPatterns.forEach(pattern => {
      if (!preloadedPages.has(pattern.to)) {
        preloadRoute(pattern.to)
      }
    })
  }

  // Función para precargar páginas críticas
  const preloadCriticalPages = (): void => {
    const criticalPages = ['/shop', '/user', '/admin']
    
    criticalPages.forEach(page => {
      if (!preloadedPages.has(page)) {
        preloadRoute(page)
      }
    })
  }

  // Función para precargar componentes críticos (deshabilitada temporalmente)
  const preloadCriticalComponents = (): void => {
    // Deshabilitado temporalmente para evitar errores de especificadores
    // const criticalComponents = [
    //   '~/components/common/Toast.vue',
    //   '~/components/common/ConfirmModal.vue'
    // ]
    
    // criticalComponents.forEach(component => {
    //   if (!preloadedComponents.has(component)) {
    //     preloadComponent(component)
    //   }
    // })
  }

  // Función para precargar basado en la página actual
  const preloadForCurrentPage = (): void => {
    const currentPath = route.path
    const config = preloadConfigs[currentPath]
    
    if (config) {
      const { trigger } = config
      
      switch (trigger) {
        case 'idle':
          preloadOnIdle(config)
          break
        case 'hover':
          // Se maneja en setupHoverPreloading
          break
        case 'visibility':
          // Precargar cuando la página se vuelve visible
          if (document.visibilityState === 'visible') {
            preloadByConfig(config)
          }
          break
      }
    }
  }

  // Función para precargar APIs relacionadas (solo APIs públicas)
  const preloadRelatedAPIs = (): void => {
    const currentPath = route.path
    const publicApiEndpoints: Record<string, string[]> = {
      '/': ['/api/categories', '/api/products'],
      '/shop': ['/api/categories', '/api/products'],
      '/about': []
    }

    const endpoints = publicApiEndpoints[currentPath]
    if (endpoints && endpoints.length > 0) {
      endpoints.forEach(endpoint => {
        // Solo precargar APIs públicas que no requieren autenticación
        fetch(endpoint, { 
          method: 'HEAD',
          headers: {
            'Accept': 'application/json'
          }
        }).catch(() => {
          // Ignorar errores de precarga silenciosamente
        })
      })
    }
  }

  // Función para optimizar la precarga
  const optimizePreloading = (): void => {
    // Precargar solo si el usuario está activo
    if (document.visibilityState === 'hidden') {
      return
    }

    // Precargar solo si hay conexión buena
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      if (connection && connection.effectiveType === 'slow-2g') {
        return
      }
    }

    // Precargar solo si no hay muchas pestañas abiertas
    if ((performance as any).memory && (performance as any).memory.usedJSHeapSize > 50 * 1024 * 1024) {
      return
    }
  }

  // Función principal de inicialización
  const init = (): void => {
    // 1. Precargar páginas críticas
    preloadCriticalPages()
    
    // 2. Precargar componentes críticos (deshabilitado temporalmente)
    // preloadCriticalComponents()
    
    // 3. Configurar precarga en hover
    setupHoverPreloading()
    
    // 4. Precargar basado en la página actual
    preloadForCurrentPage()
    
    // 5. Precargar APIs relacionadas (deshabilitado temporalmente)
    // preloadRelatedAPIs()
    
    // 6. Precargar basado en patrones (después de un delay)
    setTimeout(() => {
      preloadByPatterns()
    }, 5000)
  }

  // Escuchar cambios de ruta
  router.afterEach((to, from) => {
    // Actualizar patrones de navegación
    updateNavigationPattern(from.path, to.path)
    
    // Precargar para la nueva página
    setTimeout(() => {
      preloadForCurrentPage()
      // preloadRelatedAPIs() // Deshabilitado temporalmente
    }, 1000)
  })

  // Escuchar cambios de visibilidad
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      // Optimizar precarga cuando la página se vuelve visible
      optimizePreloading()
    }
  })

  // Inicializar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }

  // Limpiar al desmontar
  onUnmounted(() => {
    preloadedPages.clear()
    preloadedComponents.clear()
    navigationPatterns.clear()
  })

  // Exponer funciones globalmente
  return {
    provide: {
      pagePreloader: {
        preloadRoute,
        preloadComponent,
        preloadRoutes,
        preloadComponents,
        preloadByConfig,
        preloadCriticalPages,
        preloadCriticalComponents,
        getStats: () => ({
          preloadedPages: preloadedPages.size,
          preloadedComponents: preloadedComponents.size,
          navigationPatterns: navigationPatterns.size
        })
      }
    }
  }
})
