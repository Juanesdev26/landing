<template>
  <div class="min-h-screen transition-colors duration-300 theme-container">
    <!-- Sidebar -->
    <aside class="fixed inset-y-0 left-0 z-50 w-64 shadow-lg transition-colors duration-300 theme-sidebar flex flex-col">
      <div class="flex items-center justify-center h-16 theme-header">
        <h1 class="text-xl font-bold transition-colors theme-text-primary text-gray-900 dark:text-white">Admin Panel</h1>
      </div>
      
      <nav class="mt-8 flex-1 overflow-y-auto">
        <div class="px-4 space-y-2">
          <NuxtLink 
            to="/admin" 
            class="flex items-center px-4 py-2 rounded-lg transition-colors theme-nav-item"
            :class="{ 'theme-nav-active': $route.path === '/admin' }"
          >
            <Icon name="heroicons:home" class="w-5 h-5 mr-3" />
            Dashboard
          </NuxtLink>
          
          <NuxtLink 
            to="/admin/products" 
            class="flex items-center px-4 py-2 rounded-lg transition-colors theme-nav-item"
            :class="{ 'theme-nav-active': $route.path.startsWith('/admin/products') }"
          >
            <Icon name="heroicons:cube" class="w-5 h-5 mr-3" />
            Productos
          </NuxtLink>
          
          <NuxtLink 
            to="/admin/categories" 
            class="flex items-center px-4 py-2 rounded-lg transition-colors theme-nav-item"
            :class="{ 'theme-nav-active': $route.path.startsWith('/admin/categories') }"
          >
            <Icon name="heroicons:tag" class="w-5 h-5 mr-3" />
            Categorías
          </NuxtLink>
          
          <NuxtLink 
            to="/admin/inventory" 
            class="flex items-center px-4 py-2 rounded-lg transition-colors theme-nav-item"
            :class="{ 'theme-nav-active': $route.path.startsWith('/admin/inventory') }"
          >
            <Icon name="heroicons:archive-box" class="w-5 h-5 mr-3" />
            Inventario
          </NuxtLink>
          
          <NuxtLink 
            to="/admin/providers" 
            class="flex items-center px-4 py-2 rounded-lg transition-colors theme-nav-item"
            :class="{ 'theme-nav-active': $route.path.startsWith('/admin/providers') }"
          >
            <Icon name="heroicons:truck" class="w-5 h-5 mr-3" />
            Proveedores
          </NuxtLink>
          
          <NuxtLink 
            to="/admin/orders" 
            class="flex items-center px-4 py-2 rounded-lg transition-colors theme-nav-item"
            :class="{ 'theme-nav-active': $route.path.startsWith('/admin/orders') }"
          >
            <Icon name="heroicons:shopping-bag" class="w-5 h-5 mr-3" />
            Pedidos
          </NuxtLink>
          
          <NuxtLink 
            to="/admin/customers" 
            class="flex items-center px-4 py-2 rounded-lg transition-colors theme-nav-item"
            :class="{ 'theme-nav-active': $route.path.startsWith('/admin/customers') }"
          >
            <Icon name="heroicons:users" class="w-5 h-5 mr-3" />
            Clientes
          </NuxtLink>
          
          <NuxtLink 
            to="/admin/profiles" 
            class="flex items-center px-4 py-2 rounded-lg transition-colors theme-nav-item"
            :class="{ 'theme-nav-active': $route.path.startsWith('/admin/profiles') }"
          >
            <Icon name="heroicons:user-circle" class="w-5 h-5 mr-3" />
            Usuarios
          </NuxtLink>

          <NuxtLink 
            to="/admin/offers" 
            class="flex items-center px-4 py-2 rounded-lg transition-colors theme-nav-item"
            :class="{ 'theme-nav-active': $route.path.startsWith('/admin/offers') }"
          >
            <Icon name="heroicons:tag" class="w-5 h-5 mr-3" />
            Ofertas
          </NuxtLink>
        </div>
      </nav>

      <!-- Footer fijo en la parte inferior con acciones de usuario -->
      <div class="p-4 border-t transition-colors duration-300 theme-header-bar mt-auto">
        <div class="bg-gray-50 dark:bg-white/5 rounded-lg p-3">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-white flex items-center justify-center text-sm font-semibold shadow-sm">
              {{ userInitials }}
            </div>
            <div class="min-w-0">
              <p class="text-sm font-semibold transition-colors theme-text-primary truncate">{{ userName }}</p>
              <p class="text-xs transition-colors theme-text-secondary truncate">{{ userRole }}</p>
            </div>
            <div class="ml-auto flex items-center gap-2">
              <button 
                @click="toggleTheme" 
                class="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                :title="isDark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'"
              >
                <Icon :name="isDark ? 'heroicons:sun' : 'heroicons:moon'" class="w-5 h-5" />
              </button>
              <button class="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-white/10 transition-colors" :title="'Notificaciones'">
                <Icon name="heroicons:bell" class="w-5 h-5" />
              </button>
              <button @click="handleLogout" class="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-white/10 transition-colors" :title="'Cerrar sesión'">
                <Icon name="heroicons:arrow-right-on-rectangle" class="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="ml-64">
      <!-- Header -->
      <header class="shadow-sm border-b transition-colors duration-300 theme-header-bar">
        <div class="flex justify-between items-center h-16 px-6">
          <div class="flex items-center space-x-4">
            <h2 class="text-lg font-semibold transition-colors theme-text-primary">
              {{ pageTitle }}
            </h2>
          </div>
          
          <div class="flex items-center space-x-4"></div>
        </div>
      </header>

      <!-- Page Content (sin cache para evitar botones trabados) -->
      <main class="p-6" :key="$route.fullPath">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup>
const route = useRoute()

// Composable para manejar el tema
const { isDark, toggleTheme } = useTheme()
// Composable de autenticación
const { logout } = useAuth()

const pageTitle = computed(() => {
  const titles = {
    '/dashboard': 'Dashboard',
    '/admin': 'Dashboard',
    '/admin/products': 'Gestión de Productos',
    '/admin/categories': 'Gestión de Categorías',
    '/admin/inventory': 'Gestión de Inventario',
    '/admin/providers': 'Gestión de Proveedores',
    '/admin/orders': 'Gestión de Pedidos',
    '/admin/customers': 'Gestión de Clientes',
    '/admin/profiles': 'Gestión de Usuarios'
  }
  return titles[route.path] || 'Administración'
})

const userInitials = ref('AD')
const userName = ref('Administrador')
const userRole = ref('Admin')

const handleLogout = async () => {
  try {
    await logout()
  } catch (e) {
    console.error('Error al cerrar sesión:', e)
  }
}
</script>


