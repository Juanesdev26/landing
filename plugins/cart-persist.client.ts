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
      let isDestroyed = false
      let cleanupFunctions: (() => void)[] = []
      const loadForUser = async () => {
        if (isDestroyed) return
        try {
          const { data: { session } } = await supabase.auth.getSession()
          currentUid = session?.user?.id || null
          const key = getKey(currentUid)
          const cached = localStorage.getItem(key)
          if (cached) {
            const parsed = JSON.parse(cached)
            if (!isDestroyed) {
              store.$patch({
                items: Array.isArray(parsed.items) ? parsed.items : [],
                taxAmount: typeof parsed.taxAmount === 'number' ? parsed.taxAmount : 0,
                shippingAmount: typeof parsed.shippingAmount === 'number' ? parsed.shippingAmount : 0
              })
            }
          } else {
            if (!isDestroyed) {
              store.$patch({ items: [], taxAmount: 0, shippingAmount: 0 })
            }
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

      // Debounced save to prevent excessive localStorage writes (optimizado)
      let saveTimeout: NodeJS.Timeout | null = null
      const debouncedSave = (state: any) => {
        if (saveTimeout) clearTimeout(saveTimeout)
        saveTimeout = setTimeout(async () => {
          if (isDestroyed) return
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
        }, 500) // Aumentar debounce a 500ms para reducir escrituras
      }

      const unsubscribe = store.$subscribe(async (_mutation: any, state: any) => {
        if (isDestroyed) return
        debouncedSave(state)
      }, { detached: true })
      
      cleanupFunctions.push(() => {
        if (saveTimeout) clearTimeout(saveTimeout)
        unsubscribe()
      })

      // Realtime: limpiar carrito si el admin elimina un pedido del usuario
      let ordersChannel: any = null
      let itemsChannel: any = null
      const subscribeOrdersDeletes = async () => {
        if (isDestroyed) return
        try {
          const { data: sess } = await supabase.auth.getSession()
          const hasSession = Boolean(sess?.session?.user?.id)
          if (!hasSession) return
          const resp: any = await $fetch('/api/customers/my')
          const idCustomer = resp?.data?.success ? resp.data.data?.id_customer : null
          if (!idCustomer) return
          
          // Cleanup existing channels
          if (ordersChannel) try { supabase.removeChannel(ordersChannel) } catch {}
          if (itemsChannel) try { supabase.removeChannel(itemsChannel) } catch {}
          
          ordersChannel = (supabase as any)
            .channel(`orders-deletes-${idCustomer}`)
            .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'orders', filter: `customer_id=eq.${idCustomer}` }, (_payload: any) => {
              if (isDestroyed) return
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
            
          itemsChannel = (supabase as any)
            .channel(`order-items-deletes-${idCustomer}`)
            .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'order_items' }, (payload: any) => {
              if (isDestroyed) return
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
            
          // Add cleanup functions
          cleanupFunctions.push(() => {
            if (ordersChannel) try { supabase.removeChannel(ordersChannel) } catch {}
            if (itemsChannel) try { supabase.removeChannel(itemsChannel) } catch {}
          })
        } catch (e) {
          // Silencioso
        }
      }

      // When auth state changes, reload the proper cart for that user and clear the old state
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: string, session: any) => {
        if (isDestroyed) return
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
          if (!isDestroyed) {
            await loadForUser()
            await subscribeOrdersDeletes()
          }
        }
        if (event === 'SIGNED_OUT' && !isDestroyed) {
          try { if (ordersChannel) supabase.removeChannel(ordersChannel) } catch {}
          try { if (itemsChannel) supabase.removeChannel(itemsChannel) } catch {}
          ordersChannel = null
          itemsChannel = null
          currentUid = null
          await loadForUser()
        }
      })
      
      cleanupFunctions.push(() => {
        subscription.unsubscribe()
      })

      // Suscribirse inicialmente sólo si ya hay sesión
      ;(async () => {
        try {
          if (isDestroyed) return
          const { data: sess } = await supabase.auth.getSession()
          if (sess?.session?.user?.id) await subscribeOrdersDeletes()
        } catch {}
      })()

      // Cleanup function for when the plugin is destroyed
      const cleanup = () => {
        isDestroyed = true
        cleanupFunctions.forEach(fn => {
          try { fn() } catch (e) { console.error('Cleanup error:', e) }
        })
        cleanupFunctions = []
      }

      // Register cleanup on app unmount - using a more compatible approach
      if (process.client) {
        // Use window events for cleanup
        const cleanupOnUnload = () => {
          cleanup()
        }
        
        window.addEventListener('beforeunload', cleanupOnUnload)
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'hidden') {
            cleanup()
          }
        })
        
        cleanupFunctions.push(() => {
          window.removeEventListener('beforeunload', cleanupOnUnload)
        })
      }
    }
  })
})




