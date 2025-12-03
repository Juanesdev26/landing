<template>
  <div class="min-h-screen transition-colors duration-300 theme-container">
    <!-- Header (oculto para customers) -->
    <header
      v-if="!isCustomer"
      class="theme-header backdrop-blur-md shadow-lg border-b theme-border sticky top-0 z-50"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-20">
          <!-- Logo -->
          <div class="flex items-center">
            <NuxtLink to="/" class="flex items-center space-x-2 group">
              <div
                class="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300"
              >
                <Icon name="heroicons:sparkles" class="w-6 h-6 text-white" />
              </div>
              <span
                class="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent"
              >
                BylotoStore
              </span>
            </NuxtLink>
          </div>

          <!-- Navigation -->
          <nav class="hidden md:flex space-x-8">
            <button
              v-if="isUser"
              @click="navigateToOffers"
              class="relative theme-nav-item hover:text-pink-600 transition-colors font-medium group"
            >
              Mis Ofertas
              <span
                class="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-pink-500 to-purple-600 group-hover:w-full transition-all duration-300"
              ></span>
            </button>

            <NuxtLink
              v-if="isUser || isAdmin"
              to="/shop"
              class="relative theme-nav-item hover:text-pink-600 transition-colors font-medium group"
            >
              Productos
              <span
                class="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-pink-500 to-purple-600 group-hover:w-full transition-all duration-300"
              ></span>
            </NuxtLink>

            <NuxtLink
              v-if="isUser || isAdmin"
              to="/about"
              class="relative theme-nav-item hover:text-pink-600 transition-colors font-medium group"
            >
              Nosotros
              <span
                class="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-pink-500 to-purple-600 group-hover:w-full transition-all duration-300"
              ></span>
            </NuxtLink>
          </nav>

          <!-- User Menu -->
          <div class="flex items-center space-x-6">
            <!-- Theme Toggle -->
            <button
              @click="optimizedToggleTheme"
              class="p-2 rounded-full theme-button hover:theme-button-hover transition-all duration-300"
            >
              <Icon
                :name="isDark ? 'heroicons:sun' : 'heroicons:moon'"
                class="w-5 h-5 theme-text-primary"
              />
            </button>

            <!-- Cart (solo usuarios) -->
            <button
              v-if="isUser"
              @click="navigateToCart"
              class="relative theme-text-primary hover:text-pink-600 transition-colors group"
            >
              <div
                class="p-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 group-hover:from-pink-600 group-hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <Icon
                  name="heroicons:shopping-cart"
                  class="w-6 h-6 text-white"
                />
              </div>
              <span
                v-if="cartItemsCount > 0"
                class="absolute -top-1 -right-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold shadow-lg animate-pulse"
              >
                {{ cartItemsCount }}
              </span>
            </button>

            <!-- Login Button (oculto si hay sesión) -->
            <NuxtLink
              v-if="!authUser"
              to="/login"
              class="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-2 rounded-full font-medium hover:from-pink-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Iniciar Sesión
            </NuxtLink>

            <!-- Logout cuando hay sesión -->
            <button
              v-else
              @click="handleLogout"
              class="theme-button text-theme-text-primary px-6 py-2 rounded-full font-medium hover:theme-button-hover transition-all duration-300 shadow-sm"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main :key="`${$route.fullPath}-${refreshKey}`">
      <slot />
    </main>

    <!-- Footer -->
    <footer
      class="bg-gradient-to-r from-gray-900 via-purple-900 to-pink-900 text-white relative overflow-hidden"
    >
      <!-- Background decoration -->
      <div
        class="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-purple-500/10"
      ></div>
      <div
        class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500"
      ></div>

      <div class="relative max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div class="space-y-4">
            <div class="flex items-center space-x-2">
              <div
                class="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center"
              >
                <Icon name="heroicons:sparkles" class="w-5 h-5 text-white" />
              </div>
              <h3 class="text-xl font-bold">BylotoStore</h3>
            </div>
            <p class="text-gray-300 leading-relaxed">
              Tu tienda de belleza y moda femenina con los mejores productos
              seleccionados especialmente para la mujer moderna y elegante.
            </p>
            <div class="flex space-x-4">
              <a
                href="#"
                class="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-300"
              >
                <Icon name="heroicons:globe-alt" class="w-5 h-5 text-white" />
              </a>
              <a
                href="#"
                class="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-300"
              >
                <Icon name="heroicons:heart" class="w-5 h-5 text-white" />
              </a>
              <a
                href="#"
                class="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-300"
              >
                <Icon name="heroicons:star" class="w-5 h-5 text-white" />
              </a>
            </div>
          </div>

          <div>
            <h4 class="text-lg font-semibold mb-6 text-pink-300">Productos</h4>
            <ul class="space-y-3">
              <li>
                <NuxtLink
                  to="/shop/category/1"
                  class="text-gray-300 hover:text-pink-300 transition-colors flex items-center space-x-2 group"
                >
                  <Icon
                    name="heroicons:sparkles"
                    class="w-4 h-4 group-hover:scale-110 transition-transform"
                  />
                  <span>Loción</span>
                </NuxtLink>
              </li>
              <li>
                <NuxtLink
                  to="/shop/category/2"
                  class="text-gray-300 hover:text-pink-300 transition-colors flex items-center space-x-2 group"
                >
                  <Icon
                    name="heroicons:tag"
                    class="w-4 h-4 group-hover:scale-110 transition-transform"
                  />
                  <span>Ropa</span>
                </NuxtLink>
              </li>
              <li>
                <NuxtLink
                  to="/shop/category/3"
                  class="text-gray-300 hover:text-pink-300 transition-colors flex items-center space-x-2 group"
                >
                  <Icon
                    name="heroicons:eye"
                    class="w-4 h-4 group-hover:scale-110 transition-transform"
                  />
                  <span>Maquillaje</span>
                </NuxtLink>
              </li>
              <li>
                <NuxtLink
                  to="/shop/category/4"
                  class="text-gray-300 hover:text-pink-300 transition-colors flex items-center space-x-2 group"
                >
                  <Icon
                    name="heroicons:shopping-bag"
                    class="w-4 h-4 group-hover:scale-110 transition-transform"
                  />
                  <span>Bolsos</span>
                </NuxtLink>
              </li>
            </ul>
          </div>

          <div>
            <h4 class="text-lg font-semibold mb-6 text-pink-300">Soporte</h4>
            <ul class="space-y-3">
              <li>
                <a
                  href="#"
                  class="text-gray-300 hover:text-pink-300 transition-colors flex items-center space-x-2 group"
                >
                  <Icon
                    name="heroicons:envelope"
                    class="w-4 h-4 group-hover:scale-110 transition-transform"
                  />
                  <span>Contacto</span>
                </a>
              </li>
              <li>
                <a
                  href="#"
                  class="text-gray-300 hover:text-pink-300 transition-colors flex items-center space-x-2 group"
                >
                  <Icon
                    name="heroicons:truck"
                    class="w-4 h-4 group-hover:scale-110 transition-transform"
                  />
                  <span>Envíos</span>
                </a>
              </li>
              <li>
                <a
                  href="#"
                  class="text-gray-300 hover:text-pink-300 transition-colors flex items-center space-x-2 group"
                >
                  <Icon
                    name="heroicons:arrow-path"
                    class="w-4 h-4 group-hover:scale-110 transition-transform"
                  />
                  <span>Devoluciones</span>
                </a>
              </li>
              <li>
                <a
                  href="#"
                  class="text-gray-300 hover:text-pink-300 transition-colors flex items-center space-x-2 group"
                >
                  <Icon
                    name="heroicons:question-mark-circle"
                    class="w-4 h-4 group-hover:scale-110 transition-transform"
                  />
                  <span>FAQ</span>
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 class="text-lg font-semibold mb-6 text-pink-300">Newsletter</h4>
            <p class="text-gray-300 mb-4">
              Suscríbete para recibir ofertas exclusivas
            </p>
            <div class="flex space-x-2">
              <input
                type="email"
                placeholder="Tu email"
                class="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-white placeholder-gray-400"
              />
              <button
                class="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-300"
              >
                <Icon name="heroicons:paper-airplane" class="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div class="border-t border-gray-700 mt-12 pt-8 text-center">
          <p class="text-gray-300">
            &copy; 2024 BylotoStore. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
const cartItemsCount = ref(0)

// Ocultar botón de login cuando hay sesión
const authUser = useSupabaseUser()
const { logout } = useAuth()
const { user } = useAuth()
const isUser = computed(() => user.value?.role === 'user')
const isAdmin = computed(() => user.value?.role === 'admin')
const isCustomer = computed(() => user.value?.role === 'customer')

// Tema
const { theme, isDark, toggleTheme, initTheme } = useTheme()
const { $themeOptimizer } = useNuxtApp()

// Usar toggle optimizado si está disponible
const optimizedToggleTheme =
  $themeOptimizer?.optimizedToggleTheme || toggleTheme

// Inicializar tema al montar
onMounted(() => {
  initTheme()
})

// Key para forzar re-renderizado cuando sea necesario
const refreshKey = ref(0)

// Detectar inactividad y forzar refresh
let lastInteraction = Date.now()
const INACTIVITY_THRESHOLD = 5 * 60 * 1000 // 5 minutos

const handleUserActivity = () => {
  lastInteraction = Date.now()
}

const checkForInactivity = () => {
  const now = Date.now()
  if (now - lastInteraction > INACTIVITY_THRESHOLD) {
    // Forzar re-render incrementando la key
    refreshKey.value++
    lastInteraction = now
  }
}

const handleLogout = async () => {
  try {
    console.log('🚪 Iniciando logout de usuario...')

    // 1. Deshabilitar autenticación inmediatamente
    const { $disableAuth } = useNuxtApp()
    if ($disableAuth) {
      $disableAuth()
      console.log('🚫 Auth deshabilitado')
    }

    // 2. Matar la sesión completamente
    const { $killSession } = useNuxtApp()
    if ($killSession) {
      $killSession()
      return
    }

    // 3. Fallback: usar el plugin de logout forzado
    const { $forceLogout } = useNuxtApp()
    if ($forceLogout) {
      $forceLogout()
      return
    }

    // Fallback si el plugin no está disponible
    console.log(
      '⚠️ Plugin de logout forzado no disponible, usando método alternativo'
    )

    // 1. Marcar que estamos haciendo logout para evitar redirecciones automáticas
    const { $setLoggingOut } = useNuxtApp()
    if ($setLoggingOut) {
      $setLoggingOut(true)
      console.log('🚫 Flag de logout activado')
    }

    // 2. Limpiar estado local INMEDIATAMENTE
    const { user } = useAuth()
    user.value = null
    console.log('🧹 Estado de usuario limpiado')

    // 3. Limpiar localStorage INMEDIATAMENTE
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user')
      localStorage.removeItem('isAuthenticated')
      // Limpiar datos del carrito
      const cartKeys = Object.keys(localStorage).filter(key =>
        key.startsWith('cart:')
      )
      cartKeys.forEach(key => localStorage.removeItem(key))
      console.log('🧹 localStorage limpiado')
    }

    // 4. Cerrar sesión de Supabase
    const supabase = useSupabaseClient()
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('Error cerrando sesión de Supabase:', error)
    } else {
      console.log('✅ Sesión de Supabase cerrada')
    }

    // 5. Redireccionar inmediatamente usando window.location
    console.log('🔄 Redirigiendo a /login...')
    if (typeof window !== 'undefined') {
      // Forzar redirección con timeout como backup
      window.location.href = '/login'
      setTimeout(() => {
        if (window.location.pathname !== '/login') {
          console.log('🔄 Forzando redirección...')
          window.location.replace('/login')
        }
      }, 100)
    }
  } catch (e) {
    console.error('Error en logout:', e)
    // Fallback: redirección directa
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
  }
}

// Composable para navegación de usuario
const { navigateToOffers: navToOffers, navigateToCart: navToCart } =
  useUserNavigation()

// Funciones de navegación mejoradas para usuarios
const navigateToOffers = async () => {
  // Forzar refresh antes de navegar
  refreshKey.value++
  await nextTick()

  await navToOffers()
}

const navigateToCart = async () => {
  // Forzar refresh antes de navegar
  refreshKey.value++
  await nextTick()

  await navToCart()
}

// Inicializar datos básicos
onMounted(() => {
  // Simular datos de carrito
  cartItemsCount.value = 0

  // Eventos para detectar actividad
  const events = ['click', 'mousemove', 'keydown', 'scroll', 'touchstart']
  events.forEach(event => {
    document.addEventListener(event, handleUserActivity, { passive: true })
  })

  // Verificar inactividad cada minuto
  setInterval(checkForInactivity, 60000)

  // Forzar refresh cuando la ventana recupera el foco
  window.addEventListener('focus', () => {
    refreshKey.value++
  })

  // Forzar refresh cuando la página se vuelve visible
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      refreshKey.value++
    }
  })
})
</script>
