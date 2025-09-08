<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
    <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
      <div class="mt-3">
        <!-- Header -->
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-medium text-gray-900">
            Cambiar Estado del Pedido
          </h3>
          <button
            @click="$emit('close')"
            class="text-gray-400 hover:text-gray-600"
          >
            <Icon name="heroicons:x-mark" class="w-6 h-6" />
          </button>
        </div>

        <!-- Información del pedido -->
        <div class="bg-gray-50 p-4 rounded-lg mb-4">
          <div class="text-sm text-gray-600">
            <p><strong>Pedido:</strong> #{{ order?.id_order?.slice(0, 8) }}</p>
            <p><strong>Cliente:</strong> {{ order?.customer?.first_name }} {{ order?.customer?.last_name }}</p>
            <p><strong>Total:</strong> ${{ formatPrice(order?.total_amount) }}</p>
            <p><strong>Estado Actual:</strong> 
              <span :class="getStatusClass(order?.status)">
                {{ getStatusText(order?.status) }}
              </span>
            </p>
          </div>
        </div>

        <!-- Formulario -->
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <!-- Nuevo estado -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Nuevo Estado *
            </label>
            <select
              v-model="form.status"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Seleccionar estado</option>
              <option value="pending">Pendiente</option>
              <option value="confirmed">Confirmado</option>
              <option value="shipped">Enviado</option>
              <option value="delivered">Entregado</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>

          <!-- Número de tracking (si se envía) -->
          <div v-if="form.status === 'shipped'">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Número de Seguimiento
            </label>
            <input
              v-model="form.tracking_number"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Número de tracking"
            />
          </div>

          <!-- Notas del cambio -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Notas del Cambio
            </label>
            <textarea
              v-model="form.notes"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Notas sobre el cambio de estado"
            ></textarea>
          </div>

          <!-- Botones -->
          <div class="flex space-x-3 pt-4">
            <button
              type="button"
              @click="$emit('close')"
              class="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="loading || !form.status"
              class="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span v-if="loading">Actualizando...</span>
              <span v-else>Actualizar Estado</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  order: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'update'])

const loading = ref(false)

// Formulario reactivo
const form = ref({
  status: '',
  tracking_number: '',
  notes: ''
})

// Métodos
const handleSubmit = async () => {
  if (!form.value.status) {
    alert('Debe seleccionar un nuevo estado')
    return
  }

  // Validar confirmación requiere pago "paid"
  if (form.value.status === 'confirmed' && props.order?.payment_status !== 'paid') {
    alert('No puedes confirmar un pedido con pago pendiente. Marca el pago como "Pagado" primero.')
    return
  }

  // Confirmación adicional al confirmar
  if (form.value.status === 'confirmed') {
    const ok = confirm('¿Confirmar el pedido? Se descontará el stock de los productos.')
    if (!ok) return
  }

  loading.value = true
  try {
    emit('update', { ...form.value })
  } catch (error) {
    console.error('Error en el formulario:', error)
  } finally {
    loading.value = false
  }
}

const getStatusClass = (status) => {
  const classes = {
    pending: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800',
    confirmed: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800',
    shipped: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800',
    delivered: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800',
    cancelled: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800'
  }
  return classes[status] || 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800'
}

const getStatusText = (status) => {
  const texts = {
    pending: 'Pendiente',
    confirmed: 'Aprobado',
    shipped: 'Enviado',
    delivered: 'Entregado',
    cancelled: 'Cancelado'
  }
  return texts[status] || 'Desconocido'
}

const formatPrice = (price) => {
  return parseFloat(price || 0).toFixed(2)
}

// Inicializar formulario cuando cambie el order
watch(() => props.order, (newOrder) => {
  if (newOrder) {
    form.value = {
      status: newOrder.status || '',
      tracking_number: newOrder.tracking_number || '',
      notes: ''
    }
  }
}, { immediate: true })
</script>
