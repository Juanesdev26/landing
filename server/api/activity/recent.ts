import { serverSupabaseClient } from '#supabase/server'
import { requireAdmin, respondSuccess, respondError } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const method = getMethod(event)
  const supabase = await serverSupabaseClient(event)
  if (method !== 'GET') return respondError('Método no permitido')

  try {
    await requireAdmin(event)
    const limit = 10

    // Últimas órdenes
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id_order, total_amount, created_at, customer:customers(first_name, last_name)')
      .order('created_at', { ascending: false })
      .limit(limit)

    // Últimos productos
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id_product, name, sku, created_at')
      .order('created_at', { ascending: false })
      .limit(limit)

    // Últimos clientes
    const { data: customers, error: customersError } = await supabase
      .from('customers')
      .select('id_customer, first_name, last_name, email, created_at')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (ordersError || productsError || customersError) {
      const firstErr = ordersError || productsError || customersError
      return respondError('Error obteniendo actividad reciente', firstErr?.message)
    }

    const orderEvents = (orders || []).map((o: any) => ({
      type: 'order',
      title: 'Nueva orden recibida',
      description: `Orden #${o.id_order} por $${o.total_amount}`,
      time: o.created_at,
      meta: { customer: o.customer ? `${o.customer.first_name} ${o.customer.last_name}` : null }
    }))

    const productEvents = (products || []).map((p: any) => ({
      type: 'product',
      title: 'Nuevo producto agregado',
      description: `${p.name} (${p.sku})`,
      time: p.created_at
    }))

    const customerEvents = (customers || []).map((c: any) => ({
      type: 'customer',
      title: 'Nuevo cliente registrado',
      description: `${c.first_name} ${c.last_name} (${c.email})`,
      time: c.created_at
    }))

    const combined = [...orderEvents, ...productEvents, ...customerEvents]
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, limit)

    return respondSuccess(combined)
  } catch (e) {
    console.error('GET /api/activity/recent error:', e)
    return respondError('Error interno del servidor')
  }
})


