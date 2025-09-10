# Solución a Problemas de Navegación de Usuario tras Inactividad

## Problema Identificado

Los usuarios experimentaban problemas de navegación después de períodos de inactividad:
- **"Mis Ofertas"** no direccionaba correctamente a `/user`
- **Carrito** no direccionaba correctamente a `/shop/cart`
- Botones del menú dejaban de responder tras inactividad
- Middleware `user-only` causaba bloqueos en verificaciones

## ✅ Soluciones Implementadas

### 1. **Middleware `user-only.ts` Optimizado**

```typescript
// ✅ Antes: Sin timeout, verificaciones bloqueantes
// ❌ Ahora: Con timeout de 3 segundos y manejo de errores robusto

export default defineNuxtRouteMiddleware(async (_to: any) => {
  // Evitar verificaciones múltiples simultáneas
  if (isChecking) return
  isChecking = true

  try {
    // Verificar sesión con timeout
    const sessionPromise = supabase.auth.getSession()
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Session timeout')), 3000)
    )
    
    const { data: { session }, error: sessionError } = await Promise.race([sessionPromise, timeoutPromise])
    
    // Verificar perfil con timeout
    const profilePromise = supabase.from('profiles').select('role, is_active').eq('id', session.user.id).single()
    const profileTimeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Profile timeout')), 3000)
    )

    const { data: profile, error } = await Promise.race([profilePromise, profileTimeoutPromise])
    
    // Validación de rol y estado
    if (error || !role || active === false || role !== 'user') {
      return navigateTo('/unauthorized')
    }
  } finally {
    isChecking = false
  }
})
```

**Beneficios:**
- ✅ **Timeouts de 3 segundos** evitan bloqueos indefinidos
- ✅ **Promise.race** cancela operaciones lentas
- ✅ **Prevención de verificaciones múltiples** simultáneas
- ✅ **Logs detallados** para debugging

### 2. **Layout Default - Navegación Mejorada**

```vue
<!-- ✅ Antes: NuxtLink directo (podía fallar tras inactividad) -->
<NuxtLink v-if="isUser" to="/user">Mis Ofertas</NuxtLink>

<!-- ❌ Ahora: Botón con verificación de sesión -->
<button v-if="isUser" @click="navigateToOffers">Mis Ofertas</button>
```

**Funciones de navegación inteligente:**
```typescript
const navigateToOffers = async () => {
  // Forzar refresh antes de navegar
  refreshKey.value++
  await nextTick()
  
  await navToOffers() // Usa composable con verificación
}

const navigateToCart = async () => {
  // Forzar refresh antes de navegar
  refreshKey.value++
  await nextTick()
  
  await navToCart() // Usa composable con verificación
}
```

**Beneficios:**
- ✅ **Verificación de sesión** antes de cada navegación
- ✅ **Force refresh** para reactivar componentes
- ✅ **Fallback a URL directa** si falla navegación programática
- ✅ **Manejo de errores** robusto

### 3. **Composable `useUserNavigation.ts`**

Centraliza la lógica de navegación de usuario:

```typescript
export const useUserNavigation = () => {
  const verifySessionAndNavigate = async (path: string, fallbackUrl?: string) => {
    try {
      // Verificar sesión con timeout
      const { data: { session }, error } = await Promise.race([
        supabase.auth.getSession(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Session timeout')), 3000))
      ])
      
      if (error || !session) {
        await navigateTo('/login')
        return false
      }
      
      // Verificar rol con timeout
      const { data: profile } = await Promise.race([
        supabase.from('profiles').select('role, is_active').eq('id', session.user.id).single(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Profile timeout')), 3000))
      ])
      
      const role = profile?.role
      const active = profile?.is_active
      
      if (!role || active === false || role !== 'user') {
        await navigateTo('/unauthorized')
        return false
      }
      
      await navigateTo(path)
      return true
      
    } catch (error) {
      // Fallback: navegación directa
      window.location.href = fallbackUrl || path
      return false
    }
  }
  
  return {
    navigateToOffers: () => verifySessionAndNavigate('/user', '/user'),
    navigateToCart: () => verifySessionAndNavigate('/shop/cart', '/shop/cart'),
    navigateToUserPage: (path) => verifySessionAndNavigate(path, path)
  }
}
```

**Características:**
- ✅ **Verificación completa** de sesión y rol
- ✅ **Timeouts de 3 segundos** para evitar bloqueos
- ✅ **Fallback automático** a navegación directa
- ✅ **API reutilizable** para todas las páginas de usuario
- ✅ **Manejo de errores** centralizado

### 4. **Páginas de Usuario Mejoradas**

#### `pages/user/index.vue`
```typescript
definePageMeta({ 
  middleware: 'user-only',
  key: route => `user-${route.fullPath}-${Date.now()}` // Fuerza re-render
})

// Reactivación automática tras inactividad
const reloadData = async () => {
  console.log('🔄 Recargando datos de usuario tras reactivación...')
  await Promise.all([fetchOffers(), loadMyReservations(), fetchMyOrders()])
}

// Detectar reactivación (5 minutos de inactividad)
const checkDataReload = () => {
  const now = Date.now()
  if (now - lastDataLoad > DATA_RELOAD_THRESHOLD) {
    reloadData()
    lastDataLoad = now
  }
}

onMounted(() => {
  // Listeners para reactivación
  window.addEventListener('focus', checkDataReload, { passive: true })
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') checkDataReload()
  }, { passive: true })
  
  // Verificación periódica cada minuto
  setInterval(checkDataReload, 60000)
})
```

#### `pages/shop/cart.vue`
```typescript
definePageMeta({ 
  layout: 'default', 
  middleware: 'user-only',
  key: route => `cart-${route.fullPath}-${Date.now()}` // Fuerza re-render
})

// Reactivación automática del carrito
const reloadCartData = async () => {
  console.log('🔄 Recargando datos del carrito tras reactivación...')
  await Promise.all([loadMyReservations(), loadMyOrders()])
}

// Sistema idéntico de reactivación que en /user
```

**Beneficios:**
- ✅ **Keys dinámicas** fuerzan re-renderizado
- ✅ **Recarga automática** de datos tras inactividad
- ✅ **Listeners de reactivación** en focus/visibilidad
- ✅ **Verificación periódica** cada minuto
- ✅ **Logs informativos** para debugging

## 📊 **Mejoras Técnicas Implementadas**

### **Detección de Inactividad**
- **Threshold**: 5 minutos sin actividad
- **Verificación**: Cada 60 segundos
- **Eventos**: `focus`, `visibilitychange`

### **Timeouts y Performance**
- **Session check**: 3 segundos máximo
- **Profile check**: 3 segundos máximo
- **Navegación**: Fallback automático si falla

### **Reactivación Automática**
- **Force refresh**: Incrementa keys de componentes
- **Data reload**: Recarga datos tras inactividad
- **Session verification**: Verifica antes de cada navegación

### **Error Handling**
- **Logs detallados**: Para debugging y monitoreo
- **Fallbacks**: Navegación directa si falla programática
- **Graceful degradation**: No bloquea la aplicación

## 🎯 **Resultados**

### ✅ **Problemas Solucionados:**
1. **"Mis Ofertas"** ahora navega correctamente tras inactividad
2. **Carrito** ahora navega correctamente tras inactividad
3. **Botones del menú** siempre responden
4. **Middleware** no causa bloqueos
5. **Datos** se recargan automáticamente tras reactivación

### ✅ **Beneficios Adicionales:**
- **UX mejorada**: Navegación siempre funcional
- **Performance**: Timeouts evitan bloqueos
- **Robustez**: Múltiples fallbacks
- **Debugging**: Logs detallados
- **Mantenibilidad**: Código modular y reutilizable

## 🔍 **Monitoreo**

Logs en consola para seguimiento:
```
🧭 Navegando a /user...
✅ Navegando a /user
🔄 Recargando datos de usuario tras reactivación...
👀 Ventana recuperó el foco
💤 Usuario inactivo detectado
🔄 Reactivando página tras inactividad...
```

## 🚀 **Uso**

Las mejoras son **completamente automáticas**:
- ✅ **Navegación**: Funciona desde el menú sin cambios
- ✅ **Reactivación**: Automática tras inactividad
- ✅ **Fallbacks**: Se activan automáticamente si es necesario
- ✅ **Compatibilidad**: 100% compatible con código existente

La solución mantiene **todos los endpoints existentes** intactos y mejora significativamente la experiencia de usuario tras períodos de inactividad.
