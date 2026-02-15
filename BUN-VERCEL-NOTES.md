# 🍞 Notas sobre Bun en Vercel

## Configuración Actual

Este proyecto usa **Bun** como gestor de paquetes. El archivo `vercel.json` está configurado para usar bun:

```json
{
  "buildCommand": "bun run build",
  "devCommand": "bun run dev",
  "installCommand": "bun install",
  "framework": "nuxtjs"
}
```

## ✅ Vercel Soporta Bun

Vercel tiene soporte nativo para Bun desde 2023. No necesitas configuración adicional.

## 🔧 Verificación en Vercel Dashboard

En **Settings** → **General**, verifica que:

- **Install Command**: `bun install` (no `npm install`)
- **Build Command**: `bun run build` (no `npm run build`)

Si Vercel detecta automáticamente `bun.lockb` o `bun.lock`, debería usar bun automáticamente, pero el `vercel.json` lo fuerza explícitamente.

## 📝 Notas Importantes

1. **Bun es más rápido**: Las instalaciones y builds son significativamente más rápidos que npm
2. **Compatibilidad**: Bun es compatible con la mayoría de paquetes de npm
3. **Lock file**: Si usas `bun.lockb`, asegúrate de que esté en el repositorio (no en .gitignore)

## 🚨 Si el Build Falla

Si Vercel no reconoce bun:

1. Verifica que `vercel.json` esté en el repositorio
2. En Vercel Dashboard, verifica que los comandos sean `bun install` y `bun run build`
3. Si es necesario, cambia manualmente en **Settings** → **General**

## 🔄 Alternativa: Usar npm

Si por alguna razón necesitas usar npm en Vercel (aunque bun funciona bien):

1. Elimina `vercel.json`
2. Vercel detectará automáticamente npm
3. O crea `vercel.json` con comandos de npm

Pero **no es necesario** - bun funciona perfectamente en Vercel.

