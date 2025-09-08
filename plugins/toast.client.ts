import { createApp } from 'vue'
import Toast from '~/components/common/Toast.vue'

export default defineNuxtPlugin((nuxtApp) => {
  const show = (opts: { type?: 'success' | 'error' | 'info' | 'warning'; title: string; message?: string; duration?: number }) => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const app = createApp(Toast, opts)
    app.mount(container)
    setTimeout(() => {
      app.unmount()
      container.remove()
    }, (opts.duration || 3000) + 300)
  }

  return { provide: { toast: { show, success: (title: string, message?: string, duration?: number) => show({ type: 'success', title, message, duration }), error: (title: string, message?: string, duration?: number) => show({ type: 'error', title, message, duration }), info: (title: string, message?: string, duration?: number) => show({ type: 'info', title, message, duration }), warning: (title: string, message?: string, duration?: number) => show({ type: 'warning', title, message, duration }) } } }
})


