export default defineNuxtPlugin((nuxtApp) => {
  // Persist only the cart store in localStorage
  const pinia: any = (nuxtApp as any).$pinia
  if (!pinia) return

  pinia.use(({ store }: any) => {
    if (store.$id !== 'cart') return

    if (process.client) {
      const supabase = useSupabaseClient<any>()
      const getKey = (uid?: string | null) => `cart:${uid || 'guest'}`
      let currentUid: string | null = null
      const loadForUser = async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession()
          currentUid = session?.user?.id || null
          const key = getKey(currentUid)
          const cached = localStorage.getItem(key)
          if (cached) {
            const parsed = JSON.parse(cached)
            store.$patch({
              items: Array.isArray(parsed.items) ? parsed.items : [],
              taxAmount: typeof parsed.taxAmount === 'number' ? parsed.taxAmount : 0,
              shippingAmount: typeof parsed.shippingAmount === 'number' ? parsed.shippingAmount : 0
            })
          } else {
            store.$patch({ items: [], taxAmount: 0, shippingAmount: 0 })
          }
        } catch (e) {
          console.error('Error loading cart from localStorage', e)
        }
      }
      const mergeCarts = (base: any, incoming: any) => {
        const map = new Map<string, any>()
        ;(Array.isArray(base.items) ? base.items : []).forEach((it: any) => map.set(it.product_id, { ...it }))
        ;(Array.isArray(incoming.items) ? incoming.items : []).forEach((it: any) => {
          const prev = map.get(it.product_id)
          if (prev) prev.quantity = Math.max(1, Number(prev.quantity || 1) + Number(it.quantity || 1))
          else map.set(it.product_id, { ...it })
        })
        return {
          items: Array.from(map.values()),
          taxAmount: Number(base.taxAmount || 0),
          shippingAmount: Number(base.shippingAmount || 0)
        }
      }

      try {
        loadForUser()
      } catch (e) {
        console.error('Error loading cart from localStorage', e)
      }

      store.$subscribe(async (_mutation: any, state: any) => {
        try {
          if (currentUid === null) {
            const { data: { session } } = await supabase.auth.getSession()
            currentUid = session?.user?.id || null
          }
          const key = getKey(currentUid)
          localStorage.setItem(key, JSON.stringify({
            items: state.items,
            taxAmount: state.taxAmount,
            shippingAmount: state.shippingAmount
          }))
        } catch (e) {
          console.error('Error saving cart to localStorage', e)
        }
      }, { detached: true })

      // When auth state changes, reload the proper cart for that user and clear the old state
      supabase.auth.onAuthStateChange(async (event: string, session: any) => {
        try {
          if (event === 'SIGNED_IN' && session?.user?.id) {
            const uid = session.user.id
            currentUid = uid
            const guestKey = getKey(null)
            const userKey = getKey(uid)
            const guest = localStorage.getItem(guestKey)
            const currentUserCart = localStorage.getItem(userKey)
            if (guest) {
              const guestCart = JSON.parse(guest)
              const userCart = currentUserCart ? JSON.parse(currentUserCart) : { items: [], taxAmount: 0, shippingAmount: 0 }
              const merged = mergeCarts(userCart, guestCart)
              localStorage.setItem(userKey, JSON.stringify(merged))
              localStorage.removeItem(guestKey)
            }
          }
        } catch (e) {
          console.error('Error merging carts on sign-in', e)
        } finally {
          await loadForUser()
        }
      })
    }
  })
})




