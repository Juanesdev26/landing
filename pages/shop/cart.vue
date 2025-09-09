<template>
  <div class="py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">Carrito de Compras</h1>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div class="lg:col-span-2">
          <div class="bg-white rounded-lg shadow-sm">
            <div class="p-6 border-b flex items-center justify-between">
              <h2 class="text-lg font-semibold text-gray-900">Productos ({{ cart.count }})</h2>
              <div class="flex items-center gap-2">
                <button @click="refreshStatuses" class="px-3 py-2 text-sm border rounded hover:bg-gray-50">Refrescar estados</button>
                <label class="inline-flex items-center gap-2 text-sm text-gray-600">
                  <input type="checkbox" v-model="autoRefresh" class="rounded border-gray-300" /> Auto
                </label>
              </div>
            </div>

            <div v-if="cart.items.length === 0" class="p-6 text-gray-600">Tu carrito está vacío.</div>
            <div v-else>
              <div v-for="it in cart.items" :key="it.product_id" class="p-6 border-b">
                <div class="flex items-center space-x-4">
                  <div class="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                    <img v-if="it.image_url" :src="it.image_url" :alt="it.name" class="w-full h-full object-cover" />
                    <Icon v-else name="heroicons:shopping-bag" class="w-8 h-8 text-pink-500" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <h3 class="font-semibold text-gray-900 truncate">{{ it.name }}</h3>
                    <p class="text-gray-600 text-sm">SKU: {{ it.sku }}</p>
                    <div class="flex items-center space-x-4 mt-2">
                      <div class="flex items-center border border-gray-300 rounded-lg">
                        <button @click="dec(it.product_id)" class="px-3 py-1 hover:bg-gray-100">-</button>
                        <span class="px-3 py-1">{{ it.quantity }}</span>
                        <button @click="inc(it.product_id)" class="px-3 py-1 hover:bg-gray-100">+</button>
                      </div>
                      <span class="text-lg font-bold text-pink-600">{{ formatCOP(it.price * it.quantity) }}</span>
                    </div>
                  </div>
                  <div class="flex items-center gap-3">
                    <span v-if="reservationStatus(it.product_id)"
                          :class="[
                            'inline-flex items-center px-2 py-0.5 text-xs font-medium rounded',
                            badgeClass(reservationStatus(it.product_id))
                          ]">
                      {{ badgeText(reservationStatus(it.product_id)) }}
                    </span>
                    <button @click="remove(it.product_id)" class="text-red-500 hover:text-red-700">
                      <Icon name="heroicons:trash" class="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="lg:col-span-1">
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Resumen del Pedido</h2>

            <div class="space-y-3 mb-6">
              <div class="flex justify-between">
                <span class="text-gray-600">Subtotal</span>
                <span class="font-semibold">{{ formatCOP(cart.subtotal) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Envío</span>
                <span class="font-semibold">{{ formatCOP(cart.shippingAmount) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Impuestos</span>
                <span class="font-semibold">{{ formatCOP(cart.taxAmount) }}</span>
              </div>
              <div class="border-t pt-3">
                <div class="flex justify-between">
                  <span class="text-lg font-bold text-gray-900">Total</span>
                  <span class="text-lg font-bold text-pink-600">{{ formatCOP(cart.total) }}</span>
                </div>
              </div>
            </div>

            <button @click="checkout" class="w-full bg-pink-600 text-white py-3 rounded-lg font-semibold hover:bg-pink-700 transition-colors">
              Proceder al Pago
            </button>

            <div class="mt-4 text-center">
              <NuxtLink to="/shop" class="text-pink-600 hover:text-pink-700 text-sm">
                Continuar Comprando
              </NuxtLink>
            </div>
            <div class="mt-8">
              <h3 class="text-sm font-semibold text-gray-900 mb-2">Tus pedidos recientes</h3>
              <div v-if="myOrders.length === 0" class="text-gray-600 text-sm">Aún no tienes pedidos.</div>
              <div v-else class="space-y-3 max-h-64 overflow-auto">
                <div v-for="o in myOrders" :key="o.id_order" class="border rounded p-3 text-sm">
                  <div class="flex items-center justify-between">
                    <div class="font-medium">#{{ (o.id_order || '').slice(0,8) }}</div>
                    <span :class="getStatusClass(o.status)" class="px-2 py-0.5 rounded">{{ getStatusText(o.status) }}</span>
                  </div>
                  <div class="text-gray-600">{{ formatDate(o.created_at) }} · {{ o.order_items?.length || 0 }} productos</div>
                  <div class="text-pink-600 font-semibold">{{ formatCOP(o.total_amount || 0) }}</div>
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
definePageMeta({ layout: 'default' })
const cart = useCartStore()
const { formatCOP } = useCurrency()

const { $toast } = useNuxtApp()
const inc = (id) => { cart.updateQuantity(id, (cart.items.find(i => i.product_id === id)?.quantity || 1) + 1); $toast?.info('Cantidad actualizada') }
const dec = (id) => { cart.removeOne(id); $toast?.info('Cantidad actualizada') }
const remove = (id) => cart.removeItem(id)

// Reservas del usuario para mostrar estado (aprobado/pending/cancelado)
const myReservations = ref([])
const loadMyReservations = async () => {
  try {
    const { data } = await $fetch('/api/reservations/my')
    if (data?.success) {
      myReservations.value = Array.isArray(data.data) ? data.data : []
    }
  } catch (e) {
    console.error('Error cargando reservas del usuario', e)
  }
}

const refreshStatuses = async () => {
  await loadMyReservations()
  $toast?.info('Estados actualizados')
}

const reservationStatus = (productId) => {
  const list = myReservations.value
    .filter(r => r.product_id === productId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  return list[0]?.status || null
}

const badgeClass = (status) => {
  const map = {
    pending: 'bg-yellow-100 text-yellow-800',
    converted: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  }
  return map[status] || 'bg-gray-100 text-gray-800'
}

const badgeText = (status) => {
  const map = { pending: 'Pendiente', converted: 'Aprobado', cancelled: 'Cancelado' }
  return map[status] || 'Estado'
}

const checkout = async () => {
  try {
    // Asegurar sesión antes de crear pedido
    const supabase = useSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      await navigateTo('/login')
      return
    }
    // Obtener/crear customer para el usuario actual
    const { data: myCustomer } = await $fetch('/api/customers/my')
    if (!myCustomer?.success || !myCustomer.data?.id_customer) {
      alert('No fue posible identificar el cliente para crear el pedido')
      return
    }

    const body = {
      customer_id: myCustomer.data.id_customer,
      order_items: cart.items.map(it => ({ product_id: it.product_id, quantity: it.quantity, unit_price: it.price })),
      tax_amount: cart.taxAmount,
      shipping_amount: cart.shippingAmount
    }

    const { data } = await $fetch('/api/orders/create-from-customer', { method: 'POST', body })
    if (data?.success) {
      cart.clear()
      navigateTo('/user')
      $toast?.success('Pedido creado', 'Tu pedido quedó pendiente de pago')
    } else {
      $toast?.error('Error', data?.error || 'Error creando pedido')
    }
  } catch (e) {
    console.error('Checkout error', e)
    $toast?.error('Error', 'Ocurrió un error creando el pedido')
  }
}

// Mis pedidos (por perfil asociado)
const myOrders = ref([])
const loadMyOrders = async () => {
  try {
    const { data } = await $fetch('/api/orders/my')
    if (data?.success) myOrders.value = Array.isArray(data.data) ? data.data : []
  } catch (e) { console.error('Error cargando mis pedidos', e) }
}

onMounted(() => { loadMyOrders() })

// Auto refresh cada 15s opcional
const autoRefresh = ref(false)
let intervalId = null

onMounted(async () => {
  await loadMyReservations()
  intervalId = setInterval(() => {
    if (autoRefresh.value) loadMyReservations()
  }, 15000)
})

onBeforeUnmount(() => {
  if (intervalId) clearInterval(intervalId)
})
</script>


