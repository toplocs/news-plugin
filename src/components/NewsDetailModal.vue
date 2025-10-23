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
              loading="lazy"
              decoding="async"
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

              <!-- Bookmark Button -->
              <button
                @click="handleBookmarkToggle"
                class="flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-200 font-medium"
                :class="isBookmarked ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-100'"
                :aria-label="isBookmarked ? 'Lesezeichen entfernen' : 'Zu Lesezeichen hinzufügen'"
              >
                <svg v-if="!isBookmarked" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                <svg v-else class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                <span>{{ isBookmarked ? 'Gespeichert' : 'Speichern' }}</span>
              </button>

              <!-- Share Button with Dropdown -->
              <div class="relative">
                <button
                  @click="shareArticle"
                  class="flex items-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-slate-100 rounded-lg transition-colors font-medium"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  <span>Teilen</span>
                </button>

                <!-- Share Menu (Desktop only) -->
                <Transition name="share-menu">
                  <div
                    v-if="showShareMenu"
                    class="absolute bottom-full mb-2 right-0 w-64 bg-slate-800 border border-slate-700 rounded-lg shadow-2xl overflow-hidden z-20"
                    @click.stop
                  >
                    <!-- Copy Link -->
                    <button
                      @click="handleCopyLink"
                      class="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-700 transition-colors text-left"
                    >
                      <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <span class="text-slate-100 font-medium">Link kopieren</span>
                    </button>

                    <div class="border-t border-slate-700"></div>

                    <!-- Social Media Options -->
                    <button
                      @click="handleShareToSocial('twitter')"
                      class="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-700 transition-colors text-left"
                    >
                      <span class="text-xl">𝕏</span>
                      <span class="text-slate-100">Auf Twitter teilen</span>
                    </button>

                    <button
                      @click="handleShareToSocial('facebook')"
                      class="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-700 transition-colors text-left"
                    >
                      <span class="text-xl">📘</span>
                      <span class="text-slate-100">Auf Facebook teilen</span>
                    </button>

                    <button
                      @click="handleShareToSocial('linkedin')"
                      class="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-700 transition-colors text-left"
                    >
                      <span class="text-xl">💼</span>
                      <span class="text-slate-100">Auf LinkedIn teilen</span>
                    </button>

                    <button
                      @click="handleShareToSocial('whatsapp')"
                      class="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-700 transition-colors text-left"
                    >
                      <span class="text-xl">💬</span>
                      <span class="text-slate-100">Auf WhatsApp teilen</span>
                    </button>
                  </div>
                </Transition>
              </div>
            </div>

            <!-- Reactions -->
            <div class="mt-8">
              <ReactionBar :article-id="article.id" />
            </div>

            <!-- Comments Section -->
            <div class="mt-8 pt-8 border-t border-slate-700/50">
              <CommentSection :article-id="article.id" :show-emoji-picker="true" />
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { NewsArticle } from '../types'
import { useShare } from '../composables/useShare'
import { useBookmarks } from '../stores/useBookmarks'
import CommentSection from './CommentSection.vue'
import ReactionBar from './ReactionBar.vue'

const props = defineProps<{
  article: NewsArticle
}>()

const emit = defineEmits<{
  close: []
}>()

const { share, copyToClipboard, shareToSocial, canShare } = useShare()
const bookmarksStore = useBookmarks()
const showShareMenu = ref(false)

// Check if article is bookmarked
const isBookmarked = computed(() => bookmarksStore.isBookmarked(props.article.id))

// Toggle bookmark
const handleBookmarkToggle = () => {
  bookmarksStore.toggleBookmark(props.article)
}

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
  // Use native share if available, otherwise show share menu
  if (canShare()) {
    await share({
      title: props.article.title,
      text: props.article.summary,
      url: props.article.url
    })
  } else {
    // Toggle share menu on desktop
    showShareMenu.value = !showShareMenu.value
  }
}

const handleCopyLink = async () => {
  await copyToClipboard(props.article.url)
  showShareMenu.value = false
}

const handleShareToSocial = (platform: 'twitter' | 'facebook' | 'linkedin' | 'whatsapp') => {
  shareToSocial(platform, {
    title: props.article.title,
    text: props.article.summary,
    url: props.article.url
  })
  showShareMenu.value = false
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

/* Share Menu Transition */
.share-menu-enter-active,
.share-menu-leave-active {
  transition: all 0.2s ease;
}

.share-menu-enter-from,
.share-menu-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.95);
}

.share-menu-enter-to,
.share-menu-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.modal-enter-from > div,
.modal-leave-to > div {
  transform: scale(0.9) translateY(20px);
}
</style>
