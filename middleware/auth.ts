/**
 * Middleware de autenticación
 * Sistema adaptado para usar profiles + auth.users de Supabase
 */
import type { RouteLocationNormalized } from 'vue-router'

// Este middleware ya no se utiliza. La verificación se realiza por SSR y middlewares específicos de rol.
export default defineNuxtRouteMiddleware((_to: RouteLocationNormalized) => {
  return
})
