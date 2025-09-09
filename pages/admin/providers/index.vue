<template>
  <div>
    <!-- Header con botones de acción -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Gestión de Proveedores</h1>
        <p class="text-gray-600">Administra los proveedores de tu tienda</p>
      </div>
      <button
        @click="openModal()"
        class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
      >
        <Icon name="heroicons:plus-circle" class="w-5 h-5" />
        <span>Nuevo Proveedor</span>
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
            placeholder="Nombre, email, contacto..."
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        
        <!-- Filtro por estado -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
          <select
            v-model="selectedStatus"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
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

    <!-- Tabla de proveedores -->
    <div class="bg-white rounded-lg shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Proveedor
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contacto
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Dirección
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Productos
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="provider in filteredProviders.slice(startIndex, endIndex)" :key="provider.id_provider" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10">
                    <div class="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                      <Icon name="heroicons:truck" class="w-5 h-5 text-green-600" />
                    </div>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">{{ provider.name }}</div>
                    <div class="text-sm text-gray-500">{{ provider.email }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ provider.contact_person || 'N/A' }}</div>
                <div class="text-sm text-gray-500">{{ provider.phone || 'N/A' }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ provider.address || 'N/A' }}</div>
                <div class="text-sm text-gray-500">{{ provider.city || 'N/A' }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="[
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                    provider.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  ]"
                >
                  {{ provider.is_active ? 'Activo' : 'Inactivo' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ provider.product_count || 0 }} productos
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex space-x-2">
                  <button
                    @click="openModal(provider)"
                    class="text-blue-600 hover:text-blue-900"
                    title="Editar proveedor"
                  >
                    <Icon name="heroicons:pencil" class="w-5 h-5" />
                  </button>
                  <button
                    @click="toggleStatus(provider)"
                    :class="[
                      'hover:text-gray-900',
                      provider.is_active ? 'text-orange-600' : 'text-green-600'
                    ]"
                    :title="provider.is_active ? 'Desactivar' : 'Activar'"
                  >
                    <Icon 
                      :name="provider.is_active ? 'heroicons:pause' : 'heroicons:play'" 
                      class="w-5 h-5" 
                    />
                  </button>
                  <button
                    @click="confirmDelete(provider)"
                    class="text-red-600 hover:text-red-900"
                    title="Eliminar proveedor"
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
              <span class="font-medium">{{ totalProviders }}</span> resultados
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

    <!-- Modal para crear/editar proveedor -->
    <ProviderModal
      v-if="showModal"
      :provider="selectedProvider"
      @close="closeModal"
      @save="saveProvider"
    />

    <!-- Modal de confirmación para eliminar -->
    <ProviderDeleteModal
      v-if="showConfirmModal && providerToDelete"
      :provider="providerToDelete"
      @confirm="deleteProvider"
      @cancel="showConfirmModal = false"
    />
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

// Estado reactivo
const providers = ref([])
const loading = ref(false)
const searchQuery = ref('')
const selectedStatus = ref('')
const currentPage = ref(1)
const itemsPerPage = ref(10)
const showModal = ref(false)
const showConfirmModal = ref(false)
const selectedProvider = ref(null)
const providerToDelete = ref(null)

// Computed properties
const filteredProviders = computed(() => {
  let filtered = providers.value

  // Filtro por búsqueda
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(provider =>
      provider.name.toLowerCase().includes(query) ||
      (provider.email && provider.email.toLowerCase().includes(query)) ||
      (provider.contact_person && provider.contact_person.toLowerCase().includes(query))
    )
  }

  // Filtro por estado
  if (selectedStatus.value !== '') {
    filtered = filtered.filter(provider => provider.is_active.toString() === selectedStatus.value)
  }

  return filtered
})

const totalProviders = computed(() => filteredProviders.value.length)
const totalPages = computed(() => Math.ceil(totalProviders.value / itemsPerPage.value))
const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage.value)
const endIndex = computed(() => Math.min(startIndex.value + itemsPerPage.value, totalProviders.value))

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
const fetchProviders = async () => {
  loading.value = true
  try {
    const { data } = await $fetch('/api/providers')
    if (data.success) {
      providers.value = data.data
    } else {
      console.error('Error en la respuesta de la API:', data.error)
    }
  } catch (error) {
    console.error('Error fetching providers:', error)
  } finally {
    loading.value = false
  }
}

const openModal = (provider = null) => {
  selectedProvider.value = provider
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  selectedProvider.value = null
}

const saveProvider = async (providerData) => {
  try {
    if (selectedProvider.value) {
      // Actualizar proveedor existente
      const { data } = await $fetch(`/api/providers/${selectedProvider.value.id_provider}`, {
        method: 'PUT',
        body: providerData
      })
      if (data.success) {
        toast.add({ title: 'Proveedor actualizado', color: 'green' })
        await fetchProviders()
        closeModal()
      } else {
        console.error('Error actualizando proveedor:', data.error)
        toast.add({ title: data.error || 'Error actualizando proveedor', color: 'red' })
      }
    } else {
      // Crear nuevo proveedor
      const { data } = await $fetch('/api/providers', {
        method: 'POST',
        body: providerData
      })
      if (data.success) {
        toast.add({ title: 'Proveedor creado', color: 'green' })
        await fetchProviders()
        closeModal()
      } else {
        console.error('Error creando proveedor:', data.error)
        toast.add({ title: data.error || 'Error creando proveedor', color: 'red' })
      }
    }
  } catch (error) {
    console.error('Error saving provider:', error)
    const e = error
    const msg = (e && e.data && e.data.error) || (e && e.message) || 'Error guardando proveedor'
    toast.add({ title: msg, color: 'red' })
  }
}

const toggleStatus = async (provider) => {
  try {
    const { data } = await $fetch(`/api/providers/${provider.id_provider}/toggle-status`, {
      method: 'PATCH'
    })
    if (data.success) {
      console.log('Estado del proveedor actualizado exitosamente')
      await fetchProviders()
    } else {
      console.error('Error actualizando estado:', data.error)
    }
  } catch (error) {
    console.error('Error toggling status:', error)
  }
}

const confirmDelete = (provider) => {
  providerToDelete.value = provider
  showConfirmModal.value = true
}

const toast = useToast()

const deleteProvider = async () => {
  if (!providerToDelete.value) return
  
  try {
    const { data } = await $fetch(`/api/providers/${providerToDelete.value.id_provider}`, {
      method: 'DELETE'
    })
    if (data.success) {
      toast.add({ title: 'Proveedor eliminado', color: 'green' })
      await fetchProviders()
      showConfirmModal.value = false
      providerToDelete.value = null
    } else {
      console.error('Error eliminando proveedor:', data.error)
      toast.add({ title: data.error || 'Error eliminando proveedor', color: 'red' })
    }
  } catch (error) {
    console.error('Error deleting provider:', error)
    const e = error
    const msg = (e && e.data && e.data.error) || (e && e.message) || 'Error eliminando proveedor'
    toast.add({ title: msg, color: 'red' })
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
  // dejar que el middleware global/SSR maneje auth; solo cargar datos
  await fetchProviders()
})
</script>
