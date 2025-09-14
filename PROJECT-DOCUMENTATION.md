# 📚 Documentación Completa del Proyecto - Mi E-commerce Femenino

## 🎯 **Resumen del Proyecto**

**Mi E-commerce Femenino** es una aplicación web moderna construida con **Nuxt.js 3** que ofrece una plataforma completa de comercio electrónico especializada en productos femeninos. La aplicación incluye gestión de inventario, sistema de pedidos, autenticación de usuarios, panel administrativo y integración con MercadoPago para pagos.

---

## 🏗️ **Arquitectura General**

### **Stack Tecnológico:**
- **Frontend**: Nuxt.js 3 + Vue.js 3 + TypeScript
- **Backend**: Nuxt.js Server API + Supabase
- **Base de Datos**: Supabase (PostgreSQL)
- **Autenticación**: Supabase Auth
- **Estado**: Pinia
- **Estilos**: Tailwind CSS + Nuxt UI
- **Pagos**: MercadoPago
- **Iconos**: Iconify
- **Gráficos**: Chart.js + Vue-ChartJS

---

## 📁 **Estructura Detallada de Carpetas**

### **📂 Raíz del Proyecto**
```
landing/
├── 📄 app.config.ts          # Configuración de la aplicación
├── 📄 app.vue               # Componente raíz de la aplicación
├── 📄 error.vue             # Página de error personalizada
├── 📄 nuxt.config.ts        # Configuración principal de Nuxt
├── 📄 package.json          # Dependencias y scripts
├── 📄 tailwind.config.ts    # Configuración de Tailwind CSS
├── 📄 tsconfig.json         # Configuración de TypeScript
├── 📄 Dockerfile            # Configuración para Docker
└── 📄 README.md             # Documentación básica
```

### **📂 assets/** - Recursos Estáticos
```
assets/
└── css/
    ├── main.css             # Estilos principales (importa Tailwind)
    └── theme.css            # Variables CSS para temas claro/oscuro
```

### **📂 components/** - Componentes Vue
```
components/
├── admin/                   # Componentes del panel administrativo
│   ├── categories/          # Gestión de categorías
│   │   ├── CategoryAddModal.vue
│   │   ├── CategoryDeleteModal.vue
│   │   └── CategoryModal.vue
│   ├── customers/           # Gestión de clientes
│   │   └── CustomerModal.vue
│   ├── inventory/           # Gestión de inventario
│   │   ├── MovementsHistoryModal.vue
│   │   └── StockAdjustmentModal.vue
│   ├── orders/              # Gestión de pedidos
│   │   ├── OrderModal.vue
│   │   ├── PaymentUpdateModal.vue
│   │   └── StatusUpdateModal.vue
│   ├── products/            # Gestión de productos
│   │   ├── ProductAddModal.vue
│   │   ├── ProductDeleteModal.vue
│   │   ├── ProductModal.vue
│   │   └── ProductPickerDrawer.vue
│   ├── profiles/            # Gestión de perfiles
│   │   ├── UserDeleteModal.vue
│   │   └── UserModal.vue
│   └── providers/           # Gestión de proveedores
│       ├── ProviderDeleteModal.vue
│       └── ProviderModal.vue
├── checkout/                # Componentes de checkout
│   └── MercadoPagoModal.vue # Modal de pago con MercadoPago
├── common/                  # Componentes comunes
│   ├── ConfirmModal.vue     # Modal de confirmación
│   ├── DonutRing.vue        # Gráfico de dona
│   ├── Toast.vue            # Notificaciones toast
│   └── VirtualList.vue      # Lista virtual para rendimiento
└── TailwindTest.vue         # Componente de prueba
```

### **📂 composables/** - Lógica Reutilizable
```
composables/
├── useAddIntent.ts          # Manejo de intenciones de compra
├── useAuth.ts               # Autenticación y sesiones
├── useCurrency.ts           # Formateo de moneda (COP)
├── useLazyImage.ts          # Carga perezosa de imágenes
├── usePageReactivation.ts   # Reactivación de páginas
├── useSimpleCache.ts        # Cache simple para API
├── useTheme.ts              # Gestión de temas claro/oscuro
├── useUserNavigation.ts     # Navegación de usuario
├── useUserRole.ts           # Gestión de roles de usuario
└── useVirtualScroll.ts      # Scroll virtual para listas grandes
```

### **📂 layouts/** - Layouts de Página
```
layouts/
├── admin.vue                # Layout para páginas administrativas
└── default.vue              # Layout por defecto para usuarios
```

### **📂 middleware/** - Middleware de Rutas
```
middleware/
├── admin.global.ts          # Middleware global para admin
├── auth.ts                  # Middleware de autenticación
├── require-auth.global.ts   # Middleware global de autenticación
└── user-only.ts             # Middleware solo para usuarios
```

### **📂 pages/** - Páginas de la Aplicación
```
pages/
├── about.vue                # Página "Acerca de"
├── dashboard.vue            # Dashboard principal
├── index.vue                # Página de inicio (landing)
├── login.vue                # Página de login
├── unauthorized.vue         # Página de acceso no autorizado
├── admin/                   # Páginas administrativas
│   ├── index.vue            # Dashboard admin
│   ├── categories/
│   │   └── index.vue        # Gestión de categorías
│   ├── customers/
│   │   └── index.vue        # Gestión de clientes
│   ├── inventory/
│   │   └── index.vue        # Gestión de inventario
│   ├── offers/
│   │   └── index.vue        # Gestión de ofertas
│   ├── orders/
│   │   └── index.vue        # Gestión de pedidos
│   ├── products/
│   │   └── index.vue        # Gestión de productos
│   ├── profiles/
│   │   └── index.vue        # Gestión de perfiles
│   └── providers/
│       └── index.vue        # Gestión de proveedores
├── checkout/                # Páginas de checkout
│   ├── pending.vue          # Pago pendiente
│   └── success.vue          # Pago exitoso
├── orders/
│   └── [id].vue             # Detalle de pedido específico
├── shop/                    # Páginas de tienda
│   ├── cart.vue             # Carrito de compras
│   ├── index.vue            # Catálogo de productos
│   └── category/
│       └── [id].vue         # Productos por categoría
└── user/                    # Páginas de usuario
    ├── index.vue            # Perfil de usuario
    └── orders.vue           # Historial de pedidos
```

### **📂 plugins/** - Plugins de Nuxt
```
plugins/
├── api-error-handler.client.ts    # Manejo de errores de API
├── auth.client.ts                 # Plugin de autenticación
├── cart-persist.client.ts         # Persistencia del carrito
├── console-filter.client.ts       # Filtro de consola
├── global-error.client.ts         # Manejo global de errores
├── image-optimizer.client.ts      # Optimización de imágenes
├── page-preloader.client.ts       # Precarga de páginas
├── page-reactivation.client.ts    # Reactivación de páginas
├── performance-optimizer.client.ts # Optimizaciones de rendimiento
├── resource-optimizer.client.ts   # Optimización de recursos
├── resource-preloader.client.ts   # Precarga de recursos
├── router-guard.client.ts         # Guard de rutas
├── session-focus.client.ts        # Manejo de sesión en foco
├── session-killer.client.ts       # Limpieza de sesión
├── smart-lazy-loading.client.ts   # Carga perezosa inteligente
├── supabase-check.client.ts       # Verificación de Supabase
└── toast.client.ts                # Sistema de notificaciones
```

### **📂 public/** - Archivos Públicos
```
public/
├── favicon.ico              # Icono de la aplicación
└── robots.txt               # Configuración para robots
```

### **📂 server/** - API del Servidor
```
server/
├── api/                     # Endpoints de API
│   ├── activity/
│   │   └── recent.ts        # Actividad reciente
│   ├── auth/
│   │   └── upsert-profile.ts # Crear/actualizar perfil
│   ├── categories/          # API de categorías
│   │   ├── [id]/
│   │   │   └── [1 file]
│   │   ├── [id].ts
│   │   └── index.ts
│   ├── customers/           # API de clientes
│   │   ├── [id]/
│   │   │   └── [1 file]
│   │   ├── [id].ts
│   │   ├── index.ts
│   │   ├── my.ts
│   │   └── stats.ts
│   ├── dashboard/
│   │   └── index.ts         # Estadísticas del dashboard
│   ├── inventory/           # API de inventario
│   │   ├── adjustments/
│   │   │   └── index.ts
│   │   ├── index.ts
│   │   └── movements/
│   │       └── [1 file]
│   ├── mercadopago/         # API de MercadoPago
│   │   ├── create-preference.ts
│   │   └── webhook.ts
│   ├── offers/              # API de ofertas
│   │   ├── [id].ts
│   │   ├── active.ts
│   │   ├── index.ts
│   │   └── latest.ts
│   ├── orders/              # API de pedidos
│   │   ├── [id]/
│   │   │   └── [3 files]
│   │   ├── [id].ts
│   │   ├── create-from-customer.ts
│   │   ├── create-from-user.ts
│   │   ├── index.ts
│   │   ├── my.ts
│   │   ├── recent.ts
│   │   ├── stats.ts
│   │   ├── summary.ts
│   │   └── weekly.ts
│   ├── products/            # API de productos
│   │   └── [5 files]
│   ├── profiles/            # API de perfiles
│   │   ├── [id]/
│   │   │   └── [1 file]
│   │   ├── [id].ts
│   │   └── index.ts
│   ├── providers/           # API de proveedores
│   │   └── [3 files]
│   ├── reservations/        # API de reservas
│   │   └── [6 files]
│   ├── stripe/              # API de Stripe (no usado)
│   └── user-offers/         # API de ofertas de usuario
│       └── [3 files]
├── middleware/
│   └── require-auth.ts      # Middleware de autenticación del servidor
├── sql/                     # Scripts SQL
│   ├── 001_roles_offers_orders.sql
│   └── 002_inventory_movements_enhancements.sql
├── tsconfig.json            # Configuración TypeScript del servidor
└── utils/
    └── auth.ts              # Utilidades de autenticación
```

### **📂 stores/** - Estado Global (Pinia)
```
stores/
└── cart.ts                  # Store del carrito de compras
```

### **📂 types/** - Definiciones de TypeScript
```
types/
├── global.d.ts              # Tipos globales
├── nuxt.d.ts                # Tipos de Nuxt
├── product.ts               # Tipos de productos
├── shims-vue.d.ts           # Shims de Vue
└── types.d.ts               # Tipos generales
```

### **📂 utils/** - Utilidades
```
utils/
└── dateUtils.ts             # Utilidades de fechas
```

### **📂 scripts/** - Scripts de Automatización
```
scripts/
├── fix-nuxt-tsconfig.mjs    # Script para arreglar tsconfig
└── watch-fix-nuxt-tsconfig.mjs # Script de monitoreo
```

---

## 🔧 **Configuración y Variables de Entorno**

### **Variables de Entorno Requeridas (.env):**
```env
# Supabase
NUXT_SUPABASE_URL=https://tu-proyecto.supabase.co
NUXT_SUPABASE_KEY=tu_anon_key_aqui
NUXT_SUPABASE_SERVICE_KEY=tu_service_key_aqui

# MercadoPago
MERCADOPAGO_ACCESS_TOKEN=APP-USR-tu_access_token_aqui
NUXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## 🚀 **Scripts Disponibles**

```json
{
  "dev": "nuxi dev",                    # Servidor de desarrollo
  "build": "nuxi build",               # Construcción para producción
  "generate": "nuxi generate",         # Generación estática
  "preview": "nuxi preview",           # Vista previa de producción
  "predev": "node scripts/fix-nuxt-tsconfig.mjs",
  "postinstall": "nuxi prepare && node scripts/fix-nuxt-tsconfig.mjs",
  "prepare": "nuxi prepare && node scripts/fix-nuxt-tsconfig.mjs"
}
```

---

## 🎨 **Sistema de Temas**

### **Temas Disponibles:**
- **Tema Claro**: Colores suaves y claros
- **Tema Oscuro**: Colores oscuros y elegantes

### **Archivos de Tema:**
- `assets/css/theme.css` - Variables CSS para temas
- `composables/useTheme.ts` - Lógica de cambio de tema
- `layouts/default.vue` - Toggle de tema en header

---

## 💳 **Sistema de Pagos**

### **MercadoPago Integration:**
- **Modal de Checkout**: `components/checkout/MercadoPagoModal.vue`
- **API de Preferencias**: `server/api/mercadopago/create-preference.ts`
- **Webhook**: `server/api/mercadopago/webhook.ts`
- **Páginas de Confirmación**: `pages/checkout/success.vue`, `pages/checkout/pending.vue`

---

## 🔐 **Sistema de Autenticación**

### **Roles de Usuario:**
- **admin**: Acceso completo al panel administrativo
- **user**: Acceso a funciones de usuario
- **customer**: Cliente con permisos limitados

### **Middleware de Protección:**
- `admin.global.ts` - Protege rutas administrativas
- `user-only.ts` - Solo usuarios autenticados
- `require-auth.global.ts` - Autenticación global

---

## 📊 **Funcionalidades Principales**

### **Para Usuarios:**
- ✅ Navegación por categorías
- ✅ Carrito de compras persistente
- ✅ Sistema de pedidos
- ✅ Pago con MercadoPago
- ✅ Historial de pedidos
- ✅ Perfil de usuario

### **Para Administradores:**
- ✅ Dashboard con estadísticas
- ✅ Gestión de productos
- ✅ Gestión de categorías
- ✅ Gestión de clientes
- ✅ Gestión de pedidos
- ✅ Control de inventario
- ✅ Gestión de ofertas
- ✅ Gestión de proveedores

---

## 🎯 **Optimizaciones de Rendimiento**

### **Implementadas:**
- ✅ Lazy loading de imágenes
- ✅ Cache de API con TTL
- ✅ Virtual scrolling para listas grandes
- ✅ Precarga de recursos críticos
- ✅ Optimización de bundles
- ✅ Compresión de assets
- ✅ Cache agresivo en Nitro

---

## 📱 **Responsive Design**

- ✅ Mobile-first approach
- ✅ Breakpoints de Tailwind CSS
- ✅ Componentes adaptativos
- ✅ Navegación móvil optimizada

---

## 🔧 **Mantenimiento y Desarrollo**

### **Para Desarrolladores:**
1. **Instalación**: `npm install`
2. **Desarrollo**: `npm run dev`
3. **Build**: `npm run build`
4. **Preview**: `npm run preview`

### **Configuración Inicial:**
1. Configurar variables de entorno
2. Configurar Supabase
3. Configurar MercadoPago
4. Ejecutar scripts SQL en Supabase

---

## 📚 **Documentación Adicional**

- `MERCADOPAGO-SETUP.md` - Configuración de MercadoPago
- `PERFORMANCE-OPTIMIZATIONS.md` - Optimizaciones implementadas
- `INACTIVITY-FIX-README.md` - Fixes de inactividad
- `USER-NAVIGATION-FIX-README.md` - Fixes de navegación

---

## 🎉 **Estado del Proyecto**

**✅ COMPLETAMENTE FUNCIONAL**
- Sistema de e-commerce completo
- Integración de pagos con MercadoPago
- Panel administrativo completo
- Sistema de autenticación robusto
- Optimizaciones de rendimiento
- Temas claro/oscuro
- Responsive design

**🚀 LISTO PARA PRODUCCIÓN**
