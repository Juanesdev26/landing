import { serverSupabaseClient } from '#supabase/server'
import { requireAdmin, respondSuccess, respondError } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const method = getMethod(event)
  const supabase = await serverSupabaseClient(event)

  if (method === 'GET') {
    try {
      await requireAdmin(event)
      const { data, error } = await supabase
        .from('offers')
        .select(`
          *,
          product:products(id_product, name, sku, price, image_url)
        `)
        .order('created_at', { ascending: false })
      if (error) return respondError('Error obteniendo ofertas', error.message)
      return respondSuccess(data)
    } catch (e) {
      console.error('GET /api/offers error:', e)
      return respondError('Error interno del servidor')
    }
  }

  if (method === 'POST') {
    try {
      await requireAdmin(event)
      const body = await readBody(event)
      if (!body.product_id || body.discount_percent === undefined) {
        return respondError('product_id y discount_percent son requeridos')
      }

      const payload: any = {
        product_id: body.product_id,
        discount_percent: Number(body.discount_percent),
        is_active: body.is_active !== undefined ? !!body.is_active : true,
        valid_from: body.valid_from || null,
        valid_to: body.valid_to || null,
        notes: body.notes || null
      }

      const { data, error } = await supabase
        .from('offers')
        .insert(payload)
        .select()
        .single()
      if (error) return respondError('Error creando oferta', error.message)
      return respondSuccess(data, 'Oferta creada exitosamente')
    } catch (e) {
      console.error('POST /api/offers error:', e)
      return respondError('Error interno del servidor')
    }
  }

  return respondError('Método no permitido')
})









