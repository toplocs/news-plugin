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
