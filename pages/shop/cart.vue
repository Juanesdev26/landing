<template>
  <div class="py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">Carrito de Compras</h1>

      <!-- Resumen rápido del carrito -->
      <div v-if="cart.items.length > 0" class="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-6 mb-8 border border-pink-200">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
              <Icon name="heroicons:shopping-cart" class="w-6 h-6 text-pink-600" />
            </div>
            <div>
              <h2 class="text-lg font-semibold text-gray-900">Tu Carrito</h2>
              <p class="text-sm text-gray-600">{{ cart.count }} producto(s) • Total: {{ formatCOP(cart.total) }}</p>
            </div>
          </div>
          <div class="text-right">
            <div class="text-2xl font-bold text-pink-600">{{ formatCOP(cart.total) }}</div>
            <div class="text-sm text-gray-500">Incluye envío e impuestos</div>
          </div>
        </div>
      </div>

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
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold text-gray-900">Mis Pedidos</h3>
                <button @click="loadMyOrders" class="text-pink-600 hover:text-pink-700 text-sm font-medium">
                  <Icon name="heroicons:arrow-path" class="w-4 h-4 inline mr-1" />
                  Actualizar
                </button>
              </div>
              
              <div v-if="myOrders.length === 0" class="text-center py-8 text-gray-600">
                <Icon name="heroicons:shopping-bag" class="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p class="text-sm">Aún no tienes pedidos.</p>
                <p class="text-xs text-gray-500 mt-1">Tus pedidos aparecerán aquí después de completar una compra.</p>
              </div>
              
              <div v-else class="space-y-4 max-h-96 overflow-auto">
                <div v-for="o in myOrders" :key="o.id_order" class="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <!-- Header del pedido -->
                  <div class="flex items-center justify-between mb-3">
                    <div class="flex items-center gap-2">
                      <NuxtLink :to="`/orders/${o.id_order}`" class="font-semibold text-pink-600 hover:text-pink-700">
                        Pedido #{{ (o.id_order || '').slice(0,8) }}
                      </NuxtLink>
                      <span class="text-xs text-gray-500">{{ formatDate(o.created_at) }}</span>
                    </div>
                    <span :class="getStatusClass(o.status)" class="px-2 py-1 text-xs font-medium rounded-full">
                      {{ getStatusText(o.status) }}
                    </span>
                  </div>
                  
                  <!-- Productos del pedido -->
                  <div class="space-y-2 mb-3">
                    <div v-for="item in (o.order_items || []).slice(0, 2)" :key="item.id_order_item" class="flex items-center gap-2 text-sm">
                      <div class="w-8 h-8 bg-white rounded flex items-center justify-center overflow-hidden">
                        <img v-if="item.product?.image_url" :src="item.product.image_url" :alt="item.product?.name" class="w-full h-full object-cover" />
                        <Icon v-else name="heroicons:cube" class="w-4 h-4 text-pink-500" />
                      </div>
                      <div class="flex-1 min-w-0">
                        <div class="font-medium text-gray-900 truncate">{{ item.product?.name }}</div>
                        <div class="text-xs text-gray-500">Cant: {{ item.quantity }}</div>
                      </div>
                      <div class="text-xs font-medium text-gray-900">{{ formatCOP(item.total_price || (item.quantity * item.unit_price)) }}</div>
                    </div>
                    <div v-if="(o.order_items || []).length > 2" class="text-xs text-gray-500 pl-10">
                      +{{ (o.order_items || []).length - 2 }} producto(s) más
                    </div>
                  </div>
                  
                  <!-- Footer del pedido -->
                  <div class="flex items-center justify-between pt-2 border-t border-gray-200">
                    <div class="text-sm">
                      <span class="text-gray-600">{{ o.order_items?.length || 0 }} producto(s)</span>
                      <span class="text-gray-400 mx-2">•</span>
                      <span class="text-gray-600">Total: </span>
                      <span class="font-semibold text-pink-600">{{ formatCOP(o.total_amount || 0) }}</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <NuxtLink :to="`/orders/${o.id_order}`" class="text-xs text-pink-600 hover:text-pink-700 font-medium">
                        Ver detalles
                      </NuxtLink>
                      <button v-if="o.status === 'pending'" @click="cancel(o.id_order)" class="text-xs text-red-600 hover:text-red-700 font-medium">
                        Cancelar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Ver todos los pedidos -->
              <div v-if="myOrders.length > 0" class="mt-4 text-center">
                <NuxtLink to="/user/orders" class="text-sm text-pink-600 hover:text-pink-700 font-medium">
                  Ver todos mis pedidos
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Pago -->
    <MercadoPagoModal 
      v-if="showPaymentModal"
      @close="closePaymentModal"
      @success="onPaymentSuccess"
    />
  </div>
</template>

<script setup>
definePageMeta({ 
  layout: 'default', 
  middleware: 'user-only',
  key: route => `cart-${route.fullPath}-${Date.now()}`
})
import { useCartStore } from '~/stores/cart'
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
    // Asegurar que exista el customer vinculado al usuario
    try { await $fetch('/api/customers/my') } catch (_) {}
    const { data } = await $fetch('/api/orders/my')
    if (data?.success) myOrders.value = Array.isArray(data.data) ? data.data : []
  } catch (e) { console.error('Error cargando mis pedidos', e) }
}

onMounted(() => { loadMyOrders() })

// Auto refresh cada 15s opcional
const autoRefresh = ref(false)
let intervalId = null

// Función para recargar datos tras inactividad
const reloadCartData = async () => {
  console.log('🔄 Recargando datos del carrito tras reactivación...')
  await Promise.all([loadMyReservations(), loadMyOrders()])
}

// Detectar reactivación
let lastCartDataLoad = Date.now()
const CART_DATA_RELOAD_THRESHOLD = 5 * 60 * 1000 // 5 minutos

const checkCartDataReload = () => {
  const now = Date.now()
  if (now - lastCartDataLoad > CART_DATA_RELOAD_THRESHOLD) {
    reloadCartData()
    lastCartDataLoad = now
  }
}

onMounted(async () => {
  await loadMyReservations()
  lastCartDataLoad = Date.now()
  
  intervalId = setInterval(() => {
    if (autoRefresh.value) loadMyReservations()
  }, 15000)
  
  // Listeners para reactivación
  window.addEventListener('focus', checkCartDataReload, { passive: true })
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      checkCartDataReload()
    }
  }, { passive: true })
  
  // Verificación periódica
  setInterval(checkCartDataReload, 60000) // cada minuto
})

onBeforeUnmount(() => {
  if (intervalId) clearInterval(intervalId)
})

// Helpers UI
const formatDate = (d) => new Date(d).toLocaleString()
const getStatusClass = (s) => ({ pending: 'bg-yellow-100 text-yellow-800', confirmed: 'bg-blue-100 text-blue-800', shipped: 'bg-purple-100 text-purple-800', delivered: 'bg-green-100 text-green-800', cancelled: 'bg-red-100 text-red-800' }[s] || 'bg-gray-100 text-gray-800')
const getStatusText = (s) => ({ pending: 'Pendiente', confirmed: 'Confirmado', shipped: 'Enviado', delivered: 'Entregado', cancelled: 'Cancelado' }[s] || s)

const cancel = async (id) => {
  if (!confirm('¿Cancelar este pedido?')) return
  try {
    const res = await $fetch(`/api/orders/${id}/cancel`, { method: 'POST' })
    const ok = res?.data?.success || res?.success
    if (ok) {
      await loadMyOrders()
      const { $toast } = useNuxtApp()
      $toast?.success('Pedido cancelado')
    }
  } catch (e) { console.error('Cancel error', e) }
}
</script>


