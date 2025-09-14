/**
 * Plugin de Optimización de Transiciones de Tema
 * Hace que los cambios de tema sean ultra rápidos y fluidos
 */

export default defineNuxtPlugin(() => {
  // Optimizar transiciones CSS para cambios de tema
  const optimizeThemeTransitions = () => {
    // Crear estilos optimizados para cambios de tema
    const style = document.createElement('style')
    style.textContent = `
      /* Transiciones ultra rápidas para cambios de tema */
      .theme-container,
      .theme-header,
      .theme-card-bg,
      .theme-button,
      .theme-input,
      .theme-nav-item,
      .theme-text-primary,
      .theme-text-secondary,
      .theme-border {
        transition: background-color 0.08s cubic-bezier(0.4, 0, 0.2, 1),
                    color 0.08s cubic-bezier(0.4, 0, 0.2, 1),
                    border-color 0.08s cubic-bezier(0.4, 0, 0.2, 1),
                    box-shadow 0.08s cubic-bezier(0.4, 0, 0.2, 1) !important;
      }

      /* Transiciones instantáneas para elementos críticos */
      .theme-hero-bg,
      .theme-section-bg,
      .theme-section-bg-alt {
        transition: background-color 0.05s cubic-bezier(0.4, 0, 0.2, 1) !important;
      }

      /* Optimizar transiciones de botones y elementos interactivos */
      .theme-button:hover,
      .theme-nav-item:hover {
        transition: all 0.08s cubic-bezier(0.4, 0, 0.2, 1) !important;
      }

      /* Deshabilitar transiciones durante el cambio de tema para evitar glitches */
      .theme-changing * {
        transition: none !important;
      }
    `
    document.head.appendChild(style)
  }

  // Función para deshabilitar temporalmente las transiciones durante el cambio
  const disableTransitionsDuringChange = () => {
    document.documentElement.classList.add('theme-changing')
    
    // Rehabilitar después de un frame
    requestAnimationFrame(() => {
      document.documentElement.classList.remove('theme-changing')
    })
  }

  // Interceptar cambios de tema para optimizar
  const { toggleTheme: originalToggle, setTheme: originalSetTheme } = useTheme()
  
  // Crear versión optimizada del toggle
  const optimizedToggleTheme = () => {
    disableTransitionsDuringChange()
    originalToggle()
  }

  // Crear versión optimizada del setTheme
  const optimizedSetTheme = (theme: 'light' | 'dark') => {
    disableTransitionsDuringChange()
    originalSetTheme(theme)
  }

  // Optimizar el renderizado de cambios de tema
  const optimizeThemeRendering = () => {
    // Usar CSS containment para mejor rendimiento
    const containers = document.querySelectorAll('.theme-container, .theme-header')
    containers.forEach(container => {
      if (container instanceof HTMLElement) {
        container.style.contain = 'layout style paint'
      }
    })
  }

  // Función para precargar estilos de tema
  const preloadThemeStyles = () => {
    // Crear elementos invisibles para precargar estilos
    const preloadElements = document.createElement('div')
    preloadElements.className = 'theme-dark theme-light'
    preloadElements.style.display = 'none'
    preloadElements.innerHTML = `
      <div class="theme-container theme-header theme-card-bg theme-button theme-input"></div>
    `
    document.body.appendChild(preloadElements)
    
    // Remover después de un momento
    setTimeout(() => {
      document.body.removeChild(preloadElements)
    }, 1000)
  }

  // Función para optimizar el scroll durante cambios de tema
  const optimizeScrollDuringThemeChange = () => {
    let isChanging = false
    
    // Interceptar cambios de tema
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          const target = mutation.target as HTMLElement
          if (target.classList.contains('theme-light') || target.classList.contains('theme-dark')) {
            if (!isChanging) {
              isChanging = true
              // Mantener la posición de scroll
              const scrollY = window.scrollY
              
              requestAnimationFrame(() => {
                window.scrollTo(0, scrollY)
                isChanging = false
              })
            }
          }
        }
      })
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    })

    return () => observer.disconnect()
  }

  // Función para optimizar imágenes durante cambios de tema
  const optimizeImagesDuringThemeChange = () => {
    const images = document.querySelectorAll('img[data-lazy]')
    
    images.forEach(img => {
      if (img instanceof HTMLImageElement) {
        // Pausar lazy loading durante cambios de tema
        img.style.willChange = 'auto'
        
        // Reanudar después del cambio
        setTimeout(() => {
          img.style.willChange = ''
        }, 100)
      }
    })
  }

  // Inicializar optimizaciones
  const init = () => {
    optimizeThemeTransitions()
    preloadThemeStyles()
    optimizeThemeRendering()
    
    // Configurar observador de scroll
    const cleanupScroll = optimizeScrollDuringThemeChange()
    
    // Escuchar cambios de tema para optimizar imágenes
    const { watch } = useTheme()
    watch('theme', () => {
      optimizeImagesDuringThemeChange()
    })

    // Cleanup
    onUnmounted(() => {
      cleanupScroll?.()
    })
  }

  // Inicializar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }

  // Exponer funciones optimizadas
  return {
    provide: {
      themeOptimizer: {
        optimizedToggleTheme,
        optimizedSetTheme,
        disableTransitionsDuringChange,
        optimizeThemeRendering
      }
    }
  }
})
