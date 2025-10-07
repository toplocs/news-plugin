<template>
  <div class="clean-layout">
    <!-- Header -->
    <CleanHeader
      :location="locationName"
      @search="handleSearch"
      @refresh="handleRefresh"
      @settings="showSettings = true"
    />

    <!-- Main Content -->
    <main class="main-content">
      <div class="container">
        <!-- Statistics Bar -->
        <StatsBar :articles="articles" :last-refresh="lastRefreshTime" />

        <!-- Location Bar -->
        <div class="location-bar">
          <div class="location-info">
            <LocationSelector @location-change="handleLocationChange" />
            <span class="radius">{{ settings.radius }}km Umkreis</span>
            <span class="count">{{ filteredArticles.length }} Artikel</span>
          </div>
          <div class="filters">
            <button
              v-for="category in categories"
              :key="category"
              @click="toggleFilter(category)"
              :class="{ active: activeCategories.includes(category) }"
              class="filter-btn"
            >
              {{ category }}
            </button>
          </div>
        </div>

        <!-- News Grid -->
        <div class="news-grid">
          <CleanNewsCard
            v-for="article in displayedArticles"
            :key="article.id"
            :article="article"
            @click="selectedArticle = article"
          />
        </div>

        <!-- Empty State -->
        <div v-if="displayedArticles.length === 0" class="empty-state">
          <div class="empty-icon">📰</div>
          <h3>Keine Artikel gefunden</h3>
          <p>Versuche einen anderen Suchbegriff oder Filter</p>
        </div>
      </div>
    </main>

    <!-- Article Modal -->
    <Teleport to="body">
      <div v-if="selectedArticle" class="modal-overlay" @click="selectedArticle = null">
        <div class="modal-content" @click.stop>
          <button class="modal-close" @click="selectedArticle = null">×</button>

          <img v-if="selectedArticle.imageUrl" :src="selectedArticle.imageUrl" class="modal-image" />

          <div class="modal-body">
            <div class="modal-meta">
              <span class="modal-source">{{ selectedArticle.source }}</span>
              <span class="modal-time">{{ formatDate(selectedArticle.publishedAt) }}</span>
            </div>

            <h2 class="modal-title">{{ selectedArticle.title }}</h2>
            <p class="modal-summary">{{ selectedArticle.summary }}</p>

            <a :href="selectedArticle.url" target="_blank" class="modal-link">
              Artikel öffnen →
            </a>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Settings Modal -->
    <SettingsModal
      v-model="showSettings"
      :settings="settings"
      @save="handleSaveSettings"
    />

    <!-- Loading Overlay -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner">
        <div class="spinner"></div>
        <span>Lade Nachrichten...</span>
      </div>
    </div>

    <!-- Toast Notifications -->
    <ToastContainer />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useNewsStore } from '../stores/useNewsStore'
import { newsService } from '../services/newsService'
import { useLocation } from '../composables/useLocation'
import { useToast } from '../composables/useToast'
import CleanHeader from '../components/CleanHeader.vue'
import CleanNewsCard from '../components/CleanNewsCard.vue'
import LocationSelector from '../components/LocationSelector.vue'
import SettingsModal from '../components/SettingsModal.vue'
import StatsBar from '../components/StatsBar.vue'
import ToastContainer from '../components/ToastContainer.vue'
import type { NewsArticle } from '../types'

const props = defineProps<{
  parentId?: string
  entity?: string
}>()

const store = useNewsStore()
const { currentLocation, calculateDistance } = useLocation()
const { success, error, info } = useToast()
const searchQuery = ref('')
const activeCategories = ref<string[]>([])
const selectedArticle = ref<NewsArticle | null>(null)
const showSettings = ref(false)
const isLoading = ref(false)
const lastRefreshTime = ref<number>(0)
let autoRefreshInterval: ReturnType<typeof setInterval> | null = null

const categories = ['Alle', 'Breaking', 'Lokal', 'Community', 'Tech']

const articles = computed(() => store.getArticlesByParent(props.parentId || 'default'))
const settings = computed(() => store.getSettings(props.parentId || 'default'))

const locationName = computed(() => {
  if (currentLocation.value?.name) {
    return currentLocation.value.name
  }
  return props.parentId === 'demo' ? 'Berlin Mitte' : 'Deine Location'
})

const filteredArticles = computed(() => {
  let result = articles.value

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(a =>
      a.title.toLowerCase().includes(q) ||
      a.summary.toLowerCase().includes(q)
    )
  }

  if (activeCategories.value.length > 0 && !activeCategories.value.includes('Alle')) {
    result = result.filter(a =>
      activeCategories.value.some(cat =>
        a.tags?.includes(cat.toLowerCase()) ||
        a.source.toLowerCase().includes(cat.toLowerCase())
      )
    )
  }

  return result
})

const displayedArticles = computed(() => filteredArticles.value.slice(0, 12))

const handleSearch = (query: string) => {
  searchQuery.value = query
}

const handleLocationChange = async (location: { lat: number; lng: number; name?: string } | null) => {
  if (location) {
    info(`Standort gewechselt: ${location.name || 'Unbekannt'}`)
    // Refresh articles with new location
    await handleRefresh()
  }
}

const handleRefresh = async () => {
  isLoading.value = true

  try {
    // Fetch real RSS feeds
    const rssArticles = await newsService.fetchAllRSS(locationName.value)

    // If RSS feeds return articles, use them
    if (rssArticles.length > 0) {
      for (const article of rssArticles) {
        await store.addArticle(props.parentId || 'default', article)
      }
      success(`${rssArticles.length} neue Artikel geladen`)
    } else {
      // Fallback to mock data if RSS fails
      const freshArticles = await newsService.searchByInterests(settings.value.interests)
      for (const article of freshArticles) {
        await store.addArticle(props.parentId || 'default', article)
      }
      info(`${freshArticles.length} Artikel geladen (Mock-Daten)`)
    }

    lastRefreshTime.value = Date.now()
  } catch (err) {
    console.error('Refresh failed:', err)
    error('Fehler beim Laden der Nachrichten')
  } finally {
    isLoading.value = false
  }
}

const handleSaveSettings = async (newSettings: any) => {
  try {
    await store.updateSettings(props.parentId || 'default', newSettings)
    success('Einstellungen gespeichert')

    // Restart auto-refresh if settings changed
    setupAutoRefresh()
  } catch (err) {
    console.error('Settings save failed:', err)
    error('Fehler beim Speichern der Einstellungen')
  }
}

const setupAutoRefresh = () => {
  // Clear existing interval
  if (autoRefreshInterval) {
    clearInterval(autoRefreshInterval)
    autoRefreshInterval = null
  }

  // Setup new interval if enabled
  if (settings.value.autoRefresh) {
    autoRefreshInterval = setInterval(() => {
      handleRefresh()
    }, settings.value.refreshInterval)
  }
}

const toggleFilter = (category: string) => {
  if (category === 'Alle') {
    activeCategories.value = []
  } else {
    const index = activeCategories.value.indexOf(category)
    if (index > -1) {
      activeCategories.value.splice(index, 1)
    } else {
      activeCategories.value.push(category)
    }
  }
}

const formatDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(async () => {
  store.subscribeToParent(props.parentId || 'default')

  // Load initial RSS feeds on mount
  await handleRefresh()

  // Setup auto-refresh
  setupAutoRefresh()
})

onUnmounted(() => {
  // Cleanup auto-refresh interval
  if (autoRefreshInterval) {
    clearInterval(autoRefreshInterval)
  }
})
</script>

<style scoped>
.clean-layout {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
}

.main-content {
  padding: 2rem 0;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.location-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  margin-bottom: 2rem;
  padding: 1rem 1.5rem;
  background: rgba(30, 41, 59, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.75rem;
}

.location-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.9375rem;
}

.radius {
  color: #6366f1;
  font-weight: 600;
}

.count {
  color: #94a3b8;
}

.filters {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 0.5rem 1rem;
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  color: #cbd5e1;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-btn:hover {
  background: rgba(99, 102, 241, 0.2);
  border-color: #6366f1;
}

.filter-btn.active {
  background: #6366f1;
  border-color: #6366f1;
  color: white;
}

.news-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state h3 {
  font-size: 1.5rem;
  color: #f8fafc;
  margin: 0 0 0.5rem 0;
}

.empty-state p {
  color: #94a3b8;
  font-size: 1rem;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 2rem;
}

.modal-content {
  background: #1e293b;
  border-radius: 1rem;
  max-width: 700px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
}

.modal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(15, 23, 42, 0.9);
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  z-index: 10;
}

.modal-image {
  width: 100%;
  height: 300px;
  object-fit: cover;
}

.modal-body {
  padding: 2rem;
}

.modal-meta {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  font-size: 0.875rem;
}

.modal-source {
  color: #6366f1;
  font-weight: 600;
}

.modal-time {
  color: #94a3b8;
}

.modal-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #f8fafc;
  line-height: 1.3;
  margin: 0 0 1rem 0;
}

.modal-summary {
  font-size: 1.0625rem;
  color: #cbd5e1;
  line-height: 1.6;
  margin: 0 0 2rem 0;
}

.modal-link {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background: #6366f1;
  color: white;
  text-decoration: none;
  border-radius: 0.5rem;
  font-weight: 600;
  transition: all 0.2s;
}

.modal-link:hover {
  background: #4f46e5;
  transform: translateY(-2px);
}

/* Loading Overlay */
.loading-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.9);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(99, 102, 241, 0.2);
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-spinner span {
  color: #f8fafc;
  font-size: 1.125rem;
  font-weight: 600;
}

@media (max-width: 768px) {
  .main-content {
    padding: 1.5rem 0;
  }

  .container {
    padding: 0 1rem;
  }

  .location-bar {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .location-info {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }

  .filters {
    justify-content: flex-start;
  }

  .filter-btn {
    font-size: 0.8125rem;
    padding: 0.4rem 0.875rem;
  }

  .news-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .modal-overlay {
    padding: 1rem;
  }

  .modal-content {
    max-height: 85vh;
  }
}

@media (max-width: 480px) {
  .main-content {
    padding: 1rem 0;
  }

  .container {
    padding: 0 0.75rem;
  }

  .location-bar {
    padding: 1rem;
  }

  .filter-btn {
    font-size: 0.75rem;
    padding: 0.375rem 0.75rem;
  }

  .empty-state {
    padding: 3rem 1rem;
  }

  .empty-icon {
    font-size: 3rem;
  }

  .empty-state h3 {
    font-size: 1.25rem;
  }

  .empty-state p {
    font-size: 0.875rem;
  }
}
</style>
