<template>
  <div class="max-w-5xl mx-auto p-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Pedido #{{ (order?.id_order || '').slice(0,8) }}</h1>
      <NuxtLink to="/shop/cart" class="text-pink-600 hover:text-pink-700">Volver al carrito</NuxtLink>
    </div>

    <div v-if="loading" class="text-gray-600">Cargando pedido...</div>
    <div v-else-if="!order" class="text-gray-600">Pedido no encontrado.</div>
    <div v-else class="space-y-6">
      <div class="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between">
        <div class="space-y-1">
          <div class="text-sm text-gray-500">Fecha: {{ formatDate(order.created_at) }}</div>
          <div class="text-sm text-gray-500">Estado de pago: {{ order.payment_status || 'pending' }}</div>
        </div>
        <div class="flex items-center gap-3">
          <span :class="statusClass(order.status)" class="px-2 py-1 rounded text-xs font-medium">{{ order.status }}</span>
          <button
            v-if="order.status === 'pending'"
            @click="cancelOrder"
            class="px-3 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700">
            Cancelar pedido
          </button>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm">
        <div class="p-4 border-b text-lg font-semibold text-gray-900">Productos</div>
        <div>
          <div v-for="it in (order.order_items || [])" :key="it.id_order_item" class="p-4 border-b flex items-center gap-4">
            <div class="w-16 h-16 rounded bg-gray-100 flex items-center justify-center overflow-hidden">
              <img v-if="it.product?.image_url" :src="it.product.image_url" :alt="it.product?.name" class="w-full h-full object-cover" />
              <Icon v-else name="heroicons:shopping-bag" class="w-6 h-6 text-pink-500" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="font-medium text-gray-900 truncate">{{ it.product?.name }}</div>
              <div class="text-sm text-gray-600">SKU: {{ it.product?.sku }} · Cant: {{ it.quantity }}</div>
            </div>
            <div class="text-sm font-semibold text-gray-900">{{ formatCOP(it.total_price || it.quantity * it.unit_price) }}</div>
          </div>
        </div>
        <div class="p-4 text-right space-y-1">
          <div class="text-gray-700">Subtotal: {{ formatCOP(order.subtotal || 0) }}</div>
          <div class="text-gray-700">Impuestos: {{ formatCOP(order.tax_amount || 0) }}</div>
          <div class="text-gray-900 font-bold">Total: {{ formatCOP(order.total_amount || 0) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'default' })
const route = useRoute()
const loading = ref(true)
const order = ref(null)
const { formatCOP } = useCurrency()

const formatDate = (d) => new Date(d).toLocaleString()
const statusClass = (s) => ({
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800'
}[s] || 'bg-gray-100 text-gray-800')

const loadOrder = async () => {
  loading.value = true
  try {
    const { data } = await $fetch(`/api/orders/${route.params.id}`)
    if (data?.data?.success || data?.success) {
      order.value = (data.data?.data) || data.data || null
    } else if (data?.data) {
      order.value = data.data
    }
  } catch (e) {
    console.error('Error cargando pedido', e)
  } finally {
    loading.value = false
  }
}

const cancelOrder = async () => {
  if (!order.value) return
  if (!confirm('¿Cancelar este pedido?')) return
  try {
    const res = await $fetch(`/api/orders/${order.value.id_order}/cancel`, { method: 'POST' })
    const ok = res?.data?.success || res?.success
    if (ok) {
      await loadOrder()
      const { $toast } = useNuxtApp()
      $toast?.success('Pedido cancelado')
    }
  } catch (e) {
    console.error('Error al cancelar pedido', e)
  }
}

onMounted(loadOrder)
</script>




