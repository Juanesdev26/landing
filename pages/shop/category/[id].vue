<template>
  <div class="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 py-12">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="text-center mb-12">
        <h1 class="text-4xl md:text-5xl font-bold mb-6">
          <span class="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            {{ categoryTitle }}
          </span>
        </h1>
        <p class="text-xl text-gray-600 max-w-3xl mx-auto">
          {{ categoryDescription }}
        </p>
      </div>

      <!-- Category Icon -->
      <div class="flex justify-center mb-12">
        <div class="w-32 h-32 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl">
          <Icon :name="categoryIcon" class="w-16 h-16 text-white" />
        </div>
      </div>

      <!-- Products Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        <!-- Placeholder Products -->
        <div v-for="i in 8" :key="i" class="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-pink-100">
          <div class="relative h-64 bg-gradient-to-br from-pink-200 to-purple-200 flex items-center justify-center overflow-hidden">
            <div class="absolute inset-0 bg-gradient-to-br from-pink-500/20 to-purple-500/20 group-hover:scale-110 transition-transform duration-500"></div>
            <Icon :name="categoryIcon" class="w-20 h-20 text-pink-500 relative z-10 group-hover:scale-110 transition-transform duration-300" />
            <div class="absolute top-4 right-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium">
              Nuevo
            </div>
          </div>
          <div class="p-6">
            <h3 class="font-bold text-xl text-gray-800 mb-2 group-hover:text-pink-600 transition-colors">
              Producto {{ i }} - {{ categoryTitle }}
            </h3>
            <p class="text-gray-600 text-sm mb-4">Descripción del producto {{ i }} en la categoría {{ categoryTitle }}</p>
            <div class="flex justify-between items-center">
              <span class="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                ${{ (Math.random() * 100 + 20).toFixed(2) }}
              </span>
              <button @click="handleAdd(i)" class="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-2 rounded-full hover:from-pink-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg">
                Agregar
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Back Button -->
      <div class="text-center mt-16">
        <NuxtLink 
          to="/shop" 
          class="inline-flex items-center bg-gradient-to-r from-gray-500 to-gray-600 text-white px-8 py-3 rounded-full font-semibold hover:from-gray-600 hover:to-gray-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
        >
          <Icon name="heroicons:arrow-left" class="w-5 h-5 mr-2" />
          Volver a la Tienda
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
const route = useRoute()
const categoryId = route.params.id

// Category data based on ID
const categoryData = {
  '1': {
    title: 'Loción',
    description: 'Productos de cuidado personal que nutren y protegen tu piel',
    icon: 'heroicons:sparkles'
  },
  '2': {
    title: 'Ropa',
    description: 'Moda femenina elegante que destaca tu belleza natural',
    icon: 'heroicons:tag'
  },
  '3': {
    title: 'Maquillaje',
    description: 'Productos de belleza que realzan tu naturalidad',
    icon: 'heroicons:eye'
  },
  '4': {
    title: 'Bolsos',
    description: 'Accesorios elegantes que complementan tu estilo',
    icon: 'heroicons:shopping-bag'
  }
}

const categoryInfo = categoryData[categoryId] || {
  title: 'Categoría',
  description: 'Productos de nuestra tienda',
  icon: 'heroicons:star'
}

const categoryTitle = categoryInfo.title
const categoryDescription = categoryInfo.description
const categoryIcon = categoryInfo.icon

// Set page meta
definePageMeta({
  layout: 'default'
})

useHead({
  title: `${categoryTitle} - BylotoStore`,
  meta: [
    { name: 'description', content: categoryDescription }
  ]
})

const supabase = useSupabaseClient()
const router = useRouter()
const { setAddIntent } = useAddIntent()
const handleAdd = async (i) => {
  const { data: { session } } = await supabase.auth.getSession()
  const fakeProductId = String(i) // placeholder para demo; en real usar id_product
  if (!session) {
    setAddIntent({ productId: fakeProductId, quantity: 1 })
    await router.push('/login')
    return
  }
  setAddIntent({ productId: fakeProductId, quantity: 1 })
  await router.push('/user')
}
</script>


