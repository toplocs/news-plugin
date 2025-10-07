<template>
  <div class="stats-bar">
    <div class="stat-item">
      <div class="stat-icon">📊</div>
      <div class="stat-content">
        <span class="stat-label">Gesamt</span>
        <span class="stat-value">{{ totalArticles }}</span>
      </div>
    </div>

    <div class="stat-item">
      <div class="stat-icon">🔥</div>
      <div class="stat-content">
        <span class="stat-label">Heute</span>
        <span class="stat-value">{{ todayArticles }}</span>
      </div>
    </div>

    <div class="stat-item">
      <div class="stat-icon">📍</div>
      <div class="stat-content">
        <span class="stat-label">Quellen</span>
        <span class="stat-value">{{ uniqueSources }}</span>
      </div>
    </div>

    <div class="stat-item">
      <div class="stat-icon">⏱️</div>
      <div class="stat-content">
        <span class="stat-label">Letzte Aktualisierung</span>
        <span class="stat-value">{{ lastUpdate }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { NewsArticle } from '../types'

const props = defineProps<{
  articles: NewsArticle[]
  lastRefresh?: number
}>()

const totalArticles = computed(() => props.articles.length)

const todayArticles = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return props.articles.filter(article => article.publishedAt >= today.getTime()).length
})

const uniqueSources = computed(() => {
  const sources = new Set(props.articles.map(article => article.source))
  return sources.size
})

const lastUpdate = computed(() => {
  if (!props.lastRefresh) return 'Nie'
  const now = Date.now()
  const diff = now - props.lastRefresh
  const minutes = Math.floor(diff / 60000)

  if (minutes < 1) return 'Gerade eben'
  if (minutes < 60) return `vor ${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `vor ${hours}h`
  return `vor ${Math.floor(hours / 24)}d`
})
</script>

<style scoped>
.stats-bar {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: rgba(30, 41, 59, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.75rem;
  transition: all 0.2s;
}

.stat-item:hover {
  background: rgba(30, 41, 59, 0.6);
  border-color: rgba(99, 102, 241, 0.3);
  transform: translateY(-2px);
}

.stat-icon {
  font-size: 1.5rem;
  opacity: 0.8;
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-label {
  font-size: 0.75rem;
  color: #94a3b8;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-value {
  font-size: 1.25rem;
  color: #f8fafc;
  font-weight: 700;
}

@media (max-width: 768px) {
  .stats-bar {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
