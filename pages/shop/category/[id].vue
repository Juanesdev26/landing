<template>
  <div
    class="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 py-12"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center py-20">
        <Icon
          name="svg-spinners:180-ring-with-bg"
          class="w-16 h-16 text-pink-600"
        />
      </div>

      <div v-else>
        <!-- Header -->
        <div class="text-center mb-8">
          <h1 class="text-4xl md:text-5xl font-bold mb-4">
            <span
              class="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent"
            >
              {{ category?.name || 'Categoría' }}
            </span>
          </h1>
          <p class="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            {{ category?.description || 'Explora nuestros productos' }}
          </p>

          <!-- Category Navigation Pills -->
          <div class="flex flex-wrap justify-center gap-2 mb-8">
            <NuxtLink
              to="/shop"
              class="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border bg-white text-gray-600 border-gray-200 hover:border-pink-300 hover:text-pink-600 hover:bg-pink-50"
            >
              Todas
            </NuxtLink>
            <NuxtLink
              v-for="cat in allCategories"
              :key="cat.id_category"
              :to="`/shop/category/${cat.id_category}`"
              :class="[
                'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border',
                cat.id_category === categoryId
                  ? 'bg-pink-600 text-white border-pink-600 shadow-md transform scale-105'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-pink-300 hover:text-pink-600 hover:bg-pink-50',
              ]"
            >
              {{ cat.name }}
            </NuxtLink>
          </div>
        </div>

        <!-- Category Image -->
        <div v-if="category?.image_url" class="flex justify-center mb-12">
          <div
            class="w-32 h-32 rounded-full overflow-hidden shadow-2xl border-4 border-white"
          >
            <img
              :src="category.image_url"
              :alt="category.name"
              class="w-full h-full object-cover"
            />
          </div>
        </div>

        <!-- Empty State -->
        <div
          v-if="products.length === 0"
          class="text-center py-12 bg-white rounded-xl shadow-sm max-w-2xl mx-auto"
        >
          <Icon
            name="heroicons:shopping-bag"
            class="w-16 h-16 mx-auto text-gray-300 mb-4"
          />
          <h3 class="text-lg font-medium text-gray-900">
            No hay productos en esta categoría
          </h3>
          <p class="text-gray-500 mt-2">
            Vuelve pronto para ver nuevas colecciones
          </p>
          <NuxtLink
            to="/shop"
            class="mt-6 inline-block text-pink-600 hover:text-pink-700 font-medium"
          >
            Ver todos los productos
          </NuxtLink>
        </div>

        <!-- Products Grid -->
        <div
          v-else
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
        >
          <div
            v-for="product in products"
            :key="product.id_product"
            class="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-pink-100"
          >
            <div class="relative h-64 bg-gray-100 overflow-hidden">
              <img
                v-if="product.image_url"
                :src="product.image_url"
                :alt="product.name"
                class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div
                v-else
                class="w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-100 to-purple-100"
              >
                <Icon name="heroicons:photo" class="w-16 h-16 text-pink-300" />
              </div>

              <!-- Badge de Stock -->
              <div
                v-if="product.stock_quantity <= 0"
                class="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded"
              >
                AGOTADO
              </div>
            </div>

            <div class="p-6">
              <h3
                class="font-bold text-xl text-gray-800 mb-2 group-hover:text-pink-600 transition-colors truncate"
                :title="product.name"
              >
                {{ product.name }}
              </h3>
              <p class="text-gray-600 text-sm mb-4 line-clamp-2 h-10">
                {{ product.description }}
              </p>

              <div class="flex justify-between items-center">
                <span
                  class="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent"
                >
                  {{ formatCOP(product.price) }}
                </span>
                <button
                  @click="addToCart(product)"
                  :disabled="product.stock_quantity <= 0"
                  class="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-full hover:from-pink-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  <span class="flex items-center gap-2">
                    <Icon name="heroicons:shopping-cart" class="w-5 h-5" />
                    Agregar
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination (Simple) -->
        <div v-if="products.length > 0" class="mt-12 flex justify-center gap-4">
          <button
            @click="prevPage"
            :disabled="page <= 1"
            class="px-6 py-2 bg-white border border-pink-200 rounded-full text-pink-600 hover:bg-pink-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Anterior
          </button>
          <button
            @click="nextPage"
            :disabled="products.length < pageSize"
            class="px-6 py-2 bg-white border border-pink-200 rounded-full text-pink-600 hover:bg-pink-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Siguiente
          </button>
        </div>

        <!-- Back Button -->
        <div class="text-center mt-16">
          <NuxtLink
            to="/shop"
            class="inline-flex items-center bg-white text-gray-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-50 hover:text-pink-600 transition-all duration-300 shadow-md hover:shadow-lg border border-gray-200"
          >
            <Icon name="heroicons:arrow-left" class="w-5 h-5 mr-2" />
            Volver al Catálogo
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'default',
})

import { useCartStore } from '~/stores/cart'

const route = useRoute()
const categoryId = route.params.id
const { formatCOP } = useCurrency()
const cart = useCartStore()
const { $toast } = useNuxtApp()

// Estado
const category = ref(null)
const allCategories = ref([])
const products = ref([])
const loading = ref(true)
const page = ref(1)
const pageSize = 12

// Cargar datos
const fetchData = async () => {
  loading.value = true
  try {
    // Cargar todas las categorías para el menú
    const { data: catsData } = await $fetch('/api/categories')
    if (catsData?.success) {
      allCategories.value = catsData.data
    }

    // Cargar categoría actual
    const { data: catData } = await $fetch(`/api/categories/${categoryId}`)
    if (catData?.success) {
      category.value = catData.data

      // SEO
      useHead({
        title: `${catData.data.name} - BylotoStore`,
        meta: [{ name: 'description', content: catData.data.description }],
      })
    }

    // Cargar productos de la categoría
    const { data: prodData } = await $fetch('/api/products', {
      params: {
        category_id: categoryId,
        page: page.value,
        page_size: pageSize,
        sort: 'newest',
      },
    })

    if (prodData?.success) {
      products.value = prodData.data
    }
  } catch (e) {
    console.error('Error cargando datos:', e)
    $toast?.error('Error', 'No se pudo cargar la categoría')
  } finally {
    loading.value = false
  }
}

// Paginación
const prevPage = () => {
  if (page.value > 1) {
    page.value--
    fetchData()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const nextPage = () => {
  page.value++
  fetchData()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// Carrito
const addToCart = async product => {
  // Verificar autenticación
  const { user } = useAuth()
  if (!user.value) {
    const { setAddIntent } = useAddIntent()
    setAddIntent({
      productId: product.id_product,
      quantity: 1,
      product: {
        id_product: product.id_product,
        name: product.name,
        price: product.price,
        image_url: product.image_url,
        sku: product.sku,
      },
    })
    return navigateTo('/login')
  }

  cart.addItem({
    product_id: product.id_product,
    name: product.name,
    sku: product.sku,
    price: product.price,
    image_url: product.image_url,
  })
  $toast?.success(
    'Agregado al carrito',
    `${product.name} agregado correctamente`
  )
}

onMounted(() => {
  fetchData()
})
</script>
