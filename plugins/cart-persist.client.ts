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

      // Realtime: limpiar carrito si el admin elimina un pedido del usuario
      let ordersChannel: any = null
      let itemsChannel: any = null
      const subscribeOrdersDeletes = async () => {
        try {
          const { data: sess } = await supabase.auth.getSession()
          const hasSession = Boolean(sess?.session?.user?.id)
          if (!hasSession) return
          const resp: any = await $fetch('/api/customers/my')
          const idCustomer = resp?.data?.success ? resp.data.data?.id_customer : null
          if (!idCustomer) return
          if (ordersChannel) try { supabase.removeChannel(ordersChannel) } catch {}
          ordersChannel = (supabase as any)
            .channel(`orders-deletes-${idCustomer}`)
            .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'orders', filter: `customer_id=eq.${idCustomer}` }, (_payload: any) => {
              try {
                // Vaciar carrito local en el dispositivo del usuario
                const key = getKey(currentUid)
                store.$patch({ items: [], taxAmount: 0, shippingAmount: 0 })
                localStorage.setItem(key, JSON.stringify({ items: [], taxAmount: 0, shippingAmount: 0 }))
              } catch (e) {
                console.error('Error clearing cart after order delete', e)
              }
            })
            .subscribe()
          // Suscribirse a borrados de items del pedido para eliminar solo esos productos
          if (itemsChannel) try { supabase.removeChannel(itemsChannel) } catch {}
          itemsChannel = (supabase as any)
            .channel(`order-items-deletes-${idCustomer}`)
            .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'order_items' }, (payload: any) => {
              try {
                const oldRow = payload?.old || {}
                const productId = oldRow.product_id as string | undefined
                if (!productId) return
                // Eliminar solo el producto afectado del carrito
                store.removeItem(productId)
                const key = getKey(currentUid)
                localStorage.setItem(key, JSON.stringify({
                  items: store.items,
                  taxAmount: store.taxAmount,
                  shippingAmount: store.shippingAmount
                }))
              } catch (e) {
                console.error('Error removing product from cart after item delete', e)
              }
            })
            .subscribe()
        } catch (e) {
          // Silencioso
        }
      }

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
          await subscribeOrdersDeletes()
        }
        if (event === 'SIGNED_OUT') {
          try { if (ordersChannel) supabase.removeChannel(ordersChannel) } catch {}
          try { if (itemsChannel) supabase.removeChannel(itemsChannel) } catch {}
          ordersChannel = null
          itemsChannel = null
          currentUid = null
          await loadForUser()
        }
      })

      // Suscribirse inicialmente sólo si ya hay sesión
      ;(async () => {
        try {
          const { data: sess } = await supabase.auth.getSession()
          if (sess?.session?.user?.id) await subscribeOrdersDeletes()
        } catch {}
      })()
    }
  })
})




