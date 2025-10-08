<template>
  <article class="news-card" @click="$emit('click', article)">
    <!-- Bookmark Button -->
    <button
      @click.stop="$emit('bookmark', article)"
      class="bookmark-btn"
      :class="{ bookmarked: isBookmarked }"
      :aria-label="isBookmarked ? 'Lesezeichen entfernen' : 'Lesezeichen hinzufügen'"
    >
      <svg v-if="!isBookmarked" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
      </svg>
      <svg v-else width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
        <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
      </svg>
    </button>

    <!-- Image -->
    <div v-if="article.imageUrl" class="card-image">
      <img :src="article.imageUrl" :alt="article.title" />
      <div class="image-overlay">
        <span class="location-tag">📍 {{ article.locations?.[0] || 'Lokal' }}</span>
      </div>
    </div>

    <!-- Content -->
    <div class="card-body">
      <!-- Meta -->
      <div class="meta">
        <span class="source">{{ article.source }}</span>
        <span class="time">{{ formatTime(article.publishedAt) }}</span>
      </div>

      <!-- Title -->
      <h3 class="title">{{ article.title }}</h3>

      <!-- Summary -->
      <p class="summary">{{ article.summary }}</p>

      <!-- Footer -->
      <div class="footer">
        <div v-if="article.author && article.author !== 'none'" class="author">
          <div class="avatar">{{ article.author[0] }}</div>
          <span>{{ article.author }}</span>
        </div>
        <div class="tags">
          <span v-for="tag in article.tags?.slice(0, 2)" :key="tag" class="tag">
            #{{ tag }}
          </span>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { NewsArticle } from '../types'

defineProps<{
  article: NewsArticle
  isBookmarked?: boolean
}>()

defineEmits<{
  click: [article: NewsArticle]
  bookmark: [article: NewsArticle]
}>()

const formatTime = (timestamp: number): string => {
  const now = Date.now()
  const diff = now - timestamp
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'Jetzt'
  if (minutes < 60) return `${minutes}m`
  if (hours < 24) return `${hours}h`
  if (days < 7) return `${days}d`
  return new Date(timestamp).toLocaleDateString('de')
}
</script>

<style scoped>
.news-card {
  position: relative;
  background: rgba(30, 41, 59, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.75rem;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s;
}

.news-card:hover {
  transform: translateY(-2px);
  border-color: rgba(99, 102, 241, 0.5);
  background: rgba(30, 41, 59, 0.6);
}

.bookmark-btn {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  z-index: 10;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(15, 23, 42, 0.9);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  color: #cbd5e1;
  cursor: pointer;
  transition: all 0.2s;
}

.bookmark-btn:hover {
  background: rgba(99, 102, 241, 0.2);
  border-color: #6366f1;
  color: #6366f1;
  transform: scale(1.1);
}

.bookmark-btn.bookmarked {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border-color: #6366f1;
  color: white;
}

.bookmark-btn.bookmarked:hover {
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  transform: scale(1.05);
}

.card-image {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to top, rgba(15, 23, 42, 0.8) 0%, transparent 50%);
  display: flex;
  align-items: flex-end;
  padding: 1rem;
}

.location-tag {
  font-size: 0.8125rem;
  color: white;
  font-weight: 600;
  background: rgba(99, 102, 241, 0.9);
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
}

.card-body {
  padding: 1.25rem;
}

.meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  font-size: 0.8125rem;
}

.source {
  color: #6366f1;
  font-weight: 600;
}

.time {
  color: #94a3b8;
}

.title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #f8fafc;
  line-height: 1.4;
  margin: 0 0 0.75rem 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.summary {
  font-size: 0.9375rem;
  color: #cbd5e1;
  line-height: 1.5;
  margin: 0 0 1rem 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.author {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8125rem;
  color: #94a3b8;
}

.avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.6875rem;
  font-weight: 700;
  color: white;
}

.tags {
  display: flex;
  gap: 0.5rem;
}

.tag {
  font-size: 0.75rem;
  color: #8b5cf6;
  font-weight: 600;
}
</style>
