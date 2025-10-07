import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useNewsStore } from '../stores/useNewsStore'
import { newsService } from '../services/newsService'
import type { NewsFilter, NewsArticle } from '../types'

/**
 * Composable for news operations
 * Provides reactive news data and operations for components
 */
export function useNews(parentId: string) {
  const store = useNewsStore()
  const filter = ref<NewsFilter>({})
  const refreshInterval = ref<ReturnType<typeof setInterval> | null>(null)

  const articles = computed(() =>
    store.getArticlesByParent(parentId, filter.value)
  )

  const settings = computed(() => store.getSettings(parentId))

  const loading = computed(() => store.loading)

  const error = computed(() => store.error)

  /**
   * Fetch fresh news articles
   */
  const refresh = async () => {
    try {
      const freshArticles = await newsService.searchByInterests(
        settings.value.interests
      )

      for (const article of freshArticles) {
        await store.addArticle(parentId, article)
      }
    } catch (err) {
      console.error('Failed to refresh news:', err)
    }
  }

  /**
   * Add a new article
   */
  const addArticle = async (article: Omit<NewsArticle, 'id'>) => {
    await store.addArticle(parentId, article)
  }

  /**
   * Update filter
   */
  const updateFilter = (newFilter: NewsFilter) => {
    filter.value = { ...filter.value, ...newFilter }
  }

  /**
   * Clear filter
   */
  const clearFilter = () => {
    filter.value = {}
  }

  /**
   * Search news by query
   */
  const search = (query: string) => {
    filter.value = { ...filter.value, search: query }
  }

  /**
   * Set up auto-refresh
   */
  const setupAutoRefresh = () => {
    if (settings.value.autoRefresh && !refreshInterval.value) {
      refreshInterval.value = setInterval(
        refresh,
        settings.value.refreshInterval
      )
    }
  }

  /**
   * Clean up auto-refresh
   */
  const cleanupAutoRefresh = () => {
    if (refreshInterval.value) {
      clearInterval(refreshInterval.value)
      refreshInterval.value = null
    }
  }

  onMounted(() => {
    // Subscribe to updates
    store.subscribeToParent(parentId)

    // Initial fetch
    refresh()

    // Setup auto-refresh if enabled
    setupAutoRefresh()
  })

  onUnmounted(() => {
    cleanupAutoRefresh()
  })

  return {
    // State
    articles,
    settings,
    loading,
    error,
    filter,

    // Actions
    refresh,
    addArticle,
    updateFilter,
    clearFilter,
    search
  }
}
