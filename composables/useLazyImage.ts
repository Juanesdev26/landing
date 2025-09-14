/**
 * Composable para lazy loading inteligente de imágenes
 */

interface LazyImageOptions {
  src: string
  alt?: string
  placeholder?: string
  priority?: boolean
  quality?: number
  sizes?: string
  class?: string
  style?: string
}

export const useLazyImage = () => {
  const { $lazyImage } = useNuxtApp()

  // Función para crear una imagen lazy
  const createLazyImage = (options: LazyImageOptions) => {
    const {
      src,
      alt = '',
      placeholder,
      priority = false,
      quality = 80,
      sizes,
      class: className = '',
      style: inlineStyle = ''
    } = options

    // Crear elemento imagen
    const img = document.createElement('img') as any
    img._lazyOptions = {
      src,
      alt,
      placeholder,
      priority,
      quality,
      sizes
    }

    // Aplicar atributos
    img.className = className
    img.style.cssText = inlineStyle
    img.setAttribute('data-lazy', 'true')
    
    if (priority) {
      img.setAttribute('data-priority', 'true')
    }

    // Configurar lazy loading
    $lazyImage?.setup?.(img)

    return img
  }

  // Función para precargar imagen
  const preloadImage = async (src: string, quality = 80): Promise<boolean> => {
    return $lazyImage?.preload?.(src, quality) ?? Promise.resolve(false)
  }

  // Función para optimizar URL de imagen
  const optimizeImageSrc = (src: string, quality = 80): string => {
    return $lazyImage?.optimize?.(src, quality) ?? src
  }

  // Función para crear placeholder
  const createPlaceholder = (width = 400, height = 300): string => {
    return $lazyImage?.createPlaceholder?.(width, height) ?? ''
  }

  // Función para precargar imágenes críticas
  const preloadCriticalImages = async (imageUrls: string[]) => {
    const promises = imageUrls.map(url => preloadImage(url, 90))
    return Promise.allSettled(promises)
  }

  // Función para precargar imágenes en hover
  const setupHoverPreload = (element: HTMLElement, imageUrl: string) => {
    element.setAttribute('data-hover-preload', imageUrl)
  }

  return {
    createLazyImage,
    preloadImage,
    optimizeImageSrc,
    createPlaceholder,
    preloadCriticalImages,
    setupHoverPreload
  }
}
