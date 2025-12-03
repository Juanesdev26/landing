

export const useTheme = () => {
  const theme = ref<'light' | 'dark'>('light')
  const isDark = computed(() => theme.value === 'dark')

  // Inicializar tema desde localStorage o preferencia del sistema
  const initTheme = () => {
    if (process.client) {
      const savedTheme = localStorage.getItem('theme')
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      
      if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
        theme.value = savedTheme as 'light' | 'dark'
      } else if (systemPrefersDark) {
        theme.value = 'dark'
      } else {
        theme.value = 'light'
      }
      
      applyTheme()
    }
  }

  // Aplicar tema al documento (optimizado para transiciones fluidas)
  const applyTheme = () => {
    if (process.client) {
      // Usar double RAF para asegurar que el navegador esté listo para la transición
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const html = document.documentElement
          
          // Agregar clase de transición antes de cambiar
          html.classList.add('theme-transitioning')
          
          // Remover clases anteriores
          html.classList.remove('theme-light', 'theme-dark', 'dark')
          
          // Agregar clase del tema actual
          html.classList.add(`theme-${theme.value}`)
          
          // También mantener compatibilidad con dark mode de Tailwind
          if (isDark.value) {
            html.classList.add('dark')
          }
          
          // Remover clase de transición después de un breve delay
          setTimeout(() => {
            html.classList.remove('theme-transitioning')
          }, 50)
          
          // Actualizar meta theme-color para móviles (con transición suave)
          const metaThemeColor = document.querySelector('meta[name="theme-color"]')
          if (metaThemeColor) {
            const newColor = isDark.value ? '#0f172a' : '#ffffff'
            metaThemeColor.setAttribute('content', newColor)
          }
          
          // Guardar en localStorage de forma asíncrona para no bloquear
          if (typeof window.requestIdleCallback === 'function') {
            requestIdleCallback(() => {
              localStorage.setItem('theme', theme.value)
            })
          } else {
            setTimeout(() => {
              localStorage.setItem('theme', theme.value)
            }, 0)
          }
        })
      })
    }
  }

  // Cambiar tema (ultra rápido)
  const toggleTheme = () => {
    theme.value = isDark.value ? 'light' : 'dark'
    applyTheme()
  }

  // Establecer tema específico
  const setTheme = (newTheme: 'light' | 'dark') => {
    if (newTheme === 'light' || newTheme === 'dark') {
      theme.value = newTheme
      applyTheme()
    }
  }

  // Escuchar cambios en la preferencia del sistema
  const watchSystemTheme = () => {
    if (process.client) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      
      const handleChange = (e: MediaQueryListEvent) => {
        // Solo cambiar si no hay tema guardado en localStorage
        const savedTheme = localStorage.getItem('theme')
        if (!savedTheme) {
          theme.value = e.matches ? 'dark' : 'light'
          applyTheme()
        }
      }
      
      mediaQuery.addEventListener('change', handleChange)
      
      // Cleanup function
      return () => {
        mediaQuery.removeEventListener('change', handleChange)
      }
    }
  }

  return {
    theme: readonly(theme),
    isDark,
    toggleTheme,
    setTheme,
    initTheme,
    watchSystemTheme
  }
}

