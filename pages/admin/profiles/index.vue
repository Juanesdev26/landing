<template>
  <div>
    <!-- Header con botones de acción -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
        <p class="text-gray-600">Administra todos los usuarios del sistema</p>
      </div>
      <div class="flex space-x-3">
        <button
          @click="openModal()"
          class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Icon name="heroicons:plus-circle" class="w-5 h-5" />
          <span>Nuevo Usuario</span>
        </button>
        <button
          @click="exportUsers"
          class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Icon name="heroicons:arrow-down-tray" class="w-5 h-5" />
          <span>Exportar</span>
        </button>
      </div>
    </div>

    <!-- Resumen de usuarios -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <div class="bg-white p-6 rounded-lg shadow-sm">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Icon name="heroicons:users" class="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">Total Usuarios</p>
            <p class="text-2xl font-bold text-gray-900">{{ usersSummary.total }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white p-6 rounded-lg shadow-sm">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <Icon name="heroicons:shield-check" class="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">Administradores</p>
            <p class="text-2xl font-bold text-gray-900">{{ usersSummary.admins }}</p>
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
            <p class="text-sm font-medium text-gray-500">Activos</p>
            <p class="text-2xl font-bold text-gray-900">{{ usersSummary.active }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white p-6 rounded-lg shadow-sm">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Icon name="heroicons:clock" class="w-5 h-5 text-yellow-600" />
            </div>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">Nuevos (30 días)</p>
            <p class="text-2xl font-bold text-gray-900">{{ usersSummary.new }}</p>
          </div>
        </div>
      </div>
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
            placeholder="Nombre, email, rol..."
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        
        <!-- Filtro por rol -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Rol</label>
          <select
            v-model="selectedRole"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">Todos los roles</option>
            <option value="admin">Administrador</option>
            <option value="user">Usuario</option>
            <option value="customer">Cliente</option>
          </select>
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

    <!-- Tabla de usuarios -->
    <div class="bg-white rounded-lg shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usuario
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Información
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rol
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Último Acceso
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="user in filteredUsers.slice(startIndex, endIndex)" :key="user.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10">
                    <div class="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Icon name="heroicons:user" class="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">
                      {{ user.full_name || user.email }}
                    </div>
                    <div class="text-sm text-gray-500">{{ user.email }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ user.phone || 'N/A' }}</div>
                <div class="text-sm text-gray-500">{{ user.city || 'N/A' }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="[
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                    getRoleClass(user.role)
                  ]"
                >
                  {{ getRoleText(user.role) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="[
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                    user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  ]"
                >
                  {{ user.is_active ? 'Activo' : 'Inactivo' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(user.last_sign_in_at) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex space-x-2">
                  <button
                    @click="viewUser(user)"
                    class="text-blue-600 hover:text-blue-900"
                    title="Ver usuario"
                  >
                    <Icon name="heroicons:eye" class="w-5 h-5" />
                  </button>
                  <button
                    @click="openModal(user)"
                    class="text-green-600 hover:text-green-900"
                    title="Editar usuario"
                  >
                    <Icon name="heroicons:pencil" class="w-5 h-5" />
                  </button>
                  <button
                    @click="toggleStatus(user)"
                    :class="[
                      'hover:text-gray-900',
                      user.is_active ? 'text-orange-600' : 'text-green-600'
                    ]"
                    :title="user.is_active ? 'Desactivar' : 'Activar'"
                  >
                    <Icon 
                      :name="user.is_active ? 'heroicons:pause' : 'heroicons:play'" 
                      class="w-5 h-5" 
                    />
                  </button>
                  <button
                    @click="confirmDelete(user)"
                    class="text-red-600 hover:text-red-900"
                    title="Eliminar usuario"
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
              <span class="font-medium">{{ totalUsers }}</span> resultados
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

    <!-- Modal para crear/editar usuario -->
    <UserModal
      v-if="showModal"
      :user="selectedUser"
      @close="closeModal"
      @save="saveUser"
    />

    <!-- Modal de confirmación para eliminar -->
    <UserDeleteModal
      v-if="showConfirmModal"
      :user="userToDelete"
      @confirm="deleteUser"
      @close="showConfirmModal = false"
    />
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'admin'
})
const UserDeleteModal = resolveComponent('UserDeleteModal')

// Estado reactivo
const users = ref([])
const loading = ref(false)
const searchQuery = ref('')
const selectedRole = ref('')
const selectedStatus = ref('')
const currentPage = ref(1)
const itemsPerPage = ref(10)
const showModal = ref(false)
const showConfirmModal = ref(false)
const selectedUser = ref(null)
const userToDelete = ref(null)

// Computed properties
const filteredUsers = computed(() => {
  let filtered = users.value

  // Filtro por búsqueda
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(user =>
      (user.full_name && user.full_name.toLowerCase().includes(query)) ||
      user.email.toLowerCase().includes(query) ||
      user.role.toLowerCase().includes(query)
    )
  }

  // Filtro por rol
  if (selectedRole.value) {
    filtered = filtered.filter(user => user.role === selectedRole.value)
  }

  // Filtro por estado
  if (selectedStatus.value !== '') {
    filtered = filtered.filter(user => user.is_active.toString() === selectedStatus.value)
  }

  return filtered
})

const totalUsers = computed(() => filteredUsers.value.length)
const totalPages = computed(() => Math.ceil(totalUsers.value / itemsPerPage.value))
const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage.value)
const endIndex = computed(() => Math.min(startIndex.value + itemsPerPage.value, totalUsers.value))

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

const usersSummary = computed(() => {
  const total = users.value.length
  const admins = users.value.filter(u => u.role === 'admin').length
  const active = users.value.filter(u => u.is_active).length
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const newUsers = users.value.filter(u => new Date(u.created_at) > thirtyDaysAgo).length

  return { total, admins, active, newUsers }
})

// Métodos
const fetchUsers = async () => {
  loading.value = true
  try {
    const { data } = await $fetch('/api/profiles')
    if (data.success) {
      users.value = data.data
    } else {
      console.error('Error en la respuesta de la API:', data.error)
    }
  } catch (error) {
    console.error('Error fetching users:', error)
  } finally {
    loading.value = false
  }
}

const openModal = (user = null) => {
  selectedUser.value = user
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  selectedUser.value = null
}

const viewUser = (user) => {
  // Implementar vista detallada del usuario
  console.log('Ver usuario:', user)
}

const saveUser = async (userData) => {
  try {
    if (selectedUser.value) {
      // Actualizar usuario existente
      const { data } = await $fetch(`/api/profiles/${selectedUser.value.id}`, {
        method: 'PUT',
        body: userData
      })
      if (data.success) {
        console.log('Usuario actualizado exitosamente')
        await fetchUsers()
        closeModal()
      } else {
        console.error('Error actualizando usuario:', data.error)
      }
    } else {
      // Crear nuevo usuario
      const { data } = await $fetch('/api/profiles', {
        method: 'POST',
        body: userData
      })
      if (data.success) {
        console.log('Usuario creado exitosamente')
        await fetchUsers()
        closeModal()
      } else {
        console.error('Error creando usuario:', data.error)
      }
    }
  } catch (error) {
    console.error('Error saving user:', error)
  }
}

const toggleStatus = async (user) => {
  try {
    const { data } = await $fetch(`/api/profiles/${user.id}/toggle-status`, {
      method: 'PATCH'
    })
    if (data.success) {
      console.log('Estado del usuario actualizado exitosamente')
      await fetchUsers()
    } else {
      console.error('Error actualizando estado:', data.error)
    }
  } catch (error) {
    console.error('Error toggling status:', error)
  }
}

const confirmDelete = (user) => {
  userToDelete.value = user
  showConfirmModal.value = true
}

const deleteUser = async () => {
  if (!userToDelete.value) return
  try {
    const res = await $fetch(`/api/profiles/${userToDelete.value.id}`, { method: 'DELETE' })
    if (res?.data?.success) {
      console.log('Usuario eliminado exitosamente')
      await fetchUsers()
      showConfirmModal.value = false
      userToDelete.value = null
    } else {
      console.error('Error eliminando usuario:', res?.data?.error || 'Respuesta inválida')
    }
  } catch (error) {
    console.error('Error deleting user:', error)
  }
}

const exportUsers = () => {
  // Implementar exportación de usuarios
  console.log('Exportando usuarios...')
}

const clearFilters = () => {
  searchQuery.value = ''
  selectedRole.value = ''
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

const getRoleClass = (role) => {
  switch (role) {
    case 'admin': return 'bg-purple-100 text-purple-800'
    case 'user': return 'bg-blue-100 text-blue-800'
    case 'customer': return 'bg-green-100 text-green-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const getRoleText = (role) => {
  switch (role) {
    case 'admin': return 'Administrador'
    case 'user': return 'Usuario'
    case 'customer': return 'Cliente'
    default: return role
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
  await checkAuthentication()
  await fetchUsers()
})
</script>
