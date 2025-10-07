<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
    <!-- Header -->
    <HeaderBar
      :title="pageTitle"
      :unread-count="unreadCount"
      @search="handleSearch"
      @refresh="handleRefresh"
    />

    <!-- Main Layout - 3 Column Grid -->
    <div class="container mx-auto px-4 py-6">
      <!-- Location Header -->
      <LocationHeader
        :location-name="locationName"
        :radius="settings.radius"
        :news-count="filteredArticles.length"
        :breaking-count="breakingCount"
        :local-count="localCount"
        :community-count="communityCount"
        :sources-count="activeSources"
        @update:radius="updateRadius"
      />
      <div class="grid gap-6" :class="layoutGridClass">
        <!-- Left Sidebar - Settings/Filters (25%) -->
        <aside class="space-y-6" :class="leftSidebarClass">
          <SidebarLeft
            :settings="settings"
            @update-settings="handleUpdateSettings"
          />
        </aside>

        <!-- Center - Main Feed (50%) -->
        <main class="space-y-6">
          <FeedView
            :articles="filteredArticles"
            :loading="loading.value"
            :error="error.value"
            :layout="feedLayout"
            @article-click="openArticleDetail"
            @load-more="loadMore"
          />
        </main>

        <!-- Right Sidebar - Discovery/Users (25%) -->
        <aside class="space-y-6" :class="rightSidebarClass">
          <UserSidebar />
        </aside>
      </div>
    </div>

    <!-- Article Detail Modal -->
    <NewsDetailModal
      v-if="selectedArticle"
      :article="selectedArticle"
      @close="selectedArticle = null"
    />

    <!-- Mobile Bottom Navigation -->
    <MobileBottomNav
      v-if="isMobile"
      :active-view="activeView"
      @update:view="activeView = $event"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useNewsStore } from '../stores/useNewsStore'
import { newsService } from '../services/newsService'
import HeaderBar from '../components/HeaderBar.vue'
import LocationHeader from '../components/LocationHeader.vue'
import FeedView from '../components/FeedView.vue'
import NewsFilter from '../components/NewsFilter.vue'
import NewsDetailModal from '../components/NewsDetailModal.vue'
import MobileBottomNav from '../components/MobileBottomNav.vue'
import SidebarLeft from '../components/SidebarLeft.vue'
import UserSidebar from '../components/UserSidebar.vue'
import type { NewsArticle, NewsFilter as Filter } from '../types'

const props = defineProps<{
  parentId?: string
  entity?: string
}>()

const store = useNewsStore()
const filter = ref<Filter>({})
const selectedArticle = ref<NewsArticle | null>(null)
const feedLayout = ref<'grid' | 'list'>('grid')
const activeView = ref<'feed' | 'filters' | 'discover'>('feed')
const searchQuery = ref('')

const articles = computed(() => store.getArticlesByParent(props.parentId || 'default'))
const settings = computed(() => store.getSettings(props.parentId || 'default'))
const loading = computed(() => store.loading)
const error = computed(() => store.error)

const filteredArticles = computed(() => {
  let result = articles.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(
      a => a.title.toLowerCase().includes(query) ||
           a.summary.toLowerCase().includes(query)
    )
  }

  return result
})

const unreadCount = computed(() => {
  // TODO: Track read articles
  return Math.min(filteredArticles.value.length, 99)
})

const availableSources = computed(() => newsService.getSources())
const activeSources = computed(() => availableSources.value.filter(s => s.enabled).length)

const trendingTopics = ref([
  { slug: 'technology', name: 'Technology', count: 45 },
  { slug: 'community', name: 'Community', count: 38 },
  { slug: 'events', name: 'Events', count: 27 },
  { slug: 'business', name: 'Business', count: 19 }
])

const recentSources = computed(() => availableSources.value.slice(0, 4))

const pageTitle = computed(() => {
  return props.entity === 'Location'
    ? 'Lokale Nachrichten'
    : 'Topic News'
})

const locationName = computed(() => {
  return props.parentId === 'demo' ? 'Berlin Mitte' : props.parentId || 'Deine Location'
})

const breakingCount = computed(() => {
  return filteredArticles.value.filter(a => a.tags?.includes('breaking')).length
})

const localCount = computed(() => {
  return filteredArticles.value.filter(a => a.tags?.includes('local')).length
})

const communityCount = computed(() => {
  return filteredArticles.value.filter(a => a.source.includes('Community')).length
})

const updateRadius = async (newRadius: number) => {
  await store.updateSettings(props.parentId || 'default', {
    ...settings.value,
    radius: newRadius
  })
}

const handleUpdateSettings = async (newSettings: any) => {
  await store.updateSettings(props.parentId || 'default', newSettings)
}

// Responsive breakpoints
const isMobile = ref(false)
const isTablet = ref(false)

const layoutGridClass = computed(() => {
  if (isMobile.value) return 'grid-cols-1'
  if (isTablet.value) return 'grid-cols-[1fr_2fr]'
  return 'grid-cols-[1fr_2fr_1fr]' // 25% | 50% | 25%
})

const leftSidebarClass = computed(() => {
  if (isMobile.value && activeView.value !== 'filters') return 'hidden'
  return ''
})

const rightSidebarClass = computed(() => {
  if (isMobile.value && activeView.value !== 'discover') return 'hidden'
  if (isTablet.value) return 'hidden'
  return ''
})

const updateFilter = (newFilter: Filter) => {
  filter.value = newFilter
}

const handleSearch = (query: string) => {
  searchQuery.value = query
}

const handleRefresh = async () => {
  const freshArticles = await newsService.searchByInterests(settings.value.interests)
  for (const article of freshArticles) {
    await store.addArticle(props.parentId || 'default', article)
  }
}

const openArticleDetail = (article: NewsArticle) => {
  selectedArticle.value = article
}

const loadMore = () => {
  // TODO: Implement pagination
  console.log('Load more articles')
}

const filterByTopic = (topic: string) => {
  filter.value = { ...filter.value, topics: [topic] }
}

// Handle responsive breakpoints
const updateBreakpoints = () => {
  isMobile.value = window.innerWidth < 768
  isTablet.value = window.innerWidth >= 768 && window.innerWidth < 1024
}

onMounted(() => {
  updateBreakpoints()
  window.addEventListener('resize', updateBreakpoints)

  // Initial data load
  store.subscribeToParent(props.parentId || 'default')
  handleRefresh()
})
</script>
