<template>
  <div class="min-h-screen theme-container">
    <!-- VISTA CUSTOMER (Lookbook / Catálogo Visual) -->
    <div v-if="isCustomer" class="pb-20">
      <!-- Hero Section -->
      <div class="relative h-[40vh] min-h-[300px] overflow-hidden">
        <div
          class="absolute inset-0 bg-gradient-to-r from-pink-900/80 to-purple-900/80 z-10"
        ></div>
        <img
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop"
          class="absolute inset-0 w-full h-full object-cover"
          alt="Cover"
        />
        <div
          class="absolute inset-0 z-20 flex flex-col items-center justify-center text-white text-center px-4"
        >
          <h1
            class="text-4xl md:text-6xl font-serif font-bold mb-4 animate-fade-in-up"
          >
            Colección Exclusiva
          </h1>
          <p
            class="text-lg md:text-xl font-light max-w-2xl opacity-90 animate-fade-in-up animation-delay-200"
          >
            Descubre las últimas tendencias seleccionadas especialmente para ti.
            Disponibles para compra en nuestra boutique.
          </p>
        </div>
      </div>

      <!-- Gallery Grid -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-30">
        <div v-if="loading" class="flex justify-center py-20">
          <Icon
            name="svg-spinners:180-ring-with-bg"
            class="w-12 h-12 text-white"
          />
        </div>

        <div
          v-else-if="offers.length === 0"
          class="bg-white/90 backdrop-blur rounded-2xl p-12 text-center shadow-xl"
        >
          <Icon
            name="heroicons:sparkles"
            class="w-16 h-16 mx-auto text-pink-300 mb-4"
          />
          <h3 class="text-xl font-medium text-gray-900">Próximamente</h3>
          <p class="text-gray-500">
            Estamos preparando nuevas ofertas exclusivas para ti.
          </p>
        </div>

        <div
          v-else
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          <div
            v-for="offer in offers"
            :key="offer.id_offer"
            class="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
          >
            <!-- Image Container -->
            <div class="relative h-96 overflow-hidden">
              <div
                class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 z-10"
              ></div>
              <img
                v-if="offer.product?.image_url"
                :src="offer.product.image_url"
                :alt="offer.product?.name"
                class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div
                v-else
                class="w-full h-full bg-gray-100 flex items-center justify-center"
              >
                <Icon name="heroicons:photo" class="w-16 h-16 text-gray-300" />
              </div>

              <!-- Badges -->
              <div class="absolute top-4 right-4 z-20 flex flex-col gap-2">
                <span
                  class="bg-white/90 backdrop-blur text-pink-600 text-xs font-bold px-3 py-1 rounded-full shadow-sm"
                >
                  -{{ offer.discount_percent }}% OFF
                </span>
              </div>

              <!-- Content Overlay -->
              <div
                class="absolute bottom-0 left-0 w-full p-6 z-20 text-white transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300"
              >
                <h3 class="text-2xl font-serif font-bold mb-1">
                  {{ offer.product?.name }}
                </h3>
                <p class="text-sm opacity-90 mb-3 line-clamp-1">
                  {{ offer.product?.description || 'Producto exclusivo' }}
                </p>

                <div
                  class="flex items-center justify-between border-t border-white/20 pt-3"
                >
                  <div class="flex flex-col">
                    <span class="text-xs opacity-75 line-through">{{
                      formatCOP(offer.product?.price)
                    }}</span>
                    <span class="text-xl font-bold text-pink-200">
                      {{
                        formatCOP(
                          discountedPrice(
                            offer.product?.price,
                            offer.discount_percent
                          )
                        )
                      }}
                    </span>
                  </div>
                  <div
                    class="flex items-center text-xs font-medium bg-white/20 backdrop-blur px-3 py-1.5 rounded-lg"
                  >
                    <Icon name="heroicons:map-pin" class="w-3 h-3 mr-1" />
                    En Boutique
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- VISTA USER (Funcional / Carrito) -->
    <div v-else class="max-w-6xl mx-auto p-6">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold theme-text-primary">Mi Perfil</h1>
        <NuxtLink
          to="/shop/cart"
          class="inline-flex items-center px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors shadow-md"
        >
          <Icon name="heroicons:shopping-cart" class="w-5 h-5 mr-2" />
          Ir al carrito ({{ cart.count }})
        </NuxtLink>
      </div>

      <div v-if="loading" class="flex justify-center py-12">
        <Icon
          name="svg-spinners:180-ring-with-bg"
          class="w-10 h-10 text-pink-600"
        />
      </div>

      <div v-else>
        <div
          v-if="offers.length === 0"
          class="bg-white rounded-lg p-8 text-center text-gray-600 shadow-sm border border-gray-100"
        >
          <Icon
            name="heroicons:shopping-bag"
            class="w-12 h-12 mx-auto text-gray-300 mb-3"
          />
          No hay ofertas disponibles por el momento.
        </div>

        <div
          v-else
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <div
            v-for="offer in offers"
            :key="offer.id_offer"
            class="bg-white rounded-xl shadow-sm overflow-hidden border border-pink-100 hover:shadow-md transition-shadow"
          >
            <div
              class="h-48 bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center overflow-hidden relative group"
            >
              <img
                v-if="offer.product?.image_url"
                :src="offer.product.image_url"
                :alt="offer.product?.name"
                class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <Icon
                v-else
                name="heroicons:sparkles"
                class="w-16 h-16 text-pink-500"
              />
              <div
                class="absolute top-2 right-2 bg-pink-600 text-white text-xs font-bold px-2 py-1 rounded shadow"
              >
                -{{ offer.discount_percent }}%
              </div>
            </div>
            <div class="p-4 space-y-3">
              <div>
                <h3 class="text-lg font-semibold text-gray-900 line-clamp-1">
                  {{ offer.product?.name }}
                </h3>
                <div class="text-sm text-gray-500">
                  SKU: {{ offer.product?.sku }}
                </div>
              </div>

              <div class="flex items-center justify-between">
                <div class="flex flex-col">
                  <span
                    class="text-xs text-gray-400 line-through"
                    v-if="offer.product?.price"
                  >
                    {{ formatCOP(offer.product.price) }}
                  </span>
                  <span class="text-lg font-bold text-pink-600">
                    {{
                      formatCOP(
                        discountedPrice(
                          offer.product?.price,
                          offer.discount_percent
                        )
                      )
                    }}
                  </span>
                </div>
              </div>

              <!-- Acciones de compra -->
              <div
                class="pt-2 flex items-center gap-2 border-t border-gray-100 mt-2"
              >
                <input
                  v-model.number="quantities[offer.id_offer]"
                  type="number"
                  min="1"
                  :max="offer.product?.stock_quantity || 1"
                  class="w-16 px-2 py-2 border border-gray-200 rounded-lg text-center focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
                <button
                  @click="addToCart(offer)"
                  class="flex-1 inline-flex items-center justify-center px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <Icon name="heroicons:plus" class="w-5 h-5 mr-1" /> Agregar
                </button>
              </div>

              <div
                v-if="offer.product?.stock_quantity <= 0"
                class="text-xs text-red-600 font-medium flex items-center"
              >
                <Icon
                  name="heroicons:exclamation-circle"
                  class="w-3 h-3 mr-1"
                />
                Agotado
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
  key: route => `user-${route.fullPath}-${Date.now()}`,
})

const loading = ref(true)
const offers = ref([])
const { formatCOP } = useCurrency()
import { useCartStore } from '~/stores/cart'
const cart = useCartStore()
const quantities = reactive({})
const myReservations = ref([])
const { consumeAddIntent } = useAddIntent()
const router = useRouter()
const { user } = useAuth()
const isCustomer = computed(() => user.value?.role === 'customer')

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
    if (data?.success)
      myReservations.value = Array.isArray(data.data) ? data.data : []
  } catch (e) {
    console.error('Error cargando reservas', e)
  }
}

const reservationStatus = productId => {
  const list = myReservations.value
    .filter(r => r.product_id === productId)
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
  return list[0]?.status || null
}

const badgeClass = status => {
  const map = {
    pending: 'bg-yellow-100 text-yellow-800',
    converted: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  }
  return map[status] || 'bg-gray-100 text-gray-800'
}

const badgeText = status =>
  ({ pending: 'Pendiente', converted: 'Aprobado', cancelled: 'Cancelado' }[
    status
  ] || 'Estado')

const addToCart = async offer => {
  const p = offer?.product
  if (!p) return
  const qty = Math.max(1, Number(quantities[offer.id_offer] || 1))
  if (p.stock_quantity !== undefined && qty > Number(p.stock_quantity)) {
    alert('No hay más disponibles')
    return
  }
  const ok = true
  const priceNow = discountedPrice(p.price, offer.discount_percent)
  cart.addItem(
    {
      product_id: p.id_product,
      name: p.name,
      sku: p.sku,
      price: priceNow,
      image_url: p.image_url || null,
    },
    qty
  )
  try {
    await $fetch('/api/reservations', {
      method: 'POST',
      body: { product_id: p.id_product, quantity: qty },
    })
    const { $toast } = useNuxtApp()
    $toast?.success('Agregado al carrito', `${qty} x ${p.name}`)
  } catch (e) {
    console.error('No se pudo crear reserva', e)
  }
}

// Función para recargar datos tras inactividad
const reloadData = async () => {
  console.log('🔄 Recargando datos de usuario tras reactivación...')
  await Promise.all([fetchOffers(), loadMyReservations()])
}

// Detectar reactivación
let lastDataLoad = Date.now()
const DATA_RELOAD_THRESHOLD = 5 * 60 * 1000 // 5 minutos

const checkDataReload = () => {
  const now = Date.now()
  if (now - lastDataLoad > DATA_RELOAD_THRESHOLD) {
    reloadData()
    lastDataLoad = now
  }
}

onMounted(async () => {
  await Promise.all([fetchOffers(), loadMyReservations()])
  lastDataLoad = Date.now()

  // Consumir intención de agregado tras login/redirección
  const intent = consumeAddIntent()
  if (intent?.productId) {
    const offer = offers.value.find(
      o => o.product?.id_product === intent.productId
    )
    if (offer && intent.quantity && intent.quantity > 0) {
      quantities[offer.id_offer] = intent.quantity
      await addToCart(offer)
      try {
        await router.push('/shop/cart')
      } catch (_e) {}
    }
  }

  // Listeners para reactivación
  window.addEventListener('focus', checkDataReload, { passive: true })
  document.addEventListener(
    'visibilitychange',
    () => {
      if (document.visibilityState === 'visible') {
        checkDataReload()
      }
    },
    { passive: true }
  )

  // Verificación periódica
  setInterval(checkDataReload, 60000) // cada minuto
})
</script>

<style scoped>
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translate3d(0, 40px, 0);
  }
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}

.animate-fade-in-up {
  animation: fadeInUp 0.8s ease-out forwards;
}

.animation-delay-200 {
  animation-delay: 0.2s;
}
</style>
