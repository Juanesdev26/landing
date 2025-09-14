<template>
  <div class="min-h-screen theme-container">
    <div class="max-w-6xl mx-auto p-6">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-3xl font-bold theme-text-primary">Mis Pedidos</h1>
          <p class="text-theme-text-secondary mt-2">Historial completo de tus compras</p>
        </div>
        <div class="flex items-center gap-4">
          <button @click="fetchMyOrders" :disabled="ordersLoading" class="inline-flex items-center px-4 py-2 theme-button hover:theme-button-hover transition-colors">
            <Icon name="heroicons:arrow-path" class="w-4 h-4 mr-2" :class="{ 'animate-spin': ordersLoading }" />
            {{ ordersLoading ? 'Actualizando...' : 'Actualizar' }}
          </button>
          <NuxtLink to="/shop/cart" class="inline-flex items-center px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors">
            <Icon name="heroicons:shopping-cart" class="w-5 h-5 mr-2" /> Ir al carrito
          </NuxtLink>
        </div>
      </div>

      <!-- Estadísticas rápidas -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div class="theme-card-bg rounded-lg p-4 border theme-card-border">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Icon name="heroicons:clock" class="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div class="text-sm theme-text-secondary">Pendientes</div>
              <div class="text-lg font-semibold theme-text-primary">{{ orderStats.pending }}</div>
            </div>
          </div>
        </div>
        <div class="theme-card-bg rounded-lg p-4 border theme-card-border">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Icon name="heroicons:check-circle" class="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div class="text-sm theme-text-secondary">Entregados</div>
              <div class="text-lg font-semibold theme-text-primary">{{ orderStats.delivered }}</div>
            </div>
          </div>
        </div>
        <div class="theme-card-bg rounded-lg p-4 border theme-card-border">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <Icon name="heroicons:truck" class="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div class="text-sm theme-text-secondary">Enviados</div>
              <div class="text-lg font-semibold theme-text-primary">{{ orderStats.shipped }}</div>
            </div>
          </div>
        </div>
        <div class="theme-card-bg rounded-lg p-4 border theme-card-border">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
              <Icon name="heroicons:currency-dollar" class="w-5 h-5 text-pink-600" />
            </div>
            <div>
              <div class="text-sm theme-text-secondary">Total Gastado</div>
              <div class="text-lg font-semibold theme-text-primary">{{ formatCOP(totalSpent) }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Lista de pedidos -->
      <div class="theme-card-bg rounded-lg shadow-sm">
        <div class="p-6 border-b theme-border">
          <h2 class="text-lg font-semibold theme-text-primary">Historial de Pedidos</h2>
        </div>
        
        <div v-if="ordersLoading" class="p-8 text-center">
          <Icon name="heroicons:arrow-path" class="w-8 h-8 mx-auto mb-4 text-pink-500 animate-spin" />
          <p class="theme-text-secondary">Cargando pedidos...</p>
        </div>
        
        <div v-else-if="orders.length === 0" class="p-8 text-center">
          <Icon name="heroicons:shopping-bag" class="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 class="text-lg font-semibold theme-text-primary mb-2">No tienes pedidos</h3>
          <p class="theme-text-secondary mb-4">Cuando realices tu primera compra, aparecerá aquí.</p>
          <NuxtLink to="/shop" class="inline-flex items-center px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors">
            <Icon name="heroicons:shopping-bag" class="w-5 h-5 mr-2" />
            Comenzar a Comprar
          </NuxtLink>
        </div>
        
        <div v-else class="divide-y theme-border">
          <div v-for="order in orders" :key="order.id_order" class="p-6 hover:bg-gray-50 transition-colors">
            <div class="flex items-start justify-between mb-4">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                  <Icon name="heroicons:receipt-percent" class="w-6 h-6 text-pink-600" />
                </div>
                <div>
                  <h3 class="text-lg font-semibold theme-text-primary">
                    Pedido #{{ (order.id_order || '').slice(0,8) }}
                  </h3>
                  <p class="text-sm theme-text-secondary">{{ formatDate(order.created_at) }}</p>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <span :class="getStatusClass(order.status)" class="px-3 py-1 text-sm font-medium rounded-full">
                  {{ getStatusText(order.status) }}
                </span>
                <div class="text-right">
                  <div class="text-lg font-bold theme-text-primary">{{ formatCOP(order.total_amount || 0) }}</div>
                  <div class="text-xs theme-text-secondary">{{ order.order_items?.length || 0 }} producto(s)</div>
                </div>
              </div>
            </div>
            
            <!-- Productos del pedido -->
            <div class="mb-4">
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                <div v-for="item in order.order_items" :key="item.id_order_item" class="flex items-center gap-3 p-3 bg-white rounded-lg border">
                  <div class="w-12 h-12 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                    <img v-if="item.product?.image_url" :src="item.product.image_url" :alt="item.product?.name" class="w-full h-full object-cover" />
                    <Icon v-else name="heroicons:cube" class="w-6 h-6 text-pink-500" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="font-medium theme-text-primary truncate">{{ item.product?.name }}</div>
                    <div class="text-sm theme-text-secondary">SKU: {{ item.product?.sku }}</div>
                    <div class="text-sm theme-text-secondary">Cant: {{ item.quantity }}</div>
                  </div>
                  <div class="text-sm font-medium theme-text-primary">{{ formatCOP(item.total_price || (item.quantity * item.unit_price)) }}</div>
                </div>
              </div>
            </div>
            
            <!-- Acciones del pedido -->
            <div class="flex items-center justify-between pt-4 border-t theme-border">
              <div class="flex items-center gap-4">
                <NuxtLink :to="`/orders/${order.id_order}`" class="inline-flex items-center px-3 py-2 text-sm theme-button hover:theme-button-hover transition-colors">
                  <Icon name="heroicons:eye" class="w-4 h-4 mr-1" />
                  Ver Detalles
                </NuxtLink>
                <button v-if="order.status === 'pending'" @click="cancelOrder(order.id_order)" class="inline-flex items-center px-3 py-2 text-sm text-red-600 hover:text-red-700 transition-colors">
                  <Icon name="heroicons:x-circle" class="w-4 h-4 mr-1" />
                  Cancelar
                </button>
              </div>
              <div class="text-sm theme-text-secondary">
                <div v-if="order.status === 'pending'">
                  <Icon name="heroicons:clock" class="w-4 h-4 inline mr-1" />
                  Pendiente de pago
                </div>
                <div v-else-if="order.status === 'confirmed'">
                  <Icon name="heroicons:check-circle" class="w-4 h-4 inline mr-1 text-green-500" />
                  Confirmado
                </div>
                <div v-else-if="order.status === 'shipped'">
                  <Icon name="heroicons:truck" class="w-4 h-4 inline mr-1 text-blue-500" />
                  En camino
                </div>
                <div v-else-if="order.status === 'delivered'">
                  <Icon name="heroicons:check-badge" class="w-4 h-4 inline mr-1 text-green-500" />
                  Entregado
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ 
  middleware: 'user-only',
  layout: 'default'
})

const ordersLoading = ref(false)
const orders = ref([])
const { formatCOP } = useCurrency()
const { $toast } = useNuxtApp()

// Estadísticas de pedidos
const orderStats = computed(() => {
  const stats = {
    pending: 0,
    confirmed: 0,
    shipped: 0,
    delivered: 0
  }
  
  orders.value.forEach(order => {
    if (stats.hasOwnProperty(order.status)) {
      stats[order.status]++
    }
  })
  
  return stats
})

const totalSpent = computed(() => {
  return orders.value
    .filter(order => ['confirmed', 'shipped', 'delivered'].includes(order.status))
    .reduce((total, order) => total + (order.total_amount || 0), 0)
})

const fetchMyOrders = async () => {
  ordersLoading.value = true
  try {
    // Asegurar que exista customer asociado
    try { await $fetch('/api/customers/my') } catch (_) {}
    const { data } = await $fetch('/api/orders/my')
    if (data?.success) {
      orders.value = Array.isArray(data.data) ? data.data : []
    }
  } catch (e) {
    console.error('Error cargando mis pedidos', e)
    $toast?.error('Error', 'No se pudieron cargar los pedidos')
  } finally {
    ordersLoading.value = false
  }
}

const cancelOrder = async (orderId) => {
  if (!confirm('¿Estás seguro de que quieres cancelar este pedido?')) return
  
  try {
    const res = await $fetch(`/api/orders/${orderId}/cancel`, { method: 'POST' })
    const ok = res?.data?.success || res?.success
    if (ok) {
      await fetchMyOrders()
      $toast?.success('Pedido cancelado', 'El pedido ha sido cancelado exitosamente')
    } else {
      $toast?.error('Error', 'No se pudo cancelar el pedido')
    }
  } catch (e) {
    console.error('Error cancelando pedido', e)
    $toast?.error('Error', 'Ocurrió un error al cancelar el pedido')
  }
}

// Helpers
const formatDate = (date) => new Date(date).toLocaleDateString('es-ES', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
})

const getStatusClass = (status) => {
  const classes = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const getStatusText = (status) => {
  const texts = {
    pending: 'Pendiente',
    confirmed: 'Confirmado',
    shipped: 'Enviado',
    delivered: 'Entregado',
    cancelled: 'Cancelado'
  }
  return texts[status] || status
}

onMounted(() => {
  fetchMyOrders()
})
</script>
