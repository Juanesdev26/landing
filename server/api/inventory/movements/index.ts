/**
 * API endpoint para movimientos de inventario
 * GET: Obtener movimientos de un producto específico
 */

import { serverSupabaseClient } from '#supabase/server'
import { requireAuth, respondSuccess, respondError } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const method = getMethod(event)
  const supabase = await serverSupabaseClient<any>(event)

  if (method === 'GET') {
    try {
      // Al menos requerir sesión para ver movimientos
      await requireAuth(event)
      const query = getQuery(event)
      const productId = query.product_id

      if (!productId) {
        return respondError('ID de producto requerido')
      }

      // Obtener movimientos del producto ordenados por fecha (usar created_at y exponer alias movement_date)
      const { data: movements, error } = await supabase
        .from('inventory_movements')
        .select('*, movement_date:created_at')
        .eq('product_id', productId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error obteniendo movimientos:', error)
        return respondError('Error obteniendo movimientos')
      }

      return respondSuccess(movements)
    } catch (error) {
      console.error('Error inesperado:', error)
      return respondError('Error interno del servidor')
    }
  }

  // Creación de movimientos deshabilitada: solicitudes POST no están permitidas

  // Método no permitido
  return respondError('Método no permitido')
})
