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
      <!-- Statistics Bar -->
      <StatsBar :articles="articles" :last-refresh="Date.now()" class="mb-6" />

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

    <!-- Toast Notifications -->
    <ToastContainer />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useNewsStore } from '../stores/useNewsStore'
import { newsService } from '../services/newsService'
import { useLocation } from '../composables/useLocation'
import { useToast } from '../composables/useToast'
import HeaderBar from '../components/HeaderBar.vue'
import LocationHeader from '../components/LocationHeader.vue'
import FeedView from '../components/FeedView.vue'
import NewsDetailModal from '../components/NewsDetailModal.vue'
import MobileBottomNav from '../components/MobileBottomNav.vue'
import SidebarLeft from '../components/SidebarLeft.vue'
import UserSidebar from '../components/UserSidebar.vue'
import StatsBar from '../components/StatsBar.vue'
import ToastContainer from '../components/ToastContainer.vue'
import type { NewsArticle } from '../types'

const props = defineProps<{
  parentId?: string
  entity?: string
}>()

const store = useNewsStore()
const { currentLocation, calculateDistance } = useLocation()
const { success, error: showError, info } = useToast()
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
  console.log(`🔍 Filter Start: ${result.length} Artikel total`)

  // Filter by source
  if (settings.value.sources && settings.value.sources.length > 0) {
    const before = result.length
    result = result.filter(article => {
      const sourceId = article.source.toLowerCase().replace(/\s+/g, '')
      return settings.value.sources.some(s =>
        sourceId.includes(s.toLowerCase()) ||
        article.source.toLowerCase().includes(s.toLowerCase())
      )
    })
    console.log(`  📰 Source Filter: ${before} → ${result.length} (Sources: ${settings.value.sources.join(', ')})`)
  }

  // Filter by interests (check if article topics match any interest)
  if (settings.value.interests && settings.value.interests.length > 0) {
    const before = result.length
    const filtered = result.filter(article => {
      return settings.value.interests.some(interest =>
        article.topics.some(topic =>
          topic.toLowerCase().includes(interest.toLowerCase())
        ) ||
        article.tags?.some(tag =>
          tag.toLowerCase().includes(interest.toLowerCase())
        )
      )
    })

    console.log(`  🎯 Interest Filter: ${before} → ${filtered.length} matched (Interests: ${settings.value.interests.join(', ')})`)

    // Fallback: Wenn weniger als die Hälfte matchen, zeige alle (zu strikte Filterung)
    if (filtered.length < Math.ceil(result.length / 2)) {
      console.warn(`  ⚠️ Interest Filter FALLBACK: ${filtered.length}/${result.length} zu wenig - zeige alle`)
      // result bleibt unverändert (zeige alle)
    } else {
      result = filtered
    }
  }

  // Filter by location/radius (if user has location and radius is set)
  if (currentLocation.value && settings.value.radius) {
    const before = result.length
    result = result.filter(article => {
      // Articles without coordinates pass through (can't filter them)
      if (!article.coordinates) return true

      // Calculate distance from user location to article location
      const distance = calculateDistance(
        currentLocation.value!.lat,
        currentLocation.value!.lng,
        article.coordinates.lat,
        article.coordinates.lng
      )

      // Only show articles within radius (in km)
      return distance <= settings.value.radius
    })
    console.log(`  📍 Location Filter: ${before} → ${result.length} (Radius: ${settings.value.radius}km)`)
  }

  // Filter by search query
  if (searchQuery.value) {
    const before = result.length
    const query = searchQuery.value.toLowerCase()
    result = result.filter(
      a => a.title.toLowerCase().includes(query) ||
           a.summary.toLowerCase().includes(query) ||
           a.source.toLowerCase().includes(query)
    )
    console.log(`  🔎 Search Filter: ${before} → ${result.length} (Query: "${searchQuery.value}")`)
  }

  console.log(`✅ Filter End: ${result.length} Artikel final`)
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

const handleSearch = (query: string) => {
  searchQuery.value = query
}

const handleRefresh = async () => {
  try {
    // Clear old articles first to avoid duplicates
    store.clearArticles(props.parentId || 'default')

    // Try to fetch real RSS feeds first
    const rssArticles = await newsService.fetchAllRSS(locationName.value)

    if (rssArticles.length > 0) {
      for (const article of rssArticles) {
        await store.addArticle(props.parentId || 'default', article)
      }
      success(`${rssArticles.length} neue Artikel geladen`)
    } else {
      // Fallback to mock data with default interests if empty
      const interests = settings.value.interests.length > 0
        ? settings.value.interests
        : ['community', 'local', 'tech']

      // Generate 20 articles (more variety!)
      const freshArticles = await newsService.searchByInterests(interests)
      for (const article of freshArticles) {
        await store.addArticle(props.parentId || 'default', article)
      }
      info(`${freshArticles.length} neue Artikel geladen`)
    }
  } catch (err) {
    console.error('Refresh failed:', err)
    showError('Fehler beim Laden der Nachrichten')
  }
}

const openArticleDetail = (article: NewsArticle) => {
  selectedArticle.value = article
}

const loadMore = async () => {
  console.log('Loading more articles...')

  try {
    // Generate more mock articles (in production, this would fetch from API)
    const interests = settings.value.interests.length > 0
      ? settings.value.interests
      : ['community', 'local', 'tech']

    const moreArticles = await newsService.searchByInterests(interests)

    for (const article of moreArticles) {
      await store.addArticle(props.parentId || 'default', article)
    }

    success(`${moreArticles.length} weitere Artikel geladen`)
  } catch (err) {
    console.error('Load more failed:', err)
    showError('Fehler beim Laden weiterer Artikel')
  }
}

// Handle responsive breakpoints
const updateBreakpoints = () => {
  isMobile.value = window.innerWidth < 768
  isTablet.value = window.innerWidth >= 768 && window.innerWidth < 1024
}

onMounted(async () => {
  updateBreakpoints()
  window.addEventListener('resize', updateBreakpoints)

  // Initialize default settings if not present
  if (settings.value.interests.length === 0) {
    await store.updateSettings(props.parentId || 'default', {
      interests: ['community', 'local', 'tech'],
      radius: 10,
      autoRefresh: false
    })
  }

  // Subscribe to Gun.js (optional, for P2P sync when online)
  try {
    store.subscribeToParent(props.parentId || 'default')
  } catch (err) {
    console.warn('Gun.js subscription failed (offline mode):', err)
  }

  // Load initial articles
  await handleRefresh()

  // Debug log
  console.log('NewsLayout mounted')
  console.log('Settings:', settings.value)
  console.log('Articles in store:', articles.value.length)
  console.log('Filtered Articles:', filteredArticles.value.length)
})
</script>
