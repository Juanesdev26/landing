import { serverSupabaseClient } from '#supabase/server'
import { requireAuth, respondSuccess, respondError } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const method = getMethod(event)
  const supabase = await serverSupabaseClient(event)

  if (method !== 'GET') {
    return respondError('Método no permitido')
  }

  try {
    // Permitir a cualquier usuario autenticado consultar sus métricas globales
    await requireAuth(event)

    // Total users (profiles)
    const { count: totalUsers, error: usersError } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })

    // Total products
    const { count: totalProducts, error: productsError } = await supabase
      .from('products')
      .select('id_product', { count: 'exact', head: true })

    // Total orders
    const { count: totalOrders, error: ordersError } = await supabase
      .from('orders')
      .select('id_order', { count: 'exact', head: true })

    // Total revenue
    const { data: salesRows, error: revenueError } = await supabase
      .from('orders')
      .select('total_amount')

    if (usersError) console.error('usersError', usersError)
    if (productsError) console.error('productsError', productsError)
    if (ordersError) console.error('ordersError', ordersError)
    if (revenueError) console.error('revenueError', revenueError)

    const totalRevenue = (salesRows || []).reduce((sum: number, row: any) => sum + (row.total_amount || 0), 0)

    // Rango últimos 7 días
    const sevenDaysAgoIso = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

    // Ventas de la última semana
    const { data: weeklySalesRows, error: weeklySalesError } = await supabase
      .from('orders')
      .select('total_amount, created_at')
      .gte('created_at', sevenDaysAgoIso)
    const weeklySales = (weeklySalesRows || []).reduce((sum: number, row: any) => sum + (row.total_amount || 0), 0)
    if (weeklySalesError) console.error('weeklySalesError', weeklySalesError)

    // Nuevos productos en la última semana
    const { count: newProducts, error: newProductsError } = await supabase
      .from('products')
      .select('id_product', { count: 'exact', head: true })
      .gte('created_at', sevenDaysAgoIso)
    if (newProductsError) console.error('newProductsError', newProductsError)

    // Órdenes de la última semana
    const { count: weeklyOrders, error: weeklyOrdersError } = await supabase
      .from('orders')
      .select('id_order', { count: 'exact', head: true })
      .gte('created_at', sevenDaysAgoIso)
    if (weeklyOrdersError) console.error('weeklyOrdersError', weeklyOrdersError)

    // Total clientes
    const { count: totalCustomers, error: customersError } = await supabase
      .from('customers')
      .select('id_customer', { count: 'exact', head: true })
    if (customersError) console.error('customersError', customersError)

    return respondSuccess({
      totalUsers: totalUsers || 0,
      totalProducts: totalProducts || 0,
      totalOrders: totalOrders || 0,
      totalRevenue,
      weeklySales: weeklySales || 0,
      newProducts: newProducts || 0,
      weeklyOrders: weeklyOrders || 0,
      totalCustomers: totalCustomers || 0
    })
  } catch (error) {
    console.error('Error en GET /api/dashboard:', error)
    return respondError('Error interno del servidor')
  }
})


