# Solución al Problema de Inactividad de Botones

## Problema Identificado

Los botones del menú y panel dejaban de funcionar después de períodos de inactividad. Esto se debía a varios factores:

1. **Cache agresivo de páginas**: Nuxt cachea componentes y páginas, causando que se "congelen" tras inactividad
2. **Verificaciones de sesión bloqueantes**: Los plugins de autenticación podían causar bloqueos
3. **Falta de reactivación**: No había mecanismos para reactivar la UI tras períodos de inactividad

## Soluciones Implementadas

### 1. Configuración de Nuxt (`nuxt.config.ts`)

```typescript
// Deshabilitamos cache agresivo
render: {
  bundleRenderer: {
    shouldPreload: () => false,
    shouldPrefetch: () => false
  }
},
app: {
  keepalive: false // Evita mantener componentes en cache
}
```

### 2. Plugin de Reactivación (`plugins/page-reactivation.client.ts`)

- **Detección de inactividad**: Monitorea actividad del usuario (5 min timeout)
- **Heartbeat**: Mantiene sesión activa con verificaciones periódicas (30 seg)
- **Reactivación automática**: Fuerza re-render cuando se detecta inactividad
- **Eventos de foco**: Reacciona a cambios de ventana y visibilidad

### 3. Mejoras en Session Focus (`plugins/session-focus.client.ts`)

- **Throttling**: Evita verificaciones múltiples simultáneas (2 seg cooldown)
- **Error handling**: Manejo robusto de errores de sesión
- **Eventos pasivos**: Mejor rendimiento en listeners

### 4. Layouts Mejorados (`layouts/admin.vue`, `layouts/default.vue`)

```vue
<!-- Fuerza re-render con key dinámica -->
<main :key="`${$route.fullPath}-${refreshKey}`">
  <slot />
</main>
```

- **RefreshKey dinámica**: Fuerza re-renderizado cuando es necesario
- **Detección de actividad**: Monitorea interacciones del usuario
- **Auto-refresh**: Incrementa key tras inactividad o eventos de foco

### 5. Composable useAuth Optimizado (`composables/useAuth.ts`)

- **Timeouts**: Evita bloqueos con timeouts de 5 segundos
- **Promise.race**: Cancela operaciones que toman demasiado tiempo
- **Error resilience**: Mejor manejo de errores de red/base de datos

### 6. Composable de Reactivación (`composables/usePageReactivation.ts`)

Centraliza la lógica de reactivación para reutilización:

```typescript
const { refreshKey, forceRefresh, initializeListeners } = usePageReactivation()
```

## Características Técnicas

### Detección de Inactividad
- **Timeout**: 5 minutos sin actividad
- **Eventos monitoreados**: click, mousemove, keydown, scroll, touchstart
- **Verificación**: Cada 60 segundos

### Reactivación Automática
- **Focus events**: window.focus, document.visibilitychange
- **Force refresh**: Incrementa key de componentes
- **Session check**: Verifica estado de autenticación

### Heartbeat System
- **Interval**: 30 segundos
- **Smart**: Solo cuando usuario está activo
- **Lightweight**: Solo verifica sesión, no hace queries pesadas

## Beneficios

1. **UI Siempre Responsiva**: Los botones nunca se "congelan"
2. **Mejor UX**: Reactivación transparente para el usuario
3. **Sesión Activa**: Mantiene autenticación durante uso
4. **Performance**: Optimizaciones para evitar bloqueos
5. **Robustez**: Manejo de errores y timeouts

## Uso

Las mejoras son automáticas. No requieren cambios en código existente:

- ✅ **Layouts**: Auto-detectan inactividad y se refrescan
- ✅ **Plugins**: Se ejecutan automáticamente al cargar
- ✅ **Composables**: Disponibles para uso manual si es necesario

## Monitoreo

Logs en consola para debugging:

```
🚀 Plugin de reactivación de páginas iniciado
💤 Usuario inactivo detectado
🔄 Reactivando página tras inactividad...
👀 Ventana recuperó el foco
✅ Página reactivada correctamente
```

## Compatibilidad

- ✅ **Server-side rendering**: Funciona en SSR
- ✅ **Client-side navigation**: Compatible con SPA mode
- ✅ **Mobile devices**: Responsive a touch events
- ✅ **Supabase Auth**: Integrado con sistema de autenticación
- ✅ **Todos los endpoints**: No afecta APIs existentes

## Configuración Avanzada

Si necesitas ajustar los timeouts:

```typescript
// En plugins/page-reactivation.client.ts
const INACTIVITY_TIMEOUT = 10 * 60 * 1000 // 10 minutos
const HEARTBEAT_INTERVAL = 60 * 1000      // 1 minuto
```

La solución es completamente modular y no interfiere con el funcionamiento normal de la aplicación.
