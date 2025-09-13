<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
    <!-- Animated Background -->
    <div class="absolute inset-0 overflow-hidden">
      <div class="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
      <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      <div class="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
    </div>

    <!-- Main Content -->
    <div class="relative z-10 min-h-screen flex items-center justify-center p-4">
      <div class="w-full max-w-md">
        <!-- Back to home -->
        <div class="mb-4 flex justify-end">
          <NuxtLink to="/" class="text-sm text-white/80 hover:text-white underline underline-offset-4">
            Volver al inicio
          </NuxtLink>
        </div>
        <!-- Login Card -->
        <div class="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8">
          <!-- Header -->
          <div class="text-center mb-8">
            <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-6 shadow-lg">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
              </svg>
            </div>
            
            <h1 class="text-3xl font-bold text-white mb-2">Iniciar Sesión</h1>
            <p class="text-gray-300">Accede a tu cuenta de administrador</p>
          </div>

          <!-- Form -->
          <form @submit.prevent="handleLogin" class="space-y-6">
            <!-- Email Field -->
            <div class="space-y-2">
              <label for="email" class="block text-sm font-medium text-gray-200">
                Correo Electrónico
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"></path>
                  </svg>
                </div>
                <input
                  id="email"
                  v-model="email"
                  type="email"
                  required
                  class="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
                  placeholder="admin@ejemplo.com"
                  :disabled="loading"
                />
              </div>
            </div>

            <!-- Password Field -->
            <div class="space-y-2">
              <label for="password" class="block text-sm font-medium text-gray-200">
                Contraseña
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                  </svg>
                </div>
                <input
                  id="password"
                  v-model="password"
                  type="password"
                  required
                  class="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
                  placeholder="••••••••"
                  :disabled="loading"
                />
              </div>
            </div>

            <!-- Error Message -->
            <div v-if="error" class="bg-red-500/20 border border-red-500/30 rounded-xl p-4 backdrop-blur-sm">
              <div class="flex items-center">
                <svg class="w-5 h-5 text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <p class="text-red-300 text-sm">{{ error }}</p>
              </div>
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              :disabled="loading"
              class="group relative w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              <span v-if="loading" class="flex items-center justify-center">
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns=" http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Iniciando sesión...
              </span>
              <span v-else class="flex items-center justify-center">
                <svg class="w-5 h-5 mr-3 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
                </svg>
                Iniciar Sesión
              </span>
            </button>

            <!-- Divider -->
            <div class="flex items-center gap-4 my-4">
              <div class="h-px flex-1 bg-white/20"></div>
              <span class="text-xs text-white/60">o</span>
              <div class="h-px flex-1 bg-white/20"></div>
            </div>

            <!-- Google Sign-In -->
            <button type="button" @click="loginWithGoogle" :disabled="loading" class="w-full bg-white text-gray-800 py-3 px-4 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-300 flex items-center justify-center gap-3">
              <img alt="Google" src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" class="w-5 h-5" />
              Continuar con Google
            </button>
          </form>

          <!-- Footer -->
          <div class="mt-8 text-center">
            <div class="flex items-center justify-center space-x-2 text-gray-400">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
              </svg>
              <p class="text-sm">Acceso exclusivo para administradores</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Floating Elements -->
    <div class="absolute top-20 left-10 w-2 h-2 bg-blue-400 rounded-full animate-ping"></div>
    <div class="absolute top-40 right-20 w-3 h-3 bg-purple-400 rounded-full animate-ping animation-delay-1000"></div>
    <div class="absolute bottom-20 left-20 w-2 h-2 bg-pink-400 rounded-full animate-ping animation-delay-2000"></div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: false
})

const loading = ref(false)
const error = ref('')

const email = ref('')
const password = ref('')

const { login } = useAuth()
const supabase = useSupabaseClient()
const router = useRouter()

const handleLogin = async () => {
  if (!email.value || !password.value) {
    return
  }

  loading.value = true
  error.value = ''

  try {
    console.log('Intentando autenticar con:', email.value)
    
    const result = await login(email.value, password.value)

    if (result.success) {
      const user = result.user
      if (!user) {
        error.value = 'No se pudo obtener el perfil'
        return
      }
      // Optimización: reducir timeout y usar navegación más eficiente
      setTimeout(async () => {
        try {
          if (router.currentRoute.value.path === '/login') {
            if (user.role === 'admin') await router.replace('/dashboard')
            else if (user.role === 'user') await router.replace('/user')
            else await router.replace('/')
          }
        } catch (_e) {}
      }, 800) // Reducir de 1500ms a 800ms
    } else {
      error.value = result.error || 'Credenciales incorrectas'
    }
    
  } catch (err) {
    console.error('Error de login:', err)
    error.value = 'Error al iniciar sesión. Verifica tu conexión.'
  } finally {
    loading.value = false
  }
}

const loginWithGoogle = async () => {
  try {
    loading.value = true
    error.value = ''
    // En flujos OAuth, no bloquear UI esperando respuesta; el evento onAuthStateChange manejará la redirección
    await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin + '/login' } })
  } catch (e) {
    console.error('Google sign-in error', e)
    error.value = 'No se pudo iniciar sesión con Google'
  } finally {
    // Liberar el loading tras breve delay para permitir transición visual si no hay redirección inmediata
    setTimeout(() => { loading.value = false }, 300)
  }
}
</script>

<style scoped>
@keyframes blob {
  0% {
    transform: translate(0px, 0px) scale(1);
  }
  33% {
    transform: translate(30px, -50px) scale(1.1);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }
  100% {
    transform: translate(0px, 0px) scale(1);
  }
}

.animate-blob {
  animation: blob 7s infinite;
}

.animation-delay-2000 {
  animation-delay: 2s;
}

.animation-delay-4000 {
  animation-delay: 4s;
}

.animation-delay-1000 {
  animation-delay: 1s;
}
</style>


