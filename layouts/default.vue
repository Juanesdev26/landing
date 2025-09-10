<template>
  <div class="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
    <!-- Header -->
    <header class="bg-white/80 backdrop-blur-md shadow-lg border-b border-pink-100 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-20">
          <!-- Logo -->
          <div class="flex items-center">
            <NuxtLink to="/" class="flex items-center space-x-2 group">
              <div class="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Icon name="heroicons:sparkles" class="w-6 h-6 text-white" />
              </div>
              <span class="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                BylotoStore
              </span>
            </NuxtLink>
          </div>

          <!-- Navigation -->
          <nav class="hidden md:flex space-x-8">
            <button v-if="isUser" @click="navigateToOffers" class="relative text-gray-700 hover:text-pink-600 transition-colors font-medium group">
              Mis Ofertas
              <span class="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-pink-500 to-purple-600 group-hover:w-full transition-all duration-300"></span>
            </button>
            <NuxtLink to="/shop" class="relative text-gray-700 hover:text-pink-600 transition-colors font-medium group">
              Productos
              <span class="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-pink-500 to-purple-600 group-hover:w-full transition-all duration-300"></span>
            </NuxtLink>
            <NuxtLink to="/shop/category/1" class="relative text-gray-700 hover:text-pink-600 transition-colors font-medium group">
              Categorías
              <span class="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-pink-500 to-purple-600 group-hover:w-full transition-all duration-300"></span>
            </NuxtLink>
            <NuxtLink to="/about" class="relative text-gray-700 hover:text-pink-600 transition-colors font-medium group">
              Nosotros
              <span class="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-pink-500 to-purple-600 group-hover:w-full transition-all duration-300"></span>
            </NuxtLink>
          </nav>

          <!-- User Menu -->
          <div class="flex items-center space-x-6">
            <!-- Search -->
            <div class="relative hidden lg:block">
              <input 
                type="text" 
                placeholder="Buscar productos..." 
                class="w-64 pl-10 pr-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors"
              >
              <Icon name="heroicons:magnifying-glass" class="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            </div>

            <!-- Cart (solo usuarios) -->
            <button v-if="isUser" @click="navigateToCart" class="relative text-gray-700 hover:text-pink-600 transition-colors group">
              <div class="p-2 rounded-full bg-gradient-to-r from-pink-100 to-purple-100 group-hover:from-pink-200 group-hover:to-purple-200 transition-all duration-300">
                <Icon name="heroicons:shopping-cart" class="w-6 h-6" />
              </div>
              <span v-if="cartItemsCount > 0" class="absolute -top-1 -right-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold shadow-lg animate-pulse">
                {{ cartItemsCount }}
              </span>
            </button>

            <!-- Login Button (oculto si hay sesión) -->
            <NuxtLink v-if="!authUser" to="/login" class="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-2 rounded-full font-medium hover:from-pink-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
              Iniciar Sesión
            </NuxtLink>

            <!-- Logout cuando hay sesión -->
            <button v-else @click="handleLogout" class="bg-gray-100 text-gray-700 px-6 py-2 rounded-full font-medium hover:bg-gray-200 transition-all duration-300 shadow-sm">
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
    <footer class="bg-gradient-to-r from-gray-900 via-purple-900 to-pink-900 text-white relative overflow-hidden">
      <!-- Background decoration -->
      <div class="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-purple-500/10"></div>
      <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500"></div>
      
      <div class="relative max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div class="space-y-4">
            <div class="flex items-center space-x-2">
              <div class="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                <Icon name="heroicons:sparkles" class="w-5 h-5 text-white" />
              </div>
              <h3 class="text-xl font-bold">BylotoStore</h3>
            </div>
            <p class="text-gray-300 leading-relaxed">
              Tu tienda de belleza y moda femenina con los mejores productos seleccionados especialmente para la mujer moderna y elegante.
            </p>
            <div class="flex space-x-4">
              <a href="#" class="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-300">
                <Icon name="heroicons:globe-alt" class="w-5 h-5 text-white" />
              </a>
              <a href="#" class="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-300">
                <Icon name="heroicons:heart" class="w-5 h-5 text-white" />
              </a>
              <a href="#" class="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-300">
                <Icon name="heroicons:star" class="w-5 h-5 text-white" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 class="text-lg font-semibold mb-6 text-pink-300">Productos</h4>
            <ul class="space-y-3">
              <li><NuxtLink to="/shop/category/1" class="text-gray-300 hover:text-pink-300 transition-colors flex items-center space-x-2 group">
                <Icon name="heroicons:sparkles" class="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>Loción</span>
              </NuxtLink></li>
              <li><NuxtLink to="/shop/category/2" class="text-gray-300 hover:text-pink-300 transition-colors flex items-center space-x-2 group">
                <Icon name="heroicons:tag" class="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>Ropa</span>
              </NuxtLink></li>
              <li><NuxtLink to="/shop/category/3" class="text-gray-300 hover:text-pink-300 transition-colors flex items-center space-x-2 group">
                <Icon name="heroicons:eye" class="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>Maquillaje</span>
              </NuxtLink></li>
              <li><NuxtLink to="/shop/category/4" class="text-gray-300 hover:text-pink-300 transition-colors flex items-center space-x-2 group">
                <Icon name="heroicons:shopping-bag" class="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>Bolsos</span>
              </NuxtLink></li>
            </ul>
          </div>
          
          <div>
            <h4 class="text-lg font-semibold mb-6 text-pink-300">Soporte</h4>
            <ul class="space-y-3">
              <li><a href="#" class="text-gray-300 hover:text-pink-300 transition-colors flex items-center space-x-2 group">
                <Icon name="heroicons:envelope" class="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>Contacto</span>
              </a></li>
              <li><a href="#" class="text-gray-300 hover:text-pink-300 transition-colors flex items-center space-x-2 group">
                <Icon name="heroicons:truck" class="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>Envíos</span>
              </a></li>
              <li><a href="#" class="text-gray-300 hover:text-pink-300 transition-colors flex items-center space-x-2 group">
                <Icon name="heroicons:arrow-path" class="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>Devoluciones</span>
              </a></li>
              <li><a href="#" class="text-gray-300 hover:text-pink-300 transition-colors flex items-center space-x-2 group">
                <Icon name="heroicons:question-mark-circle" class="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>FAQ</span>
              </a></li>
            </ul>
          </div>
          
          <div>
            <h4 class="text-lg font-semibold mb-6 text-pink-300">Newsletter</h4>
            <p class="text-gray-300 mb-4">Suscríbete para recibir ofertas exclusivas</p>
            <div class="flex space-x-2">
              <input 
                type="email" 
                placeholder="Tu email" 
                class="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-white placeholder-gray-400"
              >
              <button class="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-300">
                <Icon name="heroicons:paper-airplane" class="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
        
        <div class="border-t border-gray-700 mt-12 pt-8 text-center">
          <p class="text-gray-300">&copy; 2024 BylotoStore. Todos los derechos reservados.</p>
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
  try { await logout() } catch (e) { console.error(e) }
}

// Composable para navegación de usuario
const { navigateToOffers: navToOffers, navigateToCart: navToCart } = useUserNavigation()

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
