import { defineStore } from 'pinia'

export interface CartItem {
  product_id: string
  name: string
  sku: string
  price: number
  image_url?: string | null
  quantity: number
}

interface CartState {
  items: CartItem[]
  taxAmount: number
  shippingAmount: number
}

export const useCartStore = defineStore('cart', {
  state: (): CartState => ({
    items: [],
    taxAmount: 0,
    shippingAmount: 0,
  }),
  getters: {
    subtotal: (state) => state.items.reduce((sum, it) => sum + it.price * it.quantity, 0),
    total: (state): number => state.items.reduce((sum, it) => sum + it.price * it.quantity, 0) + state.taxAmount + state.shippingAmount,
    count: (state): number => state.items.reduce((sum, it) => sum + it.quantity, 0)
  },
  actions: {
    addItem(item: Omit<CartItem, 'quantity'>, quantity: number = 1) {
      const existing = this.items.find(i => i.product_id === item.product_id)
      if (existing) existing.quantity += quantity
      else this.items.push({ ...item, quantity })
    },
    removeOne(product_id: string) {
      const it = this.items.find(i => i.product_id === product_id)
      if (!it) return
      it.quantity -= 1
      if (it.quantity <= 0) this.removeItem(product_id)
    },
    removeItem(product_id: string) {
      this.items = this.items.filter(i => i.product_id !== product_id)
    },
    updateQuantity(product_id: string, quantity: number) {
      const it = this.items.find(i => i.product_id === product_id)
      if (!it) return
      it.quantity = Math.max(1, quantity)
    },
    clear() { this.items = [] },
    setTax(amount: number) { this.taxAmount = Math.max(0, Number(amount) || 0) },
    setShipping(amount: number) { this.shippingAmount = Math.max(0, Number(amount) || 0) }
  }
})


