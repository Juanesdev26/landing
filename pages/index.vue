<template>
  <div
    class="min-h-screen bg-gradient-to-br from-gray-50 via-white to-pink-50 relative overflow-hidden"
  >
    <!-- Background Decorations -->
    <div
      class="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none"
    >
      <div
        class="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-gradient-to-br from-pink-300/30 to-purple-300/30 rounded-full blur-3xl animate-pulse"
      ></div>
      <div
        class="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-gradient-to-tr from-blue-300/20 to-pink-300/20 rounded-full blur-3xl animate-pulse animation-delay-2000"
      ></div>
    </div>

    <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
      <!-- Welcome Header -->
      <div class="text-center mb-16 animate-fade-in-up">
        <h1 class="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
          <span class="block text-gray-900 mb-2">Bienvenida a</span>
          <span
            class="bg-gradient-to-r from-pink-600 via-purple-600 to-pink-600 bg-clip-text text-transparent bg-300% animate-gradient"
          >
            BylotoStore
          </span>
        </h1>
        <p
          class="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto font-light"
        >
          Descubre la elegancia y el estilo en cada detalle. Tu destino
          exclusivo de moda y belleza.
        </p>
      </div>

      <!-- Main Action Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <!-- Shop Card -->
        <NuxtLink
          to="/shop"
          class="group relative h-96 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
        >
          <div
            class="absolute inset-0 bg-gradient-to-b from-transparent to-black/70 z-10"
          ></div>
          <img
            src="https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop"
            alt="Shopping"
            class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
          <div class="absolute bottom-0 left-0 w-full p-8 z-20 text-white">
            <div
              class="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mb-4 group-hover:bg-pink-500 transition-colors duration-300"
            >
              <Icon name="heroicons:shopping-bag" class="w-6 h-6 text-white" />
            </div>
            <h2 class="text-3xl font-bold mb-2">Colección Exclusiva</h2>
            <p
              class="text-gray-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-4 group-hover:translate-y-0"
            >
              Explora nuestra selección de productos premium
            </p>
          </div>
        </NuxtLink>

        <!-- Offers Card -->
        <NuxtLink
          to="/shop?sort=price_asc"
          class="group relative h-96 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
        >
          <div
            class="absolute inset-0 bg-gradient-to-b from-transparent to-black/70 z-10"
          ></div>
          <img
            src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070&auto=format&fit=crop"
            alt="Offers"
            class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
          <div class="absolute bottom-0 left-0 w-full p-8 z-20 text-white">
            <div
              class="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mb-4 group-hover:bg-purple-500 transition-colors duration-300"
            >
              <Icon name="heroicons:sparkles" class="w-6 h-6 text-white" />
            </div>
            <h2 class="text-3xl font-bold mb-2">Ofertas Especiales</h2>
            <p
              class="text-gray-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-4 group-hover:translate-y-0"
            >
              Precios increíbles en productos seleccionados
            </p>
          </div>
        </NuxtLink>

        <!-- About/Brand Card -->
        <NuxtLink
          to="/about"
          class="group relative h-96 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
        >
          <div
            class="absolute inset-0 bg-gradient-to-b from-transparent to-black/70 z-10"
          ></div>
          <img
            src="https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=2073&auto=format&fit=crop"
            alt="About Us"
            class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
          <div class="absolute bottom-0 left-0 w-full p-8 z-20 text-white">
            <div
              class="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mb-4 group-hover:bg-pink-600 transition-colors duration-300"
            >
              <Icon name="heroicons:heart" class="w-6 h-6 text-white" />
            </div>
            <h2 class="text-3xl font-bold mb-2">Nuestra Esencia</h2>
            <p
              class="text-gray-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-4 group-hover:translate-y-0"
            >
              Conoce la historia detrás de BylotoStore
            </p>
          </div>
        </NuxtLink>
      </div>

      <!-- Inspirational Quote -->
      <div class="mt-24 text-center animate-fade-in-up animation-delay-1000">
        <blockquote
          class="text-2xl md:text-3xl font-serif italic text-gray-400 max-w-3xl mx-auto leading-relaxed"
        >
          "La belleza comienza en el momento en que decides ser tú misma."
        </blockquote>
        <cite class="block mt-4 text-pink-600 font-medium not-italic"
          >— Coco Chanel</cite
        >
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'default',
})

// Lógica de redirección de intent (mantener por si acaso)
const supabase = useSupabaseClient()
const router = useRouter()
const { setAddIntent } = useAddIntent()
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
}

.animation-delay-1000 {
  animation-delay: 0.5s;
}

.animation-delay-2000 {
  animation-delay: 1s;
}
</style>
