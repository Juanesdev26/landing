/**
 * API endpoint para movimientos de inventario
 * GET: Obtener movimientos de un producto específico
 * POST: Registrar nuevo movimiento
 */

import { serverSupabaseClient } from '#supabase/server'
import { requireAdmin, requireAuth, respondSuccess, respondError } from '~/server/utils/auth'

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

  if (method === 'POST') {
    try {
      await requireAdmin(event)
      const body = await readBody(event)
      
      // Validar campos requeridos
      if (!body.product_id || !body.movement_type || !body.quantity || !body.reason) {
        return respondError('Todos los campos son obligatorios')
      }

      // Obtener stock actual del producto
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('stock_quantity')
        .eq('id_product', body.product_id)
        .single()

      if (productError || !product) {
        return respondError('Producto no encontrado')
      }

      const currentStock = (product as any).stock_quantity
      let newStock = currentStock

      // Calcular nuevo stock según el tipo de movimiento
      switch (body.movement_type) {
        case 'in':
        case 'return':
          newStock = currentStock + body.quantity
          break
        case 'out':
        case 'damaged':
          newStock = Math.max(0, currentStock - body.quantity)
          break
        case 'adjustment':
          newStock = body.quantity
          break
        default:
          return respondError('Tipo de movimiento no válido')
      }

      // Crear el movimiento
      const movementData = {
        product_id: body.product_id,
        movement_type: body.movement_type,
        quantity: body.quantity,
        stock_before: currentStock,
        stock_after: newStock,
        reason: body.reason,
        description: body.description || null,
        reference: body.reference || null
      }

      const { data: movement, error: movementError } = await supabase
        .from('inventory_movements')
        .insert(movementData as any)
        .select()
        .single()

      if (movementError) {
        console.error('Error creando movimiento:', movementError)
        return respondError('Error creando movimiento')
      }

      // Actualizar stock del producto
      const { error: updateError } = await supabase
        .from('products')
        .update({ 
          stock_quantity: newStock,
          updated_at: new Date().toISOString()
        } as any)
        .eq('id_product', body.product_id)

      if (updateError) {
        console.error('Error actualizando stock:', updateError)
        // Revertir el movimiento si no se puede actualizar el stock
        await supabase
          .from('inventory_movements')
          .delete()
          .eq('id_movement', (movement as any).id_movement)
        
        return respondError('Error actualizando stock del producto')
      }

      // Incluir alias movement_date en la respuesta para consistencia con el frontend
      const movementWithAlias = movement ? { ...movement, movement_date: (movement as any).created_at } : movement
      return respondSuccess(movementWithAlias)
    } catch (error) {
      console.error('Error inesperado:', error)
      return respondError('Error interno del servidor')
    }
  }

  // Método no permitido
  return respondError('Método no permitido')
})
