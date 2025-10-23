import { ref, computed } from 'vue'
import gun from '../services/gun'
import type { NewsArticle } from '../types'

const STORAGE_KEY = 'news_plugin_bookmarks'

// State
const bookmarks = ref<NewsArticle[]>([])
const isLoading = ref(false)

/**
 * Composable for managing article bookmarks
 */
export function useBookmarks() {
  // Load from localStorage
  const loadBookmarks = async () => {
    isLoading.value = true
    try {
      // Small delay for UX (show loading state)
      await new Promise(resolve => setTimeout(resolve, 300))

      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        bookmarks.value = JSON.parse(stored)
        console.log('📚 Loaded', bookmarks.value.length, 'bookmarks from localStorage')
      }
    } catch (err) {
      console.error('Failed to load bookmarks:', err)
    } finally {
      isLoading.value = false
    }
  }

  // Save to localStorage
  const saveBookmarks = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks.value))
      console.log('💾 Saved', bookmarks.value.length, 'bookmarks to localStorage')
    } catch (err) {
      console.error('Failed to save bookmarks:', err)
    }
  }

  // Check if article is bookmarked
  const isBookmarked = (articleId: string): boolean => {
    return bookmarks.value.some(b => b.id === articleId)
  }

  // Add bookmark
  const addBookmark = (article: NewsArticle) => {
    if (isBookmarked(article.id)) {
      console.log('⚠️ Article already bookmarked:', article.id)
      return false
    }

    bookmarks.value.unshift(article)
    saveBookmarks()

    // Sync to Gun.js (optional P2P sync)
    syncToGun(article.id, article)

    console.log('🔖 Bookmarked:', article.title)
    return true
  }

  // Remove bookmark
  const removeBookmark = (articleId: string) => {
    const index = bookmarks.value.findIndex(b => b.id === articleId)
    if (index > -1) {
      const removed = bookmarks.value.splice(index, 1)[0]
      saveBookmarks()

      // Remove from Gun.js
      removeFromGun(articleId)

      console.log('🗑️ Removed bookmark:', removed.title)
      return true
    }
    return false
  }

  // Toggle bookmark
  const toggleBookmark = (article: NewsArticle): boolean => {
    if (isBookmarked(article.id)) {
      removeBookmark(article.id)
      return false // Removed
    } else {
      addBookmark(article)
      return true // Added
    }
  }

  // Clear all bookmarks
  const clearAllBookmarks = () => {
    bookmarks.value = []
    saveBookmarks()
    console.log('🗑️ Cleared all bookmarks')
  }

  // Gun.js sync
  const syncToGun = (articleId: string, article: NewsArticle) => {
    try {
      const bookmarkNode = gun.get('news_plugin_bookmarks')
      bookmarkNode.get(articleId).put({
        ...article,
        bookmarkedAt: Date.now()
      })
    } catch (err) {
      console.warn('Failed to sync bookmark to Gun.js:', err)
    }
  }

  const removeFromGun = (articleId: string) => {
    try {
      const bookmarkNode = gun.get('news_plugin_bookmarks')
      bookmarkNode.get(articleId).put(null)
    } catch (err) {
      console.warn('Failed to remove bookmark from Gun.js:', err)
    }
  }

  // Subscribe to Gun.js for P2P sync
  const subscribeToGun = () => {
    try {
      const bookmarkNode = gun.get('news_plugin_bookmarks')

      bookmarkNode.map().on((data: any, id: string) => {
        if (!data) return

        // Add remote bookmark if not already present
        if (!isBookmarked(id)) {
          bookmarks.value.unshift(data as NewsArticle)
          saveBookmarks()
          console.log('📡 Synced bookmark from Gun.js:', data.title)
        }
      })

      console.log('📡 Subscribed to Gun.js bookmarks')
    } catch (err) {
      console.error('Failed to subscribe to Gun.js bookmarks:', err)
    }
  }

  // Get bookmarks by category
  const getBookmarksByTopic = (topic: string) => {
    return computed(() =>
      bookmarks.value.filter(b => b.topics.includes(topic))
    )
  }

  const getBookmarksBySource = (source: string) => {
    return computed(() =>
      bookmarks.value.filter(b => b.source === source)
    )
  }

  // Sort bookmarks
  const sortedBookmarks = computed(() => {
    return [...bookmarks.value].sort((a, b) => {
      // Sort by publishedAt descending (newest first)
      return b.publishedAt - a.publishedAt
    })
  })

  return {
    // State
    bookmarks: computed(() => bookmarks.value),
    sortedBookmarks,
    isLoading: computed(() => isLoading.value),

    // Computed
    bookmarkCount: computed(() => bookmarks.value.length),

    // Methods
    loadBookmarks,
    saveBookmarks,
    isBookmarked,
    addBookmark,
    removeBookmark,
    toggleBookmark,
    clearAllBookmarks,
    subscribeToGun,
    getBookmarksByTopic,
    getBookmarksBySource
  }
}
