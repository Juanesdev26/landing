<template>
  <div class="py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-4">Catálogo de Productos</h1>
        <p class="text-gray-600">Descubre nuestra colección completa de productos de belleza y moda</p>
      </div>

      <!-- Filters -->
      <div class="bg-white p-4 rounded-lg shadow-sm mb-8">
        <div class="flex flex-wrap gap-4">
          <select class="border border-gray-300 rounded-lg px-4 py-2">
            <option>Categoría</option>
            <option>Loción</option>
            <option>Ropa</option>
            <option>Maquillaje</option>
            <option>Bolsos</option>
          </select>
          <select class="border border-gray-300 rounded-lg px-4 py-2">
            <option>Precio</option>
            <option>$0 - $25</option>
            <option>$25 - $50</option>
            <option>$50 - $100</option>
            <option>$100+</option>
          </select>
          <select class="border border-gray-300 rounded-lg px-4 py-2">
            <option>Ordenar por</option>
            <option>Precio: Menor a Mayor</option>
            <option>Precio: Mayor a Menor</option>
            <option>Nombre A-Z</option>
            <option>Más Populares</option>
          </select>
        </div>
      </div>

      <!-- Products Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <!-- Product Card 1 -->
        <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
          <div class="h-48 bg-gradient-to-br from-pink-200 to-purple-200 flex items-center justify-center">
            <Icon name="heroicons:sparkles" class="w-16 h-16 text-pink-500" />
          </div>
          <div class="p-4">
            <h3 class="font-semibold text-gray-800 mb-2">Loción Hidratante</h3>
            <p class="text-gray-600 text-sm mb-3">Hidratación profunda para tu piel</p>
            <div class="flex justify-between items-center">
              <span class="text-xl font-bold text-pink-600">$29.99</span>
              <button class="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors">
                Agregar
              </button>
            </div>
          </div>
        </div>

        <!-- Product Card 2 -->
        <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
          <div class="h-48 bg-gradient-to-br from-purple-200 to-pink-200 flex items-center justify-center">
            <Icon name="heroicons:tag" class="w-16 h-16 text-purple-500" />
          </div>
          <div class="p-4">
            <h3 class="font-semibold text-gray-800 mb-2">Vestido Elegante</h3>
            <p class="text-gray-600 text-sm mb-3">Diseño moderno y sofisticado</p>
            <div class="flex justify-between items-center">
              <span class="text-xl font-bold text-pink-600">$89.99</span>
              <button class="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors">
                Agregar
              </button>
            </div>
          </div>
        </div>

        <!-- Product Card 3 -->
        <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
          <div class="h-48 bg-gradient-to-br from-pink-200 to-purple-200 flex items-center justify-center">
            <Icon name="heroicons:eye" class="w-16 h-16 text-pink-500" />
          </div>
          <div class="p-4">
            <h3 class="font-semibold text-gray-800 mb-2">Paleta de Sombras</h3>
            <p class="text-gray-600 text-sm mb-3">Colores vibrantes y duraderos</p>
            <div class="flex justify-between items-center">
              <span class="text-xl font-bold text-pink-600">$45.99</span>
              <button class="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors">
                Agregar
              </button>
            </div>
          </div>
        </div>

        <!-- Product Card 4 -->
        <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
          <div class="h-48 bg-gradient-to-br from-purple-200 to-pink-200 flex items-center justify-center">
            <Icon name="heroicons:shopping-bag" class="w-16 h-16 text-purple-500" />
          </div>
          <div class="p-4">
            <h3 class="font-semibold text-gray-800 mb-2">Bolso de Mano</h3>
            <p class="text-gray-600 text-sm mb-3">Elegante y funcional</p>
            <div class="flex justify-between items-center">
              <span class="text-xl font-bold text-pink-600">$129.99</span>
              <button class="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors">
                Agregar
              </button>
            </div>
          </div>
        </div>

        <!-- More products... -->
        <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
          <div class="h-48 bg-gradient-to-br from-pink-200 to-purple-200 flex items-center justify-center">
            <Icon name="heroicons:sparkles" class="w-16 h-16 text-pink-500" />
          </div>
          <div class="p-4">
            <h3 class="font-semibold text-gray-800 mb-2">Crema Facial</h3>
            <p class="text-gray-600 text-sm mb-3">Nutrición profunda para tu rostro</p>
            <div class="flex justify-between items-center">
              <span class="text-xl font-bold text-pink-600">$39.99</span>
              <button class="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors">
                Agregar
              </button>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
          <div class="h-48 bg-gradient-to-br from-purple-200 to-pink-200 flex items-center justify-center">
            <Icon name="heroicons:tag" class="w-16 h-16 text-purple-500" />
          </div>
          <div class="p-4">
            <h3 class="font-semibold text-gray-800 mb-2">Blusa Casual</h3>
            <p class="text-gray-600 text-sm mb-3">Comodidad y estilo</p>
            <div class="flex justify-between items-center">
              <span class="text-xl font-bold text-pink-600">$59.99</span>
              <button class="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors">
                Agregar
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div class="mt-12 flex justify-center">
        <nav class="flex space-x-2">
          <button class="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Anterior</button>
          <button class="px-3 py-2 bg-pink-600 text-white rounded-lg">1</button>
          <button class="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">2</button>
          <button class="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">3</button>
          <button class="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Siguiente</button>
        </nav>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'default'
})

const supabase = useSupabaseClient()
const router = useRouter()
const { setAddIntent } = useAddIntent()

const ensureUserAndRedirectToUser = async (productId, quantity = 1) => {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    setAddIntent({ productId, quantity })
    await router.push('/login')
    return
  }
  // Si hay sesión, ir a /user con intención para que se agregue allí
  setAddIntent({ productId, quantity })
  await router.push('/user')
}
</script>


