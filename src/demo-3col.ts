import { createApp } from 'vue'
import { createPinia } from 'pinia'
import CleanLayout from './views/CleanLayout.vue'
import '@toplocs/plugin-sdk/style.css'

const app = createApp(CleanLayout, {
  parentId: 'demo',
  entity: 'Location'
})

const pinia = createPinia()
app.use(pinia)

app.mount('#app')

// Register Service Worker (Production only)
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('✅ Service Worker registered:', registration.scope)

        // Check for updates periodically
        setInterval(() => {
          registration.update()
        }, 60000) // Check every minute
      })
      .catch((error) => {
        console.error('❌ Service Worker registration failed:', error)
      })
  })
}
