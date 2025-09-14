# 💳 Configuración de MercadoPago - Guía Súper Simple

## 🚀 **¡Implementación Completa con MercadoPago!**

He implementado un sistema de pago **súper sencillo** usando MercadoPago que es perfecto para Colombia.

### ✅ **Lo que se ha Implementado:**

1. **💳 Pago con MercadoPago**
   - Integración directa y simple
   - Acepta tarjetas, PSE, Nequi, Daviplata
   - Sin configuración compleja de webhooks

2. **🛒 Modal de Checkout Elegante**
   - Formulario de envío integrado
   - Resumen del pedido
   - Redirección automática a MercadoPago

3. **📱 Páginas de Confirmación**
   - Página de éxito
   - Página de pago pendiente
   - Navegación intuitiva

4. **🔄 Estados Automáticos**
   - `pending` → `paid` (automático)
   - Admin puede confirmar pedidos
   - Stock se descuenta al confirmar

---

## ⚙️ **Configuración Súper Fácil (5 minutos)**

### **Paso 1: Crear Cuenta en MercadoPago**
1. Ve a [https://www.mercadopago.com.co](https://www.mercadopago.com.co)
2. Crea una cuenta gratuita
3. Ve a **"Desarrolladores"** en el menú

### **Paso 2: Obtener las Claves**
1. En **"Credenciales"** encontrarás:
   - **Access Token** (empieza con `APP-`)
   - **Public Key** (empieza con `APP-`)

### **Paso 3: Configurar tu .env**
Agrega estas líneas a tu archivo `.env`:

```env
# MercadoPago Configuration
MERCADOPAGO_ACCESS_TOKEN=APP-USR-tu_access_token_aqui
NUXT_PUBLIC_SITE_URL=http://localhost:3000
```

### **Paso 4: ¡Listo!**
- No necesitas configurar webhooks complicados
- No necesitas certificados SSL para desarrollo
- Todo funciona automáticamente

---

## 🧪 **Probar el Sistema**

### **Tarjetas de Prueba:**
- **✅ Éxito**: `4009 1756 5356 7430`
- **❌ Fallido**: `4000 0000 0000 0002`
- **⏳ Pendiente**: `4000 0000 0000 0127`

### **Flujo de Prueba:**
1. Agrega productos al carrito
2. Click en "Proceder al Pago"
3. Completa información de envío
4. Click en "Pagar"
5. Te redirige a MercadoPago
6. Usa una tarjeta de prueba
7. ¡Listo!

---

## 🎯 **Ventajas de MercadoPago:**

✅ **Más fácil que Stripe** - Sin configuración compleja
✅ **Popular en Colombia** - Los usuarios lo conocen
✅ **Acepta PSE** - Ideal para usuarios colombianos
✅ **Nequi y Daviplata** - Métodos de pago populares
✅ **Sin webhooks complicados** - Todo automático
✅ **Gratis para empezar** - Sin costos iniciales

---

## 📁 **Archivos Creados:**

- `server/api/mercadopago/create-preference.ts` - Crear preferencia de pago
- `server/api/mercadopago/webhook.ts` - Procesar notificaciones (automático)
- `components/checkout/MercadoPagoModal.vue` - Modal de checkout
- `pages/checkout/success.vue` - Página de éxito
- `pages/checkout/pending.vue` - Página de pago pendiente
- `MERCADOPAGO-SETUP.md` - Esta guía

---

## 🔧 **Configuración de Producción**

Cuando estés listo para producción:

1. **Cambia a modo Live** en MercadoPago
2. **Obtén las credenciales de producción**
3. **Actualiza tu .env** con las nuevas claves
4. **Cambia la URL** a tu dominio real

---

## 🆘 **Si Tienes Problemas:**

1. **Verifica las credenciales** en MercadoPago
2. **Revisa la consola** del navegador
3. **Verifica el .env** esté bien configurado
4. **Reinicia el servidor** después de cambiar .env

---

## 🎉 **¡Es Todo!**

**MercadoPago es mucho más simple que Stripe para Colombia. Solo necesitas:**
1. Cuenta de MercadoPago (gratis)
2. Access Token (1 línea en .env)
3. ¡Listo para recibir pagos!

**¿Necesitas ayuda con algún paso específico?** 🚀

