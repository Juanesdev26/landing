import { serverSupabaseClient } from '#supabase/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdmin, respondSuccess, respondError } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const method = getMethod(event)
  const supabase = await serverSupabaseClient(event)
  const id = getRouterParam(event, 'id')

  if (!id) {
    return {
      success: false,
      error: 'ID de usuario requerido'
    }
  }

  if (method === 'GET') {
    try {
      // Obtener perfil específico
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return {
            success: false,
            error: 'Usuario no encontrado'
          }
        }
        console.error('Error obteniendo perfil:', error)
        return {
          success: false,
          error: 'Error obteniendo perfil',
          details: error.message
        }
      }

      // Procesar el perfil para incluir información adicional
      const processedProfile = {
        ...(profile as any),
        full_name: `${(profile as any).first_name || ''} ${(profile as any).last_name || ''}`.trim() || null
      }

      return respondSuccess(processedProfile)

    } catch (error) {
      console.error('Error en GET /api/profiles/[id]:', error)
      return respondError('Error interno del servidor')
    }
  }

  if (method === 'PUT') {
    try {
      await requireAdmin(event)
      const body = await readBody(event)
      
      // Validar campos requeridos
      if (!body.first_name || !body.last_name || !body.email || !body.role) {
        return respondError('Los campos nombre, apellido, email y rol son requeridos')
      }

      // Verificar si el email ya existe en otro usuario
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', body.email)
        .neq('id', id)
        .single()

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error verificando email duplicado:', checkError)
        return respondError('Error verificando email duplicado')
      }

      if (existingProfile) {
        return respondError('Ya existe otro usuario con este email')
      }

      // Actualizar perfil
      const updatedProfile = {
        first_name: body.first_name.trim(),
        last_name: body.last_name.trim(),
        email: body.email.trim().toLowerCase(),
        phone: body.phone?.trim() || null,
        address: body.address?.trim() || null,
        city: body.city?.trim() || null,
        state: body.state?.trim() || null,
        postal_code: body.postal_code?.trim() || null,
        country: body.country?.trim() || null,
        birth_date: body.birth_date || null,
        gender: body.gender || null,
        role: body.role,
        is_active: body.is_active !== undefined ? body.is_active : true,
        notes: body.notes?.trim() || null,
        updated_at: new Date().toISOString()
      }

      const { data, error } = await (supabase as any)
        .from('profiles')
        .update(updatedProfile as any)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error actualizando perfil:', error)
        return {
          success: false,
          error: 'Error actualizando perfil',
          details: error.message
        }
      }

      return respondSuccess(data, 'Perfil actualizado exitosamente')

    } catch (error) {
      console.error('Error en PUT /api/profiles/[id]:', error)
      return respondError('Error interno del servidor')
    }
  }

  if (method === 'DELETE') {
    try {
      await requireAdmin(event)
      // Usar service role para operaciones administrativas y evitar bloqueos por RLS / FKs
      const config = useRuntimeConfig()
      const adminClient = createClient(
        config.public.supabaseUrl,
        config.supabaseServiceKey,
        { auth: { persistSession: false } }
      ) as any

      // 0) Intentar eliminar auth user primero (si no existe, continuar)
      const delAuth = await adminClient.auth.admin.deleteUser(id)
      if ((delAuth as any).error && (delAuth as any).error?.message && !(delAuth as any).error?.message?.includes('not found')) {
        const err = (delAuth as any).error
        console.warn('No se pudo eliminar auth user en primer intento, continuando:', err)
      }

      // 1) Desasociar customers del auth user (FK customers.user_id -> auth.users.id)
      const clearCust = await adminClient
        .from('customers')
        .update({ user_id: null, updated_at: new Date().toISOString() })
        .eq('user_id', id)
      if (clearCust.error) {
        console.error('Error desasociando cliente del usuario:', clearCust.error)
        return respondError('Error desasociando cliente del usuario', clearCust.error.message)
      }

      // 2) Eliminar reservas del usuario
      const delResv = await adminClient
        .from('reservations')
        .delete()
        .eq('user_id', id)
      if (delResv.error) {
        console.error('Error eliminando reservas del usuario:', delResv.error)
        return respondError('Error eliminando reservas del usuario', delResv.error.message)
      }

      // 2.1) Eliminar ofertas asignadas al usuario (si no hay CASCADE)
      const delOffers = await adminClient
        .from('user_offers')
        .delete()
        .eq('user_id', id)
      if (delOffers.error) {
        console.error('Error eliminando ofertas del usuario:', delOffers.error)
        return respondError('Error eliminando ofertas del usuario', delOffers.error.message)
      }

      // 2.2) Desasociar órdenes asignadas a este usuario (assigned_user_id)
      const clearAssigned = await adminClient
        .from('orders')
        .update({ assigned_user_id: null, updated_at: new Date().toISOString() })
        .eq('assigned_user_id', id)
      if (clearAssigned.error) {
        console.error('Error desasociando órdenes asignadas:', clearAssigned.error)
        return respondError('Error desasociando órdenes asignadas', clearAssigned.error.message)
      }

      // 3) Eliminar perfil
      const delProf = await adminClient
        .from('profiles')
        .delete()
        .eq('id', id)
      if (delProf.error) {
        console.error('Error eliminando perfil:', delProf.error)
        return respondError('Error eliminando perfil', delProf.error.message)
      }

      // 4) Eliminar auth user (segundo intento definitivo)
      const authDel = await adminClient.auth.admin.deleteUser(id)
      if ((authDel as any).error && (authDel as any).error?.message && !(authDel as any).error?.message?.includes('not found')) {
        const err = (authDel as any).error
        console.error('Error eliminando usuario de Auth:', err)
        return respondError('Error eliminando usuario del sistema de autenticación', err.message)
      }

      return respondSuccess(null, 'Usuario eliminado exitosamente')

    } catch (error) {
      console.error('Error en DELETE /api/profiles/[id]:', error)
      return respondError('Error interno del servidor')
    }
  }

  return respondError('Método no permitido')
})
