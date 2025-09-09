<template>
  <div>
    <!-- Hero Section -->
    <section class="relative min-h-screen flex items-center justify-center overflow-hidden">
      <!-- Background Elements -->
      <div class="absolute inset-0 bg-gradient-to-br from-pink-100 via-white to-purple-100"></div>
      <div class="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-pink-300 to-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
      <div class="absolute top-40 right-10 w-72 h-72 bg-gradient-to-r from-purple-300 to-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      <div class="absolute -bottom-8 left-20 w-72 h-72 bg-gradient-to-r from-pink-300 to-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      
      <!-- Floating Elements -->
      <div class="absolute top-1/4 left-1/4 animate-bounce">
        <Icon name="heroicons:sparkles" class="w-8 h-8 text-pink-400" />
      </div>
      <div class="absolute top-1/3 right-1/4 animate-pulse">
        <Icon name="heroicons:heart" class="w-6 h-6 text-purple-400" />
      </div>
      <div class="absolute bottom-1/4 left-1/3 animate-ping">
        <Icon name="heroicons:star" class="w-4 h-4 text-pink-500" />
      </div>

      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center z-10">
        <div class="mb-8">
          <div class="inline-flex items-center px-6 py-3 bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-full border border-pink-200/50 mb-8">
            <Icon name="heroicons:sparkles" class="w-5 h-5 text-pink-500 mr-2" />
            <span class="text-pink-600 font-medium">✨ Colección Exclusiva 2024</span>
          </div>
        </div>

        <h1 class="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight">
          <span class="bg-gradient-to-r from-pink-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Belleza y Moda
          </span>
          <span class="block text-4xl md:text-6xl lg:text-7xl bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
            Femenina
          </span>
        </h1>

        <p class="text-xl md:text-2xl mb-12 max-w-4xl mx-auto text-gray-600 leading-relaxed">
          Descubre nuestra colección exclusiva de productos de belleza, moda y accesorios 
          <span class="font-semibold text-pink-600">diseñados especialmente para la mujer moderna</span>.
        </p>

        <div class="flex flex-col sm:flex-row gap-6 justify-center mb-16">
          <a 
            href="#"
            @click.prevent="goAdd()"
            class="group relative px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full font-semibold text-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            <span class="relative z-10">Ver Productos</span>
            <div class="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-700 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </a>
          
          <NuxtLink 
            to="/shop/category/1" 
            class="group px-8 py-4 border-2 border-pink-500 text-pink-600 rounded-full font-semibold text-lg hover:bg-pink-500 hover:text-white transition-all duration-300 transform hover:-translate-y-1"
          >
            Explorar Categorías
          </NuxtLink>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div class="text-center">
            <div class="text-3xl font-bold text-pink-600 mb-2">500+</div>
            <div class="text-gray-600">Productos Únicos</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-purple-600 mb-2">10k+</div>
            <div class="text-gray-600">Clientes Satisfechas</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-pink-600 mb-2">24/7</div>
            <div class="text-gray-600">Soporte Personalizado</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Categories Section -->
    <section class="py-24 bg-white relative overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-r from-pink-50/50 to-purple-50/50"></div>
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-4xl md:text-5xl font-bold mb-6">
            <span class="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Nuestras Categorías
            </span>
          </h2>
          <p class="text-xl text-gray-600 max-w-3xl mx-auto">
            Explora nuestras categorías cuidadosamente seleccionadas para satisfacer todas tus necesidades de belleza y moda
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div v-for="cat in categories" :key="cat.id_category" class="group cursor-pointer">
            <NuxtLink :to="`/shop/category/${cat.id_category}`">
              <div class="relative bg-gradient-to-br from-pink-100 via-white to-purple-100 rounded-2xl p-8 text-center hover:shadow-2xl transition-all duration-500 group-hover:scale-105 border border-pink-200/50">
                <div class="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div class="relative z-10">
                  <div class="w-20 h-20 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg overflow-hidden">
                    <img v-if="cat.image_url" :src="cat.image_url" :alt="cat.name" class="w-full h-full object-cover rounded-full" />
                    <Icon v-else name="heroicons:tag" class="w-10 h-10 text-white" />
                  </div>
                  <h3 class="text-2xl font-bold text-gray-800 mb-3 group-hover:text-pink-600 transition-colors">{{ cat.name }}</h3>
                  <p class="text-gray-600 mb-4">{{ cat.description || ' ' }}</p>
                  <div class="inline-flex items-center text-pink-600 font-medium group-hover:translate-x-1 transition-transform">
                    Explorar
                    <Icon name="heroicons:arrow-right" class="w-4 h-4 ml-1" />
                  </div>
                </div>
              </div>
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- Featured Products -->
    <section class="py-24 bg-gradient-to-br from-gray-50 to-pink-50 relative overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-r from-pink-500/5 to-purple-500/5"></div>
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-4xl md:text-5xl font-bold mb-6">
            <span class="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Productos Destacados
            </span>
          </h2>
          <p class="text-xl text-gray-600 max-w-3xl mx-auto">
            Descubre nuestros productos más populares, cuidadosamente seleccionados para ti
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          <div v-for="p in products" :key="p.id_product" class="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-pink-100">
            <div class="relative h-64 bg-gradient-to-br from-pink-200 to-purple-200 flex items-center justify-center overflow-hidden">
              <img v-if="p.image_url" :src="p.image_url" :alt="p.name" class="absolute inset-0 w-full h-full object-cover" />
              <div class="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-purple-500/10"></div>
            </div>
            <div class="p-6">
              <h3 class="font-bold text-xl text-gray-800 mb-2 group-hover:text-pink-600 transition-colors">{{ p.name }}</h3>
              <p class="text-gray-600 text-sm mb-4 line-clamp-2">{{ p.description || '' }}</p>
              <div class="flex justify-between items-center">
                <span class="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">{{ formatCOP(p.price) }}</span>
                <NuxtLink :to="`/shop/product/${p.id_product}`" class="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-2 rounded-full hover:from-pink-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg">
                  Ver
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
        
        <div class="text-center mt-16">
          <NuxtLink 
            to="/shop" 
            class="inline-flex items-center bg-gradient-to-r from-pink-500 to-purple-600 text-white px-10 py-4 rounded-full font-semibold text-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            Ver Todos los Productos
            <Icon name="heroicons:arrow-right" class="w-5 h-5 ml-2" />
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-24 bg-white relative overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-r from-pink-50/30 to-purple-50/30"></div>
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-4xl md:text-5xl font-bold mb-6">
            <span class="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              ¿Por qué elegirnos?
            </span>
          </h2>
          <p class="text-xl text-gray-600 max-w-3xl mx-auto">
            Nos comprometemos a brindarte la mejor experiencia de compra con productos de calidad y servicio excepcional
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div class="text-center group">
            <div class="w-24 h-24 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <Icon name="heroicons:truck" class="w-12 h-12 text-white" />
            </div>
            <h3 class="text-2xl font-bold mb-4 text-gray-800 group-hover:text-pink-600 transition-colors">Envío Gratis</h3>
            <p class="text-gray-600 text-lg">En pedidos superiores a $50 con entrega rápida y segura</p>
          </div>
          
          <div class="text-center group">
            <div class="w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <Icon name="heroicons:shield-check" class="w-12 h-12 text-white" />
            </div>
            <h3 class="text-2xl font-bold mb-4 text-gray-800 group-hover:text-purple-600 transition-colors">Garantía</h3>
            <p class="text-gray-600 text-lg">30 días de garantía en todos los productos con devolución gratuita</p>
          </div>
          
          <div class="text-center group">
            <div class="w-24 h-24 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <Icon name="heroicons:heart" class="w-12 h-12 text-white" />
            </div>
            <h3 class="text-2xl font-bold mb-4 text-gray-800 group-hover:text-pink-600 transition-colors">Calidad Premium</h3>
            <p class="text-gray-600 text-lg">Productos seleccionados cuidadosamente para satisfacer tus expectativas</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-24 bg-gradient-to-r from-pink-500 to-purple-600 relative overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-purple-500/20"></div>
      <div class="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
        <h2 class="text-4xl md:text-5xl font-bold text-white mb-6">
          ¡Únete a nuestra comunidad de belleza!
        </h2>
        <p class="text-xl text-pink-100 mb-8 max-w-2xl mx-auto">
          Recibe ofertas exclusivas, consejos de belleza y las últimas tendencias directamente en tu inbox
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
          <input 
            type="email" 
            placeholder="Tu email" 
            class="flex-1 px-6 py-4 rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-white text-gray-800 placeholder-gray-500"
          >
          <button class="bg-white text-pink-600 px-8 py-4 rounded-full font-semibold hover:bg-pink-50 transition-colors">
            Suscribirse
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'default'
})

const categories = ref([])
const products = ref([])
const loading = ref(false)
const { formatCOP } = useCurrency()

const fetchHomeData = async () => {
  loading.value = true
  try {
    const [{ data: catRes }, { data: prodRes }] = await Promise.all([
      $fetch('/api/categories'),
      $fetch('/api/products')
    ])
    if (catRes?.success) categories.value = catRes.data
    if (prodRes?.success) products.value = (prodRes.data || []).slice(0, 8)
  } catch (e) {
    console.error('Error cargando datos del home:', e)
  } finally {
    loading.value = false
  }
}

onMounted(fetchHomeData)

// Intento de agregar: si no hay sesión, ir a login y luego /user agregará
const supabase = useSupabaseClient()
const router = useRouter()
const { setAddIntent } = useAddIntent()
const goAdd = async () => {
  const { data: { session } } = await supabase.auth.getSession()
  setAddIntent({})
  if (!session) return router.push('/login')
  return router.push('/user')
}
</script>

<style scoped>
.animation-delay-2000 {
  animation-delay: 2s;
}

.animation-delay-4000 {
  animation-delay: 4s;
}
</style>
