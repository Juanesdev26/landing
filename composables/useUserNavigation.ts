/**
 * Composable para manejar navegación de usuario con verificación de sesión
 * Soluciona problemas de navegación tras inactividad
 */

export const useUserNavigation = () => {
  const router = useRouter()
  const supabase = useSupabaseClient<any>()
  
  // Función para verificar sesión antes de navegar
  const verifySessionAndNavigate = async (path: string, fallbackUrl?: string) => {
    try {
      console.log(`🧭 Navegando a ${path}...`)
      
      // Verificar sesión con timeout
      const sessionPromise = supabase.auth.getSession()
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Session timeout')), 3000)
      )
      
      const { data: { session }, error } = await Promise.race([sessionPromise, timeoutPromise]) as any
      
      if (error || !session) {
        console.log('❌ No hay sesión, redirigiendo al login')
        await navigateTo('/login')
        return false
      }
      
      // Verificar rol de usuario
      const profilePromise = supabase
        .from('profiles')
        .select('role, is_active')
        .eq('id', session.user.id)
        .single()
        
      const profileTimeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile timeout')), 3000)
      )
      
      const { data: profile } = await Promise.race([profilePromise, profileTimeoutPromise]) as any
      
      const role = (profile as any)?.role
      const active = (profile as any)?.is_active
      
      if (!role || active === false || role !== 'user') {
        console.log('❌ Usuario no autorizado')
        await navigateTo('/unauthorized')
        return false
      }
      
      // Navegación exitosa
      console.log(`✅ Navegando a ${path}`)
      await navigateTo(path)
      return true
      
    } catch (error) {
      console.error(`❌ Error navegando a ${path}:`, error)
      
      // Fallback: usar URL directa si falla la navegación programática
      if (fallbackUrl || path) {
        console.log(`🔄 Usando fallback para navegar a ${fallbackUrl || path}`)
        window.location.href = fallbackUrl || path
      }
      
      return false
    }
  }
  
  // Navegación específica a ofertas de usuario
  const navigateToOffers = async () => {
    return await verifySessionAndNavigate('/user', '/user')
  }
  
  // Navegación específica al carrito
  const navigateToCart = async () => {
    return await verifySessionAndNavigate('/shop/cart', '/shop/cart')
  }
  
  // Navegación genérica para usuarios
  const navigateToUserPage = async (path: string) => {
    return await verifySessionAndNavigate(path, path)
  }
  
  return {
    verifySessionAndNavigate,
    navigateToOffers,
    navigateToCart,
    navigateToUserPage
  }
}
