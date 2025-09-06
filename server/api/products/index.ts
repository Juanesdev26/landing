import { serverSupabaseClient } from '#supabase/server'
import { requireAdmin, respondSuccess, respondError } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  const method = getMethod(event)

  try {
    switch (method) {
      case 'GET':
        // Obtener productos con filtros opcionales y paginación
        const query = getQuery(event) as Record<string, string>
        const categoryId = query.category_id ? String(query.category_id) : undefined
        const search = query.search ? String(query.search) : undefined
        const page = query.page ? Math.max(1, parseInt(String(query.page))) : undefined
        const pageSize = query.page_size ? Math.max(1, parseInt(String(query.page_size))) : undefined

        let builder = client
          .from('products')
          .select(`
            *,
            category:categories(name)
          `)
          .order('created_at', { ascending: false }) as any

        if (categoryId) builder = builder.eq('category_id', categoryId)
        if (search && search.trim()) {
          const like = `%${search.trim()}%`
          builder = builder.or(`name.ilike.${like},sku.ilike.${like}`)
        }
        if (page && pageSize) {
          const from = (page - 1) * pageSize
          const to = from + pageSize - 1
          builder = builder.range(from, to)
        }

        const { data: products, error: getError } = await builder
        if (getError) throw getError

        return respondSuccess(products)

      case 'POST':
        // Solo administradores pueden crear productos
        await requireAdmin(event)
        // Crear nuevo producto (permite multipart/form-data para imagen)
        const contentType = getHeader(event, 'content-type') || ''
        let body: any = {}
        let uploadedImageUrl: string | null = null

        if (contentType.includes('multipart/form-data')) {
          const form = await readMultipartFormData(event)
          const fields: Record<string, string> = {}
          let filePart: any = null
          for (const part of form || []) {
            if (part.type === 'file') {
              if (part.name === 'image' && part.data && part.filename) {
                filePart = part
              }
            } else if (part.name) {
              fields[part.name] = part.data?.toString() || ''
            }
          }
          body = fields

          if (filePart) {
            const fileExt = (filePart.filename as string).split('.').pop()
            const filePath = `${crypto.randomUUID()}.${fileExt}`
            const { error: uploadError } = await client.storage
              .from('product-image')
              .upload(filePath, filePart.data, { contentType: filePart.mimetype, upsert: false })
            if (uploadError) {
              throw createError({ statusCode: 400, statusMessage: 'Error subiendo imagen' })
            }
            const { data: publicUrl } = client.storage.from('product-image').getPublicUrl(filePath)
            uploadedImageUrl = publicUrl.publicUrl
          }
        } else {
          body = await readBody(event)
        }

        // Validar campos requeridos
        const requiredFields = ['name', 'description', 'price', 'stock_quantity', 'category_id', 'sku']
        for (const field of requiredFields) {
          if (!body[field]) {
            throw createError({
              statusCode: 400,
              statusMessage: `Campo requerido: ${field}`
            })
          }
        }

        // Generar ID único
        const productId = crypto.randomUUID()

        const { data: newProduct, error: createErr } = await (client
          .from('products') as any)
          .insert({
            id_product: productId,
            name: body.name,
            description: body.description,
            price: parseFloat(body.price),
            stock_quantity: parseInt(body.stock_quantity),
            category_id: body.category_id,
            brand: body.brand || '',
            sku: body.sku,
            image_url: uploadedImageUrl || body.image_url || null,
            is_active: body.is_active !== undefined ? body.is_active : true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single()

        if (createErr) throw createErr

        return respondSuccess(newProduct, 'Producto creado exitosamente')

      default:
        throw createError({
          statusCode: 405,
          statusMessage: 'Método no permitido'
        })
    }
  } catch (error) {
    console.error('Error en API de productos:', error)
    return respondError((error as any).statusMessage || (error as any).message || 'Error interno del servidor')
  }
})
