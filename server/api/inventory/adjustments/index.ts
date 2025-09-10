/**
 * API endpoint para ajustes de stock
 * POST: Realizar ajuste de stock
 */

import { serverSupabaseClient } from '#supabase/server'
import { requireAdmin, respondSuccess, respondError } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const method = getMethod(event)
  const supabase = await serverSupabaseClient<any>(event)

  if (method !== 'POST') {
    return respondError('Método no permitido')
  }

  try {
    await requireAdmin(event)
    const body = await readBody(event)
    
    // Validar campos requeridos (permitir quantity = 0 para tipo 'set')
    if (!body.product_id || !body.adjustment_type || body.quantity === undefined || body.quantity === null || !body.reason) {
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

    // Calcular nuevo stock según el tipo de ajuste
    switch (body.adjustment_type) {
      case 'set':
        newStock = body.quantity
        break
      case 'add':
        newStock = currentStock + body.quantity
        break
      case 'subtract':
        newStock = Math.max(0, currentStock - body.quantity)
        break
      default:
        return respondError('Tipo de ajuste no válido')
    }

    // Crear el movimiento de ajuste
    const movementData = {
      product_id: body.product_id,
      movement_type: 'adjustment',
      quantity: Math.abs(newStock - currentStock),
      stock_before: currentStock,
      stock_after: newStock,
      reason: body.reason,
      description: body.description || `Ajuste de stock: ${body.adjustment_type}`,
      reference: body.reference || null
    }

    const { data: movement, error: movementError } = await supabase
      .from('inventory_movements')
      .insert(movementData as any)
      .select()
      .single()

    if (movementError) {
      console.error('Error creando movimiento de ajuste:', movementError)
      return respondError('Error creando movimiento de ajuste')
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

    return respondSuccess({ movement, old_stock: currentStock, new_stock: newStock })
  } catch (error) {
    console.error('Error inesperado:', error)
    return respondError('Error interno del servidor')
  }
})
