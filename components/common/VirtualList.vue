<template>
  <div 
    ref="containerRef"
    class="virtual-list-container"
    :style="{ height: containerHeight + 'px' }"
    @scroll="handleScroll"
  >
    <!-- Spacer para mantener la altura total -->
    <div :style="{ height: totalHeight + 'px' }">
      <!-- Lista virtual con elementos visibles -->
      <div 
        class="virtual-list-content"
        :style="{ 
          transform: `translateY(${offsetY}px)`,
          position: 'relative'
        }"
      >
        <div
          v-for="(item, index) in visibleItems"
          :key="getItemKey(item, startIndex.value + index)"
          :style="{ height: itemHeight + 'px' }"
          class="virtual-list-item"
        >
          <slot 
            :item="item" 
            :index="startIndex + index"
            :isVisible="true"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface VirtualListProps {
  items: any[]
  itemHeight: number
  containerHeight: number
  overscan?: number // Número de elementos extra a renderizar fuera del viewport
  keyField?: string // Campo a usar como key, por defecto 'id'
}

interface VirtualListState {
  scrollTop: number
  startIndex: number
  endIndex: number
  offsetY: number
}

const props = withDefaults(defineProps<VirtualListProps>(), {
  overscan: 5,
  keyField: 'id'
})

const emit = defineEmits<{
  scroll: [scrollTop: number]
  visibleRange: [start: number, end: number]
}>()

const containerRef = ref<HTMLElement>()
const state = reactive<VirtualListState>({
  scrollTop: 0,
  startIndex: 0,
  endIndex: 0,
  offsetY: 0
})

// Computed properties
const totalHeight = computed(() => props.items.length * props.itemHeight)

const visibleCount = computed(() => 
  Math.ceil(props.containerHeight / props.itemHeight) + props.overscan * 2
)

const startIndex = computed(() => {
  const index = Math.floor(state.scrollTop / props.itemHeight)
  return Math.max(0, index - props.overscan)
})

const endIndex = computed(() => {
  const index = startIndex.value + visibleCount.value
  return Math.min(props.items.length - 1, index)
})

const offsetY = computed(() => startIndex.value * props.itemHeight)

const visibleItems = computed(() => 
  props.items.slice(startIndex.value, endIndex.value + 1)
)

// Métodos
const getItemKey = (item: any, index: number | string): string | number => {
  if (props.keyField && item[props.keyField] !== undefined) {
    return item[props.keyField]
  }
  return typeof index === 'number' ? index : parseInt(index.toString())
}

const handleScroll = (event: Event) => {
  const target = event.target as HTMLElement
  state.scrollTop = target.scrollTop
  
  emit('scroll', state.scrollTop)
  emit('visibleRange', startIndex.value, endIndex.value)
}

// Optimización: usar requestAnimationFrame para scroll suave
let rafId: number | null = null
const optimizedHandleScroll = (event: Event) => {
  if (rafId) {
    cancelAnimationFrame(rafId)
  }
  
  rafId = requestAnimationFrame(() => {
    handleScroll(event)
    rafId = null
  })
}

// Función para hacer scroll a un índice específico
const scrollToIndex = (index: number, smooth = true) => {
  if (!containerRef.value) return
  
  const scrollTop = index * props.itemHeight
  containerRef.value.scrollTo({
    top: scrollTop,
    behavior: smooth ? 'smooth' : 'auto'
  })
}

// Función para hacer scroll a un elemento específico
const scrollToItem = (item: any, smooth = true) => {
  const index = props.items.findIndex(i => 
    props.keyField ? i[props.keyField] === item[props.keyField] : i === item
  )
  
  if (index !== -1) {
    scrollToIndex(index, smooth)
  }
}

// Función para obtener el índice del elemento visible en el centro
const getCenterIndex = (): number => {
  const centerY = state.scrollTop + props.containerHeight / 2
  return Math.floor(centerY / props.itemHeight)
}

// Función para obtener el elemento en el centro
const getCenterItem = (): any => {
  const index = getCenterIndex()
  return props.items[index] || null
}

// Función para actualizar el estado cuando cambian los items
const updateState = () => {
  state.startIndex = startIndex.value
  state.endIndex = endIndex.value
  state.offsetY = offsetY.value
}

// Watchers
watch(() => props.items.length, () => {
  updateState()
})

watch([startIndex, endIndex, offsetY], () => {
  updateState()
})

// Exponer métodos públicamente
defineExpose({
  scrollToIndex,
  scrollToItem,
  getCenterIndex,
  getCenterItem,
  containerRef
})

// Cleanup
onUnmounted(() => {
  if (rafId) {
    cancelAnimationFrame(rafId)
  }
})
</script>

<style scoped>
.virtual-list-container {
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;
}

.virtual-list-content {
  will-change: transform;
}

.virtual-list-item {
  position: relative;
  width: 100%;
}

/* Optimizaciones de rendimiento */
.virtual-list-container {
  contain: layout style paint;
}

.virtual-list-content {
  contain: layout style;
}

.virtual-list-item {
  contain: layout style paint;
}

/* Scrollbar personalizada */
.virtual-list-container::-webkit-scrollbar {
  width: 8px;
}

.virtual-list-container::-webkit-scrollbar-track {
  background: var(--theme-bg-secondary, #f1f5f9);
  border-radius: 4px;
}

.virtual-list-container::-webkit-scrollbar-thumb {
  background: var(--theme-border, #cbd5e1);
  border-radius: 4px;
}

.virtual-list-container::-webkit-scrollbar-thumb:hover {
  background: var(--theme-text-muted, #64748b);
}
</style>
