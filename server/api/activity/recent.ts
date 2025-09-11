import { serverSupabaseClient } from '#supabase/server'
import { requireAdmin, respondSuccess, respondError } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const method = getMethod(event)
  const supabase = await serverSupabaseClient(event)
  if (method !== 'GET') return respondError('Método no permitido')

  try {
    await requireAdmin(event)

    // Obtener actividad básica reciente de distintas tablas (simple y eficiente)
    const limit = 10

    const [ordersRes, productsRes, customersRes] = await Promise.all([
      supabase.from('orders').select('id_order, created_at, status, total_amount').order('created_at', { ascending: false }).limit(limit),
      supabase.from('products').select('id_product, name, created_at').order('created_at', { ascending: false }).limit(limit),
      supabase.from('customers').select('id_customer, first_name, last_name, created_at').order('created_at', { ascending: false }).limit(limit)
    ])

    const events: Array<{ type: string; timestamp: string; title: string; description?: string }> = []

    type OrderRow = { id_order: number; created_at: string; status: string; total_amount: number | null }
    const orders: OrderRow[] = (ordersRes.data as OrderRow[] | null) || []
    for (const o of orders) {
      events.push({
        type: 'order',
        timestamp: o.created_at,
        title: `Orden #${o.id_order} - ${o.status}`,
        description: `Total: $${o.total_amount || 0}`
      })
    }

    type ProductRow = { id_product: number; name: string; created_at: string }
    const products: ProductRow[] = (productsRes.data as ProductRow[] | null) || []
    for (const p of products) {
      events.push({
        type: 'product',
        timestamp: p.created_at,
        title: `Producto creado: ${p.name}`
      })
    }

    type CustomerRow = { id_customer: number; first_name: string | null; last_name: string | null; created_at: string }
    const customers: CustomerRow[] = (customersRes.data as CustomerRow[] | null) || []
    for (const c of customers) {
      events.push({
        type: 'customer',
        timestamp: c.created_at,
        title: `Nuevo cliente: ${(c.first_name || '') + ' ' + (c.last_name || '')}`
      })
    }

    // Ordenar por timestamp descendente y limitar a 15
    const recent = events
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 15)

    return respondSuccess(recent)
  } catch (e) {
    console.error('GET /api/activity/recent error:', e)
    return respondError('Error interno del servidor')
  }
})


