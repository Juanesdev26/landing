import { serverSupabaseClient } from '#supabase/server'

type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'

interface UpdateStatusBody {
  status: OrderStatus
  tracking_number?: string
  notes?: string
}

interface CurrentOrder {
  id_order: string
  status: OrderStatus
  payment_status: PaymentStatus
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
    const body = await readBody<Partial<UpdateStatusBody>>(event)
    
    // Validar campos requeridos
    if (!body.status) {
      return {
        data: {
          success: false,
          error: 'El nuevo estado es requerido'
        }
      }
    }

    // Validar estado válido
    const validStatuses: OrderStatus[] = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']
    if (!body.status || !validStatuses.includes(body.status)) {
      return {
        data: {
          success: false,
          error: 'Estado no válido. Estados permitidos: pending, confirmed, shipped, delivered, cancelled'
        }
      }
    }

    // Obtener el pedido actual
    const currentOrderRes = await supabase
      .from('orders')
      .select('id_order, status, payment_status')
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

    // Validar transiciones de estado permitidas
    const currentStatus: OrderStatus = currentOrder.status
    const newStatus: OrderStatus = body.status

    // Reglas de transición de estado
    const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['shipped', 'cancelled'],
      shipped: ['delivered', 'cancelled'],
      delivered: [],
      cancelled: []
    }

    if (!allowedTransitions[currentStatus].includes(newStatus)) {
      return {
        data: {
          success: false,
          error: `No se puede cambiar el estado de '${currentStatus}' a '${newStatus}'. Transiciones permitidas: ${allowedTransitions[currentStatus].join(', ')}`
        }
      }
    }

    // Validaciones específicas por estado
    if (newStatus === 'shipped' && !body.tracking_number) {
      return {
        data: {
          success: false,
          error: 'El número de seguimiento es requerido cuando el estado cambia a "shipped"'
        }
      }
    }

    if (newStatus === 'confirmed' && currentOrder.payment_status !== 'paid') {
      return {
        data: {
          success: false,
          error: 'No se puede confirmar un pedido con estado de pago pendiente'
        }
      }
    }

    // Preparar datos de actualización
    const updateData: Partial<{ status: OrderStatus; updated_at: string; tracking_number: string; notes: string }> = {
      status: newStatus,
      updated_at: new Date().toISOString()
    }

    // Agregar tracking number si se proporciona
    if (body.tracking_number) {
      updateData.tracking_number = body.tracking_number.trim()
    }

    // Agregar notas si se proporcionan
    if (body.notes) {
      updateData.notes = body.notes.trim()
    }

    // Actualizar el pedido
    const updateRes = await (supabase as any)
      .from('orders')
      .update(updateData)
      .eq('id_order', id)
      .select('id_order, status, tracking_number, notes, updated_at')
      .single()
    const error = (updateRes as any).error as any
    const data = (updateRes as any).data as { id_order: string; status: OrderStatus; tracking_number: string | null; notes: string | null; updated_at: string }

    if (error) {
      console.error('Error actualizando estado del pedido:', error)
      return {
        data: {
          success: false,
          error: 'Error actualizando estado del pedido',
          details: error.message
        }
      }
    }

    // Si el pedido se cancela, restaurar stock
    if (newStatus === 'cancelled' && currentStatus !== 'cancelled') {
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

    // Si el pedido se confirma desde pendiente, verificar stock y descontar
    if (newStatus === 'confirmed' && currentStatus === 'pending') {
      const orderItemsRes = await supabase
        .from('order_items')
        .select('product_id, quantity')
        .eq('order_id', id)
      const itemsError = (orderItemsRes as any).error as any
      const orderItems = (orderItemsRes as any).data as OrderItemRow[] | null

      if (itemsError) {
        console.error('Error obteniendo items para verificar stock:', itemsError)
      } else if (orderItems) {
        for (const item of orderItems) {
          const productRes = await supabase
            .from('products')
            .select('stock_quantity, name')
            .eq('id_product', item.product_id)
            .single()
          const productError = (productRes as any).error as any
          const product = (productRes as any).data as { stock_quantity: number, name: string }

          if (productError) {
            console.error('Error verificando stock del producto:', productError)
          } else if (product.stock_quantity < item.quantity) {
            console.warn(`Stock insuficiente para ${product.name} al confirmar pedido`)
            return {
              data: {
                success: false,
                error: `Stock insuficiente para ${product.name}`
              }
            }
          }
        }

        // Descontar stock ahora que hay disponibilidad (RPC)
        for (const item of orderItems) {
          const rpcRes = await (supabase as any).rpc('adjust_product_stock', { p_id_product: item.product_id, p_delta: -Number(item.quantity) })
          const stockError = (rpcRes as any).error
          if (stockError) console.error('Error descontando stock via RPC:', stockError)
        }
      }
    }

    return {
      data: {
        success: true,
        data: {
          id_order: data.id_order,
          status: data.status,
          tracking_number: data.tracking_number,
          notes: data.notes,
          updated_at: data.updated_at
        },
        message: `Estado del pedido actualizado exitosamente a '${newStatus}'`
      }
    }

  } catch (error) {
    console.error('Error en PATCH /api/orders/[id]/update-status:', error)
    return {
      data: {
        success: false,
        error: 'Error interno del servidor'
      }
    }
  }
})
