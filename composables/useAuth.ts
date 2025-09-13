/**
 * Composable para manejo de autenticación
 * Sistema independiente usando tabla users propia
 */

import type { User } from '~/types/types'

export const useAuth = () => {
  const supabase = useSupabaseClient<any>()
  const user = useState<User | null>('user', () => null)
  const isAuthenticated = computed(() => !!user.value)
  const loading = ref(false)

  // Función para iniciar sesión
  const login = async (email: string, password: string) => {
    loading.value = true
    
    try {
      // Usar Supabase Auth para autenticación
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      })

      if (error || !data.user) {
        throw new Error('Credenciales incorrectas')
      }

      // Asegurar que exista perfil y rol 'user' (mantener admin si ya lo es)
      try {
        await $fetch('/api/auth/upsert-profile', { method: 'POST' })
      } catch (_e) {
        // no bloquear el login por fallo en upsert
        console.warn('upsert-profile falló tras login')
      }

      // Obtener perfil del usuario desde la tabla profiles
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single()

      if (profileError || !profile) {
        throw new Error('Perfil de usuario no encontrado')
      }

      // Aceptar los tres roles: admin, user, customer
      if (!['admin', 'user', 'customer'].includes(profile.role)) {
        throw new Error('Rol no permitido')
      }

      // Crear objeto de usuario
      const userData: User = {
        id: profile.id,
        email: profile.email,
        role: profile.role,
        name: profile.first_name ? `${profile.first_name} ${profile.last_name || ''}`.trim() : (profile.name || null),
        avatar: profile.avatar_url,
        created_at: profile.created_at,
        updated_at: profile.updated_at
      }

      // Guardar en estado
      user.value = userData

      // Guardar en localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(userData))
        localStorage.setItem('isAuthenticated', 'true')
      }

      return { success: true, user: userData }
    } catch (error) {
      console.error('Error en login:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error al iniciar sesión' 
      }
    } finally {
      loading.value = false
    }
  }

  // Función para cerrar sesión
  const logout = async () => {
    try {
      // 1. Cerrar sesión de Supabase PRIMERO
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('Error cerrando sesión de Supabase:', error)
      }
      
      // 2. Limpiar estado inmediatamente
      user.value = null
      
      // 3. Limpiar localStorage inmediatamente
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user')
        localStorage.removeItem('isAuthenticated')
        // Limpiar también datos del carrito para evitar problemas
        const cartKeys = Object.keys(localStorage).filter(key => key.startsWith('cart:'))
        cartKeys.forEach(key => localStorage.removeItem(key))
      }

      return { success: true }
    } catch (error) {
      console.error('Error en logout:', error)
      // Asegurar que el estado se limpia incluso si hay error
      user.value = null
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user')
        localStorage.removeItem('isAuthenticated')
      }
      return { 
        success: true // Siempre retornar success para permitir redirección
      }
    }
  }

  // Función para verificar autenticación al cargar la página (optimizada)
  const checkAuth = async () => {
    try {
      // Verificar sesión de Supabase con timeout reducido
      const sessionPromise = supabase.auth.getSession()
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Session check timeout')), 5000) // Reducir de 10s a 5s
      )
      
      const { data: { session }, error } = await Promise.race([sessionPromise, timeoutPromise]) as any
      
      if (error || !session) {
        return false
      }

      // Obtener perfil del usuario desde la tabla profiles con timeout reducido
      const profilePromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()
      
      const profileTimeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile fetch timeout')), 5000) // Reducir de 10s a 5s
      )
      
      const { data: profile, error: profileError } = await Promise.race([profilePromise, profileTimeoutPromise]) as any

      if (profileError || !profile) {
        return false
      }

      // Aceptar los tres roles
      if (!['admin', 'user', 'customer'].includes(profile.role)) return false

      // Actualizar datos del usuario
      user.value = {
        id: profile.id,
        email: profile.email,
        role: profile.role,
        name: profile.first_name ? `${profile.first_name} ${profile.last_name || ''}`.trim() : (profile.name || null),
        avatar: profile.avatar_url,
        created_at: profile.created_at,
        updated_at: profile.updated_at
      }

      // Actualizar localStorage de forma asíncrona
      if (typeof window !== 'undefined') {
        // Usar requestIdleCallback si está disponible para no bloquear el hilo principal
        if (window.requestIdleCallback) {
          window.requestIdleCallback(() => {
            localStorage.setItem('user', JSON.stringify(user.value))
            localStorage.setItem('isAuthenticated', 'true')
          })
        } else {
          setTimeout(() => {
            localStorage.setItem('user', JSON.stringify(user.value))
            localStorage.setItem('isAuthenticated', 'true')
          }, 0)
        }
      }
      
      return true
    } catch (error) {
      // Evitar ruido en consola por timeouts intermitentes; log suave en dev
      if (import.meta.env.DEV) console.warn('Auth check issue:', error)
      return false
    }
  }

  // Función para registrar nuevo usuario
  const register = async (userData: {
    email: string
    password: string
    first_name: string
    last_name: string
    phone?: string
  }) => {
    loading.value = true
    
    try {
      // Verificar si el email ya existe
      const { data: existingUser } = await supabase
        .from('users')
        .select('id_user')
        .eq('email', userData.email)
        .single()

      if (existingUser) {
        throw new Error('El email ya está registrado')
      }

      // Hash de la contraseña (en producción usar bcrypt)
      const passwordHash = userData.password // Por ahora sin hash

      // Crear usuario
      const { data, error } = await supabase
        .from('users')
        .insert({
          email: userData.email,
          password_hash: passwordHash,
          first_name: userData.first_name,
          last_name: userData.last_name,
          phone: userData.phone,
          role: 'customer',
          is_active: true,
          email_verified: false
        })
        .select()
        .single()

      if (error) {
        throw new Error('Error al crear usuario')
      }

      // Crear cliente asociado
      await supabase
        .from('customers')
        .insert({
          user_id: data.id_user,
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          phone: data.phone
        })

      return { success: true, user: data }
    } catch (error) {
      console.error('Error en registro:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error al registrar usuario' 
      }
    } finally {
      loading.value = false
    }
  }

  // Función para cambiar contraseña
  const changePassword = async (userId: string, currentPassword: string, newPassword: string) => {
    try {
      // Verificar contraseña actual
      const { data: user } = await supabase
        .from('users')
        .select('password_hash')
        .eq('id_user', userId)
        .single()

      if (!user || user.password_hash !== currentPassword) {
        throw new Error('Contraseña actual incorrecta')
      }

      // Actualizar contraseña
      const { error } = await supabase
        .from('users')
        .update({ password_hash: newPassword })
        .eq('id_user', userId)

      if (error) {
        throw new Error('Error al cambiar contraseña')
      }

      return { success: true }
    } catch (error) {
      console.error('Error cambiando contraseña:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error al cambiar contraseña' 
      }
    }
  }

  // Función para actualizar perfil
  const updateProfile = async (userId: string, profileData: {
    first_name?: string
    last_name?: string
    phone?: string
    address?: string
    city?: string
    state?: string
    postal_code?: string
    avatar_url?: string
  }) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(profileData)
        .eq('id_user', userId)
        .select()
        .single()

      if (error) {
        throw new Error('Error al actualizar perfil')
      }

      // Actualizar estado local
      if (user.value && user.value.id === userId) {
        user.value = {
          ...user.value,
          name: `${data.first_name} ${data.last_name}`,
          avatar: data.avatar_url,
          updated_at: data.updated_at
        }
        
        // Actualizar localStorage
        localStorage.setItem('user', JSON.stringify(user.value))
      }

      return { success: true, user: data }
    } catch (error) {
      console.error('Error actualizando perfil:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error al actualizar perfil' 
      }
    }
  }

  return {
    // Estado
    user: readonly(user),
    isAuthenticated,
    loading: readonly(loading),
    
    // Funciones
    login,
    logout,
    checkAuth,
    register,
    changePassword,
    updateProfile
  }
}


