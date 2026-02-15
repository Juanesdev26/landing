# 🔧 Fix en Vercel Dashboard para Error de Prebuilt Artifacts

## Si el Error Persiste Después del Push

El error puede estar causado por una configuración en el Dashboard de Vercel. Sigue estos pasos:

## 📋 Pasos en Vercel Dashboard

### 1. Ir a la Configuración del Proyecto

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto `landing`
3. Ve a **Settings** → **General**

### 2. Verificar Build Settings

Asegúrate de que:

- **Framework Preset**: `Nuxt.js` (o `Other` si no aparece)
- **Build Command**: `npm run build`
- **Output Directory**: **DEBE ESTAR VACÍO** (no `.output` ni `.vercel/output`)
- **Install Command**: `npm install`
- **Root Directory**: `.` (raíz del proyecto)

### 3. Deshabilitar Build Output API (IMPORTANTE)

Si ves una opción relacionada con:
- "Use Build Output API"
- "Prebuilt artifacts"
- "Build Output"

**DESHABÍLALA** o elimínala.

### 4. Limpiar Cache y Redeploy

1. Ve a la pestaña **Deployments**
2. Encuentra el último deployment fallido
3. Click en los **3 puntos** (⋯) → **Redeploy**
4. O mejor aún, haz un **Redeploy** desde el commit más reciente

### 5. Verificar Variables de Entorno

1. Ve a **Settings** → **Environment Variables**
2. Verifica que todas estas variables estén configuradas:
   - `NUXT_SUPABASE_URL`
   - `NUXT_SUPABASE_KEY`
   - `NUXT_SUPABASE_SERVICE_KEY`
   - `MERCADOPAGO_ACCESS_TOKEN`
   - `NUXT_PUBLIC_SITE_URL` (debe ser tu URL de Vercel)

### 6. Forzar un Nuevo Build

Si nada funciona:

1. Ve a **Settings** → **General**
2. Scroll hasta abajo
3. Busca **"Clear Build Cache"** o **"Reset Build Cache"**
4. Click en **Clear** o **Reset**
5. Haz un nuevo deployment

## 🔍 Verificar en los Logs

Cuando Vercel haga el build, los logs deberían mostrar:

```
✅ Installing dependencies...
✅ Running build command: npm run build
✅ Building for Nitro preset: vercel
✅ Build completed successfully
```

**NO debería mostrar:**
```
❌ Using prebuilt build artifacts from .vercel/output
```

## 🚨 Si Nada Funciona

### Opción 1: Eliminar y Recrear el Proyecto

1. En Vercel Dashboard, elimina el proyecto actual
2. Crea un nuevo proyecto desde el mismo repositorio
3. Vercel detectará automáticamente Nuxt.js
4. Configura las variables de entorno
5. Haz el deployment

### Opción 2: Usar Vercel CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# En el directorio del proyecto
vercel --prod
```

Esto forzará un build limpio sin usar prebuilt artifacts.

## ✅ Verificación Final

Después de aplicar estos cambios, el build debería:

1. ✅ Instalar dependencias correctamente
2. ✅ Ejecutar `npm run build`
3. ✅ Generar `.output/` automáticamente
4. ✅ Desplegar sin errores

---

**Nota**: El problema de "prebuilt artifacts" generalmente ocurre cuando Vercel detecta un folder `.vercel/output/` en el repositorio o cuando hay una configuración que fuerza su uso. Ya eliminamos esos archivos del repositorio, así que el problema debe estar en la configuración del dashboard.

