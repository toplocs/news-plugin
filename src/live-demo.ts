import { createApp } from 'vue'
import { createPinia } from 'pinia'
import LiveDemoPage from './views/LiveDemoPage.vue'
import '@toplocs/plugin-sdk/style.css'

const app = createApp(LiveDemoPage)

const pinia = createPinia()
app.use(pinia)

app.mount('#app')
