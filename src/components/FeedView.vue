<!--
═══════════════════════════════════════════════════════════════════════════════
🧪 TEST-DOKUMENTATION - FeedView.vue (PHASE 2) - 230 ZEILEN
═══════════════════════════════════════════════════════════════════════════════

📋 WAS WIRD HIER GETESTET:
- Grid/List Layout Toggle
- Infinite Scroll (IntersectionObserver + Sentinel)
- Loading States (Skeleton Loader)
- Error State (Red border + icon)
- Empty State (No articles)
- Fade-Slide Transitions
- Load More (incremental 12 articles at a time)

🎯 ERWARTETE ERGEBNISSE:
✅ Layout Toggle: Grid (2 cols) vs List (single col)
✅ Infinite Scroll: Sentinel 200px vor Ende → loadMore()
✅ Loading: ArticleSkeleton (3x) während loading
✅ Error: Red border, error icon, error message
✅ Empty: "No news articles yet" + Configure button
✅ Transitions: fade-slide (translateY + opacity)
✅ Load More: +12 articles pro Scroll

🔧 WIE ZU TESTEN:
1. Layout Toggle:
   - Grid Button klicken → grid-cols-1 md:grid-cols-2
   - List Button klicken → space-y-4 (single column)
   - Active Button: bg-indigo-600 text-white
2. Infinite Scroll:
   - 50 Artikel laden
   - Nur 12 initial sichtbar (displayCount = 12)
   - Scroll nach unten → Sentinel IntersectionObserver
   - Wenn Sentinel 200px vor viewport → loadMore()
   - displayCount += 12
3. Loading State:
   - :loading="true" + articles.length === 0
   - ArticleSkeleton (3x) erscheint
   - Pulsing animation
4. Error State:
   - :error="'Failed to load'"
   - Red border (border-red-500/20)
   - Error Icon (⚠️)
   - Error Message
5. Empty State:
   - :articles="[]" + !loading + !error
   - "📰" Icon (opacity 50%)
   - "No news articles yet"
   - "Configure Settings" Button
6. Transitions:
   - New article erscheint → fade-slide-enter
   - translateY(20px) + opacity 0 → 0
   - Duration: 0.3s ease-out
7. Sentinel Test:
   - IntersectionObserver rootMargin: '200px'
   - Startet load 200px VOR Ende
   - isLoadingMore: true während loading
   - Spinner + "Lade weitere Artikel..."

📊 LAYOUT-SPECS:
- Grid: grid grid-cols-1 md:grid-cols-2 gap-4
- List: space-y-4
- Toggle Buttons: p-2 rounded, active: bg-indigo-600

🎬 ANIMATIONS:
- fade-slide-enter: translateY(20px) opacity 0 → 0 (0.3s ease-out)
- fade-slide-leave: translateY(-20px) opacity 1 → 0 (0.3s ease-in)
- Spinner: border-top-color rotate 360deg (1s linear infinite)

🔄 INFINITE SCROLL:
- IntersectionObserver: rootMargin 200px
- displayCount: initial 12, increment +12
- Sentinel: div ref="sentinelRef" beobachtet
- loadMore(): emit('load-more') wenn hasMore

🚨 BEKANNTE ISSUES:
- Keine (Phase 2 vollständig implementiert ✅)

═══════════════════════════════════════════════════════════════════════════════
-->
<template>
  <div class="space-y-6">
    <!-- Feed Header -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold text-slate-100">News Feed</h2>
        <p class="text-sm text-slate-400 mt-1">
          {{ articles.length }} {{ articles.length === 1 ? 'article' : 'articles' }}
        </p>
      </div>

      <!-- Layout Toggle -->
      <div class="flex items-center gap-2 bg-slate-800/50 backdrop-blur-sm rounded-lg p-1 border border-slate-700/50">
        <button
          @click="$emit('update:layout', 'grid')"
          :class="layout === 'grid' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-100'"
          class="p-2 rounded transition-all duration-200"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
        </button>
        <button
          @click="$emit('update:layout', 'list')"
          :class="layout === 'list' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-100'"
          class="p-2 rounded transition-all duration-200"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading && articles.length === 0" class="space-y-4">
      <ArticleSkeleton v-for="i in 3" :key="i" />
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="p-6 bg-red-500/10 border border-red-500/20 rounded-lg">
      <div class="flex items-start gap-3">
        <svg class="w-6 h-6 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <h3 class="text-red-400 font-medium">Failed to load news</h3>
          <p class="text-red-300 text-sm mt-1">{{ error }}</p>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="articles.length === 0" class="py-16 text-center">
      <div class="text-6xl mb-4 opacity-50">📰</div>
      <h3 class="text-xl font-semibold text-slate-300 mb-2">No news articles yet</h3>
      <p class="text-slate-400 mb-6">Start by adding some news sources or interests</p>
      <button
        class="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
      >
        Configure Settings
      </button>
    </div>

    <!-- Articles Grid/List -->
    <div v-else>
      <transition-group
        name="fade-slide"
        tag="div"
        :class="layout === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-4'"
      >
        <NewsCard
          v-for="article in displayedArticles"
          :key="article.id"
          :article="article"
          :show-image="true"
          @click="$emit('article-click', article)"
          class="fade-slide-item"
        />
      </transition-group>

      <!-- Infinite Scroll Sentinel -->
      <div
        v-if="hasMoreToShow"
        ref="sentinelRef"
        class="sentinel mt-8 py-8 text-center"
      >
        <div v-if="isLoadingMore" class="flex flex-col items-center gap-3">
          <div class="spinner"></div>
          <span class="text-slate-400 text-sm">Lade weitere Artikel...</span>
        </div>
        <div v-else class="text-slate-500 text-sm">
          Scrolle weiter für mehr Artikel
        </div>
      </div>

      <!-- End of Feed -->
      <div v-else class="mt-8 py-8 text-center">
        <div class="text-slate-400 text-sm">
          ✓ Alle Artikel geladen
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import NewsCard from './NewsCard.vue'
import ArticleSkeleton from './ArticleSkeleton.vue'
import type { NewsArticle } from '../types'

const props = defineProps<{
  articles: NewsArticle[]
  loading?: boolean
  error?: string | null
  layout?: 'grid' | 'list'
  hasMore?: boolean
}>()

const emit = defineEmits<{
  'article-click': [article: NewsArticle]
  'load-more': []
  'update:layout': [layout: 'grid' | 'list']
}>()

const displayCount = ref(12)
const isLoadingMore = ref(false)
const sentinelRef = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

const displayedArticles = computed(() => {
  return props.articles.slice(0, displayCount.value)
})

const hasMoreToShow = computed(() => {
  return displayCount.value < props.articles.length || props.hasMore
})

const loadMore = () => {
  if (isLoadingMore.value) return

  isLoadingMore.value = true

  // If we have more local articles, just increase display count
  if (displayCount.value < props.articles.length) {
    setTimeout(() => {
      displayCount.value += 12
      isLoadingMore.value = false
    }, 300)
  } else if (props.hasMore) {
    // Otherwise, request more from parent
    emit('load-more')
    setTimeout(() => {
      isLoadingMore.value = false
    }, 500)
  }
}

onMounted(() => {
  // Setup Intersection Observer for infinite scroll
  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && hasMoreToShow.value && !isLoadingMore.value) {
        loadMore()
      }
    },
    {
      rootMargin: '200px' // Start loading 200px before reaching end
    }
  )

  if (sentinelRef.value) {
    observer.observe(sentinelRef.value)
  }
})

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
  }
})
</script>

<style scoped>
/* Fade Slide Transition */
.fade-slide-enter-active {
  transition: all 0.3s ease-out;
}

.fade-slide-leave-active {
  transition: all 0.3s ease-in;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.fade-slide-move {
  transition: transform 0.3s ease;
}

/* Spinner */
.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(99, 102, 241, 0.2);
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Sentinel */
.sentinel {
  min-height: 80px;
}
</style>
