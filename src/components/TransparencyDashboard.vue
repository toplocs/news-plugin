<template>
  <div class="transparency-dashboard">
    <!-- Header -->
    <div class="dashboard-header">
      <div class="header-title">
        <span class="title-icon">✨</span>
        <h2>Transparenz-Dashboard</h2>
      </div>
      <p class="header-subtitle">
        Verstehe genau, warum du welche Inhalte siehst – <strong>keine versteckten Algorithmen</strong>
      </p>
    </div>

    <!-- Algorithm Explanation -->
    <div class="dashboard-section">
      <h3 class="section-title">🧠 Wie funktioniert unser Algorithmus?</h3>
      <div class="algorithm-steps">
        <div class="step">
          <span class="step-number">1</span>
          <div class="step-content">
            <h4>Deine Interessen</h4>
            <p>Wir matchen Artikel mit deinen {{ interests.interests.value.length }} Interessen</p>
          </div>
        </div>
        <div class="step">
          <span class="step-number">2</span>
          <div class="step-content">
            <h4>Distanz-Filter</h4>
            <p>Nur Artikel innerhalb von {{ settings.radius }}km werden gezeigt</p>
          </div>
        </div>
        <div class="step">
          <span class="step-number">3</span>
          <div class="step-content">
            <h4>Sortierung</h4>
            <p>Nach {{ sortLabel }} sortiert</p>
          </div>
        </div>
        <div class="step">
          <span class="step-number">4</span>
          <div class="step-content">
            <h4>Volle Transparenz</h4>
            <p>Du siehst ALLE relevanten Artikel – keine versteckten Inhalte</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Interest Breakdown -->
    <div v-if="interestStats.length > 0" class="dashboard-section">
      <h3 class="section-title">💫 Deine Interessen im Detail</h3>
      <div class="interest-breakdown">
        <div v-for="stat in interestStats" :key="stat.keyword" class="interest-stat">
          <div class="interest-stat-header">
            <span class="interest-name">{{ stat.keyword }}</span>
            <span class="interest-matches">{{ stat.matches }} Artikel</span>
          </div>
          <div class="interest-bar">
            <div class="interest-bar-fill" :style="{ width: `${stat.percentage}%` }"></div>
          </div>
          <span class="interest-percentage">{{ Math.round(stat.percentage) }}% aller Artikel</span>
        </div>
      </div>
    </div>

    <!-- Distance Distribution -->
    <div class="dashboard-section">
      <h3 class="section-title">📍 Distanz-Verteilung</h3>
      <div class="distance-breakdown">
        <div v-for="range in distanceRanges" :key="range.label" class="distance-range">
          <div class="range-header">
            <span class="range-label">{{ range.label }}</span>
            <span class="range-count">{{ range.count }} Artikel</span>
          </div>
          <div class="range-bar">
            <div class="range-bar-fill" :style="{ width: `${range.percentage}%` }"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Match Score Distribution -->
    <div class="dashboard-section">
      <h3 class="section-title">🔥 Match Score Verteilung</h3>
      <div class="score-breakdown">
        <div class="score-card high">
          <div class="score-icon">🔥</div>
          <div class="score-value">{{ highMatchCount }}</div>
          <div class="score-label">Sehr hoher Match (80%+)</div>
        </div>
        <div class="score-card medium">
          <div class="score-icon">✨</div>
          <div class="score-value">{{ mediumMatchCount }}</div>
          <div class="score-label">Hoher Match (50-80%)</div>
        </div>
        <div class="score-card low">
          <div class="score-icon">💫</div>
          <div class="score-value">{{ lowMatchCount }}</div>
          <div class="score-label">Guter Match (30-50%)</div>
        </div>
      </div>
    </div>

    <!-- Anti-Instagram Comparison -->
    <div class="dashboard-section comparison">
      <h3 class="section-title">🆚 Wir vs. Instagram/TikTok</h3>
      <div class="comparison-grid">
        <div class="comparison-item us">
          <div class="comparison-header">
            <span class="comparison-icon">✅</span>
            <strong>LocalConnect</strong>
          </div>
          <ul class="comparison-list">
            <li>✨ Volle Transparenz</li>
            <li>🎯 Du kontrollierst deine Interessen</li>
            <li>📍 Lokaler Fokus</li>
            <li>🚫 Kein Infinite Scroll</li>
            <li>💚 Keine versteckten Algorithmen</li>
            <li>🔒 Deine Daten bleiben lokal</li>
          </ul>
        </div>
        <div class="comparison-item them">
          <div class="comparison-header">
            <span class="comparison-icon">⚠️</span>
            <strong>Instagram/TikTok</strong>
          </div>
          <ul class="comparison-list">
            <li>🌫️ Intransparente Algorithmen</li>
            <li>🎰 Manipulation durch Feed</li>
            <li>🌍 Globaler Content</li>
            <li>♾️ Süchtig machender Scroll</li>
            <li>🤖 Black-Box AI</li>
            <li>📊 Daten werden verkauft</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Transparency Promise -->
    <div class="dashboard-section promise">
      <div class="promise-icon">🤝</div>
      <h3>Unser Transparenz-Versprechen</h3>
      <p class="promise-text">
        Wir zeigen dir <strong>immer</strong> warum du einen Artikel siehst.
        Du kannst <strong>jederzeit</strong> deine Interessen anpassen.
        Es gibt <strong>keine versteckten</strong> Inhalte oder manipulative Algorithmen.
        Du hast die <strong>volle Kontrolle</strong>.
      </p>
      <div class="promise-actions">
        <button @click="$emit('edit-interests')" class="action-btn primary">
          <span>✏️</span>
          <span>Interessen bearbeiten</span>
        </button>
        <button @click="$emit('view-algorithm')" class="action-btn secondary">
          <span>🔍</span>
          <span>Algorithmus im Detail</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useNewsStore } from '../stores/useNewsStore'
import { useInterests } from '../stores/useInterests'
import { useLocation } from '../composables/useLocation'

const props = defineProps<{
  parentId?: string
  sortBy?: 'distance' | 'match' | 'time'
}>()

defineEmits<{
  'edit-interests': []
  'view-algorithm': []
  close: []
}>()

const store = useNewsStore()
const interests = useInterests()
const { currentLocation, calculateDistance } = useLocation()

const articles = computed(() => store.getArticlesByParent(props.parentId || 'default'))
const settings = computed(() => store.getSettings(props.parentId || 'default'))

// Sort label
const sortLabel = computed(() => {
  switch (props.sortBy) {
    case 'distance': return 'Distanz'
    case 'match': return 'Match Score'
    case 'time': return 'Zeit (neueste zuerst)'
    default: return 'Distanz'
  }
})

// Interest Statistics
const interestStats = computed(() => {
  const stats = interests.interests.value.map(interest => {
    const matches = articles.value.filter(article => {
      const topics = article.topics || []
      const tags = article.tags || []
      return topics.includes(interest.keyword) || tags.includes(interest.keyword)
    }).length

    return {
      keyword: interest.keyword,
      matches,
      percentage: articles.value.length > 0 ? (matches / articles.value.length) * 100 : 0
    }
  })

  return stats.sort((a, b) => b.matches - a.matches).slice(0, 5)
})

// Distance Ranges
const distanceRanges = computed(() => {
  if (!currentLocation.value) return []

  const ranges = [
    { label: '0-2 km', min: 0, max: 2, count: 0, percentage: 0 },
    { label: '2-5 km', min: 2, max: 5, count: 0, percentage: 0 },
    { label: '5-10 km', min: 5, max: 10, count: 0, percentage: 0 },
    { label: '10-25 km', min: 10, max: 25, count: 0, percentage: 0 },
    { label: '25+ km', min: 25, max: Infinity, count: 0, percentage: 0 }
  ]

  articles.value.forEach(article => {
    if (!article.coordinates) return

    const dist = calculateDistance(
      currentLocation.value!.lat,
      currentLocation.value!.lng,
      article.coordinates.lat,
      article.coordinates.lng
    )

    const range = ranges.find(r => dist >= r.min && dist < r.max)
    if (range) range.count++
  })

  const articlesWithCoords = articles.value.filter(a => a.coordinates).length
  ranges.forEach(range => {
    range.percentage = articlesWithCoords > 0 ? (range.count / articlesWithCoords) * 100 : 0
  })

  return ranges.filter(r => r.count > 0)
})

// Match Score Distribution
const highMatchCount = computed(() => {
  return articles.value.filter(a => interests.calculateArticleScore(a) >= 0.8).length
})

const mediumMatchCount = computed(() => {
  return articles.value.filter(a => {
    const score = interests.calculateArticleScore(a)
    return score >= 0.5 && score < 0.8
  }).length
})

const lowMatchCount = computed(() => {
  return articles.value.filter(a => {
    const score = interests.calculateArticleScore(a)
    return score >= 0.3 && score < 0.5
  }).length
})
</script>

<style scoped>
.transparency-dashboard {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Header */
.dashboard-header {
  text-align: center;
  margin-bottom: 1rem;
}

.header-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.title-icon {
  font-size: 2rem;
}

.dashboard-header h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #f8fafc;
  margin: 0;
}

.header-subtitle {
  font-size: 0.9375rem;
  color: #cbd5e1;
  margin: 0;
}

.header-subtitle strong {
  color: #10b981;
  font-weight: 700;
}

/* Sections */
.dashboard-section {
  background: rgba(30, 41, 59, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.75rem;
  padding: 1.5rem;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #f8fafc;
  margin: 0 0 1rem 0;
}

/* Algorithm Steps */
.algorithm-steps {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.step {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.step-number {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border-radius: 50%;
  font-size: 0.875rem;
  font-weight: 700;
  color: white;
  flex-shrink: 0;
}

.step-content h4 {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #f8fafc;
  margin: 0 0 0.25rem 0;
}

.step-content p {
  font-size: 0.875rem;
  color: #94a3b8;
  margin: 0;
}

/* Interest Breakdown */
.interest-breakdown {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.interest-stat {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.interest-stat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.interest-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #a5b4fc;
}

.interest-matches {
  font-size: 0.875rem;
  font-weight: 600;
  color: #cbd5e1;
}

.interest-bar {
  width: 100%;
  height: 8px;
  background: rgba(99, 102, 241, 0.2);
  border-radius: 4px;
  overflow: hidden;
}

.interest-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #6366f1, #8b5cf6);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.interest-percentage {
  font-size: 0.75rem;
  color: #64748b;
}

/* Distance Breakdown */
.distance-breakdown {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.distance-range {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.range-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.range-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #10b981;
}

.range-count {
  font-size: 0.875rem;
  font-weight: 600;
  color: #cbd5e1;
}

.range-bar {
  width: 100%;
  height: 8px;
  background: rgba(16, 185, 129, 0.2);
  border-radius: 4px;
  overflow: hidden;
}

.range-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #10b981, #059669);
  border-radius: 4px;
  transition: width 0.3s ease;
}

/* Score Breakdown */
.score-breakdown {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.score-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  border-radius: 0.5rem;
  text-align: center;
}

.score-card.high {
  background: rgba(245, 158, 11, 0.15);
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.score-card.medium {
  background: rgba(139, 92, 246, 0.15);
  border: 1px solid rgba(139, 92, 246, 0.3);
}

.score-card.low {
  background: rgba(99, 102, 241, 0.15);
  border: 1px solid rgba(99, 102, 241, 0.3);
}

.score-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.score-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #f8fafc;
  margin-bottom: 0.5rem;
}

.score-label {
  font-size: 0.75rem;
  color: #94a3b8;
}

/* Comparison */
.comparison-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.comparison-item {
  padding: 1rem;
  border-radius: 0.5rem;
}

.comparison-item.us {
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.comparison-item.them {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.comparison-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  font-size: 1rem;
  font-weight: 700;
  color: #f8fafc;
}

.comparison-icon {
  font-size: 1.25rem;
}

.comparison-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.comparison-list li {
  font-size: 0.875rem;
  color: #cbd5e1;
  line-height: 1.5;
}

/* Promise */
.dashboard-section.promise {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.15));
  border-color: rgba(99, 102, 241, 0.3);
  text-align: center;
}

.promise-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.promise-text {
  font-size: 0.9375rem;
  color: #cbd5e1;
  line-height: 1.6;
  margin: 1rem 0 1.5rem 0;
}

.promise-text strong {
  color: #a5b4fc;
  font-weight: 700;
}

.promise-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn.primary {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border: none;
  color: white;
}

.action-btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(99, 102, 241, 0.4);
}

.action-btn.secondary {
  background: rgba(99, 102, 241, 0.1);
  border: 1px solid rgba(99, 102, 241, 0.3);
  color: #a5b4fc;
}

.action-btn.secondary:hover {
  background: rgba(99, 102, 241, 0.2);
  border-color: #6366f1;
}

/* Mobile Responsive */
@media (max-width: 640px) {
  .transparency-dashboard {
    padding: 1rem;
    gap: 1.5rem;
  }

  .dashboard-header h2 {
    font-size: 1.25rem;
  }

  .comparison-grid {
    grid-template-columns: 1fr;
  }

  .score-breakdown {
    grid-template-columns: 1fr;
  }

  .promise-actions {
    flex-direction: column;
  }

  .action-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
