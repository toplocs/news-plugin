<template>
  <div class="space-y-4">
    <div v-if="loading" class="flex justify-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
    </div>

    <div v-else-if="error" class="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
      <p class="text-red-400 text-sm">{{ error }}</p>
    </div>

    <div v-else-if="articles.length === 0" class="p-8 text-center">
      <p class="text-slate-400">No news articles found</p>
      <p class="text-slate-500 text-sm mt-1">Try adjusting your filters</p>
    </div>

    <div v-else class="grid gap-4" :class="gridClass">
      <NewsCard
        v-for="article in articles"
        :key="article.id"
        :article="article"
        :show-image="showImages"
        @click="handleArticleClick"
      />
    </div>

    <div v-if="hasMore" class="flex justify-center pt-4">
      <button
        @click="$emit('load-more')"
        class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors text-sm font-medium"
      >
        Load More
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import NewsCard from './NewsCard.vue'
import type { NewsArticle } from '../types'

const props = defineProps<{
  articles: NewsArticle[]
  loading?: boolean
  error?: string | null
  layout?: 'grid' | 'list'
  showImages?: boolean
  hasMore?: boolean
}>()

const emit = defineEmits<{
  'article-click': [article: NewsArticle]
  'load-more': []
}>()

const gridClass = computed(() => {
  if (props.layout === 'list') {
    return 'grid-cols-1'
  }
  return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
})

const handleArticleClick = (article: NewsArticle) => {
  emit('article-click', article)
  // Open article URL in new tab
  if (article.url) {
    window.open(article.url, '_blank')
  }
}
</script>
