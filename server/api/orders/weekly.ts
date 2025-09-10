import { serverSupabaseClient } from '#supabase/server'
import { requireAdmin, respondSuccess, respondError } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const method = getMethod(event)
  const supabase = await serverSupabaseClient(event)
  if (method !== 'GET') return respondError('Método no permitido')

  try {
    await requireAdmin(event)
    const days = 7
    const start = new Date()
    start.setDate(start.getDate() - (days - 1))
    start.setHours(0, 0, 0, 0)
    const startIso = start.toISOString()

    const { data, error } = await supabase
      .from('orders')
      .select('created_at, total_amount')
      .gte('created_at', startIso)
      .order('created_at', { ascending: true })

    if (error) return respondError('Error obteniendo ventas semanales', error.message)

    // Agrupar por día
    const byDay: Record<string, number> = {}
    const cursor = new Date(start)
    for (let i = 0; i < days; i++) {
      const key = cursor.toISOString().slice(0, 10)
      byDay[key] = 0
      cursor.setDate(cursor.getDate() + 1)
    }
    type WeeklyRow = { created_at: string; total_amount: number | null }
    const rows: WeeklyRow[] = (data as WeeklyRow[] | null) || []
    for (const row of rows) {
      const key = new Date(row.created_at).toISOString().slice(0, 10)
      byDay[key] = (byDay[key] || 0) + (row.total_amount || 0)
    }

    const series = Object.entries(byDay).map(([date, sales]) => ({ date, sales }))
    return respondSuccess({ series })
  } catch (e) {
    console.error('GET /api/orders/weekly error:', e)
    return respondError('Error interno del servidor')
  }
})


