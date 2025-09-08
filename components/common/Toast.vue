<template>
  <transition name="fade">
    <div v-if="visible" class="fixed top-4 right-4 z-50">
      <div :class="classes" class="rounded-lg shadow-lg px-4 py-3 flex items-start gap-3 min-w-[280px]">
        <Icon :name="getIconName()" class="w-5 h-5 mt-0.5" />
        <div>
          <div class="font-medium">{{ title }}</div>
          <div v-if="message" class="text-sm opacity-90">{{ message }}</div>
        </div>
        <button @click="hide" class="ml-2 opacity-70 hover:opacity-100"><Icon name="heroicons:x-mark" class="w-5 h-5" /></button>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
const props = defineProps<{ type?: 'success' | 'error' | 'info' | 'warning'; title: string; message?: string; duration?: number }>()
const visible = ref(true)
const type = computed(() => props.type || 'info')
const classes = computed(() => ({
  'bg-green-50 text-green-800 border border-green-200': type.value === 'success',
  'bg-red-50 text-red-800 border border-red-200': type.value === 'error',
  'bg-yellow-50 text-yellow-800 border border-yellow-200': type.value === 'warning',
  'bg-pink-50 text-pink-800 border border-pink-200': type.value === 'info'
}))
const getIconName = (): string => ({
  success: 'heroicons:check-circle',
  error: 'heroicons:exclamation-triangle',
  warning: 'heroicons:exclamation-circle',
  info: 'heroicons:sparkles'
})[type.value]

const hide = () => { visible.value = false }
onMounted(() => { setTimeout(hide, props.duration || 3000) })
</script>

<style>
.fade-enter-active, .fade-leave-active { transition: opacity .2s }
.fade-enter-from, .fade-leave-to { opacity: 0 }
</style>


