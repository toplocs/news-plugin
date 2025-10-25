import { createApp } from 'vue'
import { createPinia } from 'pinia'
import P2PDemo from './views/P2PDemo.vue'
import { initAnalytics, trackPageView, trackWebVitals } from './utils/analytics'
import '@toplocs/plugin-sdk/style.css'
import './assets/styles/accessibility.css'

// Initialize Analytics
initAnalytics({
  domain: 'toplocs-news.local',
  trackLocalhost: true,
  hashMode: true
})

trackPageView()
trackWebVitals()

const app = createApp(P2PDemo)
const pinia = createPinia()
app.use(pinia)

app.mount('#app')
