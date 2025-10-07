<template>
  <article
    class="news-card"
    :class="{ 'breaking': article.tags?.includes('breaking'), 'featured': featured }"
    @click="$emit('click', article)"
  >
    <!-- Image avec Location Overlay -->
    <div v-if="article.imageUrl && showImage" class="card-image-container">
      <img
        :src="article.imageUrl"
        :alt="article.title"
        class="card-image"
        @error="imageError = true"
      />

      <!-- Location Badge on Image -->
      <div class="location-overlay">
        <div class="location-badge">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
          </svg>
          <span>{{ article.locations?.[0] || 'Local' }}</span>
        </div>
      </div>

      <!-- Breaking News Badge -->
      <div v-if="article.tags?.includes('breaking')" class="breaking-badge">
        <span class="breaking-pulse"></span>
        BREAKING
      </div>
    </div>

    <!-- Card Content -->
    <div class="card-content">
      <!-- Meta Header -->
      <div class="card-meta">
        <span class="source-badge" :class="`source-${getSourceColor(article.source)}`">
          {{ article.source }}
        </span>
        <span class="time-badge">
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {{ formatTimeAgo(article.publishedAt) }}
        </span>
      </div>

      <!-- Headline -->
      <h3 class="card-headline">
        {{ article.title }}
      </h3>

      <!-- Summary -->
      <p class="card-summary">
        {{ article.summary }}
      </p>

      <!-- Footer: Author & Tags -->
      <div class="card-footer">
        <!-- Author -->
        <div v-if="article.author" class="author-info">
          <div class="author-avatar">
            {{ article.author.charAt(0).toUpperCase() }}
          </div>
          <span class="author-name">{{ article.author }}</span>
        </div>

        <!-- Tags -->
        <div v-if="article.tags?.length" class="card-tags">
          <span
            v-for="tag in article.tags.slice(0, 2)"
            :key="tag"
            class="tag"
          >
            #{{ tag }}
          </span>
        </div>
      </div>
    </div>

    <!-- Read More Indicator -->
    <div class="read-more">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
      </svg>
    </div>
  </article>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { NewsArticle } from '../types'

defineProps<{
  article: NewsArticle
  showImage?: boolean
  featured?: boolean
}>()

defineEmits<{
  click: [article: NewsArticle]
}>()

const imageError = ref(false)

const formatTimeAgo = (timestamp: number): string => {
  const now = Date.now()
  const diff = now - timestamp
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'Gerade eben'
  if (minutes < 60) return `vor ${minutes}min`
  if (hours < 24) return `vor ${hours}h`
  if (days < 7) return `vor ${days}d`
  return new Date(timestamp).toLocaleDateString('de-DE')
}

const getSourceColor = (source: string): string => {
  const colors = ['blue', 'green', 'purple', 'orange', 'pink']
  const hash = source.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return colors[hash % colors.length]
}
</script>

<style scoped>
.news-card {
  position: relative;
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.9));
  border-radius: 1rem;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(12px);
}

.news-card:hover {
  transform: translateY(-6px) scale(1.02);
  box-shadow: 0 20px 40px -10px rgba(99, 102, 241, 0.4);
  border-color: rgba(99, 102, 241, 0.5);
}

.news-card.breaking {
  border-color: rgba(239, 68, 68, 0.5);
  animation: urgent-pulse 2s infinite;
}

@keyframes urgent-pulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
  }
  50% {
    box-shadow: 0 0 0 10px rgba(239, 68, 68, 0);
  }
}

.news-card.featured {
  grid-column: span 2;
  grid-row: span 2;
}

.card-image-container {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.news-card.featured .card-image-container {
  height: 300px;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.news-card:hover .card-image {
  transform: scale(1.05);
}

.location-overlay {
  position: absolute;
  top: 1rem;
  left: 1rem;
  z-index: 2;
}

.location-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.95), rgba(59, 130, 246, 0.95));
  backdrop-filter: blur(8px);
  color: white;
  padding: 0.375rem 0.75rem;
  border-radius: 999px;
  font-size: 0.8125rem;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.breaking-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: linear-gradient(135deg, #f59e0b, #ef4444);
  color: white;
  padding: 0.375rem 0.875rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
}

.breaking-pulse {
  width: 8px;
  height: 8px;
  background: white;
  border-radius: 50%;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.3); }
}

.card-content {
  padding: 1.25rem;
}

.card-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.source-badge {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.25rem 0.625rem;
  border-radius: 0.375rem;
}

.source-blue { background: rgba(59, 130, 246, 0.2); color: #60a5fa; }
.source-green { background: rgba(16, 185, 129, 0.2); color: #34d399; }
.source-purple { background: rgba(139, 92, 246, 0.2); color: #a78bfa; }
.source-orange { background: rgba(245, 158, 11, 0.2); color: #fbbf24; }
.source-pink { background: rgba(236, 72, 153, 0.2); color: #f472b6; }

.time-badge {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.8125rem;
  color: #94a3b8;
}

.card-headline {
  font-size: 1.25rem;
  font-weight: 800;
  line-height: 1.3;
  color: #f8fafc;
  margin-bottom: 0.75rem;
  letter-spacing: -0.01em;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.news-card.featured .card-headline {
  font-size: 1.75rem;
  -webkit-line-clamp: 3;
}

.card-summary {
  font-size: 0.9375rem;
  line-height: 1.6;
  color: #cbd5e1;
  margin-bottom: 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.author-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.author-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.75rem;
  color: white;
}

.author-name {
  font-size: 0.8125rem;
  color: #cbd5e1;
  font-weight: 500;
}

.card-tags {
  display: flex;
  gap: 0.375rem;
}

.tag {
  font-size: 0.75rem;
  color: #8b5cf6;
  font-weight: 600;
}

.read-more {
  position: absolute;
  bottom: 1.25rem;
  right: 1.25rem;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  opacity: 0;
  transform: translateX(10px);
  transition: all 0.3s ease;
}

.news-card:hover .read-more {
  opacity: 1;
  transform: translateX(0);
}

@media (max-width: 768px) {
  .news-card.featured {
    grid-column: span 1;
    grid-row: span 1;
  }

  .card-headline {
    font-size: 1.125rem;
  }
}
</style>
