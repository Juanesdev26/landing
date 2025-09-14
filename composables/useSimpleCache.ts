/**
 * Composable simplificado para cache de API calls
 * Versión optimizada sin conflictos de tipos
 */

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

interface SimpleFetchOptions {
  cache?: boolean
  ttl?: number
  retries?: number
  timeout?: number
  method?: string
  body?: any
}

export const useSimpleCache = () => {
  const cache = new Map<string, CacheEntry<any>>()
  const pendingRequests = new Map<string, Promise<any>>()

  // Función para generar key de cache
  const generateCacheKey = (url: string, options?: SimpleFetchOptions): string => {
    const method = options?.method || 'GET'
    const body = options?.body ? JSON.stringify(options.body) : ''
    return `${method}:${url}:${body}`
  }

  // Función para obtener datos del cache
  const getFromCache = <T>(key: string): T | null => {
    const entry = cache.get(key)
    if (!entry) return null

    const now = Date.now()
    if (now - entry.timestamp > entry.ttl) {
      cache.delete(key)
      return null
    }

    return entry.data as T
  }

  // Función para guardar en cache
  const setCache = <T>(key: string, data: T, ttl: number = 300000): void => {
    cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }

  // Función para hacer fetch con timeout
  const fetchWithTimeout = async (url: string, timeout: number = 10000): Promise<Response> => {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      const response = await fetch(url, {
        signal: controller.signal
      })
      clearTimeout(timeoutId)
      return response
    } catch (error) {
      clearTimeout(timeoutId)
      throw error
    }
  }

  // Función principal de fetch con cache
  const cachedFetch = async <T>(
    url: string, 
    options: SimpleFetchOptions = {}
  ): Promise<T> => {
    const cacheKey = generateCacheKey(url, options)
    
    // Verificar cache primero (si no está deshabilitado explícitamente)
    if (options.cache !== false) {
      const cachedData = getFromCache<T>(cacheKey)
      if (cachedData) {
        return cachedData
      }
    }

    // Verificar si hay una request pendiente
    if (pendingRequests.has(cacheKey)) {
      return pendingRequests.get(cacheKey)!
    }

    // Crear nueva request
    const requestPromise = (async () => {
      try {
        const response = await fetchWithTimeout(url, options.timeout)
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const data = await response.json()
        
        // Guardar en cache si está habilitado
        if (options.cache !== false) {
          setCache(cacheKey, data, options.ttl)
        }

        return data
      } finally {
        // Limpiar request pendiente
        pendingRequests.delete(cacheKey)
      }
    })()

    // Guardar request pendiente
    pendingRequests.set(cacheKey, requestPromise)

    return requestPromise
  }

  // Función para fetch múltiple en paralelo
  const parallelFetch = async <T>(
    requests: Array<{ url: string; options?: SimpleFetchOptions }>
  ): Promise<T[]> => {
    const promises = requests.map(({ url, options }) => 
      cachedFetch<T>(url, options)
    )

    return Promise.allSettled(promises).then(results =>
      results.map(result => {
        if (result.status === 'fulfilled') {
          return result.value
        } else {
          console.error('Parallel fetch error:', result.reason)
          throw result.reason
        }
      })
    )
  }

  // Función para invalidar cache
  const invalidateCache = (pattern?: string): void => {
    if (!pattern) {
      cache.clear()
      return
    }

    for (const key of cache.keys()) {
      if (key.includes(pattern)) {
        cache.delete(key)
      }
    }
  }

  // Limpiar al desmontar
  onUnmounted(() => {
    cache.clear()
    pendingRequests.clear()
  })

  return {
    fetch: cachedFetch,
    parallelFetch,
    invalidateCache,
    getFromCache,
    setCache
  }
}
