<template>
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl p-4">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-bold">Historial de movimientos</h3>
        <button @click="$emit('close')" class="text-gray-600 hover:text-gray-800">
          <Icon name="heroicons:x-mark" class="w-5 h-5" />
        </button>
      </div>
      <div class="max-h-[60vh] overflow-y-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
              <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
              <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Cantidad</th>
              <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
              <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Motivo</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="m in movements" :key="m.id_movement">
              <td class="px-4 py-2 text-sm text-gray-700">{{ formatDate(m.movement_date || m.created_at) }}</td>
              <td class="px-4 py-2 text-sm">{{ m.movement_type }}</td>
              <td class="px-4 py-2 text-sm">{{ m.quantity }}</td>
              <td class="px-4 py-2 text-sm">{{ m.stock_before }} → {{ m.stock_after }}</td>
              <td class="px-4 py-2 text-sm">{{ m.reason }}</td>
            </tr>
            <tr v-if="!loading && movements.length === 0">
              <td colspan="5" class="px-4 py-6 text-center text-sm text-gray-500">Sin movimientos</td>
            </tr>
          </tbody>
        </table>
        <div v-if="loading" class="py-6 text-center text-sm text-gray-500">Cargando...</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ product?: any }>()
const emit = defineEmits<{ (e: 'close'): void }>()

const loading = ref(false)
const movements = ref<any[]>([])

const formatDate = (d?: string) => {
  if (!d) return 'N/A'
  return new Date(d).toLocaleString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
}

onMounted(async () => {
  if (!props.product?.id_product) return
  loading.value = true
  try {
    const resp: any = await $fetch('/api/inventory/movements', { method: 'GET', query: { product_id: props.product.id_product } })
    if (resp?.data?.success) {
      movements.value = resp.data.data || []
    }
  } catch (e) {
    console.error('Error cargando movimientos:', e)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
</style>


