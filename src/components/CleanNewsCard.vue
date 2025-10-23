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

    <!-- Why Am I Seeing This? Button -->
    <button
      v-if="matchScore !== undefined && matchScore > 0"
      @click.stop="showExplanation = !showExplanation"
      class="why-btn"
      :aria-label="'Warum sehe ich das?'"
    >
      <span class="why-icon">?</span>
    </button>

    <!-- Explanation Tooltip -->
    <Transition name="fade">
      <div v-if="showExplanation" class="explanation-tooltip" @click.stop>
        <div class="explanation-header">
          <span class="explanation-title">💡 Warum siehst du das?</span>
          <button @click="showExplanation = false" class="explanation-close">×</button>
        </div>
        <div class="explanation-content">
          <div class="explanation-section">
            <div class="explanation-label">🎯 Interesse-Match</div>
            <div class="explanation-value">{{ Math.round(matchScore * 100) }}% Übereinstimmung</div>
            <div v-if="matchedInterests.length > 0" class="explanation-interests">
              <span v-for="interest in matchedInterests" :key="interest" class="interest-tag">
                {{ interest }}
              </span>
            </div>
          </div>
          <div v-if="distance !== undefined" class="explanation-section">
            <div class="explanation-label">📍 Distanz</div>
            <div class="explanation-value">{{ formatDistance(distance) }} von dir entfernt</div>
          </div>
          <div class="explanation-section">
            <div class="explanation-label">✨ Transparenz-Versprechen</div>
            <div class="explanation-text">
              Wir zeigen dir diesen Artikel, weil er zu deinen Interessen passt und in deinem Umkreis ist.
              <strong>Keine versteckten Algorithmen</strong> – du hast die volle Kontrolle.
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Image -->
    <div v-if="article.imageUrl" class="card-image">
      <img :src="article.imageUrl" :alt="article.title" loading="lazy" decoding="async" />
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
        <span v-if="distance !== undefined && distance > 0" class="distance">
          📍 {{ formatDistance(distance) }}
        </span>
        <span v-if="matchScore !== undefined && matchScore > 0" class="match-score" :class="getMatchClass(matchScore)">
          {{ getMatchLabel(matchScore) }}
        </span>
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
import { ref, computed } from 'vue'
import type { NewsArticle } from '../types'

const props = defineProps<{
  article: NewsArticle
  isBookmarked?: boolean
  distance?: number  // Distance in km from user location
  matchScore?: number  // Match score 0-1 from interest system
}>()

const showExplanation = ref(false)

// 💡 Calculate which interests matched this article
const matchedInterests = computed(() => {
  const interests: string[] = []

  // Extract from topics
  props.article.topics.forEach(topic => {
    if (!interests.includes(topic)) {
      interests.push(topic)
    }
  })

  // Extract from tags (max 5 total)
  props.article.tags?.forEach(tag => {
    if (interests.length < 5 && !interests.includes(tag)) {
      interests.push(tag)
    }
  })

  return interests.slice(0, 3) // Show max 3
})

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

const formatDistance = (km: number): string => {
  if (km < 1) {
    return `${Math.round(km * 1000)}m`
  }
  return `${km.toFixed(1)}km`
}

// 🎯 Get match score label
const getMatchLabel = (score: number): string => {
  const percentage = Math.round(score * 100)
  if (score >= 0.8) return `🔥 ${percentage}% Match`
  if (score >= 0.5) return `✨ ${percentage}% Match`
  if (score >= 0.3) return `💫 ${percentage}% Match`
  return `${percentage}% Match`
}

// 🎯 Get CSS class for match score
const getMatchClass = (score: number): string => {
  if (score >= 0.8) return 'match-high'
  if (score >= 0.5) return 'match-medium'
  return 'match-low'
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

/* Why Am I Seeing This? Button */
.why-btn {
  position: absolute;
  top: 0.75rem;
  left: 0.75rem;
  z-index: 10;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(99, 102, 241, 0.9);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
}

.why-btn:hover {
  background: rgba(99, 102, 241, 1);
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}

.why-icon {
  font-size: 1rem;
  font-weight: 700;
}

/* Explanation Tooltip */
.explanation-tooltip {
  position: absolute;
  top: 3rem;
  left: 0.75rem;
  right: 0.75rem;
  z-index: 20;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(30, 41, 59, 0.98));
  backdrop-filter: blur(16px);
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 0.75rem;
  padding: 1rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

.explanation-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.explanation-title {
  font-size: 0.9375rem;
  font-weight: 700;
  color: #f8fafc;
}

.explanation-close {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 50%;
  font-size: 1.25rem;
  color: #cbd5e1;
  cursor: pointer;
  transition: all 0.2s;
}

.explanation-close:hover {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.explanation-content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.explanation-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.explanation-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.explanation-value {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #a5b4fc;
}

.explanation-text {
  font-size: 0.875rem;
  color: #cbd5e1;
  line-height: 1.5;
}

.explanation-text strong {
  color: #10b981;
  font-weight: 700;
}

.explanation-interests {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.interest-tag {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  background: rgba(139, 92, 246, 0.15);
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: 999px;
  color: #a78bfa;
  font-weight: 600;
}

/* Fade Transition */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
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

.distance {
  color: #10b981;
  font-weight: 600;
  background: rgba(16, 185, 129, 0.1);
  padding: 0.125rem 0.5rem;
  border-radius: 999px;
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.match-score {
  font-weight: 600;
  padding: 0.125rem 0.5rem;
  border-radius: 999px;
  font-size: 0.75rem;
  white-space: nowrap;
}

.match-score.match-high {
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.15);
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.match-score.match-medium {
  color: #8b5cf6;
  background: rgba(139, 92, 246, 0.15);
  border: 1px solid rgba(139, 92, 246, 0.3);
}

.match-score.match-low {
  color: #6366f1;
  background: rgba(99, 102, 241, 0.15);
  border: 1px solid rgba(99, 102, 241, 0.3);
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
