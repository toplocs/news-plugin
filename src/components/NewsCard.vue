<template>
  <article
    class="bg-slate-800/50 backdrop-blur-sm rounded-lg overflow-hidden hover:bg-slate-800/70 transition-all duration-200 hover:scale-[1.02] cursor-pointer"
    @click="$emit('click', article)"
  >
    <div v-if="article.imageUrl && showImage" class="w-full h-48 overflow-hidden">
      <img
        :src="article.imageUrl"
        :alt="article.title"
        class="w-full h-full object-cover"
        @error="imageError = true"
      />
    </div>

    <div class="p-4 space-y-2">
      <div class="flex items-start justify-between gap-2">
        <h3 class="text-lg font-semibold text-slate-100 line-clamp-2">
          {{ article.title }}
        </h3>
      </div>

      <p class="text-sm text-slate-400 line-clamp-3">
        {{ article.summary }}
      </p>

      <div class="flex items-center justify-between text-xs text-slate-500">
        <div class="flex items-center gap-2">
          <span class="font-medium">{{ article.source }}</span>
          <span v-if="article.author">• {{ article.author }}</span>
        </div>
        <time :datetime="formatDate(article.publishedAt, 'iso')">
          {{ formatDate(article.publishedAt, 'relative') }}
        </time>
      </div>

      <div v-if="article.tags?.length" class="flex flex-wrap gap-1">
        <span
          v-for="tag in article.tags.slice(0, 3)"
          :key="tag"
          class="px-2 py-1 bg-indigo-600/20 text-indigo-300 text-xs rounded-full"
        >
          {{ tag }}
        </span>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { NewsArticle } from '../types'

defineProps<{
  article: NewsArticle
  showImage?: boolean
}>()

defineEmits<{
  click: [article: NewsArticle]
}>()

const imageError = ref(false)

const formatDate = (timestamp: number, format: 'iso' | 'relative') => {
  const date = new Date(timestamp)

  if (format === 'iso') {
    return date.toISOString()
  }

  const now = Date.now()
  const diff = now - timestamp
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`

  return date.toLocaleDateString()
}
</script>
