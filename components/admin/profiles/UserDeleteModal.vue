<template>
  <div class="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
    <div class="bg-white rounded-lg w-full max-w-md p-6 space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold">Eliminar usuario</h3>
        <button @click="$emit('close')" class="p-2 rounded hover:bg-gray-100">
          <Icon name="heroicons:x-mark" class="w-5 h-5" />
        </button>
      </div>

      <div class="space-y-3 text-sm text-gray-600">
        <p>
          Vas a eliminar al usuario <span class="font-semibold">{{ user?.first_name }} {{ user?.last_name }}</span>
          <span v-if="user?.email" class="text-gray-500">({{ user.email }})</span>.
        </p>
        <p>Esta acción es permanente y no se puede deshacer.</p>
        <div class="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded p-3">
          Si el usuario tiene pedidos asociados, no se permitirá la eliminación.
        </div>
      </div>

      <div class="space-y-2">
        <label class="block text-sm text-gray-700">Escribe ELIMINAR para confirmar</label>
        <input v-model="confirmText" type="text" class="w-full px-3 py-2 border rounded" placeholder="ELIMINAR" />
      </div>

      <div class="flex justify-end gap-2 pt-2">
        <button @click="$emit('close')" class="px-4 py-2 border rounded">Cancelar</button>
        <button :disabled="confirmText !== 'ELIMINAR' || loading" @click="confirm" class="px-4 py-2 bg-red-600 text-white rounded disabled:opacity-50">Eliminar</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const props = defineProps<{ user: any }>()
const emit = defineEmits<{ (e: 'close'): void; (e: 'confirm'): void }>()
const loading = ref(false)
const confirmText = ref('')

const confirm = async () => {
  loading.value = true
  try {
    emit('confirm')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
</style>


