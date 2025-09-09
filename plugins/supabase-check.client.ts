export default defineNuxtPlugin(() => {
  if (process.client) {
    // Evitar spam de logs en producción
    if (import.meta.env.DEV) console.log('🔍 Verificando configuración de Supabase...')
    
    const supabase = useSupabaseClient<any>()
    
    if (supabase) {
      if (import.meta.env.DEV) console.log('✅ Cliente Supabase encontrado')
      // Evitar acceder a propiedades protegidas para no romper tipos
      const configInfo = {
        hasAuth: Boolean((supabase as any).auth),
        hasFrom: Boolean((supabase as any).from)
      }
      if (import.meta.env.DEV) console.log('🔧 Configuración:', configInfo)
    } else {
      if (import.meta.env.DEV) {
        console.error('❌ Cliente Supabase no encontrado')
        console.error('🔧 Variables de entorno necesarias:')
        console.error('- NUXT_SUPABASE_URL')
        console.error('- NUXT_SUPABASE_KEY')
        console.error('- NUXT_SUPABASE_SERVICE_KEY')
      }
    }
  }
})

