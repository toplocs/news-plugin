<template>
  <div class="discovery-panel">
    <div class="panel-header">
      <h3 class="panel-title">
        <span class="icon">✨</span>
        Entdeckungen für dich
      </h3>
      <button v-if="hasMatches" @click="$emit('refresh')" class="refresh-btn" :disabled="isLoading">
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Suche nach passenden Inhalten...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="!hasMatches" class="empty-state">
      <div class="empty-icon">🔍</div>
      <p>Noch keine Entdeckungen</p>
      <small>Wir suchen nach Inhalten, die zu deinen Interessen passen</small>
    </div>

    <!-- Matches List -->
    <div v-else class="matches-list">
      <!-- High Score Matches (Featured) -->
      <div v-if="highScoreMatches.length > 0" class="featured-section">
        <h4 class="section-label">🌟 Top-Empfehlungen</h4>
        <div
          v-for="match in highScoreMatches.slice(0, 3)"
          :key="match.id"
          class="match-item featured"
          @click="$emit('select', match)"
        >
          <div class="match-header">
            <div class="match-type-icon">
              {{ getTypeIcon(match.type) }}
            </div>
            <div class="match-info">
              <div class="match-title">{{ match.title }}</div>
              <div class="match-reason">{{ match.reason }}</div>
            </div>
            <div class="match-score" :style="{ '--score': match.score }">
              {{ Math.round(match.score * 100) }}%
            </div>
          </div>
          <p v-if="match.description" class="match-description">
            {{ truncate(match.description, 80) }}
          </p>
        </div>
      </div>

      <!-- Regular Matches -->
      <div class="regular-section">
        <h4 v-if="highScoreMatches.length > 0" class="section-label">📌 Weitere Empfehlungen</h4>
        <div
          v-for="match in regularMatches"
          :key="match.id"
          class="match-item"
          @click="$emit('select', match)"
        >
          <div class="match-header">
            <div class="match-type-icon small">
              {{ getTypeIcon(match.type) }}
            </div>
            <div class="match-info">
              <div class="match-title">{{ match.title }}</div>
              <div class="match-reason">{{ match.reason }}</div>
            </div>
            <div class="match-score small" :style="{ '--score': match.score }">
              {{ Math.round(match.score * 100) }}%
            </div>
          </div>
        </div>
      </div>

      <!-- Stats Footer -->
      <div class="panel-footer">
        <div class="stat">
          <span class="stat-value">{{ matches.length }}</span>
          <span class="stat-label">Gesamt</span>
        </div>
        <div class="stat">
          <span class="stat-value">{{ highScoreMatches.length }}</span>
          <span class="stat-label">Top</span>
        </div>
        <div class="stat">
          <span class="stat-value">{{ lastUpdateText }}</span>
          <span class="stat-label">Aktualisiert</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { DiscoveryMatch } from '../stores/useDiscovery'

const props = defineProps<{
  matches: DiscoveryMatch[]
  highScoreMatches: DiscoveryMatch[]
  isLoading: boolean
  lastUpdate: number
}>()

defineEmits<{
  refresh: []
  select: [match: DiscoveryMatch]
}>()

const hasMatches = computed(() => props.matches.length > 0)

const regularMatches = computed(() => {
  const highScoreIds = new Set(props.highScoreMatches.map(m => m.id))
  return props.matches
    .filter(m => !highScoreIds.has(m.id))
    .slice(0, 7)
})

const lastUpdateText = computed(() => {
  if (!props.lastUpdate) return 'nie'

  const diff = Date.now() - props.lastUpdate
  const minutes = Math.floor(diff / 60000)

  if (minutes < 1) return 'jetzt'
  if (minutes === 1) return '1 Min'
  if (minutes < 60) return `${minutes} Min`

  const hours = Math.floor(minutes / 60)
  if (hours === 1) return '1 Std'
  return `${hours} Std`
})

const getTypeIcon = (type: string): string => {
  const icons = {
    article: '📰',
    user: '👤',
    topic: '🏷️',
    event: '📅'
  }
  return icons[type as keyof typeof icons] || '📌'
}

const truncate = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}
</script>

<style scoped>
.discovery-panel {
  background: rgba(30, 41, 59, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.75rem;
  overflow: hidden;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.panel-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9375rem;
  font-weight: 700;
  color: #f8fafc;
  margin: 0;
}

.icon {
  font-size: 1.125rem;
}

.refresh-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(99, 102, 241, 0.2);
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 0.5rem;
  color: #a5b4fc;
  cursor: pointer;
  transition: all 0.2s;
}

.refresh-btn:hover:not(:disabled) {
  background: rgba(99, 102, 241, 0.3);
  transform: rotate(45deg);
}

.refresh-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1.5rem;
  gap: 1rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(99, 102, 241, 0.2);
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-state p {
  color: #94a3b8;
  font-size: 0.875rem;
  margin: 0;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 3rem 1.5rem;
  text-align: center;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state p {
  color: #cbd5e1;
  font-size: 0.9375rem;
  margin: 0 0 0.5rem 0;
}

.empty-state small {
  color: #64748b;
  font-size: 0.8125rem;
}

/* Matches List */
.matches-list {
  padding: 1rem;
}

.section-label {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #94a3b8;
  margin: 0 0 0.75rem 0;
}

.featured-section {
  margin-bottom: 1.5rem;
}

.match-item {
  padding: 1rem;
  background: rgba(15, 23, 42, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 0.5rem;
  margin-bottom: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
}

.match-item:hover {
  background: rgba(15, 23, 42, 0.6);
  border-color: rgba(99, 102, 241, 0.3);
  transform: translateX(2px);
}

.match-item.featured {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1));
  border-color: rgba(99, 102, 241, 0.3);
}

.match-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.match-type-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  background: rgba(99, 102, 241, 0.2);
  border-radius: 0.5rem;
  flex-shrink: 0;
}

.match-type-icon.small {
  width: 32px;
  height: 32px;
  font-size: 1rem;
}

.match-info {
  flex: 1;
  min-width: 0;
}

.match-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #f8fafc;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 0.25rem;
}

.match-reason {
  font-size: 0.75rem;
  color: #94a3b8;
}

.match-score {
  font-size: 0.875rem;
  font-weight: 700;
  color: #6366f1;
  padding: 0.25rem 0.5rem;
  background: rgba(99, 102, 241, 0.2);
  border-radius: 0.25rem;
  flex-shrink: 0;
}

.match-score.small {
  font-size: 0.75rem;
  padding: 0.125rem 0.375rem;
}

.match-description {
  font-size: 0.8125rem;
  color: #cbd5e1;
  line-height: 1.4;
  margin: 0.75rem 0 0 0;
}

/* Footer Stats */
.panel-footer {
  display: flex;
  justify-content: space-around;
  padding: 1rem;
  margin-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  background: rgba(15, 23, 42, 0.3);
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.stat-value {
  font-size: 1.125rem;
  font-weight: 700;
  color: #6366f1;
}

.stat-label {
  font-size: 0.6875rem;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
</style>
