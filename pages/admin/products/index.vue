<template>
  <div>
    <!-- Header con botón de agregar producto -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Gestión de Productos</h1>
        <p class="text-gray-600">Administra el catálogo de productos de tu tienda</p>
      </div>
      <button
        @click="openCreateModal"
        class="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
      >
        <Icon name="heroicons:plus" class="w-5 h-5" />
        <span>Agregar Producto</span>
      </button>
    </div>

    <!-- Filtros y búsqueda -->
    <div class="bg-white p-4 rounded-lg shadow-sm mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <!-- Búsqueda -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Nombre, SKU o descripción..."
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
        </div>
        
        <!-- Filtro por categoría -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
          <select
            v-model="selectedCategory"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
          >
            <option value="">Todas las categorías</option>
            <option v-for="category in categories" :key="category.id_category" :value="category.id_category">
              {{ category.name }}
            </option>
          </select>
        </div>
        
        <!-- Filtro por estado -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
          <select
            v-model="selectedStatus"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
          >
            <option value="">Todos los estados</option>
            <option value="true">Activo</option>
            <option value="false">Inactivo</option>
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

    <!-- Tabla de productos -->
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
                Precio
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="product in filteredProducts.slice(startIndex, endIndex)" :key="product.id_product" class="hover:bg-gray-50">
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
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ formatCOP(product.price) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="[
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                    product.stock_quantity > 10 ? 'bg-green-100 text-green-800' :
                    product.stock_quantity > 0 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  ]"
                >
                  {{ product.stock_quantity }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="[
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                    product.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  ]"
                >
                  {{ product.is_active ? 'Activo' : 'Inactivo' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex space-x-2">
                  <button
                    @click="editProduct(product)"
                    class="text-indigo-600 hover:text-indigo-900"
                  >
                    <Icon name="heroicons:pencil-square" class="w-5 h-5" />
                  </button>
                  <button
                    @click="toggleProductStatus(product)"
                    :class="[
                      'hover:text-gray-900',
                      product.is_active ? 'text-red-600' : 'text-green-600'
                    ]"
                  >
                    <Icon
                      :name="product.is_active ? 'heroicons:eye-slash' : 'heroicons:eye'"
                      class="w-5 h-5"
                    />
                  </button>
                  <button
                    @click="deleteProduct(product)"
                    class="text-red-600 hover:text-red-900"
                  >
                    <Icon name="heroicons:trash" class="w-5 h-5" />
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
                    ? 'z-10 bg-pink-50 border-pink-500 text-pink-600'
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

    <!-- Modal para crear/editar producto -->
    <ProductAddModal
      v-if="showModal"
      :product="editingProduct"
      :categories="categories"
      @close="closeModal"
      @save="saveProduct"
    />

    <!-- Modal de confirmación para eliminar -->
    <ProductDeleteModal
      v-if="showDeleteModal"
      :product="productToDelete"
      @confirm="confirmDelete"
      @cancel="showDeleteModal = false"
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
const loading = ref(false)
const searchQuery = ref('')
const selectedCategory = ref('')
const selectedStatus = ref('')
const currentPage = ref(1)
const itemsPerPage = ref(10)
const showModal = ref(false)
const showDeleteModal = ref(false)
const editingProduct = ref(null)
const productToDelete = ref(null)

// Computed properties
const filteredProducts = computed(() => {
  let filtered = products.value

  // Filtro por búsqueda
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(product =>
      product.name.toLowerCase().includes(query) ||
      product.sku.toLowerCase().includes(query) ||
      product.description.toLowerCase().includes(query)
    )
  }

  // Filtro por categoría
  if (selectedCategory.value) {
    filtered = filtered.filter(product => product.category_id === selectedCategory.value)
  }

  // Filtro por estado
  if (selectedStatus.value !== '') {
    const isActive = selectedStatus.value === 'true'
    filtered = filtered.filter(product => product.is_active === isActive)
  }

  return filtered
})

const totalProducts = computed(() => filteredProducts.value.length)
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

// Métodos
const { formatCOP } = useCurrency()
const fetchProducts = async () => {
  loading.value = true
  try {
    const { data } = await $fetch('/api/products')
    if (data.success) {
      products.value = data.data
    } else {
      console.error('Error en la respuesta de la API:', data.error)
    }
  } catch (error) {
    console.error('Error fetching products:', error)
  } finally {
    loading.value = false
  }
}

const fetchCategories = async () => {
  try {
    const { data } = await $fetch('/api/categories')
    if (data.success) {
      categories.value = data.data
    } else {
      console.error('Error en la respuesta de la API:', data.error)
    }
  } catch (error) {
    console.error('Error fetching categories:', error)
  }
}

const openCreateModal = () => {
  editingProduct.value = null
  nextTick(() => { showModal.value = true })
}

const editProduct = (product) => {
  editingProduct.value = { ...product }
  nextTick(() => { showModal.value = true })
}

const closeModal = () => {
  showModal.value = false
  editingProduct.value = null
}

const toast = useToast()

const saveProduct = async (productData) => {
  try {
    if (editingProduct.value) {
      // Actualizar producto existente
      const { data } = await $fetch(`/api/products/${productData.get('id_product')}`, {
        method: 'PUT',
        body: productData
      })
      if (data.success) {
        toast.add({ title: 'Producto actualizado', color: 'green' })
      } else {
        console.error('Error actualizando producto:', data.error)
        toast.add({ title: data.error || 'Error actualizando producto', color: 'red' })
        return
      }
    } else {
      // Crear nuevo producto
      const { data } = await $fetch('/api/products', {
        method: 'POST',
        body: productData
      })
      if (data.success) {
        toast.add({ title: 'Producto creado', color: 'green' })
      } else {
        console.error('Error creando producto:', data.error)
        toast.add({ title: data.error || 'Error creando producto', color: 'red' })
        return
      }
    }
    
    await fetchProducts()
    closeModal()
  } catch (error) {
    console.error('Error saving product:', error)
    toast.add({ title: 'Error guardando producto', color: 'red' })
  }
}

const toggleProductStatus = async (product) => {
  try {
    const { data } = await $fetch(`/api/products/${product.id_product}/toggle-status`, {
      method: 'PATCH'
    })
    if (data.success) {
      toast.add({ title: 'Estado actualizado', color: 'green' })
      await fetchProducts()
    } else {
      console.error('Error cambiando estado del producto:', data.error)
      toast.add({ title: data.error || 'Error cambiando estado', color: 'red' })
    }
  } catch (error) {
    console.error('Error toggling product status:', error)
    toast.add({ title: 'Error cambiando estado', color: 'red' })
  }
}

const deleteProduct = (product) => {
  productToDelete.value = product
  // Forzar tick antes de abrir el modal para asegurar render
  nextTick(() => { showDeleteModal.value = true })
}

const confirmDelete = async () => {
  try {
    const { data } = await $fetch(`/api/products/${productToDelete.value.id_product}`, {
      method: 'DELETE'
    })
    if (data.success) {
      toast.add({ title: 'Producto eliminado', color: 'green' })
      await fetchProducts()
      // Cerrar modal después de refrescar para evitar re-render extraño
      nextTick(() => {
        showDeleteModal.value = false
        productToDelete.value = null
      })
    } else {
      console.error('Error eliminando producto:', data.error)
      toast.add({ title: data.error || 'Error eliminando producto', color: 'red' })
    }
  } catch (error) {
    console.error('Error deleting product:', error)
    toast.add({ title: 'Error eliminando producto', color: 'red' })
  }
}

const clearFilters = () => {
  searchQuery.value = ''
  selectedCategory.value = ''
  selectedStatus.value = ''
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
  // auth via middleware
  await fetchProducts()
  await fetchCategories()
})
</script>
