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
          v-for="article in articles"
          :key="article.id"
          :article="article"
          :show-image="true"
          @click="$emit('article-click', article)"
          class="fade-slide-item"
        />
      </transition-group>

      <!-- Load More -->
      <div v-if="hasMore" class="mt-8 text-center">
        <button
          @click="$emit('load-more')"
          class="px-8 py-3 bg-slate-800/50 hover:bg-slate-800/70 backdrop-blur-sm border border-slate-700/50 text-slate-100 rounded-lg transition-all duration-200 font-medium hover:scale-105 transform"
        >
          Load More Articles
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import NewsCard from './NewsCard.vue'
import ArticleSkeleton from './ArticleSkeleton.vue'
import type { NewsArticle } from '../types'

defineProps<{
  articles: NewsArticle[]
  loading?: boolean
  error?: string | null
  layout?: 'grid' | 'list'
  hasMore?: boolean
}>()

defineEmits<{
  'article-click': [article: NewsArticle]
  'load-more': []
  'update:layout': [layout: 'grid' | 'list']
}>()
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
</style>
