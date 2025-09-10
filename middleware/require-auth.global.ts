import type { RouteLocationNormalized } from 'vue-router'

// Simplificado: la verificación de sesión global se maneja en `server/middleware/require-auth.ts`.
export default defineNuxtRouteMiddleware((_to: RouteLocationNormalized) => { return })


