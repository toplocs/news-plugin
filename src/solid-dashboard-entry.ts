import { createApp } from 'vue'
import { createPinia } from 'pinia'
import SolidDashboard from './views/SolidDashboard.vue'
import { useSolidSession } from './stores/useSolidSession'
import { initAnalytics, trackPageView, trackWebVitals } from './utils/analytics'
import '@toplocs/plugin-sdk/style.css'
import './assets/styles/accessibility.css'

// Initialize Analytics (replace with your domain)
initAnalytics({
  domain: 'toplocs-news.local', // Change this to your production domain
  trackLocalhost: true, // Set to false in production
  hashMode: true
})

// Track initial page view
trackPageView()

// Track Web Vitals for performance monitoring
trackWebVitals()

const app = createApp(SolidDashboard)

const pinia = createPinia()
app.use(pinia)

// Initialize Solid Session
const solidSession = useSolidSession()
solidSession.init().then(() => {
  console.log('✅ Solid Session initialized')
  if (solidSession.isLoggedIn) {
    console.log('✅ User logged in:', solidSession.webId)
  } else {
    console.log('ℹ️ User not logged in - please login')
  }
})

app.mount('#app')
