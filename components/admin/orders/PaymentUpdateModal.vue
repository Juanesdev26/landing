<template>
  <div class="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
    <div class="bg-white rounded-lg w-full max-w-md p-6 space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold">Actualizar pago</h3>
        <button @click="$emit('close')" class="p-2 rounded hover:bg-gray-100">
          <Icon name="heroicons:x-mark" class="w-5 h-5" />
        </button>
      </div>
      <div class="space-y-3">
        <div>
          <label class="block text-sm text-gray-600 mb-1">Estado de pago</label>
          <select v-model="form.payment_status" class="w-full px-3 py-2 border rounded">
            <option value="paid">Pagado</option>
            <option value="pending">Pendiente</option>
            <option value="failed">Fallido</option>
            <option value="refunded">Reembolsado</option>
          </select>
        </div>
        <div>
          <label class="block text-sm text-gray-600 mb-1">Método de pago</label>
          <input v-model="form.payment_method" type="text" class="w-full px-3 py-2 border rounded" placeholder="Nequi, Bancolombia..." />
        </div>
        <div>
          <label class="block text-sm text-gray-600 mb-1">Referencia</label>
          <input v-model="form.payment_reference" type="text" class="w-full px-3 py-2 border rounded" placeholder="# de transacción" />
        </div>
        <div>
          <label class="block text-sm text-gray-600 mb-1">Notas</label>
          <textarea v-model="form.notes" class="w-full px-3 py-2 border rounded" rows="3" placeholder="Notas opcionales"></textarea>
        </div>
      </div>
      <div class="flex justify-end gap-2 pt-2">
        <button @click="$emit('close')" class="px-4 py-2 border rounded">Cancelar</button>
        <button @click="save" class="px-4 py-2 bg-green-600 text-white rounded">Guardar</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ orderId: string }>()
const emit = defineEmits<{ (e: 'close'): void; (e: 'saved'): void }>()

const form = reactive({ payment_status: 'paid', payment_method: '', payment_reference: '', notes: '' })

const save = async () => {
  try {
    const res = await $fetch<any>(`/api/orders/${props.orderId}/update-payment`, { method: 'PATCH', body: form })
    if (res?.data?.success) {
      emit('saved')
      emit('close')
    } else {
      alert(String(res?.data?.error || 'Error actualizando pago'))
    }
  } catch (e) {
    console.error('Update payment error', e)
    alert('Error actualizando pago')
  }
}
</script>

<style scoped>
</style>



