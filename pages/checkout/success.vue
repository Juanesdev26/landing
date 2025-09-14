<template>
  <div class="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
    <div class="max-w-md w-full">
      <!-- Success Card -->
      <div class="bg-white rounded-2xl shadow-xl p-8 text-center">
        <!-- Success Icon -->
        <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Icon name="heroicons:check-circle" class="w-12 h-12 text-green-600" />
        </div>

        <!-- Success Message -->
        <h1 class="text-2xl font-bold text-gray-900 mb-2">¡Pago Exitoso!</h1>
        <p class="text-gray-600 mb-6">
          Tu pedido ha sido procesado correctamente. Recibirás un email de confirmación en breve.
        </p>

        <!-- Order Details -->
        <div v-if="orderDetails" class="bg-gray-50 rounded-lg p-4 mb-6 text-left">
          <h3 class="font-semibold text-gray-900 mb-3">Detalles del Pedido</h3>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-600">Número de Pedido:</span>
              <span class="font-medium">#{{ orderDetails.id_order?.slice(0, 8) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Total Pagado:</span>
              <span class="font-medium text-green-600">{{ formatCOP(orderDetails.total_amount) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Estado:</span>
              <span class="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                {{ getStatusText(orderDetails.payment_status) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div v-else-if="loading" class="bg-gray-50 rounded-lg p-4 mb-6">
          <div class="flex items-center justify-center">
            <Icon name="svg-spinners:ring-resize" class="w-6 h-6 text-pink-600 mr-2" />
            <span class="text-gray-600">Cargando detalles del pedido...</span>
          </div>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div class="flex items-center">
            <Icon name="heroicons:exclamation-triangle" class="w-5 h-5 text-red-500 mr-2" />
            <span class="text-red-700 text-sm">{{ error }}</span>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="space-y-3">
          <NuxtLink 
            to="/user" 
            class="w-full bg-pink-600 text-white py-3 rounded-lg font-semibold hover:bg-pink-700 transition-colors inline-block"
          >
            Ver Mis Pedidos
          </NuxtLink>
          
          <NuxtLink 
            to="/shop" 
            class="w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors inline-block"
          >
            Continuar Comprando
          </NuxtLink>
        </div>

        <!-- Additional Info -->
        <div class="mt-6 pt-6 border-t border-gray-200">
          <div class="flex items-center justify-center gap-2 text-sm text-gray-500 mb-2">
            <Icon name="heroicons:envelope" class="w-4 h-4" />
            <span>Recibirás un email de confirmación</span>
          </div>
          <div class="flex items-center justify-center gap-2 text-sm text-gray-500">
            <Icon name="heroicons:clock" class="w-4 h-4" />
            <span>El admin revisará tu pedido pronto</span>
          </div>
        </div>
      </div>

      <!-- Security Badge -->
      <div class="text-center mt-6">
        <div class="inline-flex items-center gap-2 text-sm text-gray-500">
          <Icon name="heroicons:shield-check" class="w-4 h-4 text-green-500" />
          <span>Pago procesado de forma segura con MercadoPago</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCurrency } from '~/composables/useCurrency'

definePageMeta({ 
  layout: 'default',
  middleware: 'user-only'
})

const { formatCOP } = useCurrency()
const { $toast } = useNuxtApp()
const route = useRoute()

// Estado
const loading = ref(true)
const error = ref('')
const orderDetails = ref<any>(null)

// Obtener order_id de la URL
const orderId = route.query.order_id as string

// Función para obtener texto del estado
const getStatusText = (status: string) => {
  const statusMap = {
    paid: 'Pagado',
    pending: 'Pendiente',
    failed: 'Fallido',
    refunded: 'Reembolsado'
  }
  return statusMap[status as keyof typeof statusMap] || status
}

// Cargar detalles del pedido
const loadOrderDetails = async () => {
  if (!orderId) {
    error.value = 'No se encontró información del pedido'
    loading.value = false
    return
  }

  try {
    // Buscar el pedido por order_id
    const { data } = await $fetch(`/api/orders/${orderId}`) as any

    if (data?.success && data.data) {
      orderDetails.value = data.data
    } else {
      error.value = 'No se pudo encontrar el pedido'
    }
  } catch (err) {
    console.error('Error cargando detalles del pedido:', err)
    error.value = 'Error cargando detalles del pedido'
  } finally {
    loading.value = false
  }
}

// Limpiar carrito después de pago exitoso
const clearCartAfterSuccess = () => {
  const cart = useCartStore()
  cart.clear()
}

// Inicializar
onMounted(async () => {
  await loadOrderDetails()
  
  if (orderDetails.value) {
    clearCartAfterSuccess()
    $toast?.success('¡Pago Exitoso!', 'Tu pedido ha sido procesado correctamente')
  }
})

// Meta tags para SEO
useHead({
  title: 'Pago Exitoso - Mi E-commerce',
  meta: [
    { name: 'description', content: 'Tu pago ha sido procesado exitosamente. Gracias por tu compra.' }
  ]
})
</script>

<style scoped>
/* Animaciones suaves */
.animate-bounce-in {
  animation: bounceIn 0.6s ease-out;
}

@keyframes bounceIn {
  0% {
    transform: scale(0.3);
    opacity: 0;
  }
  50% {
    transform: scale(1.05);
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>

