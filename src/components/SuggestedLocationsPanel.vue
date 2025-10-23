<template>
  <div class="suggested-locations-panel">
    <div class="panel-header">
      <h3 class="panel-title">
        <span class="icon">📍</span>
        <span>Vorgeschlagene Locations</span>
      </h3>
      <div class="panel-stats">
        <div class="stat-badge">
          <span class="stat-value">{{ totalLocations }}</span>
          <span class="stat-label">Total</span>
        </div>
        <div class="stat-badge stat-badge-verified">
          <span class="stat-value">{{ verifiedCount }}</span>
          <span class="stat-label">Verifiziert</span>
        </div>
        <div class="stat-badge stat-badge-ready">
          <span class="stat-value">{{ readyForPromotionCount }}</span>
          <span class="stat-label">Bereit</span>
        </div>
      </div>
    </div>

    <p class="panel-description">
      Locations aus News-Artikeln mit Nominatim-Verifizierung für geografische Genauigkeit
    </p>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Lade Locations...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="pendingLocations.length === 0" class="empty-state">
      <div class="empty-illustration">
        <span class="empty-icon">📍</span>
        <span class="empty-sparkle">✨</span>
      </div>
      <p class="empty-text">Noch keine vorgeschlagenen Locations</p>
      <p class="empty-hint">
        Locations werden automatisch aus News-Artikeln extrahiert und hier vorgeschlagen
      </p>
    </div>

    <!-- Locations List -->
    <div v-else class="locations-list">
      <div
        v-for="location in sortedLocations"
        :key="location.slug"
        class="location-card"
        :class="{ 'location-card-ready': meetsThresholds(location.slug) }"
      >
        <!-- Location Header -->
        <div class="location-header">
          <div class="location-info">
            <div class="location-name-row">
              <h4 class="location-name">{{ location.name }}</h4>
              <div v-if="location.verified" class="verified-badge" title="Mit Nominatim verifiziert">
                <span>✓</span>
                <span>Verifiziert</span>
              </div>
            </div>
            <p class="location-slug">{{ location.slug }}</p>
            <div v-if="location.coordinates" class="coordinates">
              📍 {{ location.coordinates.lat.toFixed(4) }}, {{ location.coordinates.lng.toFixed(4) }}
            </div>
          </div>
          <div v-if="meetsThresholds(location.slug)" class="auto-promote-badge" title="Erfüllt Auto-Promote Kriterien">
            <span>🚀</span>
            <span>Auto-Promote</span>
          </div>
        </div>

        <!-- Hierarchy (if verified) -->
        <div v-if="location.hierarchy" class="hierarchy-section">
          <div class="hierarchy-label">Hierarchie:</div>
          <div class="hierarchy-path">
            <span v-if="location.hierarchy.city" class="hierarchy-item">
              🏙️ {{ location.hierarchy.city }}
            </span>
            <span v-if="location.hierarchy.state" class="hierarchy-arrow">→</span>
            <span v-if="location.hierarchy.state" class="hierarchy-item">
              🏛️ {{ location.hierarchy.state }}
            </span>
            <span v-if="location.hierarchy.country" class="hierarchy-arrow">→</span>
            <span v-if="location.hierarchy.country" class="hierarchy-item">
              🌍 {{ location.hierarchy.country }}
            </span>
            <span v-if="location.hierarchy.continent" class="hierarchy-arrow">→</span>
            <span v-if="location.hierarchy.continent" class="hierarchy-item">
              🌏 {{ location.hierarchy.continent }}
            </span>
          </div>
        </div>

        <!-- Metrics Grid -->
        <div class="metrics-grid">
          <div class="metric">
            <div class="metric-icon">📰</div>
            <div class="metric-content">
              <div class="metric-value">{{ location.count }}</div>
              <div class="metric-label">Artikel</div>
              <div
                class="metric-progress"
                :class="{ 'metric-progress-met': location.count >= getThreshold(location, 'count') }"
              >
                <div
                  class="metric-progress-bar"
                  :style="{ width: `${Math.min(100, (location.count / getThreshold(location, 'count')) * 100)}%` }"
                ></div>
              </div>
              <div class="metric-threshold">
                Min: {{ getThreshold(location, 'count') }}
                <span class="threshold-type">({{ location.verified ? 'verifiziert' : 'unverifiziert' }})</span>
              </div>
            </div>
          </div>

          <div class="metric">
            <div class="metric-icon">🎯</div>
            <div class="metric-content">
              <div class="metric-value">{{ (location.avgConfidence * 100).toFixed(0) }}%</div>
              <div class="metric-label">Konfidenz</div>
              <div
                class="metric-progress"
                :class="{ 'metric-progress-met': location.avgConfidence >= getThreshold(location, 'avgConfidence') }"
              >
                <div
                  class="metric-progress-bar"
                  :style="{ width: `${location.avgConfidence * 100}%` }"
                ></div>
              </div>
              <div class="metric-threshold">Min: {{ (getThreshold(location, 'avgConfidence') * 100).toFixed(0) }}%</div>
            </div>
          </div>

          <div class="metric">
            <div class="metric-icon">📡</div>
            <div class="metric-content">
              <div class="metric-value">{{ location.uniqueSources.length }}</div>
              <div class="metric-label">Quellen</div>
              <div
                class="metric-progress"
                :class="{ 'metric-progress-met': location.uniqueSources.length >= getThreshold(location, 'uniqueSources') }"
              >
                <div
                  class="metric-progress-bar"
                  :style="{ width: `${Math.min(100, (location.uniqueSources.length / getThreshold(location, 'uniqueSources')) * 100)}%` }"
                ></div>
              </div>
              <div class="metric-threshold">Min: {{ getThreshold(location, 'uniqueSources') }}</div>
            </div>
          </div>

          <div v-if="!location.verified" class="metric">
            <div class="metric-icon">📅</div>
            <div class="metric-content">
              <div class="metric-value">{{ getDaysSince(location.firstSeen, location.lastSeen) }}</div>
              <div class="metric-label">Tage</div>
              <div
                class="metric-progress"
                :class="{ 'metric-progress-met': getTimeSpan(location.firstSeen, location.lastSeen) >= getThreshold(location, 'timeSpan') }"
              >
                <div
                  class="metric-progress-bar"
                  :style="{ width: `${Math.min(100, (getTimeSpan(location.firstSeen, location.lastSeen) / getThreshold(location, 'timeSpan')) * 100)}%` }"
                ></div>
              </div>
              <div class="metric-threshold">Min: {{ getThreshold(location, 'timeSpan') / 86400000 }} Tage</div>
            </div>
          </div>
        </div>

        <!-- Sources List -->
        <div class="sources-section">
          <div class="sources-label">Quellen:</div>
          <div class="sources-list">
            <span
              v-for="source in location.uniqueSources"
              :key="source"
              class="source-tag"
            >
              {{ source }}
            </span>
          </div>
        </div>

        <!-- Actions -->
        <div class="location-actions">
          <button
            v-if="!location.verified"
            @click="handleVerify(location.slug)"
            class="action-btn action-btn-verify"
            :disabled="processing === location.slug"
            title="Mit Nominatim verifizieren"
          >
            <span>🔍</span>
            <span>Verifizieren</span>
          </button>

          <button
            @click="handleApprove(location.slug)"
            class="action-btn action-btn-approve"
            :disabled="processing === location.slug"
            title="Location manuell genehmigen"
          >
            <span>✓</span>
            <span>Genehmigen</span>
          </button>

          <button
            v-if="meetsThresholds(location.slug)"
            @click="handleAutoPromote(location.slug)"
            class="action-btn action-btn-promote"
            :disabled="processing === location.slug"
            title="Automatisch zu TopLocs Location fördern"
          >
            <span>🚀</span>
            <span>Auto-Promote</span>
          </button>

          <button
            @click="handleReject(location.slug)"
            class="action-btn action-btn-reject"
            :disabled="processing === location.slug"
            title="Location ablehnen"
          >
            <span>✗</span>
            <span>Ablehnen</span>
          </button>
        </div>

        <!-- Processing Indicator -->
        <div v-if="processing === location.slug" class="processing-overlay">
          <div class="spinner"></div>
          <p>{{ processingMessage }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useSuggestedLocations, LOCATION_THRESHOLDS, type SuggestedLocation } from '../stores/useSuggestedLocations'
import { autoPromoteService } from '../services/autoPromoteService'
import { geocodeService } from '../services/geocodeService'
import { useToast } from '../composables/useToast'

const { success, error: showError } = useToast()

const {
  suggestedLocations,
  isLoading,
  totalLocations,
  pendingCount,
  verifiedCount,
  readyForPromotionCount,
  meetsAutoPromoteThresholds,
  getPendingLocations,
  updateLocationStatus,
  markLocationAsVerified,
  initialize
} = useSuggestedLocations()

const processing = ref<string | null>(null)
const processingMessage = ref('')
const pendingLocations = computed(() => getPendingLocations())

// Sort locations by verified status (verified first), then readiness, then count
const sortedLocations = computed(() => {
  return [...pendingLocations.value].sort((a, b) => {
    // Verified locations first
    if (a.verified && !b.verified) return -1
    if (!a.verified && b.verified) return 1

    // Then by readiness
    const aReady = meetsAutoPromoteThresholds(a.slug)
    const bReady = meetsAutoPromoteThresholds(b.slug)

    if (aReady && !bReady) return -1
    if (!aReady && bReady) return 1

    // Then by count
    return b.count - a.count
  })
})

const meetsThresholds = (slug: string): boolean => {
  return meetsAutoPromoteThresholds(slug)
}

const getThreshold = (location: SuggestedLocation, key: keyof typeof LOCATION_THRESHOLDS.verified) => {
  const thresholds = location.verified
    ? LOCATION_THRESHOLDS.verified
    : LOCATION_THRESHOLDS.unverified
  return thresholds[key]
}

const getDaysSince = (firstSeen: number, lastSeen: number): number => {
  return Math.floor((lastSeen - firstSeen) / 86400000)
}

const getTimeSpan = (firstSeen: number, lastSeen: number): number => {
  return lastSeen - firstSeen
}

const handleVerify = async (slug: string) => {
  const location = suggestedLocations.value.find(l => l.slug === slug)
  if (!location) return

  processing.value = slug
  processingMessage.value = 'Verifiziere mit Nominatim...'

  try {
    const result = await geocodeService.geocodeLocation(location.name)

    if (result.verified && result.coordinates && result.hierarchy) {
      await markLocationAsVerified(slug, result.coordinates, result.hierarchy)
      success(`✓ Location verifiziert: ${location.name}`)
    } else {
      showError(`Location konnte nicht verifiziert werden: ${location.name}`)
    }
  } catch (err) {
    console.error('Failed to verify location:', err)
    showError('Fehler bei der Verifizierung')
  } finally {
    processing.value = null
    processingMessage.value = ''
  }
}

const handleApprove = async (slug: string) => {
  processing.value = slug
  processingMessage.value = 'Genehmige Location...'

  try {
    await updateLocationStatus(slug, 'approved')
    success('Location genehmigt')
  } catch (err) {
    console.error('Failed to approve location:', err)
    showError('Fehler beim Genehmigen')
  } finally {
    processing.value = null
    processingMessage.value = ''
  }
}

const handleReject = async (slug: string) => {
  processing.value = slug
  processingMessage.value = 'Lehne Location ab...'

  try {
    await updateLocationStatus(slug, 'rejected')
    success('Location abgelehnt')
  } catch (err) {
    console.error('Failed to reject location:', err)
    showError('Fehler beim Ablehnen')
  } finally {
    processing.value = null
    processingMessage.value = ''
  }
}

const handleAutoPromote = async (slug: string) => {
  processing.value = slug
  processingMessage.value = 'Förderung zu TopLocs Location...'

  try {
    const result = await autoPromoteService.autoPromoteLocation(slug, true)

    if (result.success) {
      success(`🚀 Location automatisch gefördert: ${result.entityId}`)
    } else {
      showError(`Auto-Promote fehlgeschlagen: ${result.error}`)
    }
  } catch (err) {
    console.error('Failed to auto-promote location:', err)
    showError('Fehler beim Auto-Promote')
  } finally {
    processing.value = null
    processingMessage.value = ''
  }
}

onMounted(() => {
  initialize()
})
</script>

<style scoped>
.suggested-locations-panel {
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

.stat-badge-verified {
  background: rgba(59, 130, 246, 0.1);
  border-color: rgba(59, 130, 246, 0.2);
}

.stat-badge-verified .stat-value {
  color: #3b82f6;
}

.stat-badge-ready {
  background: rgba(34, 197, 94, 0.1);
  border-color: rgba(34, 197, 94, 0.2);
}

.stat-badge-ready .stat-value {
  color: #22c55e;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: #6366f1;
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

/* Loading & Empty States */
.loading-state, .empty-state {
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

.empty-illustration {
  position: relative;
  display: inline-block;
  margin-bottom: 1rem;
}

.empty-icon {
  font-size: 4rem;
  opacity: 0.3;
}

.empty-sparkle {
  position: absolute;
  top: 0;
  right: -10px;
  font-size: 1.5rem;
  animation: sparkle 2s ease-in-out infinite;
}

@keyframes sparkle {
  0%, 100% { opacity: 0.3; transform: scale(0.9); }
  50% { opacity: 1; transform: scale(1.1); }
}

.empty-text {
  font-size: 1rem;
  font-weight: 600;
  color: #cbd5e1;
  margin: 0 0 0.5rem 0;
  text-align: center;
}

.empty-hint {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0;
  text-align: center;
}

/* Locations List */
.locations-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.location-card {
  position: relative;
  padding: 1.25rem;
  background: rgba(15, 23, 42, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 0.75rem;
  transition: all 0.3s;
}

.location-card:hover {
  background: rgba(15, 23, 42, 0.6);
  border-color: rgba(99, 102, 241, 0.2);
  transform: translateY(-2px);
}

.location-card-ready {
  border-color: rgba(34, 197, 94, 0.3);
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.05) 0%, rgba(15, 23, 42, 0.4) 100%);
}

.location-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
}

.location-info {
  flex: 1;
}

.location-name-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.25rem;
}

.location-name {
  font-size: 1rem;
  font-weight: 700;
  color: #f8fafc;
  margin: 0;
}

.verified-badge {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.625rem;
  background: rgba(59, 130, 246, 0.2);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 999px;
  font-size: 0.6875rem;
  font-weight: 600;
  color: #3b82f6;
}

.location-slug {
  font-size: 0.75rem;
  color: #64748b;
  font-family: 'Courier New', monospace;
  margin: 0 0 0.375rem 0;
}

.coordinates {
  font-size: 0.75rem;
  color: #94a3b8;
  font-family: 'Courier New', monospace;
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
  }
  50% {
    box-shadow: 0 0 20px rgba(34, 197, 94, 0.5);
  }
}

/* Hierarchy Section */
.hierarchy-section {
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: rgba(59, 130, 246, 0.05);
  border: 1px solid rgba(59, 130, 246, 0.15);
  border-radius: 0.5rem;
}

.hierarchy-label {
  font-size: 0.75rem;
  color: #94a3b8;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.hierarchy-path {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.hierarchy-item {
  padding: 0.25rem 0.625rem;
  background: rgba(59, 130, 246, 0.15);
  border: 1px solid rgba(59, 130, 246, 0.25);
  border-radius: 0.25rem;
  font-size: 0.75rem;
  color: #60a5fa;
  font-weight: 500;
}

.hierarchy-arrow {
  color: #64748b;
  font-size: 0.875rem;
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

.threshold-type {
  font-style: italic;
  color: #64748b;
}

/* Sources */
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
.location-actions {
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

.action-btn-verify {
  background: rgba(59, 130, 246, 0.1);
  border-color: rgba(59, 130, 246, 0.2);
  color: #3b82f6;
}

.action-btn-verify:hover:not(:disabled) {
  background: rgba(59, 130, 246, 0.2);
  border-color: rgba(59, 130, 246, 0.3);
  transform: translateY(-2px);
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
  background: rgba(15, 23, 42, 0.95);
  border-radius: 0.75rem;
  backdrop-filter: blur(4px);
  color: #cbd5e1;
  font-size: 0.875rem;
  z-index: 10;
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
