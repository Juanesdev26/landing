<template>
  <div class="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
    <div class="max-w-6xl mx-auto p-6">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Mi Perfil</h1>
        <NuxtLink to="/shop/cart" class="inline-flex items-center px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700">
          <Icon name="heroicons:shopping-cart" class="w-5 h-5 mr-2" /> Ir al carrito ({{ cart.count }})
        </NuxtLink>
      </div>

      <div class="bg-white rounded-lg shadow-sm p-4 mb-8">
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-lg font-semibold text-gray-900">Productos en tu carrito</h2>
          <NuxtLink to="/shop/cart" class="text-pink-600 hover:text-pink-700 text-sm">Ver carrito</NuxtLink>
        </div>
        <div v-if="cart.items.length === 0" class="text-gray-600">No tienes productos en el carrito.</div>
        <div v-else class="divide-y">
          <div v-for="it in cart.items" :key="it.product_id" class="py-3 flex items-center gap-3">
            <div class="w-12 h-12 rounded bg-gray-100 flex items-center justify-center overflow-hidden">
              <img v-if="it.image_url" :src="it.image_url" :alt="it.name" class="w-full h-full object-cover" />
              <Icon v-else name="heroicons:shopping-bag" class="w-6 h-6 text-pink-500" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="font-medium text-gray-900 truncate">{{ it.name }}</div>
              <div class="text-sm text-gray-500">SKU: {{ it.sku }} · Cant: {{ it.quantity }}</div>
            </div>
            <span v-if="reservationStatus(it.product_id)"
                  :class="[
                    'inline-flex items-center px-2 py-0.5 text-xs font-medium rounded',
                    badgeClass(reservationStatus(it.product_id))
                  ]">
              {{ badgeText(reservationStatus(it.product_id)) }}
            </span>
          </div>
        </div>
      </div>

      <div v-if="loading" class="text-gray-600">Cargando ofertas...</div>
      <div v-else>
        <div v-if="offers.length === 0" class="bg-white rounded-lg p-8 text-center text-gray-600 shadow-sm">
          No hay ofertas disponibles por el momento.
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="offer in offers" :key="offer.id_offer" class="bg-white rounded-xl shadow-sm overflow-hidden border border-pink-100">
            <div class="h-48 bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center overflow-hidden">
              <img v-if="offer.product?.image_url" :src="offer.product.image_url" :alt="offer.product?.name" class="h-full w-full object-cover" />
              <Icon v-else name="heroicons:sparkles" class="w-16 h-16 text-pink-500" />
            </div>
            <div class="p-4 space-y-2">
              <h3 class="text-lg font-semibold text-gray-900">{{ offer.product?.name }}</h3>
              <div class="text-sm text-gray-600">SKU: {{ offer.product?.sku }}</div>
              <div class="flex items-center gap-2">
                <span class="text-gray-500 line-through" v-if="offer.product?.price">{{ formatCOP(offer.product.price) }}</span>
                <span class="text-pink-600 font-bold">{{ formatCOP(discountedPrice(offer.product?.price, offer.discount_percent)) }}</span>
                <span class="ml-auto inline-flex items-center text-xs px-2 py-0.5 rounded bg-pink-100 text-pink-700">-{{ offer.discount_percent }}%</span>
              </div>
              <div class="pt-2 flex items-center gap-2">
                <input v-model.number="quantities[offer.id_offer]" type="number" min="1" :max="offer.product?.stock_quantity || 1" class="w-20 px-2 py-2 border rounded" />
                <button @click="addToCart(offer)" class="flex-1 inline-flex items-center justify-center px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700">
                  <Icon name="heroicons:plus" class="w-5 h-5 mr-2" /> Agregar
                </button>
              </div>
              <div v-if="offer.product?.stock_quantity <= 0" class="text-xs text-red-600 mt-1">No hay más disponibles</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ middleware: 'auth' })

const loading = ref(true)
const offers = ref([])
const { formatCOP } = useCurrency()
import { useCartStore } from '~/stores/cart'
const cart = useCartStore()
const quantities = reactive({})
const myReservations = ref([])

const discountedPrice = (price, percent) => {
  if (!price) return 0
  return Math.round(Number(price) * (1 - Number(percent || 0) / 100))
}

const fetchOffers = async () => {
  loading.value = true
  try {
    const { data } = await $fetch('/api/offers/active')
    if (data?.success) {
      offers.value = data.data
    }
  } catch (e) {
    console.error('Error cargando ofertas:', e)
  } finally {
    loading.value = false
  }
}

const loadMyReservations = async () => {
  try {
    const { data } = await $fetch('/api/reservations/my')
    if (data?.success) myReservations.value = Array.isArray(data.data) ? data.data : []
  } catch (e) { console.error('Error cargando reservas', e) }
}

const reservationStatus = (productId) => {
  const list = myReservations.value
    .filter(r => r.product_id === productId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  return list[0]?.status || null
}

const badgeClass = (status) => {
  const map = { pending: 'bg-yellow-100 text-yellow-800', converted: 'bg-green-100 text-green-800', cancelled: 'bg-red-100 text-red-800' }
  return map[status] || 'bg-gray-100 text-gray-800'
}

const badgeText = (status) => ({ pending: 'Pendiente', converted: 'Aprobado', cancelled: 'Cancelado' }[status] || 'Estado')

const addToCart = async (offer) => {
  const p = offer?.product
  if (!p) return
  const qty = Math.max(1, Number(quantities[offer.id_offer] || 1))
  if (p.stock_quantity !== undefined && qty > Number(p.stock_quantity)) {
    alert('No hay más disponibles')
    return
  }
  const ok = true
  const priceNow = discountedPrice(p.price, offer.discount_percent)
  cart.addItem({ product_id: p.id_product, name: p.name, sku: p.sku, price: priceNow, image_url: p.image_url || null }, qty)
  try {
    await $fetch('/api/reservations', { method: 'POST', body: { product_id: p.id_product, quantity: qty } })
    const { $toast } = useNuxtApp()
    $toast?.success('Agregado al carrito', `${qty} x ${p.name}`)
  } catch (e) { console.error('No se pudo crear reserva', e) }
}

onMounted(async () => { await Promise.all([fetchOffers(), loadMyReservations()]) })
</script>


