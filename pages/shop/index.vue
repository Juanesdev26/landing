<template>
  <div class="py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-4">
          Catálogo de Productos
        </h1>
        <p class="text-gray-600">
          Descubre nuestra colección completa de productos de belleza y moda
        </p>
      </div>

      <!-- Filters & Search -->
      <div
        class="bg-white p-6 rounded-xl shadow-sm mb-8 border border-gray-100"
      >
        <div
          class="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center mb-6"
        >
          <!-- Search -->
          <div class="relative w-full md:w-96">
            <input
              v-model="searchQuery"
              @input="debouncedSearch"
              type="text"
              placeholder="Buscar productos..."
              class="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
            />
            <Icon
              name="heroicons:magnifying-glass"
              class="absolute left-4 top-3.5 w-5 h-5 text-gray-400"
            />
          </div>

          <!-- Sort -->
          <div class="flex items-center space-x-3 w-full md:w-auto">
            <span class="text-sm text-gray-500 whitespace-nowrap"
              >Ordenar por:</span
            >
            <USelectMenu
              v-model="sortBy"
              :options="[
                { label: 'Más Recientes', value: 'newest' },
                { label: 'Precio: Menor a Mayor', value: 'price_asc' },
                { label: 'Precio: Mayor a Menor', value: 'price_desc' },
                { label: 'Nombre A-Z', value: 'name_asc' },
              ]"
              option-attribute="label"
              value-attribute="value"
              class="w-full md:w-48"
            />
          </div>
        </div>

        <!-- Category Pills -->
        <div class="space-y-3">
          <h3
            class="text-sm font-medium text-gray-500 uppercase tracking-wider"
          >
            Categorías
          </h3>
          <div class="flex flex-wrap gap-2">
            <button
              @click="selectedCategory = ''"
              :class="[
                'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border',
                selectedCategory === ''
                  ? 'bg-pink-600 text-white border-pink-600 shadow-md transform scale-105'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-pink-300 hover:text-pink-600 hover:bg-pink-50',
              ]"
            >
              Todas
            </button>
            <button
              v-for="cat in categories"
              :key="cat.id_category"
              @click="selectedCategory = cat.id_category"
              :class="[
                'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border',
                selectedCategory === cat.id_category
                  ? 'bg-pink-600 text-white border-pink-600 shadow-md transform scale-105'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-pink-300 hover:text-pink-600 hover:bg-pink-50',
              ]"
            >
              {{ cat.name }}
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center py-12">
        <Icon
          name="svg-spinners:180-ring-with-bg"
          class="w-12 h-12 text-pink-600"
        />
      </div>

      <!-- Empty State -->
      <div
        v-else-if="products.length === 0"
        class="text-center py-12 bg-white rounded-lg shadow-sm"
      >
        <Icon
          name="heroicons:shopping-bag"
          class="w-16 h-16 mx-auto text-gray-300 mb-4"
        />
        <h3 class="text-lg font-medium text-gray-900">
          No se encontraron productos
        </h3>
        <p class="text-gray-500 mt-2">
          Intenta ajustar tus filtros de búsqueda
        </p>
        <button
          @click="resetFilters"
          class="mt-4 text-pink-600 hover:text-pink-700 font-medium"
        >
          Limpiar filtros
        </button>
      </div>

      <!-- Products Grid -->
      <div
        v-else
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        <div
          v-for="product in products"
          :key="product.id_product"
          class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 group"
        >
          <!-- Imagen -->
          <div class="relative h-64 bg-gray-100 overflow-hidden">
            <img
              v-if="product.image_url"
              :src="product.image_url"
              :alt="product.name"
              class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div
              v-else
              class="w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-100 to-purple-100"
            >
              <Icon name="heroicons:photo" class="w-16 h-16 text-pink-300" />
            </div>

            <!-- Badge de Stock -->
            <div
              v-if="product.stock_quantity <= 0"
              class="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded"
            >
              AGOTADO
            </div>
            <div
              v-else-if="product.stock_quantity < 5"
              class="absolute top-2 right-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded"
            >
              ¡ÚLTIMAS UNIDADES!
            </div>
          </div>

          <!-- Contenido -->
          <div class="p-4">
            <div class="mb-2">
              <span
                class="text-xs text-pink-600 font-medium bg-pink-50 px-2 py-1 rounded-full"
              >
                {{ product.category?.name || 'General' }}
              </span>
            </div>
            <h3
              class="font-semibold text-gray-800 mb-1 truncate"
              :title="product.name"
            >
              {{ product.name }}
            </h3>
            <p class="text-gray-600 text-sm mb-3 line-clamp-2 h-10">
              {{ product.description }}
            </p>

            <div class="flex justify-between items-center mt-4">
              <div class="flex flex-col">
                <span class="text-xl font-bold text-pink-600">{{
                  formatCOP(product.price)
                }}</span>
                <span class="text-xs text-gray-400"
                  >SKU: {{ product.sku }}</span
                >
              </div>

              <button
                @click="addToCart(product)"
                :disabled="product.stock_quantity <= 0"
                class="bg-pink-600 text-white p-2 rounded-lg hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg active:scale-95 transition-all duration-200"
                title="Agregar al carrito"
              >
                <Icon name="heroicons:shopping-cart" class="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div
        v-if="products.length > 0"
        class="mt-12 flex justify-center items-center space-x-4"
      >
        <button
          @click="prevPage"
          :disabled="page <= 1"
          class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          <Icon name="heroicons:chevron-left" class="w-5 h-5 mr-1" /> Anterior
        </button>
        <span class="text-gray-600 font-medium">Página {{ page }}</span>
        <button
          @click="nextPage"
          :disabled="products.length < pageSize"
          class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          Siguiente <Icon name="heroicons:chevron-right" class="w-5 h-5 ml-1" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'default',
})

import { useCartStore } from '~/stores/cart'

// Estado
const products = ref([])
const categories = ref([])
const loading = ref(true)
const searchQuery = ref('')
const selectedCategory = ref('')
const sortBy = ref('newest')
const page = ref(1)
const pageSize = 12

// Composables
const { formatCOP } = useCurrency()
const cart = useCartStore()
const { $toast } = useNuxtApp()
const { user } = useAuth()

// Cargar categorías
const fetchCategories = async () => {
  try {
    const { data } = await $fetch('/api/categories')
    if (data?.success) {
      categories.value = data.data
    }
  } catch (e) {
    console.error('Error cargando categorías:', e)
  }
}

// Cargar productos
const fetchProducts = async () => {
  loading.value = true
  try {
    const params = {
      page: page.value,
      page_size: pageSize,
      search: searchQuery.value || undefined,
      category_id: selectedCategory.value || undefined,
      sort: sortBy.value,
    }

    const { data } = await $fetch('/api/products', { params })
    if (data?.success) {
      products.value = data.data
    }
  } catch (e) {
    console.error('Error cargando productos:', e)
    $toast?.error('Error', 'No se pudieron cargar los productos')
  } finally {
    loading.value = false
  }
}

// Debounce para búsqueda
let searchTimeout
const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    page.value = 1
    fetchProducts()
  }, 500)
}

// Watchers
watch([selectedCategory, sortBy], () => {
  page.value = 1
  fetchProducts()
})

// Paginación
const prevPage = () => {
  if (page.value > 1) {
    page.value--
    fetchProducts()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const nextPage = () => {
  page.value++
  fetchProducts()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const resetFilters = () => {
  searchQuery.value = ''
  selectedCategory.value = ''
  sortBy.value = 'newest'
  page.value = 1
  fetchProducts()
}

// Carrito
const addToCart = async product => {
  // Verificar si es customer (solo visualización)
  if (user.value?.role === 'customer') {
    $toast?.info(
      'Acceso Restringido',
      'Inicia sesión como Usuario para agregar productos al carrito'
    )
    return
  }

  // Verificar autenticación
  if (!user.value) {
    const { setAddIntent } = useAddIntent()
    setAddIntent({
      productId: product.id_product,
      quantity: 1,
      product: {
        id_product: product.id_product,
        name: product.name,
        price: product.price,
        image_url: product.image_url,
        sku: product.sku,
      },
    })
    return navigateTo('/login')
  }

  cart.addItem({
    product_id: product.id_product,
    name: product.name,
    sku: product.sku,
    price: product.price,
    image_url: product.image_url,
  })
  $toast?.success(
    'Agregado al carrito',
    `${product.name} agregado correctamente`
  )
}

// Inicialización
onMounted(() => {
  fetchCategories()
  fetchProducts()

  // Verificar si hay una categoría preseleccionada en la URL
  const route = useRoute()
  if (route.query.category) {
    selectedCategory.value = route.query.category
  }
})
</script>
