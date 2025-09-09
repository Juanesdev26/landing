<template>
  <div>
    <!-- Header con botón de agregar categoría -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Gestión de Categorías</h1>
        <p class="text-gray-600">Administra las categorías de productos de tu tienda</p>
      </div>
      <button
        @click="openCreateModal"
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
      >
        <Icon name="heroicons:plus" class="w-5 h-5" />
        <span>Agregar Categoría</span>
      </button>
    </div>

    <!-- Filtros y búsqueda -->
    <div class="bg-white p-4 rounded-lg shadow-sm mb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Búsqueda -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Nombre o descripción..."
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <!-- Filtro por estado -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
          <select
            v-model="selectedStatus"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los estados</option>
            <option value="true">Activa</option>
            <option value="false">Inactiva</option>
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

    <!-- Tabla de categorías -->
    <div class="bg-white rounded-lg shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Categoría
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Descripción
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Productos
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha Creación
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="category in filteredCategories.slice(startIndex, endIndex)" :key="category.id_category" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10">
                    <div class="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Icon name="heroicons:tag" class="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">{{ category.name }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="text-sm text-gray-900 max-w-xs truncate">
                  {{ category.description || 'Sin descripción' }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {{ category.product_count || 0 }} productos
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="[
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                    category.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  ]"
                >
                  {{ category.is_active ? 'Activa' : 'Inactiva' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(category.created_at) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex space-x-2">
                  <button
                    @click="editCategory(category)"
                    class="text-indigo-600 hover:text-indigo-900"
                    title="Editar categoría"
                  >
                    <Icon name="heroicons:pencil-square" class="w-5 h-5" />
                  </button>
                  <button
                    @click="toggleCategoryStatus(category)"
                    :class="[
                      'hover:text-gray-900',
                      category.is_active ? 'text-red-600' : 'text-green-600'
                    ]"
                    :title="category.is_active ? 'Desactivar categoría' : 'Activar categoría'"
                  >
                    <Icon
                      :name="category.is_active ? 'heroicons:eye-slash' : 'heroicons:eye'"
                      class="w-5 h-5"
                    />
                  </button>
                  <button
                    @click="deleteCategory(category)"
                    class="text-red-600 hover:text-red-900"
                    title="Eliminar categoría"
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
              <span class="font-medium">{{ totalCategories }}</span> resultados
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
                    ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
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

    <!-- Modal para crear/editar categoría -->
    <CategoryAddModal
      v-if="showModal"
      :category="editingCategory"
      @close="closeModal"
      @save="saveCategory"
    />

    <!-- Modal de confirmación para eliminar -->
    <CategoryDeleteModal
      v-if="showDeleteModal"
      :category="categoryToDelete"
      @confirm="confirmDelete"
      @cancel="showDeleteModal = false"
    />
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

// Estado reactivo
const categories = ref([])
const loading = ref(false)
const searchQuery = ref('')
const selectedStatus = ref('')
const currentPage = ref(1)
const itemsPerPage = ref(10)
const showModal = ref(false)
const showDeleteModal = ref(false)
const editingCategory = ref(null)
const categoryToDelete = ref(null)

// Computed properties
const filteredCategories = computed(() => {
  let filtered = categories.value

  // Filtro por búsqueda
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(category =>
      category.name.toLowerCase().includes(query) ||
      (category.description && category.description.toLowerCase().includes(query))
    )
  }

  // Filtro por estado
  if (selectedStatus.value !== '') {
    const isActive = selectedStatus.value === 'true'
    filtered = filtered.filter(category => category.is_active === isActive)
  }

  return filtered
})

const totalCategories = computed(() => filteredCategories.value.length)
const totalPages = computed(() => Math.ceil(totalCategories.value / itemsPerPage.value))
const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage.value)
const endIndex = computed(() => Math.min(startIndex.value + itemsPerPage.value, totalCategories.value))

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
const fetchCategories = async () => {
  loading.value = true
  try {
    const { data } = await $fetch('/api/categories')
    if (data.success) {
      categories.value = data.data
    } else {
      console.error('Error en la respuesta de la API:', data.error)
    }
  } catch (error) {
    console.error('Error fetching categories:', error)
  } finally {
    loading.value = false
  }
}

const toast = useToast()

const openCreateModal = () => {
  editingCategory.value = null
  nextTick(() => { showModal.value = true })
}

const editCategory = (category) => {
  editingCategory.value = { ...category }
  nextTick(() => { showModal.value = true })
}

const closeModal = () => {
  showModal.value = false
  editingCategory.value = null
}

const saveCategory = async (categoryData) => {
  try {
    if (editingCategory.value) {
      // Actualizar categoría existente (FormData si trae archivo)
      const endpoint = `/api/categories/${editingCategory.value.id_category}`
      const { data } = await $fetch(endpoint, { method: 'PUT', body: categoryData })
      if (data.success) {
        toast.add({ title: 'Categoría actualizada', color: 'green' })
      } else {
        console.error('Error actualizando categoría:', data.error)
        toast.add({ title: data.error || 'Error actualizando categoría', color: 'red' })
        return
      }
    } else {
      // Crear nueva categoría
      const { data } = await $fetch('/api/categories', { method: 'POST', body: categoryData })
      if (data.success) {
        toast.add({ title: 'Categoría creada', color: 'green' })
      } else {
        console.error('Error creando categoría:', data.error)
        toast.add({ title: data.error || 'Error creando categoría', color: 'red' })
        return
      }
    }
    
    await fetchCategories()
    closeModal()
  } catch (error) {
    console.error('Error saving category:', error)
    toast.add({ title: 'Error guardando categoría', color: 'red' })
  }
}

const toggleCategoryStatus = async (category) => {
  try {
    const { data } = await $fetch(`/api/categories/${category.id_category}/toggle-status`, {
      method: 'PATCH'
    })
    if (data.success) {
      console.log('Estado de la categoría cambiado exitosamente')
      await fetchCategories()
    } else {
      console.error('Error cambiando estado de la categoría:', data.error)
    }
  } catch (error) {
    console.error('Error toggling category status:', error)
  }
}

const deleteCategory = (category) => {
  categoryToDelete.value = category
  nextTick(() => { showDeleteModal.value = true })
}

const confirmDelete = async () => {
  try {
    const { data } = await $fetch(`/api/categories/${categoryToDelete.value.id_category}`, { method: 'DELETE' })
    if (data.success) {
      toast.add({ title: 'Categoría eliminada', color: 'green' })
      await fetchCategories()
      nextTick(() => {
        showDeleteModal.value = false
        categoryToDelete.value = null
      })
    } else {
      console.error('Error eliminando categoría:', data.error)
      toast.add({ title: data.error || 'Error eliminando categoría', color: 'red' })
    }
  } catch (error) {
    console.error('Error deleting category:', error)
    toast.add({ title: 'Error eliminando categoría', color: 'red' })
  }
}

const clearFilters = () => {
  searchQuery.value = ''
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
  // auth via middleware
  await fetchCategories()
})
</script>
