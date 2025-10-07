<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        @click.self="$emit('close')"
      >
        <div
          class="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-2xl border border-slate-700/50"
          @click.stop
        >
          <!-- Close Button -->
          <button
            @click="$emit('close')"
            class="sticky top-4 right-4 float-right z-10 p-2 bg-slate-800/80 hover:bg-slate-700/80 backdrop-blur-sm rounded-full transition-colors"
          >
            <svg class="w-6 h-6 text-slate-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <!-- Article Image -->
          <div v-if="article.imageUrl" class="w-full h-96 overflow-hidden">
            <img
              :src="article.imageUrl"
              :alt="article.title"
              class="w-full h-full object-cover"
            />
          </div>

          <!-- Content -->
          <div class="p-8">
            <!-- Meta Info -->
            <div class="flex items-center gap-4 text-sm text-slate-400 mb-4">
              <span class="font-medium text-indigo-400">{{ article.source }}</span>
              <span>•</span>
              <time>{{ formatDate(article.publishedAt) }}</time>
              <span v-if="article.author">•</span>
              <span v-if="article.author">{{ article.author }}</span>
            </div>

            <!-- Title -->
            <h1 class="text-4xl font-bold text-slate-100 mb-6 leading-tight">
              {{ article.title }}
            </h1>

            <!-- Summary -->
            <p class="text-lg text-slate-300 mb-8 leading-relaxed">
              {{ article.summary }}
            </p>

            <!-- Full Content -->
            <div v-if="article.content" class="prose prose-invert prose-lg max-w-none mb-8">
              <p class="text-slate-300 leading-relaxed whitespace-pre-line">
                {{ article.content }}
              </p>
            </div>

            <!-- Tags -->
            <div v-if="article.tags?.length" class="flex flex-wrap gap-2 mb-8">
              <span
                v-for="tag in article.tags"
                :key="tag"
                class="px-3 py-1 bg-indigo-600/20 text-indigo-300 text-sm rounded-full"
              >
                #{{ tag }}
              </span>
            </div>

            <!-- Actions -->
            <div class="flex items-center gap-4 pt-6 border-t border-slate-700/50">
              <a
                :href="article.url"
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <span>Read Full Article</span>
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>

              <button
                @click="shareArticle"
                class="flex items-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-slate-100 rounded-lg transition-colors font-medium"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { NewsArticle } from '../types'

const props = defineProps<{
  article: NewsArticle
}>()

const emit = defineEmits<{
  close: []
}>()

const formatDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const shareArticle = async () => {
  if (navigator.share) {
    try {
      await navigator.share({
        title: props.article.title,
        text: props.article.summary,
        url: props.article.url
      })
    } catch (err) {
      console.log('Share cancelled or failed:', err)
    }
  } else {
    // Fallback: Copy to clipboard
    navigator.clipboard.writeText(props.article.url)
    alert('Link copied to clipboard!')
  }
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from > div,
.modal-leave-to > div {
  transform: scale(0.9) translateY(20px);
}
</style>
