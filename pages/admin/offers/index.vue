<!-- @ts-nocheck -->
<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Gestión de Ofertas</h1>
        <p class="text-gray-600">Descuentos visibles para todos los usuarios</p>
      </div>
      <button @click="openCreate" class="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
        <Icon name="heroicons:plus" class="w-5 h-5" />
        <span>Nueva Oferta</span>
      </button>
    </div>

    <div class="bg-white rounded-lg shadow-sm overflow-hidden">
      <div class="p-4 border-b flex gap-4">
        <input v-model="filters.sku" type="text" placeholder="Filtrar por SKU" class="px-3 py-2 border rounded w-64" />
        <button @click="fetchOffers" class="px-4 py-2 border rounded">Aplicar</button>
        <button @click="clearFilters" class="px-4 py-2 border rounded">Limpiar</button>
      </div>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descuento</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vigencia</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="o in filteredOffersForTemplate" :key="o.id_offer">
              <td class="px-6 py-4">
                <div class="text-sm font-medium text-gray-900">{{ o.product?.name }}</div>
                <div class="text-sm text-gray-500">SKU: {{ o.product?.sku }}</div>
              </td>
              <td class="px-6 py-4">
                <span class="text-pink-600 font-semibold">-{{ o.discount_percent }}%</span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-700">
                <div>{{ o.valid_from ? formatDate(o.valid_from) : '—' }} → {{ o.valid_to ? formatDate(o.valid_to) : '—' }}</div>
              </td>
              <td class="px-6 py-4">
                <span :class="o.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'" class="px-2 py-1 rounded text-xs">
                  {{ o.is_active ? 'Activa' : 'Inactiva' }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm">
                <div class="flex gap-2">
                  <button @click="edit(o)" class="text-indigo-600 hover:text-indigo-900">
                    <Icon name="heroicons:pencil-square" class="w-5 h-5" />
                  </button>
                  <button @click="remove(o)" class="text-red-600 hover:text-red-900">
                    <Icon name="heroicons:trash" class="w-5 h-5" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal con selector de producto y vista de precios -->
    <div v-if="showModal" class="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
      <div class="bg-white rounded-lg w-full max-w-lg p-6 space-y-4">
        <h3 class="text-lg font-semibold">{{ editing ? 'Editar' : 'Nueva' }} oferta</h3>
        <div class="grid grid-cols-1 gap-3">
          <div>
            <div class="flex items-center gap-2">
              <input v-model="form.product_id" type="text" placeholder="Product ID" class="px-3 py-2 border rounded flex-1" />
              <button @click="openPicker = true" type="button" class="px-3 py-2 border rounded">Buscar producto</button>
            </div>
            <div v-if="selectedProduct" class="mt-2 p-3 border rounded bg-gray-50 flex items-center gap-3">
              <img v-if="selectedProduct.image_url" :src="selectedProduct.image_url" class="w-12 h-12 object-cover rounded" />
              <div class="text-sm">
                <div class="font-medium">{{ selectedProduct.name }}</div>
                <div class="text-gray-500">SKU: {{ selectedProduct.sku }}</div>
              </div>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3 items-end">
            <div>
              <label class="block text-xs text-gray-600 mb-1">Descuento %</label>
              <input v-model.number="form.discount_percent" type="number" min="0" max="100" placeholder="Descuento %" class="px-3 py-2 border rounded w-full" />
            </div>
            <div v-if="selectedProduct" class="text-sm">
              <div class="text-gray-500 line-through" v-if="selectedProduct.price">{{ formatCOP(selectedProduct.price) }}</div>
              <div class="text-pink-600 font-semibold">{{ formatCOP(discountedPrice(selectedProduct?.price, form.discount_percent)) }}</div>
            </div>
          </div>
          <label class="flex items-center gap-2 text-sm"><input type="checkbox" v-model="form.is_active" /> Activa</label>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs text-gray-600 mb-1">Inicio</label>
              <input v-model="form.valid_from" type="datetime-local" class="px-3 py-2 border rounded w-full" />
            </div>
            <div>
              <label class="block text-xs text-gray-600 mb-1">Fin</label>
              <input v-model="form.valid_to" type="datetime-local" class="px-3 py-2 border rounded w-full" />
            </div>
          </div>
          <textarea v-model="form.notes" placeholder="Notas" class="px-3 py-2 border rounded"></textarea>
        </div>
        <div class="flex justify-end gap-2 pt-2">
          <button @click="close" class="px-4 py-2 border rounded">Cancelar</button>
          <button @click="save" class="px-4 py-2 bg-pink-600 text-white rounded">Guardar</button>
        </div>
      </div>
    </div>
    <ProductPickerDrawer v-model="openPicker" @select="onPick" />
  </div>
</template>

<script setup lang="ts">
// @ts-nocheck
definePageMeta({ layout: 'admin' })

type ProductLite = { id_product: string; name?: string; sku?: string; price?: number; image_url?: string }
interface Offer { 
  id_offer: string; 
  product_id: string; 
  discount_percent: number; 
  is_active: boolean; 
  valid_from?: string | null; 
  valid_to?: string | null; 
  notes?: string | null; 
  product?: ProductLite 
}

interface OfferForm { 
  id_offer: string | null; 
  product_id: string; 
  discount_percent: number; 
  is_active: boolean; 
  valid_from: string; 
  valid_to: string; 
  notes: string 
}

const offers = ref<Offer[]>([])
const filters = reactive({ sku: '' })
const showModal = ref(false)
const editing = ref(false)
const form = reactive<OfferForm>({ 
  id_offer: null, 
  product_id: '', 
  discount_percent: 0, 
  is_active: true, 
  valid_from: '', 
  valid_to: '', 
  notes: '' 
})
const openPicker = ref(false)
const selectedProduct = ref<ProductLite | null>(null)
const { formatCOP } = useCurrency()

const discountedPrice = (price: number | undefined, percent: number): number => {
  if (!price) return 0
  return Math.round(Number(price) * (1 - Number(percent || 0) / 100))
}

const fetchOffers = async (): Promise<void> => {
  try {
    const raw: any = await $fetch('/api/offers')
    const env: any = raw?.data ?? raw
    offers.value = (env?.success && Array.isArray(env.data)) ? (env.data as Offer[]) : ([] as Offer[])
  } catch (error) {
    console.error('Error fetching offers:', error)
    offers.value = []
  }
}

const offersList = computed<Offer[]>(() => offers.value)

const filteredOffersList = computed<Offer[]>(() => {
  const list = offersList.value as Offer[]
  return list.filter((o: Offer) => {
    const skuOk = !filters.sku || (o.product?.sku || '').toLowerCase().includes(filters.sku.toLowerCase())
    return skuOk
  })
})

// Template-safe version with explicit any[] to avoid never[] inference
const filteredOffersForTemplate = computed<any[]>(() => filteredOffersList.value as any[])

const openCreate = (): void => {
  editing.value = false
  Object.assign(form, { 
    id_offer: null, 
    product_id: '', 
    discount_percent: 0, 
    is_active: true, 
    valid_from: '', 
    valid_to: '', 
    notes: '' 
  })
  selectedProduct.value = null
  showModal.value = true
}

const edit = (o: any): void => {
  editing.value = true
  Object.assign(form, { 
    id_offer: o.id_offer,
    product_id: o.product_id,
    discount_percent: o.discount_percent,
    is_active: o.is_active,
    valid_from: o.valid_from || '',
    valid_to: o.valid_to || '',
    notes: o.notes || ''
  })
  selectedProduct.value = o.product || null
  showModal.value = true
}

const close = (): void => { 
  showModal.value = false 
  selectedProduct.value = null
}

const save = async (): Promise<void> => {
  const payload = { ...form }
  try {
    if (editing.value && form.id_offer) {
      const raw: any = await $fetch(`/api/offers/${form.id_offer}`, { method: 'PUT', body: payload })
      const env: any = raw?.data ?? raw
      if (env?.success) { 
        await fetchOffers()
        close() 
      }
    } else {
      const raw: any = await $fetch('/api/offers', { method: 'POST', body: payload })
      const env: any = raw?.data ?? raw
      if (env?.success) { 
        await fetchOffers()
        close() 
      }
    }
  } catch (error) {
    console.error('Error saving offer:', error)
  }
}

const onPick = (p: ProductLite): void => {
  selectedProduct.value = p
  form.product_id = p.id_product
}

const remove = async (o: any): Promise<void> => {
  try {
    const raw: any = await $fetch(`/api/offers/${o.id_offer}`, { method: 'DELETE' })
    const env: any = raw?.data ?? raw
    if (env?.success) await fetchOffers()
  } catch (error) {
    console.error('Error removing offer:', error)
  }
}

const clearFilters = (): void => { 
  filters.sku = '' 
}

const formatDate = (v: string | Date): string => new Date(v).toLocaleString()

onMounted(fetchOffers)
// TypeScript types are properly defined above
</script>



