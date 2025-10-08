import { createApp, h } from 'vue'
import { useNewsStore } from './stores/useNewsStore'
import { newsService } from './services/newsService'
import '@toplocs/plugin-sdk/style.css'

const DebugView = {
  setup() {
    const store = useNewsStore()

    const loadArticles = async () => {
      console.log('Loading articles...')
      const articles = await newsService.searchByInterests(['community', 'local', 'tech'])
      console.log('Generated articles:', articles)

      for (const article of articles) {
        await store.addArticle('demo', article)
      }

      const stored = store.getArticlesByParent('demo')
      console.log('Stored articles:', stored)
    }

    loadArticles()

    return () => h('div', {
      style: {
        padding: '2rem',
        background: '#1e293b',
        minHeight: '100vh',
        color: 'white'
      }
    }, [
      h('h1', { style: { marginBottom: '1rem' } }, 'Debug View'),
      h('button', {
        onClick: loadArticles,
        style: {
          padding: '0.5rem 1rem',
          background: '#6366f1',
          color: 'white',
          border: 'none',
          borderRadius: '0.5rem',
          cursor: 'pointer',
          marginBottom: '1rem'
        }
      }, 'Load Articles'),
      h('div', [
        h('h2', `Articles in Store: ${store.articles.value.length}`),
        h('pre', {
          style: {
            background: '#0f172a',
            padding: '1rem',
            borderRadius: '0.5rem',
            overflow: 'auto',
            maxHeight: '400px'
          }
        }, JSON.stringify(store.articles.value, null, 2))
      ])
    ])
  }
}

const app = createApp(DebugView)
app.mount('#app')
