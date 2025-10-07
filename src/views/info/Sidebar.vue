<template>
  <div class="p-4 space-y-4">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h3 class="text-lg font-semibold text-slate-100 flex items-center gap-2">
          <span>📰</span>
          <span>News Feed</span>
        </h3>
        <p class="text-xs text-slate-400 mt-1">
          {{ isLocation ? 'Local news' : 'Topic news' }}
        </p>
      </div>
      <button
        @click="refresh"
        class="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
        :class="{ 'animate-spin': loading }"
      >
        <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
      <p class="text-red-400 text-xs">{{ error }}</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading && !filteredArticles.length" class="flex justify-center py-8">
      <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500"></div>
    </div>

    <!-- News Items -->
    <div v-else-if="filteredArticles.length > 0" class="space-y-3">
      <article
        v-for="article in filteredArticles.slice(0, 5)"
        :key="article.id"
        @click="openArticle(article)"
        class="p-3 bg-slate-800/50 rounded-lg hover:bg-slate-800/70 transition-all duration-200 cursor-pointer group"
      >
        <!-- Article Image (if available) -->
        <div v-if="article.imageUrl && settings.showImages" class="mb-2 rounded overflow-hidden">
          <img
            :src="article.imageUrl"
            :alt="article.title"
            class="w-full h-24 object-cover group-hover:scale-105 transition-transform duration-200"
          />
        </div>

        <!-- Article Content -->
        <h4 class="text-sm font-medium text-slate-100 line-clamp-2 group-hover:text-indigo-300 transition-colors">
          {{ article.title }}
        </h4>
        <p class="text-xs text-slate-400 mt-1 line-clamp-2">
          {{ article.summary }}
        </p>

        <!-- Article Meta -->
        <div class="flex items-center justify-between mt-2 text-xs text-slate-500">
          <span class="font-medium">{{ article.source }}</span>
          <time>{{ formatTimeAgo(article.publishedAt) }}</time>
        </div>
      </article>
    </div>

    <!-- Empty State -->
    <div v-else class="py-8 text-center">
      <div class="text-4xl mb-2">📭</div>
      <p class="text-slate-400 text-sm">No news available</p>
      <p class="text-slate-500 text-xs mt-1">Check back later for updates</p>
    </div>

    <!-- View All Button -->
    <button
      v-if="filteredArticles.length > 5"
      class="w-full py-2 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg transition-all duration-200 text-sm font-medium shadow-lg hover:shadow-xl"
    >
      View All News ({{ filteredArticles.length }})
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useNewsStore } from '../../stores/useNewsStore'
import { newsService } from '../../services/newsService'
import type { NewsArticle } from '../../types'

defineOptions({
  name: 'NewsInfoSidebar'
})

const props = defineProps<{
  parentId?: string
  entity?: string
}>()

const store = useNewsStore()
const loading = ref(false)
const error = ref<string | null>(null)

const isLocation = computed(() => props.entity === 'Location')

const filteredArticles = computed(() =>
  store.getArticlesByParent(props.parentId || 'default')
)

const settings = computed(() =>
  store.getSettings(props.parentId || 'default')
)

let refreshInterval: ReturnType<typeof setInterval> | null = null

const refresh = async () => {
  loading.value = true
  error.value = null

  try {
    // Fetch fresh articles
    const articles = await newsService.searchByInterests(settings.value.interests)

    // Add to store
    for (const article of articles) {
      await store.addArticle(props.parentId || 'default', article)
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load news'
  } finally {
    loading.value = false
  }
}

const openArticle = (article: NewsArticle) => {
  if (article.url) {
    window.open(article.url, '_blank', 'noopener,noreferrer')
  }
}

const formatTimeAgo = (timestamp: number): string => {
  const now = Date.now()
  const diff = now - timestamp
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return new Date(timestamp).toLocaleDateString()
}

onMounted(() => {
  // Subscribe to news updates
  store.subscribeToParent(props.parentId || 'default')

  // Initial fetch
  refresh()

  // Set up auto-refresh if enabled
  if (settings.value.autoRefresh) {
    refreshInterval = setInterval(refresh, settings.value.refreshInterval)
  }
})

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
})
</script>
