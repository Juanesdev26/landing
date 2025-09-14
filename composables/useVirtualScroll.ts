/**
 * Composable para virtual scrolling
 * Optimiza el renderizado de listas largas usando virtualización
 */

interface VirtualScrollOptions {
  itemHeight: number
  containerHeight: number
  overscan?: number
  keyField?: string
  bufferSize?: number // Tamaño del buffer para precarga
}

interface VirtualScrollItem {
  id: string | number
  data: any
  height: number
  index: number
}

export const useVirtualScroll = (options: VirtualScrollOptions) => {
  const {
    itemHeight,
    containerHeight,
    overscan = 5,
    keyField = 'id',
    bufferSize = 50
  } = options

  // Estado reactivo
  const items = ref<any[]>([])
  const scrollTop = ref(0)
  const isLoading = ref(false)
  const hasMore = ref(true)
  
  // Referencias
  const containerRef = ref<HTMLElement>()
  const virtualListRef = ref<any>()

  // Computed properties
  const totalHeight = computed(() => items.value.length * itemHeight)
  
  const visibleCount = computed(() => 
    Math.ceil(containerHeight / itemHeight) + overscan * 2
  )
  
  const startIndex = computed(() => {
    const index = Math.floor(scrollTop.value / itemHeight)
    return Math.max(0, index - overscan)
  })
  
  const endIndex = computed(() => {
    const index = startIndex.value + visibleCount.value
    return Math.min(items.value.length - 1, index)
  })

  // Funciones de utilidad
  const getItemKey = (item: any, index: number): string | number => {
    if (keyField && item[keyField] !== undefined) {
      return item[keyField]
    }
    return index
  }

  const getItemIndex = (item: any): number => {
    return items.value.findIndex(i => 
      keyField ? i[keyField] === item[keyField] : i === item
    )
  }

  // Funciones de scroll
  const scrollToIndex = (index: number, smooth = true) => {
    virtualListRef.value?.scrollToIndex(index, smooth)
  }

  const scrollToItem = (item: any, smooth = true) => {
    virtualListRef.value?.scrollToItem(item, smooth)
  }

  const scrollToTop = (smooth = true) => {
    scrollToIndex(0, smooth)
  }

  const scrollToBottom = (smooth = true) => {
    scrollToIndex(items.value.length - 1, smooth)
  }

  // Funciones de carga de datos
  const loadMoreItems = async (loadFunction: () => Promise<any[]>) => {
    if (isLoading.value || !hasMore.value) return

    isLoading.value = true
    try {
      const newItems = await loadFunction()
      
      if (newItems.length === 0) {
        hasMore.value = false
      } else {
        items.value.push(...newItems)
      }
    } catch (error) {
      console.error('Error loading more items:', error)
    } finally {
      isLoading.value = false
    }
  }

  const refreshItems = async (loadFunction: () => Promise<any[]>) => {
    isLoading.value = true
    try {
      const newItems = await loadFunction()
      items.value = newItems
      hasMore.value = true
    } catch (error) {
      console.error('Error refreshing items:', error)
    } finally {
      isLoading.value = false
    }
  }

  // Función para detectar cuando se necesita cargar más datos
  const handleScroll = (scrollTopValue: number) => {
    scrollTop.value = scrollTopValue
    
    // Detectar si estamos cerca del final
    const distanceFromBottom = totalHeight.value - (scrollTopValue + containerHeight)
    
    if (distanceFromBottom < bufferSize * itemHeight && hasMore.value && !isLoading.value) {
      // Evento para cargar más datos - se maneja externamente
      console.log('Load more triggered')
    }
  }

  // Función para precargar datos cuando se acerca al final
  const setupInfiniteScroll = (loadFunction: () => Promise<any[]>) => {
    const handleLoadMore = () => loadMoreItems(loadFunction)
    
    // Usar el evento emitido por el virtual list
    onMounted(() => {
      // El componente padre debe escuchar el evento 'loadMore'
    })
    
    return handleLoadMore
  }

  // Función para optimizar el renderizado
  const optimizeRender = () => {
    // Usar requestIdleCallback para operaciones no críticas
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        // Operaciones de optimización
        if (containerRef.value) {
          // Forzar reflow si es necesario
          containerRef.value.offsetHeight
        }
      })
    }
  }

  // Función para obtener elementos visibles
  const getVisibleItems = () => {
    return items.value.slice(startIndex.value, endIndex.value + 1)
  }

  // Función para obtener el elemento en el centro del viewport
  const getCenterItem = () => {
    return virtualListRef.value?.getCenterItem() || null
  }

  // Función para obtener el índice del elemento en el centro
  const getCenterIndex = () => {
    return virtualListRef.value?.getCenterIndex() || 0
  }

  // Función para filtrar items
  const filterItems = (filterFunction: (item: any) => boolean) => {
    items.value = items.value.filter(filterFunction)
    hasMore.value = true // Reset hasMore when filtering
  }

  // Función para buscar un item
  const findItem = (searchFunction: (item: any) => boolean) => {
    return items.value.find(searchFunction)
  }

  // Función para obtener estadísticas
  const getStats = () => {
    return {
      totalItems: items.value.length,
      visibleItems: endIndex.value - startIndex.value + 1,
      scrollTop: scrollTop.value,
      isLoading: isLoading.value,
      hasMore: hasMore.value,
      startIndex: startIndex.value,
      endIndex: endIndex.value
    }
  }

  // Limpiar al desmontar
  onUnmounted(() => {
    items.value = []
    scrollTop.value = 0
    isLoading.value = false
    hasMore.value = true
  })

  return {
    // Estado
    items: readonly(items),
    scrollTop: readonly(scrollTop),
    isLoading: readonly(isLoading),
    hasMore: readonly(hasMore),
    
    // Referencias
    containerRef,
    virtualListRef,
    
    // Computed
    totalHeight,
    visibleCount,
    startIndex,
    endIndex,
    
    // Funciones de scroll
    scrollToIndex,
    scrollToItem,
    scrollToTop,
    scrollToBottom,
    handleScroll,
    
    // Funciones de datos
    loadMoreItems,
    refreshItems,
    setupInfiniteScroll,
    
    // Utilidades
    getItemKey,
    getItemIndex,
    getVisibleItems,
    getCenterItem,
    getCenterIndex,
    filterItems,
    findItem,
    getStats,
    optimizeRender
  }
}
