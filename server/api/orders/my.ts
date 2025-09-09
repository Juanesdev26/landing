import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { respondError, respondSuccess } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const method = getMethod(event)
  const supabase = await serverSupabaseClient(event)
  if (method !== 'GET') return respondError('Método no permitido')

  try {
    // Obtener usuario autenticado desde las cookies del request (server-side)
    const authUser = await serverSupabaseUser(event)
    if (!authUser) return respondSuccess([])

    // Obtener el customer del usuario
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('id_customer')
      .eq('user_id', authUser.id)
      .single()

    if (customerError || !customer) return respondSuccess([])

    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items:order_items(
          id_order_item,
          quantity,
          unit_price,
          total_price,
          product:products(id_product, name, sku, image_url)
        )
      `)
      .eq('customer_id', (customer as any).id_customer)
      .order('created_at', { ascending: false })

    if (error) return respondError('Error obteniendo mis pedidos', error.message)
    return respondSuccess(data || [])
  } catch (e) {
    console.error('GET /api/orders/my error:', e)
    return respondError('Error interno del servidor')
  }
})


