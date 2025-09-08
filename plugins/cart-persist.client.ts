export default defineNuxtPlugin((nuxtApp) => {
  // Persist only the cart store in localStorage
  const pinia: any = (nuxtApp as any).$pinia
  if (!pinia) return

  pinia.use(({ store }: any) => {
    if (store.$id !== 'cart') return

    if (process.client) {
      try {
        const cached = localStorage.getItem('cart')
        if (cached) {
          const parsed = JSON.parse(cached)
          // Patch only known fields to avoid version issues
          store.$patch({
            items: Array.isArray(parsed.items) ? parsed.items : [],
            taxAmount: typeof parsed.taxAmount === 'number' ? parsed.taxAmount : 0,
            shippingAmount: typeof parsed.shippingAmount === 'number' ? parsed.shippingAmount : 0
          })
        }
      } catch (e) {
        console.error('Error loading cart from localStorage', e)
      }

      store.$subscribe((_mutation: any, state: any) => {
        try {
          localStorage.setItem('cart', JSON.stringify({
            items: state.items,
            taxAmount: state.taxAmount,
            shippingAmount: state.shippingAmount
          }))
        } catch (e) {
          console.error('Error saving cart to localStorage', e)
        }
      }, { detached: true })
    }
  })
})



