import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const method = getMethod(event)
  
  if (method !== 'POST') {
    return createError({
      statusCode: 405,
      statusMessage: 'Método no permitido'
    })
  }

  const body = await readBody(event)
  const supabase = await serverSupabaseClient(event)
  const config = useRuntimeConfig()

  console.log('🔔 Webhook de MercadoPago recibido:', body)

  try {
    // MercadoPago envía el ID de la notificación
    const { id, type } = body

    if (!id || !type) {
      console.log('❌ Webhook sin ID o tipo válido')
      return { received: true }
    }

    // Obtener información del pago desde MercadoPago
    const accessToken = config.mercadopagoAccessToken || process.env.MERCADOPAGO_ACCESS_TOKEN
    if (!accessToken) {
      console.error('❌ MERCADOPAGO_ACCESS_TOKEN no configurado')
      return { received: true }
    }

    // Hacer llamada a la API de MercadoPago para obtener detalles
    const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${id}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    })

    if (!paymentResponse.ok) {
      console.error('❌ Error obteniendo detalles del pago desde MercadoPago')
      return { received: true }
    }

    const paymentData = await paymentResponse.json()
    console.log('💳 Datos del pago:', paymentData)

    // Obtener el order_id desde external_reference
    const orderId = paymentData.external_reference

    if (!orderId) {
      console.log('❌ No se encontró external_reference en el pago')
      return { received: true }
    }

    // Buscar el pedido en la base de datos
    const { data: order, error: orderError } = await (supabase as any)
      .from('orders')
      .select('id_order, payment_status, total_amount')
      .eq('id_order', orderId)
      .single()

    if (orderError || !order) {
      console.error('❌ Pedido no encontrado:', orderId)
      return { received: true }
    }

    // Determinar el estado del pago basado en MercadoPago
    let paymentStatus = 'pending'
    
    switch (paymentData.status) {
      case 'approved':
        paymentStatus = 'paid'
        console.log('✅ Pago aprobado:', orderId)
        break
      case 'rejected':
        paymentStatus = 'failed'
        console.log('❌ Pago rechazado:', orderId)
        break
      case 'pending':
        paymentStatus = 'pending'
        console.log('⏳ Pago pendiente:', orderId)
        break
      case 'cancelled':
        paymentStatus = 'failed'
        console.log('🚫 Pago cancelado:', orderId)
        break
      default:
        console.log('❓ Estado de pago desconocido:', paymentData.status)
        return { received: true }
    }

    // Actualizar el estado del pago en la base de datos
    const { error: updateError } = await (supabase as any)
      .from('orders')
      .update({
        payment_status: paymentStatus,
        payment_method: 'mercadopago',
        updated_at: new Date().toISOString(),
        notes: `Estado: ${paymentData.status}, Payment ID: ${id}, MercadoPago`
      })
      .eq('id_order', orderId)

    if (updateError) {
      console.error('❌ Error actualizando estado de pago:', updateError)
    } else {
      console.log(`✅ Estado de pago actualizado a "${paymentStatus}" para pedido:`, orderId)
    }

    return { received: true }

  } catch (error) {
    console.error('❌ Error procesando webhook de MercadoPago:', error)
    return { received: true }
  }
})

