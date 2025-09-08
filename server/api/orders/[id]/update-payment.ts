import { serverSupabaseClient } from '#supabase/server'

type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'
type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'

interface UpdatePaymentBody {
  payment_status: PaymentStatus
  notes?: string
  payment_method?: string
  payment_reference?: string
}

interface CurrentOrder {
  id_order: string
  payment_status: PaymentStatus
  status: OrderStatus
}

interface OrderItemRow {
  product_id: string
  quantity: number
}

export default defineEventHandler(async (event) => {
  const method = getMethod(event)
  const supabase = await serverSupabaseClient(event)
  const id = getRouterParam(event, 'id')

  if (method !== 'PATCH') {
    return {
      data: {
        success: false,
        error: 'Método no permitido'
      }
    }
  }

  if (!id) {
    return {
      data: {
        success: false,
        error: 'ID de pedido requerido'
      }
    }
  }

  try {
    const body = await readBody<Partial<UpdatePaymentBody>>(event)
    
    // Validar campos requeridos
    if (!body.payment_status) {
      return {
        data: {
          success: false,
          error: 'El nuevo estado de pago es requerido'
        }
      }
    }

    // Validar estado de pago válido
    const validPaymentStatuses: PaymentStatus[] = ['pending', 'paid', 'failed', 'refunded']
    if (!body.payment_status || !validPaymentStatuses.includes(body.payment_status)) {
      return {
        data: {
          success: false,
          error: 'Estado de pago no válido. Estados permitidos: pending, paid, failed, refunded'
        }
      }
    }

    // Obtener el pedido actual
    const currentOrderRes = await supabase
      .from('orders')
      .select('id_order, payment_status, status')
      .eq('id_order', id)
      .single()
    const fetchError = (currentOrderRes as any).error as any
    const currentOrder = (currentOrderRes as any).data as CurrentOrder

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return {
          data: {
            success: false,
            error: 'Pedido no encontrado'
          }
        }
      }
      console.error('Error obteniendo pedido:', fetchError)
      return {
        data: {
          success: false,
          error: 'Error obteniendo pedido',
          details: fetchError.message
        }
      }
    }

    // Validar transiciones de estado de pago permitidas
    const currentPaymentStatus: PaymentStatus = currentOrder.payment_status
    const newPaymentStatus: PaymentStatus = body.payment_status

    // Reglas de transición de estado de pago
    const allowedPaymentTransitions: Record<PaymentStatus, PaymentStatus[]> = {
      pending: ['paid', 'failed'],
      paid: ['refunded'],
      failed: ['pending', 'paid'],
      refunded: []
    }

    if (!allowedPaymentTransitions[currentPaymentStatus].includes(newPaymentStatus)) {
      return {
        data: {
          success: false,
          error: `No se puede cambiar el estado de pago de '${currentPaymentStatus}' a '${newPaymentStatus}'. Transiciones permitidas: ${allowedPaymentTransitions[currentPaymentStatus].join(', ')}`
        }
      }
    }

    // Validaciones específicas por estado de pago
    if (newPaymentStatus === 'refunded' && currentPaymentStatus !== 'paid') {
      return {
        data: {
          success: false,
          error: 'Solo se puede reembolsar un pedido que esté pagado'
        }
      }
    }

    if (newPaymentStatus === 'paid' && currentPaymentStatus === 'refunded') {
      return {
        data: {
          success: false,
          error: 'No se puede marcar como pagado un pedido reembolsado'
        }
      }
    }

    // Preparar datos de actualización
    const updateData: Partial<{
      payment_status: PaymentStatus
      updated_at: string
      notes: string
      payment_method: string
      payment_reference: string
    }> = {
      payment_status: newPaymentStatus,
      updated_at: new Date().toISOString()
    }

    // Agregar notas si se proporcionan
    if (body.notes) {
      updateData.notes = body.notes.trim()
    }

    // Agregar método de pago si se proporciona
    if (body.payment_method) {
      updateData.payment_method = body.payment_method.trim()
    }

    // Agregar referencia de pago si se proporciona
    if (body.payment_reference) {
      updateData.payment_reference = body.payment_reference.trim()
    }

    // Actualizar el pedido
    const clientAny = supabase as any
    const updateRes = await clientAny
      .from('orders')
      .update(updateData)
      .eq('id_order', id)
      .select('id_order, payment_status, payment_method, notes, updated_at')
      .single()
    const error = updateRes.error as any
    const data = updateRes.data as {
      id_order: string
      payment_status: PaymentStatus
      payment_method: string | null
      notes: string | null
      updated_at: string
    }

    if (error) {
      console.error('Error actualizando estado de pago del pedido:', error)
      return {
        data: {
          success: false,
          error: 'Error actualizando estado de pago del pedido',
          details: error.message
        }
      }
    }

    // Si el pago se marca como fallido, restaurar stock si el pedido estaba confirmado
    if (newPaymentStatus === 'failed' && currentPaymentStatus === 'paid' && currentOrder.status === 'confirmed') {
      const orderItemsRes = await supabase
        .from('order_items')
        .select('product_id, quantity')
        .eq('order_id', id)
      const itemsError = (orderItemsRes as any).error as any
      const orderItems = (orderItemsRes as any).data as OrderItemRow[] | null

      if (itemsError) {
        console.error('Error obteniendo items para restaurar stock:', itemsError)
      } else if (orderItems) {
        for (const item of orderItems) {
          const rpcRes = await (supabase as any).rpc('adjust_product_stock', { p_id_product: item.product_id, p_delta: Number(item.quantity) })
          const stockError = (rpcRes as any).error
          if (stockError) console.error('Error restaurando stock via RPC:', stockError)
        }
      }
    }

    // No auto-confirmar al marcar como pagado; el admin debe confirmar y allí se descuenta el stock

    return {
      data: {
        success: true,
        data: {
          id_order: data.id_order,
          payment_status: data.payment_status,
          payment_method: data.payment_method,
          notes: data.notes,
          updated_at: data.updated_at
        },
        message: `Estado de pago del pedido actualizado exitosamente a '${newPaymentStatus}'`
      }
    }

  } catch (error) {
    console.error('Error en PATCH /api/orders/[id]/update-payment:', error)
    return {
      data: {
        success: false,
        error: 'Error interno del servidor'
      }
    }
  }
})
