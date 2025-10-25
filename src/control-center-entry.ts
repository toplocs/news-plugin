import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ControlCenter from './views/ControlCenter.vue'
import { useSolidSession } from './stores/useSolidSession'
import { initAnalytics } from './utils/analytics'
import '@toplocs/plugin-sdk/style.css'
import './assets/styles/accessibility.css'

// Initialize Analytics
initAnalytics({
  domain: 'toplocs-news.local',
  trackLocalhost: true
})

const app = createApp(ControlCenter)
const pinia = createPinia()
app.use(pinia)

// Initialize Solid Session
const solidSession = useSolidSession()
solidSession.init()

app.mount('#app')
