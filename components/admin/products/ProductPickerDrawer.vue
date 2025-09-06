<template>
  <div v-if="modelValue" class="fixed inset-0 z-50">
    <div class="absolute inset-0 bg-black/40" @click="$emit('update:modelValue', false)"></div>
    <div class="absolute right-0 top-0 h-full w-full max-w-xl bg-white shadow-xl flex flex-col">
      <div class="p-4 border-b flex items-center justify-between">
        <h3 class="text-lg font-semibold">Seleccionar producto</h3>
        <button @click="$emit('update:modelValue', false)" class="p-2 rounded hover:bg-gray-100">
          <Icon name="heroicons:x-mark" class="w-5 h-5" />
        </button>
      </div>
      <div class="p-4 border-b grid grid-cols-1 gap-3">
        <div class="flex gap-2">
          <select v-model="selectedCategory" class="px-3 py-2 border rounded w-1/2">
            <option value="">Todas las categorías</option>
            <option v-for="c in categories" :key="c.id_category" :value="c.id_category">{{ c.name }}</option>
          </select>
          <input v-model="search" type="text" placeholder="Buscar por nombre o SKU" class="px-3 py-2 border rounded w-full" />
          <button @click="fetchProducts(1)" class="px-4 py-2 border rounded">Buscar</button>
        </div>
      </div>
      <div class="flex-1 overflow-auto">
        <div v-if="loading" class="p-6 text-gray-600">Cargando...</div>
        <ul v-else class="divide-y">
          <li v-for="p in products" :key="p.id_product" class="p-4 flex items-center gap-4">
            <img v-if="p.image_url" :src="p.image_url" :alt="p.name" class="w-14 h-14 object-cover rounded" />
            <div class="flex-1 min-w-0">
              <div class="font-medium text-gray-900 truncate">{{ p.name }}</div>
              <div class="text-sm text-gray-500 truncate">SKU: {{ p.sku }} • {{ p.category?.name }}</div>
              <div class="text-sm text-gray-700">{{ formatCOP(p.price) }}</div>
            </div>
            <button @click="select(p)" class="px-3 py-2 bg-pink-600 text-white rounded">Seleccionar</button>
          </li>
        </ul>
      </div>
      <div class="p-4 border-t flex items-center justify-between">
        <button :disabled="page===1" @click="prev" class="px-3 py-2 border rounded disabled:opacity-50">Anterior</button>
        <div class="text-sm text-gray-600">Página {{ page }}</div>
        <button :disabled="!hasMore" @click="next" class="px-3 py-2 border rounded disabled:opacity-50">Siguiente</button>
      </div>
    </div>
  </div>
  
</template>

<script setup lang="ts">
const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ (e: 'update:modelValue', v: boolean): void; (e: 'select', p: any): void }>()

const loading = ref(false)
const categories = ref<any[]>([])
const products = ref<any[]>([])
const page = ref(1)
const pageSize = 10
const hasMore = ref(false)
const selectedCategory = ref<string>('')
const search = ref('')

const { formatCOP } = useCurrency()

type ApiSuccess<T> = { success: true; data: T; message?: string }
type ApiFail = { success: false; error: string }
const unwrap = <T,>(raw: any): ApiSuccess<T> | ApiFail => {
  const inner = raw && typeof raw === 'object' && 'data' in (raw as any) ? (raw as any).data : raw
  return inner as ApiSuccess<T> | ApiFail
}
const isApiSuccess = <T,>(env: ApiSuccess<T> | ApiFail): env is ApiSuccess<T> => {
  return !!env && (env as any).success === true && 'data' in (env as any)
}

const fetchCategories = async () => {
  try {
    const env = unwrap<any[]>(await $fetch(`/api/categories`))
    if (isApiSuccess<any[]>(env)) {
      categories.value = (env as any).data || []
    }
  } catch (e) { console.error(e) }
}

const fetchProducts = async (goToPage?: number) => {
  if (goToPage) page.value = goToPage
  loading.value = true
  try {
    const params = new URLSearchParams()
    if (selectedCategory.value) params.set('category_id', selectedCategory.value)
    if (search.value) params.set('search', search.value)
    params.set('page', String(page.value))
    params.set('page_size', String(pageSize))
    const env = unwrap<any[]>(await $fetch(`/api/products?${params.toString()}`))
    if (isApiSuccess<any[]>(env)) {
      const list = (env as any).data || []
      products.value = list
      hasMore.value = list.length === pageSize
    }
  } catch (e) { console.error(e) }
  finally { loading.value = false }
}

const select = (p: any) => {
  emit('select', p)
  emit('update:modelValue', false)
}

const prev = () => { if (page.value > 1) { page.value -= 1; fetchProducts() } }
const next = () => { if (hasMore.value) { page.value += 1; fetchProducts() } }

watch(() => props.modelValue, (v) => { if (v) { fetchCategories(); fetchProducts(1) } })
</script>

<style scoped>
</style>


