/**
 * Live Pulse Entry Point
 * Standalone demo for the Live Pulse feature
 */

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import LivePulseView from './views/LivePulseView.vue'

const app = createApp(LivePulseView)
const pinia = createPinia()

app.use(pinia)
app.mount('#app')

console.log('🔴 Live Pulse Demo started!')
