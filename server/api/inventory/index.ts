/**
 * API endpoint para inventario
 * GET: Obtener inventario con información de productos
 */

import { serverSupabaseClient } from '#supabase/server'
import { requireAuth, respondSuccess, respondError } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const method = getMethod(event)
  const supabase = await serverSupabaseClient(event)

  if (method !== 'GET') {
    return respondError('Método no permitido')
  }

  try {
    await requireAuth(event)
    setHeader(event, 'Cache-Control', 'public, max-age=30')

    // Obtener productos con categoría y última fecha de movimiento
    const { data: products, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(name)
      `)
      .eq('is_active', true)
      .order('name')

    if (error) {
      console.error('Error obteniendo inventario:', error)
      return respondError('Error obteniendo inventario')
    }

    // Obtener últimas fechas de movimiento por producto
    const productIds = (products || []).map((p: any) => p.id_product)
    let lastMovementsByProduct: Record<string, string | null> = {}

    if (productIds.length > 0) {
      const { data: lastMovements, error: lmError } = await supabase
        .from('inventory_movements')
        .select('product_id, movement_date:created_at')
        .in('product_id', productIds)
        .order('created_at', { ascending: false })

      if (!lmError && lastMovements) {
        for (const m of lastMovements as any[]) {
          if (!lastMovementsByProduct[m.product_id]) {
            lastMovementsByProduct[m.product_id] = m.movement_date
          }
        }
      }
    }

    const processedProducts = (products || []).map((product: any) => ({
      ...product,
      category: product.category,
      last_movement_date: lastMovementsByProduct[product.id_product] || null,
      movements: undefined
    }))

    return respondSuccess(processedProducts)
  } catch (error) {
    console.error('Error inesperado:', error)
    return respondError('Error interno del servidor')
  }
})
