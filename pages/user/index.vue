<template>
  <div class="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
    <div class="max-w-6xl mx-auto p-6">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Mis Ofertas</h1>
        <NuxtLink to="/shop/cart" class="inline-flex items-center px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700">
          <Icon name="heroicons:shopping-cart" class="w-5 h-5 mr-2" /> Ir al carrito
        </NuxtLink>
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

onMounted(fetchOffers)
</script>


