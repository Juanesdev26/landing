<template>
  <div class="min-h-screen p-6 transition-colors duration-300 theme-container">
    <!-- Header del Dashboard -->
    <div class="mb-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold mb-2 transition-colors theme-text-primary">Dashboard</h1>
          <p class="transition-colors theme-text-secondary">Bienvenido de vuelta, {{ userName || 'Admin' }}! Aquí tienes un resumen de tu negocio.</p>
        </div>
        <div class="flex items-center space-x-4"></div>
      </div>
    </div>

    <!-- Tarjetas de KPI principales -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <!-- Tarjeta de Usuarios -->
      <div class="card card-hover hover:shadow-lg transition-all duration-300">
        <div class="flex items-center justify-between mb-4">
          <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
            <Icon name="heroicons:users" class="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div class="text-right">
            <p class="text-2xl font-bold theme-text-primary">{{ dashboardStats.totalUsers || 0 }}</p>
            <p class="text-green-600 dark:text-green-400 text-sm font-medium">+12% este mes</p>
          </div>
        </div>
        <p class="text-sm font-medium theme-text-secondary">Total Usuarios</p>
        <div class="mt-4 flex items-center space-x-2">
          <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div class="bg-blue-600 dark:bg-blue-400 h-2 rounded-full transition-all duration-500" style="width: 75%"></div>
          </div>
          <span class="text-xs theme-text-muted">75%</span>
        </div>
      </div>

      <!-- Tarjeta de Productos -->
      <div class="card card-hover hover:shadow-lg transition-all duration-300">
        <div class="flex items-center justify-between mb-4">
          <div class="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-xl flex items-center justify-center">
            <Icon name="heroicons:cube" class="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <div class="text-right">
            <p class="text-2xl font-bold theme-text-primary">{{ dashboardStats.totalProducts || 0 }}</p>
            <p class="text-green-600 dark:text-green-400 text-sm font-medium">+8% este mes</p>
          </div>
        </div>
        <p class="text-sm font-medium theme-text-secondary">Total Productos</p>
        <div class="mt-4 flex items-center space-x-2">
          <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div class="bg-green-600 dark:bg-green-400 h-2 rounded-full transition-all duration-500" style="width: 60%"></div>
          </div>
          <span class="text-xs theme-text-muted">60%</span>
        </div>
      </div>

      <!-- Tarjeta de Órdenes -->
      <div class="card card-hover hover:shadow-lg transition-all duration-300">
        <div class="flex items-center justify-between mb-4">
          <div class="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-xl flex items-center justify-center">
            <Icon name="heroicons:shopping-cart" class="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div class="text-right">
            <p class="text-2xl font-bold theme-text-primary">{{ dashboardStats.totalOrders || 0 }}</p>
            <p class="text-green-600 dark:text-green-400 text-sm font-medium">+15% este mes</p>
          </div>
        </div>
        <p class="text-sm font-medium theme-text-secondary">Total Órdenes</p>
        <div class="mt-4 flex items-center space-x-2">
          <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div class="bg-yellow-600 dark:bg-yellow-400 h-2 rounded-full transition-all duration-500" style="width: 85%"></div>
          </div>
          <span class="text-xs theme-text-muted">85%</span>
        </div>
      </div>

      <!-- Tarjeta de Ingresos -->
      <div class="card card-hover hover:shadow-lg transition-all duration-300">
        <div class="flex items-center justify-between mb-4">
          <div class="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-xl flex items-center justify-center">
            <Icon name="heroicons:currency-dollar" class="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div class="text-right">
            <p class="text-2xl font-bold theme-text-primary">${{ formatCurrency(dashboardStats.totalRevenue || 0) }}</p>
            <p class="text-green-600 dark:text-green-400 text-sm font-medium">+20% este mes</p>
          </div>
        </div>
        <p class="text-sm font-medium theme-text-secondary">Ingresos Totales</p>
        <div class="mt-4 flex items-center space-x-2">
          <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div class="bg-purple-600 dark:bg-purple-400 h-2 rounded-full transition-all duration-500" style="width: 90%"></div>
          </div>
          <span class="text-xs theme-text-muted">90%</span>
        </div>
      </div>
    </div>

    <!-- Tarjetas de gráficos y estadísticas -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <!-- Gráfico de Ventas -->
      <div class="card">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h3 class="text-xl font-bold theme-text-primary">Ventas</h3>
            <p class="text-sm theme-text-secondary">Últimos 7 días</p>
          </div>
          <div class="text-right">
            <p class="text-2xl font-bold theme-text-primary">${{ formatCurrency(dashboardStats.weeklySales || 0) }}</p>
            <p class="text-green-600 dark:text-green-400 text-sm font-medium">+12.5%</p>
          </div>
        </div>
        
        <!-- Gráfico de barras real -->
        <div class="space-y-3">
          <div class="flex items-center space-x-2" v-for="d in weeklySeries" :key="d.date">
            <span class="text-xs w-16 theme-text-muted">{{ formatDay(d.date) }}</span>
            <div class="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div class="bg-blue-600 dark:bg-blue-400 h-3 rounded-full transition-all duration-500" :style="{ width: barWidth(d.sales) }"></div>
            </div>
            <span class="text-xs w-16 theme-text-muted">${{ formatCurrency(d.sales) }}</span>
          </div>
        </div>
      </div>

      <!-- Gráfico de Productos (real) -->
      <div class="card">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h3 class="text-xl font-bold theme-text-primary">Productos</h3>
            <p class="text-sm theme-text-secondary">Nuevos últimos 7 días</p>
          </div>
          <div class="text-right">
            <p class="text-2xl font-bold theme-text-primary">{{ productsStats.newProducts }}</p>
          </div>
        </div>
        
        <!-- Gráfico circular simple (componente) -->
        <div class="flex items-center justify-center mb-4">
          <DonutRing :percent="productsPercent" :size="128" :stroke="16" color="#2563eb" track-color="#374151">
            <span class="text-2xl font-bold theme-text-primary">{{ percentNumber() }}%</span>
          </DonutRing>
        </div>
        
        <p class="text-center text-sm theme-text-secondary">{{ productsStats.newProducts }} nuevos de {{ productsStats.totalProducts }}</p>
      </div>
    </div>

    <!-- Tarjetas de estadísticas adicionales -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      <!-- Total de Órdenes -->
      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-bold theme-text-primary">Total Órdenes</h3>
          <select class="text-sm rounded-lg px-3 py-1 theme-select">
            <option>Esta Semana</option>
            <option>Este Mes</option>
            <option>Este Año</option>
          </select>
        </div>
        
        <!-- Gráfico de líneas simulado -->
        <div class="space-y-2">
          <div class="flex items-center space-x-2">
            <div class="w-16 h-8 bg-blue-600 dark:bg-blue-400 rounded-tl-lg rounded-tr-lg"></div>
            <div class="w-16 h-12 bg-blue-400 dark:bg-blue-300 rounded-tl-lg rounded-tr-lg"></div>
            <div class="w-16 h-6 bg-blue-500 dark:bg-blue-500 rounded-tl-lg rounded-tr-lg"></div>
            <div class="w-16 h-10 bg-blue-300 dark:bg-blue-600 rounded-tl-lg rounded-tr-lg"></div>
            <div class="w-16 h-8 bg-blue-600 dark:bg-blue-400 rounded-tl-lg rounded-tr-lg"></div>
            <div class="w-16 h-14 bg-blue-400 dark:bg-blue-300 rounded-tl-lg rounded-tr-lg"></div>
            <div class="w-16 h-9 bg-blue-500 dark:bg-blue-500 rounded-tl-lg rounded-tr-lg"></div>
          </div>
        </div>
        
        <div class="mt-4 text-center">
          <p class="text-2xl font-bold theme-text-primary">{{ dashboardStats.weeklyOrders || 0 }}</p>
          <p class="text-sm theme-text-secondary">Órdenes esta semana</p>
        </div>
      </div>

      <!-- Eliminado: Última Oferta -->

      <!-- Clientes -->
      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-bold theme-text-primary">Clientes</h3>
          <span class="text-green-600 dark:text-green-400 text-sm font-medium">+26.5%</span>
        </div>
        
        <div class="text-center mb-4">
          <p class="text-3xl font-bold theme-text-primary">{{ dashboardStats.totalCustomers || 0 }}</p>
          <p class="text-sm theme-text-secondary">Total de clientes</p>
        </div>
        
        <!-- Gráfico de líneas simulado -->
        <div class="space-y-2">
          <div class="flex items-center space-x-2">
            <div class="w-8 h-4 bg-blue-600 dark:bg-blue-400 rounded-tl-lg rounded-tr-lg"></div>
            <div class="w-8 h-6 bg-blue-400 dark:bg-blue-300 rounded-tl-lg rounded-tr-lg"></div>
            <div class="w-8 h-3 bg-blue-500 dark:bg-blue-500 rounded-tl-lg rounded-tr-lg"></div>
            <div class="w-8 h-7 bg-blue-300 dark:bg-blue-600 rounded-tl-lg rounded-tr-lg"></div>
            <div class="w-8 h-5 bg-blue-600 dark:bg-blue-400 rounded-tl-lg rounded-tr-lg"></div>
            <div class="w-8 h-8 bg-blue-400 dark:bg-blue-300 rounded-tl-lg rounded-tr-lg"></div>
            <div class="w-8 h-6 bg-blue-500 dark:bg-blue-500 rounded-tl-lg rounded-tr-lg"></div>
          </div>
        </div>
        
        <p class="text-center text-sm mt-4 theme-text-secondary">Abril 07 - Abril 14</p>
      </div>
    </div>

    <!-- (Se eliminó la sección de Actividad Reciente) -->

    <!-- Botón flotante de configuración -->
    <div class="fixed bottom-6 right-6">
      <button class="w-14 h-14 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center theme-accent-button">
        <Icon name="heroicons:cog-6-tooth" class="w-6 h-6" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import DonutRing from '~/components/common/DonutRing.vue'
definePageMeta({
  layout: 'admin',
  // sin middleware; lo maneja admin.global + SSR
})

const { user } = useAuth()
const userName = computed(() => user.value?.name || null)

// Composable para manejar el tema
const { theme, isDark, toggleTheme, initTheme } = useTheme()

// Estadísticas del dashboard
const dashboardStats = ref({
  totalUsers: 0,
  totalProducts: 0,
  totalOrders: 0,
  totalRevenue: 0,
  totalCustomers: 0,
  weeklySales: 0,
  newProducts: 0,
  weeklyOrders: 0
})

// Ventas semanales
const weeklySeries = ref<{ date: string; sales: number }[]>([])
const weeklyTotal = computed(() => weeklySeries.value.reduce((s, d) => s + d.sales, 0))

// Stats de productos
const productsStats = ref<{ totalProducts: number; newProducts: number }>({ totalProducts: 0, newProducts: 0 })
const productsPercent = computed<number>(() => {
  const total = productsStats.value.totalProducts || 1
  const pct = Math.round((productsStats.value.newProducts / total) * 100)
  return isNaN(pct) ? 0 : pct
})
const percentNumber = () => productsPercent.value
// (sin computeds para estilos inline)

// Actividad reciente
const recentActivity = ref<any[]>([])

// Función para formatear moneda
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

// Cargar estadísticas del dashboard
type ApiResponse<T> = { success: true; data: T } | { success: false; error: string; message?: string }

const loadDashboardStats = async () => {
  try {
    const resp: any = await $fetch('/api/dashboard')
    if (resp?.data?.success) {
      const payload = resp.data.data || {}
      dashboardStats.value.totalUsers = payload.totalUsers || 0
      dashboardStats.value.totalProducts = payload.totalProducts || 0
      dashboardStats.value.totalOrders = payload.totalOrders || 0
      dashboardStats.value.totalRevenue = payload.totalRevenue || 0
      dashboardStats.value.weeklySales = payload.weeklySales || 0
      dashboardStats.value.newProducts = payload.newProducts || 0
      dashboardStats.value.weeklyOrders = payload.weeklyOrders || 0
      dashboardStats.value.totalCustomers = payload.totalCustomers || 0
    }
  } catch (error) {
    console.error('Error cargando estadísticas del dashboard:', error)
  }
}

const loadWeeklySales = async () => {
  try {
    const resp: any = await $fetch('/api/orders/weekly')
    if (resp?.data?.success) {
      const payload = resp.data.data || {}
      weeklySeries.value = payload.series || []
    }
  } catch (e) {
    console.error('Error cargando ventas semanales:', e)
  }
}

const loadProductsStats = async () => {
  try {
    const resp: any = await $fetch('/api/products/stats')
    if (resp?.data?.success) {
      const payload = resp.data.data || {}
      productsStats.value = payload
    }
  } catch (e) {
    console.error('Error cargando stats de productos:', e)
  }
}

const loadRecentActivity = async () => {
  try {
    const resp: any = await $fetch('/api/activity/recent')
    if (resp?.data?.success) {
      const payload = resp.data.data || []
      recentActivity.value = payload
    }
  } catch (e) {
    console.error('Error cargando actividad reciente:', e)
  }
}

const reloadActivity = async () => {
  await loadRecentActivity()
}

const formatDay = (dateStr: string) => {
  const d = new Date(dateStr)
  return d.toLocaleDateString('es-ES', { weekday: 'short' })
}

const barWidth = (value: number) => {
  const max = Math.max(...weeklySeries.value.map(d => d.sales), 1)
  const pct = Math.round((value / max) * 100)
  return `${pct}%`
}

// Cargar datos al montar el componente
onMounted(() => {
  initTheme() // Inicializar tema
  loadDashboardStats()
  loadWeeklySales()
  loadProductsStats()
  loadRecentActivity()
})
</script>
