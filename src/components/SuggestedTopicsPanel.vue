<template>
  <div class="suggested-topics-panel">
    <div class="panel-header">
      <h3 class="panel-title">
        <span class="icon">📊</span>
        <span>Vorgeschlagene Topics</span>
      </h3>
      <div class="panel-stats">
        <div class="stat-badge">
          <span class="stat-value">{{ totalTopics }}</span>
          <span class="stat-label">Total</span>
        </div>
        <div class="stat-badge stat-badge-ready">
          <span class="stat-value">{{ readyForPromotionCount }}</span>
          <span class="stat-label">Bereit</span>
        </div>
      </div>
    </div>

    <p class="panel-description">
      Topics aus News-Artikeln, die automatisch zu TopLocs Topics werden können
    </p>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Lade Topics...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="pendingTopics.length === 0" class="empty-state">
      <div class="empty-illustration">
        <span class="empty-icon">📊</span>
        <span class="empty-sparkle">✨</span>
      </div>
      <p class="empty-text">Noch keine vorgeschlagenen Topics</p>
      <p class="empty-hint">
        Topics werden automatisch aus News-Artikeln extrahiert und hier vorgeschlagen
      </p>
    </div>

    <!-- Topics List -->
    <div v-else class="topics-list">
      <div
        v-for="topic in sortedTopics"
        :key="topic.slug"
        class="topic-card"
        :class="{ 'topic-card-ready': meetsThresholds(topic.slug) }"
      >
        <!-- Topic Header -->
        <div class="topic-header">
          <div class="topic-info">
            <h4 class="topic-name">{{ topic.name }}</h4>
            <p class="topic-slug">{{ topic.slug }}</p>
          </div>
          <div v-if="meetsThresholds(topic.slug)" class="auto-promote-badge" title="Erfüllt Auto-Promote Kriterien">
            <span>🚀</span>
            <span>Auto-Promote</span>
          </div>
        </div>

        <!-- Metrics Grid -->
        <div class="metrics-grid">
          <div class="metric">
            <div class="metric-icon">📰</div>
            <div class="metric-content">
              <div class="metric-value">{{ topic.count }}</div>
              <div class="metric-label">Artikel</div>
              <div
                class="metric-progress"
                :class="{ 'metric-progress-met': topic.count >= TOPIC_THRESHOLDS.count }"
              >
                <div
                  class="metric-progress-bar"
                  :style="{ width: `${Math.min(100, (topic.count / TOPIC_THRESHOLDS.count) * 100)}%` }"
                ></div>
              </div>
              <div class="metric-threshold">Min: {{ TOPIC_THRESHOLDS.count }}</div>
            </div>
          </div>

          <div class="metric">
            <div class="metric-icon">🎯</div>
            <div class="metric-content">
              <div class="metric-value">{{ (topic.avgConfidence * 100).toFixed(0) }}%</div>
              <div class="metric-label">Konfidenz</div>
              <div
                class="metric-progress"
                :class="{ 'metric-progress-met': topic.avgConfidence >= TOPIC_THRESHOLDS.avgConfidence }"
              >
                <div
                  class="metric-progress-bar"
                  :style="{ width: `${topic.avgConfidence * 100}%` }"
                ></div>
              </div>
              <div class="metric-threshold">Min: {{ (TOPIC_THRESHOLDS.avgConfidence * 100).toFixed(0) }}%</div>
            </div>
          </div>

          <div class="metric">
            <div class="metric-icon">📡</div>
            <div class="metric-content">
              <div class="metric-value">{{ topic.uniqueSources.length }}</div>
              <div class="metric-label">Quellen</div>
              <div
                class="metric-progress"
                :class="{ 'metric-progress-met': topic.uniqueSources.length >= TOPIC_THRESHOLDS.uniqueSources }"
              >
                <div
                  class="metric-progress-bar"
                  :style="{ width: `${Math.min(100, (topic.uniqueSources.length / TOPIC_THRESHOLDS.uniqueSources) * 100)}%` }"
                ></div>
              </div>
              <div class="metric-threshold">Min: {{ TOPIC_THRESHOLDS.uniqueSources }}</div>
            </div>
          </div>

          <div class="metric">
            <div class="metric-icon">📅</div>
            <div class="metric-content">
              <div class="metric-value">{{ getDaysSince(topic.firstSeen, topic.lastSeen) }}</div>
              <div class="metric-label">Tage</div>
              <div
                class="metric-progress"
                :class="{ 'metric-progress-met': getTimeSpan(topic.firstSeen, topic.lastSeen) >= TOPIC_THRESHOLDS.timeSpan }"
              >
                <div
                  class="metric-progress-bar"
                  :style="{ width: `${Math.min(100, (getTimeSpan(topic.firstSeen, topic.lastSeen) / TOPIC_THRESHOLDS.timeSpan) * 100)}%` }"
                ></div>
              </div>
              <div class="metric-threshold">Min: {{ TOPIC_THRESHOLDS.timeSpan / 86400000 }} Tage</div>
            </div>
          </div>
        </div>

        <!-- Sources List -->
        <div class="sources-section">
          <div class="sources-label">Quellen:</div>
          <div class="sources-list">
            <span
              v-for="source in topic.uniqueSources"
              :key="source"
              class="source-tag"
            >
              {{ source }}
            </span>
          </div>
        </div>

        <!-- Actions -->
        <div class="topic-actions">
          <button
            @click="handleApprove(topic.slug)"
            class="action-btn action-btn-approve"
            :disabled="processing === topic.slug"
            title="Topic manuell genehmigen"
          >
            <span>✓</span>
            <span>Genehmigen</span>
          </button>

          <button
            v-if="meetsThresholds(topic.slug)"
            @click="handleAutoPromote(topic.slug)"
            class="action-btn action-btn-promote"
            :disabled="processing === topic.slug"
            title="Automatisch zu TopLocs Topic fördern"
          >
            <span>🚀</span>
            <span>Auto-Promote</span>
          </button>

          <button
            @click="handleReject(topic.slug)"
            class="action-btn action-btn-reject"
            :disabled="processing === topic.slug"
            title="Topic ablehnen"
          >
            <span>✗</span>
            <span>Ablehnen</span>
          </button>
        </div>

        <!-- Processing Indicator -->
        <div v-if="processing === topic.slug" class="processing-overlay">
          <div class="spinner"></div>
          <p>Verarbeite...</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useSuggestedTopics, TOPIC_THRESHOLDS } from '../stores/useSuggestedTopics'
import { autoPromoteService } from '../services/autoPromoteService'
import { useToast } from '../composables/useToast'

const { success, error: showError } = useToast()

const {
  suggestedTopics,
  isLoading,
  totalTopics,
  pendingCount,
  readyForPromotionCount,
  meetsAutoPromoteThresholds,
  getPendingTopics,
  updateTopicStatus,
  initialize
} = useSuggestedTopics()

const processing = ref<string | null>(null)
const pendingTopics = computed(() => getPendingTopics())

// Sort topics by readiness (ready first, then by count)
const sortedTopics = computed(() => {
  return [...pendingTopics.value].sort((a, b) => {
    const aReady = meetsAutoPromoteThresholds(a.slug)
    const bReady = meetsAutoPromoteThresholds(b.slug)

    if (aReady && !bReady) return -1
    if (!aReady && bReady) return 1

    return b.count - a.count
  })
})

const meetsThresholds = (slug: string): boolean => {
  return meetsAutoPromoteThresholds(slug)
}

const getDaysSince = (firstSeen: number, lastSeen: number): number => {
  return Math.floor((lastSeen - firstSeen) / 86400000)
}

const getTimeSpan = (firstSeen: number, lastSeen: number): number => {
  return lastSeen - firstSeen
}

const handleApprove = async (slug: string) => {
  processing.value = slug
  try {
    await updateTopicStatus(slug, 'approved')
    success('Topic genehmigt')
  } catch (err) {
    console.error('Failed to approve topic:', err)
    showError('Fehler beim Genehmigen')
  } finally {
    processing.value = null
  }
}

const handleReject = async (slug: string) => {
  processing.value = slug
  try {
    await updateTopicStatus(slug, 'rejected')
    success('Topic abgelehnt')
  } catch (err) {
    console.error('Failed to reject topic:', err)
    showError('Fehler beim Ablehnen')
  } finally {
    processing.value = null
  }
}

const handleAutoPromote = async (slug: string) => {
  processing.value = slug
  try {
    const result = await autoPromoteService.autoPromoteTopic(slug)

    if (result.success) {
      success(`🚀 Topic automatisch gefördert: ${result.entityId}`)
    } else {
      showError(`Auto-Promote fehlgeschlagen: ${result.error}`)
    }
  } catch (err) {
    console.error('Failed to auto-promote topic:', err)
    showError('Fehler beim Auto-Promote')
  } finally {
    processing.value = null
  }
}

onMounted(() => {
  initialize()
})
</script>

<style scoped>
.suggested-topics-panel {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.panel-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.125rem;
  font-weight: 700;
  color: #f8fafc;
  margin: 0;
}

.icon {
  font-size: 1.25rem;
}

.panel-stats {
  display: flex;
  gap: 0.75rem;
}

.stat-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 0.75rem;
  background: rgba(99, 102, 241, 0.1);
  border: 1px solid rgba(99, 102, 241, 0.2);
  border-radius: 0.5rem;
}

.stat-badge-ready {
  background: rgba(34, 197, 94, 0.1);
  border-color: rgba(34, 197, 94, 0.2);
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: #6366f1;
}

.stat-badge-ready .stat-value {
  color: #22c55e;
}

.stat-label {
  font-size: 0.6875rem;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.panel-description {
  font-size: 0.8125rem;
  color: #94a3b8;
  margin: 0;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 3rem 1rem;
  color: #94a3b8;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(99, 102, 241, 0.2);
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 3rem 1rem;
}

.empty-illustration {
  position: relative;
  display: inline-block;
  margin-bottom: 1rem;
}

.empty-icon {
  font-size: 4rem;
  opacity: 0.3;
  display: inline-block;
}

.empty-sparkle {
  position: absolute;
  top: 0;
  right: -10px;
  font-size: 1.5rem;
  animation: sparkle 2s ease-in-out infinite;
}

.empty-text {
  font-size: 1rem;
  font-weight: 600;
  color: #cbd5e1;
  margin: 0 0 0.5rem 0;
}

.empty-hint {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0;
}

@keyframes sparkle {
  0%, 100% { opacity: 0.3; transform: scale(0.9); }
  50% { opacity: 1; transform: scale(1.1); }
}

/* Topics List */
.topics-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.topic-card {
  position: relative;
  padding: 1.25rem;
  background: rgba(15, 23, 42, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 0.75rem;
  transition: all 0.3s;
}

.topic-card:hover {
  background: rgba(15, 23, 42, 0.6);
  border-color: rgba(99, 102, 241, 0.2);
  transform: translateY(-2px);
}

.topic-card-ready {
  border-color: rgba(34, 197, 94, 0.3);
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.05) 0%, rgba(15, 23, 42, 0.4) 100%);
}

.topic-card-ready:hover {
  border-color: rgba(34, 197, 94, 0.4);
}

.topic-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
}

.topic-info {
  flex: 1;
}

.topic-name {
  font-size: 1rem;
  font-weight: 700;
  color: #f8fafc;
  margin: 0 0 0.25rem 0;
}

.topic-slug {
  font-size: 0.75rem;
  color: #64748b;
  font-family: 'Courier New', monospace;
  margin: 0;
}

.auto-promote-badge {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  background: rgba(34, 197, 94, 0.2);
  border: 1px solid rgba(34, 197, 94, 0.3);
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #22c55e;
  animation: pulse-glow 2s ease-in-out infinite;
}

@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 0 10px rgba(34, 197, 94, 0.3);
    transform: scale(1);
  }
  50% {
    box-shadow: 0 0 20px rgba(34, 197, 94, 0.5);
    transform: scale(1.05);
  }
}

/* Metrics Grid */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.metric {
  display: flex;
  gap: 0.5rem;
}

.metric-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.metric-content {
  flex: 1;
  min-width: 0;
}

.metric-value {
  font-size: 1.125rem;
  font-weight: 700;
  color: #f8fafc;
  margin-bottom: 0.125rem;
}

.metric-label {
  font-size: 0.6875rem;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.25rem;
}

.metric-progress {
  height: 4px;
  background: rgba(100, 116, 139, 0.2);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 0.25rem;
}

.metric-progress-bar {
  height: 100%;
  background: #6366f1;
  transition: width 0.3s;
}

.metric-progress-met .metric-progress-bar {
  background: #22c55e;
}

.metric-threshold {
  font-size: 0.625rem;
  color: #64748b;
}

/* Sources Section */
.sources-section {
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: rgba(30, 41, 59, 0.4);
  border-radius: 0.5rem;
}

.sources-label {
  font-size: 0.75rem;
  color: #94a3b8;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.sources-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
}

.source-tag {
  padding: 0.25rem 0.5rem;
  background: rgba(99, 102, 241, 0.15);
  border: 1px solid rgba(99, 102, 241, 0.25);
  border-radius: 0.25rem;
  font-size: 0.6875rem;
  color: #a5b4fc;
}

/* Actions */
.topic-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.action-btn {
  flex: 1;
  min-width: fit-content;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  padding: 0.625rem 1rem;
  border: 1px solid;
  border-radius: 0.5rem;
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-btn-approve {
  background: rgba(34, 197, 94, 0.1);
  border-color: rgba(34, 197, 94, 0.2);
  color: #22c55e;
}

.action-btn-approve:hover:not(:disabled) {
  background: rgba(34, 197, 94, 0.2);
  border-color: rgba(34, 197, 94, 0.3);
  transform: translateY(-2px);
}

.action-btn-promote {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%);
  border-color: rgba(99, 102, 241, 0.3);
  color: #a5b4fc;
}

.action-btn-promote:hover:not(:disabled) {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.3) 0%, rgba(139, 92, 246, 0.3) 100%);
  border-color: rgba(99, 102, 241, 0.4);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.action-btn-reject {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.action-btn-reject:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.3);
  transform: translateY(-2px);
}

/* Processing Overlay */
.processing-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  background: rgba(15, 23, 42, 0.9);
  border-radius: 0.75rem;
  backdrop-filter: blur(4px);
  color: #cbd5e1;
  font-size: 0.875rem;
}

.processing-overlay .spinner {
  width: 32px;
  height: 32px;
  border-width: 3px;
}

.processing-overlay p {
  margin: 0;
}
</style>
