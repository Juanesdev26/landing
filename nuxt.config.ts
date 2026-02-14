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
  
  // Configuración mínima para estabilidad
  experimental: {
    payloadExtraction: false,
    renderJsonPayloads: false,
    componentIslands: false,
    inlineSSRStyles: false, // Deshabilitado para evitar problemas
    viewTransition: false,
    typedPages: false, // Deshabilitado temporalmente
    appManifest: false,
    headNext: false // Deshabilitado temporalmente
  },
  
  // Configuración de renderizado ultra optimizada
  render: {
    bundleRenderer: {
      shouldPreload: () => false, // Deshabilitado temporalmente
      shouldPrefetch: () => false, // Deshabilitado temporalmente
      // Optimizaciones adicionales
      resourceHints: true,
      runInNewContext: false
    }
  },
  
  // Configuración de la aplicación
  app: {
    head: {
      title: "BylotoStore - Tu E-commerce Femenino",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { name: "description", content: "Tu tienda de belleza y moda femenina con los mejores productos seleccionados especialmente para la mujer moderna y elegante." },
        { name: "theme-color", content: "#ec4899" }
      ],
      link: [
        { rel: "icon", href: "/favicon.ico" },
        // Fuentes deshabilitadas temporalmente para evitar errores 404
        // { rel: "preconnect", href: "https://fonts.googleapis.com" },
        // { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" },
        // { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Raleway:wght@300;400;500;600;700&display=swap&subset=latin" }
      ],
      script: [
        {
          // Establecer tema lo antes posible para evitar FOUC y layout thrash
          tagPosition: 'head',
          children: `;(function(){try{var t=localStorage.getItem('theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;var e=document.documentElement;e.classList.remove('theme-light','theme-dark','dark');if(d){e.classList.add('theme-dark');e.classList.add('dark');}else{e.classList.add('theme-light');}}catch(_e){}})();`
        }
      ]
    },
    pageTransition: { name: 'page', mode: 'out-in' },
    keepalive: false
  },

  // Color Mode Nuxt UI
  colorMode: { preference: "light" },

  // UI Nuxt Module
  ui: {
    colorMode: true,
    fonts: true,
    theme: {
      transitions: true,
    },
  },
  
  // Configuración de runtime
  runtimeConfig: {
    supabaseServiceKey: process.env.NUXT_SUPABASE_SERVICE_KEY,
    public: {
      supabaseUrl: process.env.NUXT_SUPABASE_URL,
      supabaseKey: process.env.NUXT_SUPABASE_KEY,
    }
  },
  
  // Configuración de build ultra optimizada
  build: {
    transpile: ["vue-chartjs"],
    // Configuración simplificada
    analyze: false,
    extractCSS: false, // Simplificado
    optimization: {
      splitChunks: {
        layouts: false, // Simplificado
        pages: false,
        commons: false
      }
    }
  },
  
  // Configuración de Nitro ultra optimizada
  nitro: {
    preset: 'vercel',
    compressPublicAssets: true,
    minify: true,
    // Optimizaciones adicionales
    experimental: {
      wasm: true
    },
    // Almacenamiento (Redis eliminado para evitar errores de conexión en build)
    // storage: {
    //   redis: {
    //     driver: 'redis',
    //     /* configuración de Redis para cache si está disponible */
    //   }
    // },
    // Cache agresivo
    routeRules: {
      '/api/**': { headers: { 'cache-control': 's-maxage=60' } },
      '/_nuxt/**': { headers: { 'cache-control': 'max-age=31536000' } },
      // Prerenderizado desactivado temporalmente para evitar errores de build sin variables de entorno
      '/': { prerender: false }, 
      '/shop': { prerender: false },
      '/about': { prerender: false }
    }
  },
  
  // Configuración de Vite ultra optimizada
  vite: {
    optimizeDeps: {
      include: ['vue-chartjs', 'chart.js', 'vue', '@vue/runtime-core', '@vue/runtime-dom']
    },
    build: {
      sourcemap: false,
      target: 'esnext',
      minify: 'terser',
      chunkSizeWarningLimit: 300,
      rollupOptions: {
        output: {
          // Dejar que Rollup maneje el chunking automáticamente
          manualChunks: (id: string) => {
            if (id.includes('node_modules/chart.js') || id.includes('node_modules/vue-chartjs')) {
              return 'chart'
            }
            if (id.includes('node_modules/@iconify')) {
              return 'iconify'
            }
          },
          chunkFileNames: (chunkInfo: any) => {
            const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop() : 'chunk'
            return `js/[name]-[hash].js`
          }
        }
      },
      terserOptions: {
        compress: {
          drop_console: false,
          drop_debugger: false
        }
      }
    },
    // Optimizaciones adicionales
    define: {
      __VUE_PROD_DEVTOOLS__: false,
      __VUE_OPTIONS_API__: false
    },
    // Optimización de CSS
    css: {
      devSourcemap: false
    }
  }
})
