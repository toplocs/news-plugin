import { ref, computed } from 'vue'
import { newsService } from '../services/gun'
import type { NewsArticle, NewsSettings, NewsFilter } from '../types'

interface NewsStore {
  articles: Map<string, NewsArticle>
  settings: Map<string, NewsSettings>
  loading: boolean
  error: string | null
}

const state = ref<NewsStore>({
  articles: new Map(),
  settings: new Map(),
  loading: false,
  error: null
})

export function useNewsStore() {
  // Getters
  const articles = computed(() => Array.from(state.value.articles.values()))
  const loading = computed(() => state.value.loading)
  const error = computed(() => state.value.error)

  // Get articles for specific parent
  const getArticlesByParent = (parentId: string, filter?: NewsFilter) => {
    // For demo/default parent, show all articles
    let filtered = parentId === 'demo' || parentId === 'default'
      ? articles.value
      : articles.value.filter(article =>
          article.topics.includes(parentId) || article.locations.includes(parentId)
        )

    if (filter?.search) {
      const search = filter.search.toLowerCase()
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(search) ||
        article.summary.toLowerCase().includes(search)
      )
    }

    if (filter?.sources?.length) {
      filtered = filtered.filter(article => filter.sources!.includes(article.source))
    }

    if (filter?.dateFrom) {
      filtered = filtered.filter(article => article.publishedAt >= filter.dateFrom!)
    }

    if (filter?.dateTo) {
      filtered = filtered.filter(article => article.publishedAt <= filter.dateTo!)
    }

    return filtered.sort((a, b) => b.publishedAt - a.publishedAt)
  }

  // Get settings for parent
  const getSettings = (parentId: string) => {
    return state.value.settings.get(parentId) || getDefaultSettings()
  }

  // Default settings
  const getDefaultSettings = (): NewsSettings => ({
    radius: 10,
    sources: ['local', 'community'],
    interests: [],
    autoRefresh: true,
    refreshInterval: 300000, // 5 minutes
    showImages: true,
    notificationsEnabled: false
  })

  // Subscribe to articles for parent
  const subscribeToParent = (parentId: string) => {
    state.value.loading = true
    state.value.error = null

    try {
      newsService.getNewsForParent(parentId).map().on((article: any, id: string) => {
        if (article && id) {
          state.value.articles.set(id, {
            ...article,
            id
          })
        }
      })

      // Subscribe to settings
      newsService.getSettings(parentId).on((settings: any) => {
        if (settings) {
          state.value.settings.set(parentId, settings)
        }
      })
    } catch (err) {
      state.value.error = err instanceof Error ? err.message : 'Failed to load news'
    } finally {
      state.value.loading = false
    }
  }

  // Add article directly to local state (for development/offline mode)
  const addArticleDirectly = (article: NewsArticle) => {
    state.value.articles.set(article.id, article)
  }

  // Add article to Gun.js (syncs to P2P network)
  const addArticle = async (parentId: string, article: Omit<NewsArticle, 'id'>) => {
    try {
      // Generate ID if not present
      const fullArticle: NewsArticle = {
        id: `article_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...article
      }

      // Add to local state immediately (for offline/dev mode)
      addArticleDirectly(fullArticle)

      // Also sync to Gun.js (for P2P network)
      await newsService.addNews(parentId, fullArticle)
    } catch (err) {
      state.value.error = err instanceof Error ? err.message : 'Failed to add article'
      throw err
    }
  }

  // Update settings
  const updateSettings = async (parentId: string, settings: Partial<NewsSettings>) => {
    const current = getSettings(parentId)
    const updated = { ...current, ...settings }

    // Update local state immediately
    state.value.settings.set(parentId, updated)

    try {
      // Also sync to Gun.js (for P2P network)
      await newsService.saveSettings(parentId, updated)
    } catch (err) {
      state.value.error = err instanceof Error ? err.message : 'Failed to save settings'
      // Don't throw - local state is already updated
      console.error('Gun.js sync failed:', err)
    }
  }

  // Clear articles for a parent
  const clearArticles = (parentId: string) => {
    const articlesToRemove: string[] = []

    // Find all articles for this parent
    state.value.articles.forEach((article, id) => {
      if (article.topics.includes(parentId) || article.locations.includes(parentId)) {
        articlesToRemove.push(id)
      }
    })

    // Remove them
    articlesToRemove.forEach(id => state.value.articles.delete(id))
  }

  // Clear error
  const clearError = () => {
    state.value.error = null
  }

  return {
    // State
    articles,
    loading,
    error,

    // Getters
    getArticlesByParent,
    getSettings,

    // Actions
    subscribeToParent,
    addArticle,
    addArticleDirectly,
    clearArticles,
    updateSettings,
    clearError
  }
}
