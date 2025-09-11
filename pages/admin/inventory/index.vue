<template>
  <div>
    <!-- Header con botones de acción -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Gestión de Inventario</h1>
        <p class="text-gray-600">Controla el stock y movimientos de productos de tu tienda</p>
      </div>
      <div class="flex space-x-3">
        <button
          @click="openAdjustmentModal"
          class="btn btn-primary flex items-center space-x-2"
        >
          <Icon name="heroicons:adjustments-horizontal" class="w-5 h-5" />
          <span>Ajuste de Stock</span>
        </button>
      </div>
    </div>

    <!-- Resumen de inventario -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <div class="bg-white p-6 rounded-lg shadow-sm">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Icon name="heroicons:cube" class="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">Total Productos</p>
            <p class="text-2xl font-bold text-gray-900">{{ inventorySummary.totalProducts }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white p-6 rounded-lg shadow-sm">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <Icon name="heroicons:check-circle" class="w-5 h-5 text-green-600" />
            </div>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">Stock Adecuado</p>
            <p class="text-2xl font-bold text-gray-900">{{ inventorySummary.adequateStock }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white p-6 rounded-lg shadow-sm">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Icon name="heroicons:exclamation-triangle" class="w-5 h-5 text-yellow-600" />
            </div>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">Stock Bajo</p>
            <p class="text-2xl font-bold text-gray-900">{{ inventorySummary.lowStock }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white p-6 rounded-lg shadow-sm">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
              <Icon name="heroicons:x-circle" class="w-5 h-5 text-red-600" />
            </div>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">Sin Stock</p>
            <p class="text-2xl font-bold text-gray-900">{{ inventorySummary.outOfStock }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Filtros y búsqueda -->
    <div class="bg-white p-4 rounded-lg shadow-sm mb-6">
      <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
        <!-- Búsqueda -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Nombre, SKU..."
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        
        <!-- Filtro por categoría -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
          <select
            v-model="selectedCategory"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">Todas las categorías</option>
            <option v-for="category in categories" :key="category.id_category" :value="category.id_category">
              {{ category.name }}
            </option>
          </select>
        </div>

        <!-- Filtro por estado de stock -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Estado Stock</label>
          <select
            v-model="selectedStockStatus"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">Todos los estados</option>
            <option value="adequate">Stock Adecuado</option>
            <option value="low">Stock Bajo</option>
            <option value="out">Sin Stock</option>
          </select>
        </div>

        <!-- Filtro por proveedor -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Proveedor</label>
          <select
            v-model="selectedProvider"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">Todos los proveedores</option>
            <option v-for="provider in providers" :key="provider.id_provider" :value="provider.id_provider">
              {{ provider.name }}
            </option>
          </select>
        </div>
        
        <!-- Botón de limpiar filtros -->
        <div class="flex items-end">
          <button
            @click="clearFilters"
            class="w-full px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Limpiar Filtros
          </button>
        </div>
      </div>
    </div>

    <!-- Tabla de inventario -->
    <div class="bg-white rounded-lg shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Producto
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Categoría
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock Actual
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock Mínimo
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Último Movimiento
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="product in filteredInventory.slice(startIndex, endIndex)" :key="product.id_product" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-12 w-12">
                    <img
                      v-if="product.image_url"
                      :src="product.image_url"
                      :alt="product.name"
                      class="h-12 w-12 rounded-lg object-cover"
                    />
                    <div
                      v-else
                      class="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center"
                    >
                      <Icon name="heroicons:photo" class="w-6 h-6 text-gray-400" />
                    </div>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">{{ product.name }}</div>
                    <div class="text-sm text-gray-500">{{ product.sku }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {{ product.category?.name || 'Sin categoría' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ product.stock_quantity }}</div>
                <div class="text-xs text-gray-500">unidades</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ product.min_stock || 0 }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="[
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                    getStockStatusClass(product.stock_quantity, product.min_stock)
                  ]"
                >
                  {{ getStockStatusText(product.stock_quantity, product.min_stock) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(product.last_movement_date) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex space-x-2">
                  <button
                    @click="viewMovements(product)"
                    class="text-blue-600 hover:text-blue-900"
                    title="Ver movimientos"
                  >
                    <Icon name="heroicons:eye" class="w-5 h-5" />
                  </button>
                  <button
                    @click="openAdjustmentModal(product)"
                    class="text-orange-600 hover:text-orange-900"
                    title="Ajustar stock"
                  >
                    <Icon name="heroicons:adjustments-horizontal" class="w-5 h-5" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Paginación -->
      <div v-if="totalPages > 1" class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
        <div class="flex-1 flex justify-between sm:hidden">
          <button
            @click="previousPage"
            :disabled="currentPage === 1"
            class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Anterior
          </button>
          <button
            @click="nextPage"
            :disabled="currentPage === totalPages"
            class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Siguiente
          </button>
        </div>
        <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p class="text-sm text-gray-700">
              Mostrando <span class="font-medium">{{ startIndex + 1 }}</span> a 
              <span class="font-medium">{{ endIndex }}</span> de 
              <span class="font-medium">{{ totalProducts }}</span> resultados
            </p>
          </div>
          <div>
            <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
              <button
                @click="previousPage"
                :disabled="currentPage === 1"
                class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Icon name="heroicons:chevron-left" class="w-5 h-5" />
              </button>
              <button
                v-for="page in visiblePages"
                :key="page"
                @click="goToPage(page)"
                :class="[
                  'relative inline-flex items-center px-4 py-2 border text-sm font-medium',
                  page === currentPage
                    ? 'z-10 bg-green-50 border-green-500 text-green-600'
                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                ]"
              >
                {{ page }}
              </button>
              <button
                @click="nextPage"
                :disabled="currentPage === totalPages"
                class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Icon name="heroicons:chevron-right" class="w-5 h-5" />
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal para ajustes de stock -->
    <StockAdjustmentModal
      v-if="showAdjustmentModal"
      :product="selectedProduct"
      @close="closeAdjustmentModal"
      @save="saveAdjustment"
    />

    <!-- Modal para ver movimientos -->
    <MovementsHistoryModal
      v-if="showMovementsModal"
      :product="selectedProduct"
      @close="closeMovementsModal"
    />
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'admin',
  // auth por admin.global + SSR
})

// Estado reactivo
const products = ref([])
const categories = ref([])
const providers = ref([])
const loading = ref(false)
const searchQuery = ref('')
const selectedCategory = ref('')
const selectedStockStatus = ref('')
const selectedProvider = ref('')
const currentPage = ref(1)
const itemsPerPage = ref(10)
const showAdjustmentModal = ref(false)
const showMovementsModal = ref(false)
const selectedProduct = ref(null)

// Computed properties
const filteredInventory = computed(() => {
  let filtered = products.value

  // Filtro por búsqueda
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(product =>
      product.name.toLowerCase().includes(query) ||
      product.sku.toLowerCase().includes(query)
    )
  }

  // Filtro por categoría
  if (selectedCategory.value) {
    filtered = filtered.filter(product => product.category_id === selectedCategory.value)
  }

  // Filtro por estado de stock
  if (selectedStockStatus.value) {
    filtered = filtered.filter(product => {
      const status = getStockStatus(product.stock_quantity, product.min_stock)
      return status === selectedStockStatus.value
    })
  }

  // Filtro por proveedor
  if (selectedProvider.value) {
    filtered = filtered.filter(product => product.provider_id === selectedProvider.value)
  }

  return filtered
})

const totalProducts = computed(() => filteredInventory.value.length)
const totalPages = computed(() => Math.ceil(totalProducts.value / itemsPerPage.value))
const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage.value)
const endIndex = computed(() => Math.min(startIndex.value + itemsPerPage.value, totalProducts.value))

const visiblePages = computed(() => {
  const pages = []
  const maxVisible = 5
  let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2))
  let end = Math.min(totalPages.value, start + maxVisible - 1)
  
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1)
  }
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
})

const inventorySummary = computed(() => {
  const total = products.value.length
  const adequate = products.value.filter(p => getStockStatus(p.stock_quantity, p.min_stock) === 'adequate').length
  const low = products.value.filter(p => getStockStatus(p.stock_quantity, p.min_stock) === 'low').length
  const out = products.value.filter(p => getStockStatus(p.stock_quantity, p.min_stock) === 'out').length

  return { totalProducts: total, adequateStock: adequate, lowStock: low, outOfStock: out }
})

// Métodos
const fetchInventory = async () => {
  loading.value = true
  try {
    const { data } = await $fetch('/api/inventory')
    if (data.success) {
      products.value = data.data
    } else {
      console.error('Error en la respuesta de la API:', data.error)
    }
  } catch (error) {
    console.error('Error fetching inventory:', error)
  } finally {
    loading.value = false
  }
}

const fetchCategories = async () => {
  try {
    const { data } = await $fetch('/api/categories')
    if (data.success) {
      categories.value = data.data
    }
  } catch (error) {
    console.error('Error fetching categories:', error)
  }
}

const fetchProviders = async () => {
  try {
    const { data } = await $fetch('/api/providers')
    if (data.success) {
      providers.value = data.data
    }
  } catch (error) {
    console.error('Error fetching providers:', error)
  }
}

const openAdjustmentModal = (product = null) => {
  selectedProduct.value = product
  showAdjustmentModal.value = true
}

const closeAdjustmentModal = () => {
  showAdjustmentModal.value = false
  selectedProduct.value = null
}

const viewMovements = (product) => {
  selectedProduct.value = product
  showMovementsModal.value = true
}

const closeMovementsModal = () => {
  showMovementsModal.value = false
  selectedProduct.value = null
}


const saveAdjustment = async (adjustmentData) => {
  try {
    const { data } = await $fetch('/api/inventory/adjustments', {
      method: 'POST',
      body: adjustmentData
    })
    if (data.success) {
      console.log('Ajuste de stock realizado exitosamente')
      await fetchInventory()
      closeAdjustmentModal()
    } else {
      console.error('Error realizando ajuste:', data.error)
    }
  } catch (error) {
    console.error('Error saving adjustment:', error)
  }
}

const getStockStatus = (stock, minStock) => {
  if (stock <= 0) return 'out'
  if (stock <= (minStock || 5)) return 'low'
  return 'adequate'
}

const getStockStatusText = (stock, minStock) => {
  const status = getStockStatus(stock, minStock)
  switch (status) {
    case 'out': return 'Sin Stock'
    case 'low': return 'Stock Bajo'
    case 'adequate': return 'Stock Adecuado'
    default: return 'Desconocido'
  }
}

const getStockStatusClass = (stock, minStock) => {
  const status = getStockStatus(stock, minStock)
  switch (status) {
    case 'out': return 'bg-red-100 text-red-800'
    case 'low': return 'bg-yellow-100 text-yellow-800'
    case 'adequate': return 'bg-green-100 text-green-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const clearFilters = () => {
  searchQuery.value = ''
  selectedCategory.value = ''
  selectedStockStatus.value = ''
  selectedProvider.value = ''
  currentPage.value = 1
}

const goToPage = (page) => {
  currentPage.value = page
}

const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Verificación de autenticación
const checkAuthentication = async () => {
  const supabase = useSupabaseClient()
  
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error || !session) {
      console.log('No hay sesión activa, redirigiendo al login')
      await navigateTo('/login')
      return
    }
    
    // Obtener perfil del usuario para verificar rol
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()
    
    if (profileError || !profile) {
      console.log('Perfil no encontrado, redirigiendo al login')
      await navigateTo('/login')
      return
    }
    
    // Verificar que el usuario tenga rol de admin
    if (profile.role !== 'admin') {
      console.log('Usuario no es admin, redirigiendo a unauthorized')
      await navigateTo('/unauthorized')
      return
    }
    
    console.log('Usuario autenticado como admin, acceso permitido')
    
  } catch (error) {
    console.error('Error verificando autenticación:', error)
    await navigateTo('/login')
    return
  }
}

// Lifecycle
onMounted(async () => {
  await Promise.all([
    fetchInventory(),
    fetchCategories(),
    fetchProviders()
  ])
})
</script>
