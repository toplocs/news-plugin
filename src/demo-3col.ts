import { createApp } from 'vue'
import CleanLayout from './views/CleanLayout.vue'
import '@toplocs/plugin-sdk/style.css'

const app = createApp(CleanLayout, {
  parentId: 'demo',
  entity: 'Location'
})

app.mount('#app')
