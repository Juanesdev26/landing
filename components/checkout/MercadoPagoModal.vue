<template>
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
    <div class="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-xl">
        <div class="flex items-center justify-between">
          <h2 class="text-2xl font-bold text-gray-900">Finalizar Compra</h2>
          <button @click="$emit('close')" class="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <Icon name="heroicons:x-mark" class="w-6 h-6 text-gray-500" />
          </button>
        </div>
      </div>

      <!-- Content -->
      <div class="p-6 space-y-6">
        <!-- Resumen del Pedido -->
        <div class="bg-gray-50 rounded-lg p-4">
          <h3 class="text-lg font-semibold text-gray-900 mb-3">Resumen del Pedido</h3>
          <div class="space-y-2">
            <div v-for="item in cart.items" :key="item.product_id" class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 bg-white rounded-lg flex items-center justify-center overflow-hidden">
                  <img v-if="item.image_url" :src="item.image_url" :alt="item.name" class="w-full h-full object-cover" />
                  <Icon v-else name="heroicons:shopping-bag" class="w-6 h-6 text-pink-500" />
                </div>
                <div>
                  <div class="font-medium text-gray-900">{{ item.name }}</div>
                  <div class="text-sm text-gray-500">Cantidad: {{ item.quantity }}</div>
                </div>
              </div>
              <div class="text-right">
                <div class="font-semibold text-gray-900">{{ formatCOP(item.price * item.quantity) }}</div>
              </div>
            </div>
          </div>
          
          <div class="border-t border-gray-200 mt-4 pt-4 space-y-2">
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">Subtotal</span>
              <span class="font-medium">{{ formatCOP(cart.subtotal) }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">Envío</span>
              <span class="font-medium">{{ formatCOP(cart.shippingAmount) }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">Impuestos</span>
              <span class="font-medium">{{ formatCOP(cart.taxAmount) }}</span>
            </div>
            <div class="flex justify-between text-lg font-bold border-t border-gray-200 pt-2">
              <span class="text-gray-900">Total</span>
              <span class="text-pink-600">{{ formatCOP(cart.total) }}</span>
            </div>
          </div>
        </div>

        <!-- Información de Envío -->
        <div class="space-y-4">
          <h3 class="text-lg font-semibold text-gray-900">Información de Envío</h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
              <input v-model="shippingInfo.name" type="text" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent" placeholder="Tu nombre completo" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
              <input v-model="shippingInfo.phone" type="tel" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent" placeholder="+57 300 123 4567" />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
            <input v-model="shippingInfo.address" type="text" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent" placeholder="Calle 123 #45-67" />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Ciudad</label>
              <input v-model="shippingInfo.city" type="text" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent" placeholder="Bogotá" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Departamento</label>
              <input v-model="shippingInfo.state" type="text" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent" placeholder="Cundinamarca" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Código Postal</label>
              <input v-model="shippingInfo.postal_code" type="text" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent" placeholder="110111" />
            </div>
          </div>
        </div>

        <!-- Método de Pago -->
        <div class="space-y-4">
          <h3 class="text-lg font-semibold text-gray-900">Método de Pago</h3>
          
          <div class="border border-gray-200 rounded-lg p-4">
            <div class="flex items-center gap-3 mb-3">
              <img src="https://http2.mlstatic.com/storage/logos-api-admin/a5f047d0-9be0-11ec-aad4-c3381f368aaf-m.svg" alt="MercadoPago" class="w-8 h-8" />
              <div>
                <div class="font-medium text-gray-900">Pago Seguro con MercadoPago</div>
                <div class="text-sm text-gray-500">Tarjetas, PSE, Nequi, Daviplata y más</div>
              </div>
            </div>
            <div class="flex items-center gap-2 text-sm text-gray-600">
              <Icon name="heroicons:shield-check" class="w-4 h-4 text-green-500" />
              <span>Transacción 100% segura y encriptada</span>
            </div>
          </div>
        </div>

        <!-- Términos y Condiciones -->
        <div class="flex items-start gap-3">
          <input v-model="acceptTerms" type="checkbox" required class="mt-1 rounded border-gray-300 text-pink-600 focus:ring-pink-500" />
          <label class="text-sm text-gray-600">
            Acepto los <a href="#" class="text-pink-600 hover:text-pink-700 underline">términos y condiciones</a> 
            y la <a href="#" class="text-pink-600 hover:text-pink-700 underline">política de privacidad</a>
          </label>
        </div>
      </div>

      <!-- Footer -->
      <div class="sticky bottom-0 bg-white border-t border-gray-200 p-6 rounded-b-xl">
        <div class="flex items-center justify-between">
          <div class="text-sm text-gray-500">
            <Icon name="heroicons:lock-closed" class="w-4 h-4 inline mr-1" />
            Pago seguro y protegido
          </div>
          <div class="flex items-center gap-3">
            <button @click="$emit('close')" class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
              Cancelar
            </button>
            <button 
              @click="processPayment" 
              :disabled="!canProcessPayment || processing"
              class="px-8 py-2 bg-pink-600 text-white rounded-lg font-semibold hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <Icon v-if="processing" name="svg-spinners:ring-resize" class="w-4 h-4" />
              {{ processing ? 'Procesando...' : `Pagar ${formatCOP(cart.total)}` }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCartStore } from '~/stores/cart'
import { useCurrency } from '~/composables/useCurrency'

const props = defineProps<{
  orderId?: string
}>()

const emit = defineEmits<{
  close: []
  success: [orderId: string]
}>()

const cart = useCartStore()
const { formatCOP } = useCurrency()
const { $toast } = useNuxtApp()

// Estado del formulario
const processing = ref(false)
const acceptTerms = ref(false)

const shippingInfo = reactive({
  name: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  postal_code: ''
})

// Validación
const canProcessPayment = computed(() => {
  return acceptTerms.value && 
         shippingInfo.name.trim() &&
         shippingInfo.phone.trim() &&
         shippingInfo.address.trim() &&
         shippingInfo.city.trim() &&
         shippingInfo.state.trim() &&
         shippingInfo.postal_code.trim()
})

// Procesar pago
const processPayment = async () => {
  if (!canProcessPayment.value || processing.value) return

  processing.value = true

  try {
    // Asegurar sesión
    const supabase = useSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      await navigateTo('/login')
      return
    }

    // Obtener customer
    const { data: myCustomer } = await $fetch('/api/customers/my') as any
    if (!myCustomer?.success || !myCustomer.data?.id_customer) {
      $toast?.error('Error', 'No fue posible identificar el cliente')
      return
    }

    // Preparar datos para MercadoPago
    const paymentData = {
      customer_id: myCustomer.data.id_customer,
      order_items: cart.items.map(it => ({ 
        product_id: it.product_id, 
        quantity: it.quantity, 
        unit_price: it.price,
        name: it.name
      })),
      tax_amount: cart.taxAmount,
      shipping_amount: cart.shippingAmount,
      shipping_address: {
        name: shippingInfo.name,
        phone: shippingInfo.phone,
        line1: shippingInfo.address,
        city: shippingInfo.city,
        state: shippingInfo.state,
        postal_code: shippingInfo.postal_code,
        country: 'CO'
      },
      customer_info: myCustomer.data
    }

    // Crear preferencia de pago
    const { data: preferenceResult } = await $fetch('/api/mercadopago/create-preference', {
      method: 'POST',
      body: paymentData
    }) as any

    if (!preferenceResult?.success) {
      $toast?.error('Error', preferenceResult?.error || 'Error creando pago')
      return
    }

    // Redirigir a MercadoPago
    const initPoint = preferenceResult.data.sandbox_init_point || preferenceResult.data.init_point
    
    if (initPoint) {
      window.location.href = initPoint
    } else {
      $toast?.error('Error', 'No se pudo obtener la URL de pago')
    }

  } catch (error) {
    console.error('Error procesando pago:', error)
    $toast?.error('Error', 'Ocurrió un error procesando el pago')
  } finally {
    processing.value = false
  }
}

// Cargar datos del usuario si están disponibles
onMounted(async () => {
  try {
    const supabase = useSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user?.email) {
      // Intentar obtener información del customer
      const { data: myCustomer } = await $fetch('/api/customers/my') as any
      if (myCustomer?.success && myCustomer.data) {
        const customer = myCustomer.data
        shippingInfo.name = customer.name || ''
        shippingInfo.phone = customer.phone || ''
        shippingInfo.address = customer.address || ''
        shippingInfo.city = customer.city || ''
        shippingInfo.state = customer.state || ''
        shippingInfo.postal_code = customer.postal_code || ''
      }
    }
  } catch (error) {
    console.log('No se pudieron cargar datos del usuario:', error)
  }
})
</script>

<style scoped>
/* Estilos adicionales si son necesarios */
</style>

