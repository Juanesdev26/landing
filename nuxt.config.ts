// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  // Configuración básica
  ssr: true,
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },
  
  // Módulos principales
  modules: [
    "@nuxt/ui",
    "@pinia/nuxt",
    "@nuxtjs/supabase"
  ],
  
  // Configuración de Supabase
  supabase: {
    // Usa variables de entorno para URL y KEY. No exponer serviceKey en cliente.
    url: process.env.NUXT_SUPABASE_URL,
    key: process.env.NUXT_SUPABASE_KEY,
    redirect: true,
    redirectOptions: {
      login: '/login',
      callback: '/callback',
      exclude: ['/', '/about', '/shop', '/shop/*']
    },
    clientOptions: {
      auth: {
        flowType: "pkce",
        detectSessionInUrl: true,
        autoRefreshToken: true,
        persistSession: true
      },
    }
  },
  
  // CSS y estilos
  css: ["~/assets/css/main.css"],
  
  // Componentes
  components: [
    { path: "~/components", pathPrefix: false }
  ],
  
  // Configuración experimental (revertida a valores seguros)
  experimental: {
    payloadExtraction: true, // Necesario para hidratación correcta
    renderJsonPayloads: true,
    inlineSSRStyles: true, // Evita FOUC
  },

  // Configuración de build
  build: {
    transpile: ["vue-chartjs", "@iconify/utils"],
  },
  
  // Configuración de Nitro
  nitro: {
    preset: 'vercel',
    compressPublicAssets: true,
    routeRules: {
      '/api/**': { headers: { 'cache-control': 's-maxage=60' } },
      '/_nuxt/**': { headers: { 'cache-control': 'max-age=31536000' } },
      // Prerenderizado desactivado temporalmente
      '/': { prerender: false }, 
      '/shop': { prerender: false },
      '/about': { prerender: false }
    }
  },
  
  // Configuración de Vite (simplificada para estabilidad)
  vite: {
    optimizeDeps: {
      include: ['vue-chartjs', 'chart.js', 'vue', '@vue/runtime-core', '@vue/runtime-dom']
    },
    // Eliminamos optimizaciones agresivas de build/chunking que pueden romper la app
    build: {
      sourcemap: false, // Opcional: poner en true si necesitas depurar en producción
    }
  }
})
