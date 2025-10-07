import { createApp } from 'vue'
import NewsLayout from './views/NewsLayout.vue'
import '@toplocs/plugin-sdk/style.css'

const app = createApp(NewsLayout, {
  parentId: 'demo',
  entity: 'Location'
})

app.mount('#app')
