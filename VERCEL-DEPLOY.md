# 🚀 Guía de Despliegue en Vercel

Esta guía te ayudará a desplegar tu proyecto BylotoStore en Vercel correctamente.

## 📋 Prerrequisitos

1. Cuenta en [Vercel](https://vercel.com)
2. Repositorio en GitHub (o GitLab/Bitbucket)
3. Variables de entorno configuradas

## 🔧 Configuración en Vercel

### Paso 1: Conectar el Repositorio

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Click en **"Add New Project"**
3. Selecciona tu repositorio `landing`
4. Vercel detectará automáticamente que es un proyecto Nuxt.js

### Paso 2: Configurar Variables de Entorno

En la configuración del proyecto, agrega las siguientes variables de entorno:

#### Variables Requeridas:

```env
# Supabase
NUXT_SUPABASE_URL=https://tu-proyecto.supabase.co
NUXT_SUPABASE_KEY=tu_anon_key_aqui
NUXT_SUPABASE_SERVICE_KEY=tu_service_key_aqui

# MercadoPago
MERCADOPAGO_ACCESS_TOKEN=APP-USR-tu_access_token_aqui

# Site URL (IMPORTANTE: Usa tu dominio de Vercel o dominio personalizado)
NUXT_PUBLIC_SITE_URL=https://tu-proyecto.vercel.app
```

#### Cómo Agregar Variables:

1. En la configuración del proyecto, ve a **"Settings"** → **"Environment Variables"**
2. Agrega cada variable una por una
3. Selecciona los ambientes donde aplicará (Production, Preview, Development)
4. Guarda los cambios

### Paso 3: Configuración del Build

Vercel detectará automáticamente:
- **Framework Preset**: Nuxt.js
- **Build Command**: `npm run build`
- **Output Directory**: `.output` (automático con Nitro preset 'vercel')
- **Install Command**: `npm install`

No necesitas cambiar nada, pero puedes verificar en **"Settings"** → **"General"**

### Paso 4: Desplegar

1. Click en **"Deploy"**
2. Espera a que el build termine
3. Tu aplicación estará disponible en `https://tu-proyecto.vercel.app`

## 🔍 Verificación Post-Despliegue

### 1. Verificar que el Build Funciona

- El build debe completarse sin errores
- No debe aparecer el error: `Config file was not found at "/vercel/path0/.vercel/output/config.json"`

### 2. Verificar Variables de Entorno

En los logs del build, verifica que:
- Las variables de entorno estén disponibles
- No haya errores de configuración

### 3. Probar la Aplicación

1. Visita tu URL de Vercel
2. Verifica que la página de inicio carga
3. Prueba el login
4. Verifica que las APIs funcionan

## 🐛 Solución de Problemas

### Error: "Config file was not found"

**Causa**: Vercel está intentando usar prebuilt artifacts que no existen.

**Solución**: 
- Asegúrate de que `nuxt.config.ts` tenga `nitro.preset: 'vercel'`
- No debe haber un folder `.vercel` en el repositorio (está en .gitignore)
- El build debe ejecutarse desde cero

### Error: Variables de Entorno no encontradas

**Causa**: Variables de entorno no configuradas en Vercel.

**Solución**:
- Verifica que todas las variables estén en Vercel Dashboard
- Asegúrate de que `NUXT_PUBLIC_SITE_URL` apunte a tu dominio de Vercel
- Reinicia el deployment después de agregar variables

### Error: Build falla

**Causa**: Dependencias o errores de TypeScript.

**Solución**:
- Verifica los logs del build en Vercel
- Asegúrate de que `npm install` funciona localmente
- Verifica que no hay errores de TypeScript: `npm run build` localmente

### Error: API Routes no funcionan

**Causa**: Variables de entorno del servidor no configuradas.

**Solución**:
- Verifica que `NUXT_SUPABASE_SERVICE_KEY` esté configurada
- Verifica que `MERCADOPAGO_ACCESS_TOKEN` esté configurada
- Asegúrate de que las variables estén disponibles en el ambiente de producción

## 📝 Notas Importantes

1. **NUXT_PUBLIC_SITE_URL**: Debe ser tu URL de producción (ej: `https://tu-proyecto.vercel.app`)
2. **Webhooks de MercadoPago**: Configura el webhook en MercadoPago apuntando a `https://tu-proyecto.vercel.app/api/mercadopago/webhook`
3. **Supabase Redirects**: Asegúrate de que las URLs de callback en Supabase apunten a tu dominio de Vercel
4. **HTTPS**: Vercel proporciona HTTPS automáticamente

## 🔄 Actualizaciones Futuras

Cada vez que hagas push a la rama `main` (o la rama configurada), Vercel:
1. Detectará los cambios automáticamente
2. Ejecutará un nuevo build
3. Desplegará la nueva versión
4. Te notificará del resultado

## 📚 Recursos Adicionales

- [Documentación de Nuxt en Vercel](https://nuxt.com/docs/getting-started/deployment#vercel)
- [Documentación de Vercel](https://vercel.com/docs)
- [Variables de Entorno en Vercel](https://vercel.com/docs/concepts/projects/environment-variables)

---

**¡Listo!** Tu aplicación debería estar funcionando en Vercel. 🎉

