export interface AddIntentPayload {
  productId?: string
  quantity?: number
  product?: {
    id_product: string
    name: string
    price: number
    image_url?: string
    sku?: string
  }
}

const KEY = 'add-intent'

export const useAddIntent = () => {
  const setAddIntent = (payload: AddIntentPayload) => {
    if (process.client) {
      localStorage.setItem(KEY, JSON.stringify(payload || {}))
    }
  }

  const consumeAddIntent = (): AddIntentPayload | null => {
    if (!process.client) return null
    try {
      const raw = localStorage.getItem(KEY)
      if (!raw) return null
      localStorage.removeItem(KEY)
      return JSON.parse(raw || '{}')
    } catch (_e) {
      return null
    }
  }

  return { setAddIntent, consumeAddIntent }
}
