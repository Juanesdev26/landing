<template>
  <div class="min-h-screen bg-white overflow-hidden">
    <!-- Hero Section -->
    <section class="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      <!-- Animated Background -->
      <div class="absolute inset-0 overflow-hidden">
        <div class="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-pink-400/20 via-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-blob"></div>
        <div class="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-purple-400/20 via-pink-400/20 to-purple-400/20 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-pink-300/10 to-purple-300/10 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <!-- Badge -->
        <div class="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-100 to-purple-100 rounded-full mb-8 animate-fade-in-up">
          <Icon name="heroicons:sparkles" class="w-5 h-5 text-pink-600" />
          <span class="text-sm font-semibold text-pink-600">Nueva Colección 2024</span>
        </div>

        <!-- Main Heading -->
        <h1 class="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight animate-fade-in-up animation-delay-200">
          <span class="block text-gray-900 mb-2">Bienvenida a</span>
          <span class="block bg-gradient-to-r from-pink-600 via-purple-600 to-pink-600 bg-clip-text text-transparent bg-300% animate-gradient">
            BylotoStore
          </span>
        </h1>

        <!-- Subheading -->
        <p class="text-xl sm:text-2xl md:text-3xl text-gray-600 max-w-3xl mx-auto mb-12 font-light leading-relaxed animate-fade-in-up animation-delay-400">
          Descubre la elegancia y el estilo en cada detalle.<br />
          Tu destino exclusivo de <span class="font-semibold text-pink-600">moda y belleza</span>.
        </p>

        <!-- CTA Buttons -->
        <div class="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-in-up animation-delay-600">
          <NuxtLink
            to="/shop"
            class="group relative px-8 py-4 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-full font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 overflow-hidden"
          >
            <span class="relative z-10 flex items-center gap-2">
              Explorar Colección
              <Icon name="heroicons:arrow-right" class="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
            <div class="absolute inset-0 bg-gradient-to-r from-pink-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </NuxtLink>
          <NuxtLink
            to="/shop?sort=price_asc"
            class="px-8 py-4 bg-white text-gray-900 rounded-full font-semibold text-lg border-2 border-gray-200 hover:border-pink-300 hover:bg-pink-50 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Ver Ofertas
          </NuxtLink>
        </div>

        <!-- Trust Indicators -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto animate-fade-in-up animation-delay-800">
          <div class="text-center">
            <div class="text-3xl font-bold text-pink-600 mb-1">100%</div>
            <div class="text-sm text-gray-600">Productos Originales</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-pink-600 mb-1">24/7</div>
            <div class="text-sm text-gray-600">Atención al Cliente</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-pink-600 mb-1">✓</div>
            <div class="text-sm text-gray-600">Envío Gratis</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-pink-600 mb-1">★</div>
            <div class="text-sm text-gray-600">Calidad Premium</div>
          </div>
        </div>
      </div>

      <!-- Scroll Indicator -->
      <div class="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <Icon name="heroicons:chevron-down" class="w-6 h-6 text-gray-400" />
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-20 bg-gradient-to-b from-white to-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            ¿Por qué elegir <span class="text-pink-600">BylotoStore</span>?
          </h2>
          <p class="text-xl text-gray-600 max-w-2xl mx-auto">
            Ofrecemos una experiencia de compra única con los mejores productos y servicios
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div
            v-for="(feature, index) in features"
            :key="index"
            class="group p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border border-gray-100"
          >
            <div class="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Icon :name="feature.icon" class="w-8 h-8 text-white" />
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-3">{{ feature.title }}</h3>
            <p class="text-gray-600 leading-relaxed">{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </section>


    <!-- Special Offers Section -->
    <section data-section="offers" v-if="activeOffers.length > 0" class="py-20 bg-gradient-to-br from-pink-50 via-purple-50 to-pink-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <div class="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-full mb-4">
            <Icon name="heroicons:sparkles" class="w-5 h-5" />
            <span class="font-semibold">Ofertas Especiales</span>
          </div>
          <h2 class="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Aprovecha Nuestras <span class="text-pink-600">Promociones</span>
          </h2>
          <p class="text-xl text-gray-600 max-w-2xl mx-auto">
            Descuentos exclusivos en productos seleccionados
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div
            v-for="offer in activeOffers.slice(0, 3)"
            :key="offer.id_offer"
            class="group relative bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border-2 border-pink-200"
          >
            <!-- Discount Badge -->
            <div class="absolute top-4 right-4 z-10">
              <div class="bg-gradient-to-r from-pink-600 to-purple-600 text-white px-4 py-2 rounded-full font-bold text-lg shadow-lg">
                -{{ offer.discount_percent }}%
              </div>
            </div>

            <div class="p-6">
              <div v-if="offer.product" class="mb-4">
                <div class="h-48 bg-gradient-to-br from-pink-100 to-purple-100 rounded-xl overflow-hidden mb-4">
                  <img
                    v-if="offer.product.image_url"
                    :src="offer.product.image_url"
                    :alt="offer.product.name"
                    loading="lazy"
                    decoding="async"
                    class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div v-else class="w-full h-full flex items-center justify-center">
                    <Icon name="heroicons:photo" class="w-16 h-16 text-pink-300" />
                  </div>
                </div>
                <h3 class="text-xl font-bold text-gray-900 mb-2">{{ offer.product.name }}</h3>
                <div class="flex items-center gap-3 mb-4">
                  <span class="text-2xl font-bold text-pink-600">
                    {{ formatCOP(calculateDiscountedPrice(offer.product.price, offer.discount_percent)) }}
                  </span>
                  <span class="text-lg text-gray-400 line-through">
                    {{ formatCOP(offer.product.price) }}
                  </span>
                </div>
                <NuxtLink
                  to="/shop"
                  class="block w-full text-center px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-xl font-semibold hover:from-pink-700 hover:to-purple-700 transition-all duration-300"
                >
                  Ver Oferta
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>


    <!-- CTA Section -->
    <section class="py-20 bg-gradient-to-r from-pink-600 via-purple-600 to-pink-600 relative overflow-hidden">
      <div class="absolute inset-0 bg-black/10"></div>
      <div class="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-4xl md:text-5xl font-bold text-white mb-6">
          ¿Lista para comenzar tu experiencia de compra?
        </h2>
        <p class="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
          Únete a miles de clientas que ya confían en BylotoStore para sus compras de moda y belleza
        </p>
        <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
          <NuxtLink
            to="/shop"
            class="px-8 py-4 bg-white text-pink-600 rounded-full font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
          >
            Explorar Tienda
          </NuxtLink>
          <NuxtLink
            to="/about"
            class="px-8 py-4 bg-transparent text-white border-2 border-white rounded-full font-semibold text-lg hover:bg-white/10 transform hover:scale-105 transition-all duration-300"
          >
            Conocer Más
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Inspirational Quote -->
    <section class="py-16 bg-gray-50">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <Icon name="heroicons:quote" class="w-12 h-12 text-pink-400 mx-auto mb-6" />
        <blockquote class="text-2xl md:text-3xl font-serif italic text-gray-700 leading-relaxed mb-4">
          "La belleza comienza en el momento en que decides ser tú misma."
        </blockquote>
        <cite class="block text-lg text-pink-600 font-medium not-italic">
          — Coco Chanel
        </cite>
      </div>
    </section>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'default',
})

const { formatCOP } = useCurrency()

// Features data
const features = [
  {
    icon: 'heroicons:truck',
    title: 'Envío Gratis',
    description: 'Envío gratuito en compras superiores a $100.000. Recibe tus productos en la comodidad de tu hogar.'
  },
  {
    icon: 'heroicons:shield-check',
    title: 'Compra Segura',
    description: 'Protegemos tus datos con tecnología de encriptación avanzada. Tu seguridad es nuestra prioridad.'
  },
  {
    icon: 'heroicons:arrow-path',
    title: 'Devoluciones Fáciles',
    description: '30 días para devolver o cambiar cualquier producto. Proceso simple y sin complicaciones.'
  },
  {
    icon: 'heroicons:heart',
    title: 'Productos Premium',
    description: 'Seleccionamos cuidadosamente cada producto para garantizar la mejor calidad y elegancia.'
  }
]

// Products state
const activeOffers = ref([])
const sectionsVisible = ref({
  offers: false
})

// Intersection Observer para lazy loading
const setupIntersectionObserver = () => {
  if (typeof window === 'undefined' || !window.IntersectionObserver) return

  const observerOptions = {
    root: null,
    rootMargin: '100px', // Cargar 100px antes de que sea visible
    threshold: 0.1
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const section = entry.target.getAttribute('data-section')
        if (section && !sectionsVisible.value[section]) {
          sectionsVisible.value[section] = true
          
          // Cargar datos cuando la sección sea visible
          if (section === 'offers' && activeOffers.value.length === 0) {
            fetchActiveOffers()
          }
        }
      }
    })
  }, observerOptions)

  // Observar secciones después de que el DOM esté listo
  nextTick(() => {
    const offersSection = document.querySelector('[data-section="offers"]')
    
    if (offersSection) observer.observe(offersSection)
  })
}

// Fetch active offers (optimizado)
const fetchActiveOffers = async () => {
  if (activeOffers.value.length > 0) return // Ya cargado
  
  try {
    const { data } = await $fetch('/api/offers/active')
    if (data?.success) {
      activeOffers.value = data.data || []
    }
  } catch (error) {
    console.error('Error fetching offers:', error)
  }
}

// Calculate discounted price
const calculateDiscountedPrice = (price, discountPercent) => {
  return price * (1 - discountPercent / 100)
}


// Initialize con carga progresiva
onMounted(() => {
  // Cargar solo hero y features inmediatamente
  // El resto se carga cuando sea visible (lazy loading)
  setupIntersectionObserver()
})
</script>

<style scoped>
.bg-300\% {
  background-size: 300% auto;
}

@keyframes gradient {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.animate-gradient {
  animation: gradient 6s ease infinite;
}

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
  opacity: 0;
}

.animation-delay-200 {
  animation-delay: 0.2s;
}

.animation-delay-400 {
  animation-delay: 0.4s;
}

.animation-delay-600 {
  animation-delay: 0.6s;
}

.animation-delay-800 {
  animation-delay: 0.8s;
}

.animation-delay-2000 {
  animation-delay: 2s;
}

.animation-delay-4000 {
  animation-delay: 4s;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.min-h-\[3\.5rem\] {
  min-height: 3.5rem;
}

.min-h-\[2\.5rem\] {
  min-height: 2.5rem;
}

/* Optimizaciones de rendimiento */
[data-section] {
  contain: layout style paint;
  will-change: contents;
}

/* Optimizar animaciones */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* GPU acceleration para elementos animados */
.animate-blob,
.animate-fade-in-up,
.animate-gradient {
  will-change: transform, opacity;
  transform: translateZ(0);
  backface-visibility: hidden;
}
</style>
