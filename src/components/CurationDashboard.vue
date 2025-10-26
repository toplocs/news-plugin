<template>
  <div class="curation-dashboard">
    <div class="dashboard-header">
      <div class="header-content">
        <h2 class="dashboard-title">
          <span class="title-icon">🚀</span>
          <span>Auto-Promote System</span>
        </h2>
        <p class="dashboard-description">
          Automatische Erkennung und Förderung von Topics und Locations aus News-Artikeln
        </p>
      </div>
      <button
        @click="handleRunAutoPromotion"
        class="run-promotion-btn"
        :disabled="isRunning"
        title="Auto-Promotion für alle bereiten Topics/Locations ausführen"
      >
        <span v-if="!isRunning">🚀</span>
        <div v-else class="btn-spinner"></div>
        <span>{{ isRunning ? 'Läuft...' : 'Alle Auto-Promote' }}</span>
      </button>
    </div>

    <!-- Statistics Overview -->
    <div class="stats-overview">
      <div class="stat-card">
        <div class="stat-icon">📊</div>
        <div class="stat-content">
          <div class="stat-value">{{ topicsStore.totalTopics }}</div>
          <div class="stat-label">Topics Total</div>
        </div>
      </div>

      <div class="stat-card stat-card-ready">
        <div class="stat-icon">🎯</div>
        <div class="stat-content">
          <div class="stat-value">{{ topicsStore.readyForPromotionCount }}</div>
          <div class="stat-label">Topics Bereit</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">📍</div>
        <div class="stat-content">
          <div class="stat-value">{{ locationsStore.totalLocations }}</div>
          <div class="stat-label">Locations Total</div>
        </div>
      </div>

      <div class="stat-card stat-card-verified">
        <div class="stat-icon">✓</div>
        <div class="stat-content">
          <div class="stat-value">{{ locationsStore.verifiedCount }}</div>
          <div class="stat-label">Verifiziert</div>
        </div>
      </div>

      <div class="stat-card stat-card-ready">
        <div class="stat-icon">🚀</div>
        <div class="stat-content">
          <div class="stat-value">{{ locationsStore.readyForPromotionCount }}</div>
          <div class="stat-label">Locations Bereit</div>
        </div>
      </div>
    </div>

    <!-- Tab Navigation -->
    <div class="tab-navigation">
      <button
        @click="activeTab = 'topics'"
        class="tab-btn"
        :class="{ 'tab-btn-active': activeTab === 'topics' }"
      >
        <span>📊</span>
        <span>Topics</span>
        <span v-if="topicsStore.readyForPromotionCount.value > 0" class="tab-badge">
          {{ topicsStore.readyForPromotionCount.value }}
        </span>
      </button>

      <button
        @click="activeTab = 'locations'"
        class="tab-btn"
        :class="{ 'tab-btn-active': activeTab === 'locations' }"
      >
        <span>📍</span>
        <span>Locations</span>
        <span v-if="locationsStore.readyForPromotionCount.value > 0" class="tab-badge">
          {{ locationsStore.readyForPromotionCount.value }}
        </span>
      </button>

      <button
        @click="activeTab = 'info'"
        class="tab-btn"
        :class="{ 'tab-btn-active': activeTab === 'info' }"
      >
        <span>ℹ️</span>
        <span>Info</span>
      </button>
    </div>

    <!-- Tab Content -->
    <div class="tab-content">
      <Transition name="fade" mode="out-in">
        <SuggestedTopicsPanel v-if="activeTab === 'topics'" key="topics" />
        <SuggestedLocationsPanel v-else-if="activeTab === 'locations'" key="locations" />
        <div v-else-if="activeTab === 'info'" key="info" class="info-panel">
          <h3 class="info-title">
            <span>ℹ️</span>
            <span>Wie funktioniert Auto-Promote?</span>
          </h3>

          <div class="info-section">
            <h4 class="info-subtitle">📊 Topics</h4>
            <p class="info-text">
              Topics werden automatisch aus News-Artikeln extrahiert. Wenn ein Topic folgende Kriterien erfüllt,
              kann es automatisch zu einem TopLocs Topic gefördert werden:
            </p>
            <ul class="info-list">
              <li><strong>Min. 10 Artikel</strong> müssen das Topic erwähnen</li>
              <li><strong>Min. 80% NLP-Konfidenz</strong> im Durchschnitt</li>
              <li><strong>Min. 7 Tage Zeitspanne</strong> zwischen erstem und letztem Artikel</li>
              <li><strong>Min. 3 verschiedene Quellen</strong> berichten darüber</li>
            </ul>
          </div>

          <div class="info-section">
            <h4 class="info-subtitle">📍 Locations</h4>
            <p class="info-text">
              Locations werden aus Artikel-Metadaten extrahiert und mit OpenStreetMap Nominatim verifiziert.
              Es gibt zwei Threshold-Sets:
            </p>

            <div class="threshold-comparison">
              <div class="threshold-box threshold-verified">
                <h5 class="threshold-title">✓ Verifiziert</h5>
                <ul class="info-list">
                  <li><strong>Min. 3 Artikel</strong></li>
                  <li><strong>Min. 95% Konfidenz</strong></li>
                  <li><strong>Sofortige Promotion</strong> (keine Wartezeit)</li>
                  <li><strong>Min. 2 Quellen</strong></li>
                </ul>
              </div>

              <div class="threshold-box threshold-unverified">
                <h5 class="threshold-title">⚠ Unverifiziert</h5>
                <ul class="info-list">
                  <li><strong>Min. 15 Artikel</strong></li>
                  <li><strong>Min. 85% Konfidenz</strong></li>
                  <li><strong>Min. 14 Tage Zeitspanne</strong></li>
                  <li><strong>Min. 5 Quellen</strong></li>
                </ul>
              </div>
            </div>
          </div>

          <div class="info-section">
            <h4 class="info-subtitle">🚀 Auto-Promotion</h4>
            <p class="info-text">
              Wenn alle Kriterien erfüllt sind, erscheint das <span class="badge-example">🚀 Auto-Promote</span> Badge.
              Du kannst dann:
            </p>
            <ul class="info-list">
              <li><strong>✓ Genehmigen:</strong> Manuell genehmigen für spätere Promotion</li>
              <li><strong>🚀 Auto-Promote:</strong> Sofort zu TopLocs Entity fördern</li>
              <li><strong>✗ Ablehnen:</strong> Topic/Location ablehnen</li>
              <li><strong>🔍 Verifizieren (Locations):</strong> Mit Nominatim API verifizieren</li>
            </ul>
          </div>

          <div class="info-section">
            <h4 class="info-subtitle">🌍 Location-Hierarchie</h4>
            <p class="info-text">
              Verifizierte Locations erhalten automatisch eine geografische Hierarchie:
            </p>
            <div class="hierarchy-example">
              🏙️ Berlin → 🏛️ Berlin → 🌍 Deutschland → 🌏 Europa
            </div>
            <p class="info-text">
              Parent-Locations (Bundesland, Land, Kontinent) werden automatisch erstellt, falls nicht vorhanden.
            </p>
          </div>
        </div>
      </Transition>
    </div>

    <!-- Results Modal (after batch auto-promote) -->
    <Teleport to="body">
      <div v-if="showResults" class="results-modal-overlay" @click="showResults = false">
        <div class="results-modal" @click.stop>
          <div class="results-header">
            <h3>Auto-Promotion Ergebnisse</h3>
            <button @click="showResults = false" class="close-btn">×</button>
          </div>

          <div class="results-stats">
            <div class="result-stat result-success">
              <div class="result-value">{{ successCount }}</div>
              <div class="result-label">Erfolgreich</div>
            </div>
            <div class="result-stat result-failed">
              <div class="result-value">{{ failedCount }}</div>
              <div class="result-label">Fehlgeschlagen</div>
            </div>
          </div>

          <div class="results-list">
            <div
              v-for="(result, index) in promotionResults"
              :key="index"
              class="result-item"
              :class="{ 'result-item-success': result.success, 'result-item-failed': !result.success }"
            >
              <div class="result-icon">{{ result.success ? '✓' : '✗' }}</div>
              <div class="result-content">
                <div class="result-entity">
                  {{ result.entityType === 'topic' ? '📊' : '📍' }}
                  {{ result.entityId }}
                </div>
                <div class="result-reason">{{ result.reason || result.error }}</div>
              </div>
            </div>
          </div>

          <button @click="showResults = false" class="results-close-btn">Schließen</button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useSuggestedTopics } from '../stores/useSuggestedTopics'
import { useSuggestedLocations } from '../stores/useSuggestedLocations'
import { autoPromoteService, type PromotionResult } from '../services/autoPromoteService'
import { useToast } from '../composables/useToast'
import SuggestedTopicsPanel from './SuggestedTopicsPanel.vue'
import SuggestedLocationsPanel from './SuggestedLocationsPanel.vue'

const { success, error: showError } = useToast()

const topicsStore = useSuggestedTopics()
const locationsStore = useSuggestedLocations()

const activeTab = ref<'topics' | 'locations' | 'info'>('topics')
const isRunning = ref(false)
const showResults = ref(false)
const promotionResults = ref<PromotionResult[]>([])

const successCount = computed(() => promotionResults.value.filter(r => r.success).length)
const failedCount = computed(() => promotionResults.value.filter(r => !r.success).length)

const handleRunAutoPromotion = async () => {
  isRunning.value = true
  promotionResults.value = []

  try {
    const results = await autoPromoteService.runAutoPromotion()
    promotionResults.value = results

    const successfulCount = results.filter(r => r.success).length
    const failedCount = results.filter(r => !r.success).length

    if (successfulCount > 0) {
      success(`🚀 ${successfulCount} Entity/Entities erfolgreich gefördert!`)
    }

    if (failedCount > 0) {
      showError(`${failedCount} Auto-Promote fehlgeschlagen`)
    }

    // Show results modal
    if (results.length > 0) {
      showResults.value = true
    } else {
      showError('Keine Topics/Locations bereit für Auto-Promote')
    }
  } catch (err) {
    console.error('Failed to run auto-promotion:', err)
    showError('Fehler beim Auto-Promote Batch-Prozess')
  } finally {
    isRunning.value = false
  }
}
</script>

<style scoped>
.curation-dashboard {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1.5rem;
}

.header-content {
  flex: 1;
}

.dashboard-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.5rem;
  font-weight: 800;
  color: #f8fafc;
  margin: 0 0 0.5rem 0;
}

.title-icon {
  font-size: 1.75rem;
}

.dashboard-description {
  font-size: 0.9375rem;
  color: #94a3b8;
  margin: 0;
  line-height: 1.5;
}

.run-promotion-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border: none;
  border-radius: 0.5rem;
  color: white;
  font-size: 0.9375rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}

.run-promotion-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.5);
}

.run-promotion-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Statistics Overview */
.stats-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 1rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(99, 102, 241, 0.2);
  border-radius: 0.75rem;
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-2px);
  border-color: rgba(99, 102, 241, 0.4);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
}

.stat-card-ready {
  border-color: rgba(34, 197, 94, 0.3);
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.05) 0%, rgba(15, 23, 42, 0.6) 100%);
}

.stat-card-ready:hover {
  border-color: rgba(34, 197, 94, 0.4);
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.2);
}

.stat-card-verified {
  border-color: rgba(59, 130, 246, 0.3);
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(15, 23, 42, 0.6) 100%);
}

.stat-card-verified:hover {
  border-color: rgba(59, 130, 246, 0.4);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
}

.stat-icon {
  font-size: 2rem;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 800;
  color: #f8fafc;
  margin-bottom: 0.125rem;
}

.stat-label {
  font-size: 0.75rem;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Tab Navigation */
.tab-navigation {
  display: flex;
  gap: 0.5rem;
  padding: 0.5rem;
  background: rgba(15, 23, 42, 0.4);
  border-radius: 0.75rem;
}

.tab-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 0.5rem;
  color: #94a3b8;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.tab-btn:hover {
  background: rgba(99, 102, 241, 0.1);
  color: #cbd5e1;
}

.tab-btn-active {
  background: rgba(99, 102, 241, 0.2);
  border-color: rgba(99, 102, 241, 0.3);
  color: #f8fafc;
}

.tab-badge {
  padding: 0.125rem 0.5rem;
  background: rgba(34, 197, 94, 0.3);
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
  color: #22c55e;
}

/* Tab Content */
.tab-content {
  min-height: 400px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Info Panel */
.info-panel {
  padding: 1.5rem;
  background: rgba(15, 23, 42, 0.4);
  border-radius: 0.75rem;
}

.info-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.25rem;
  font-weight: 700;
  color: #f8fafc;
  margin: 0 0 1.5rem 0;
}

.info-section {
  margin-bottom: 2rem;
}

.info-subtitle {
  font-size: 1rem;
  font-weight: 600;
  color: #f8fafc;
  margin: 0 0 0.75rem 0;
}

.info-text {
  font-size: 0.9375rem;
  color: #cbd5e1;
  line-height: 1.6;
  margin: 0 0 0.75rem 0;
}

.info-list {
  list-style: none;
  padding: 0;
  margin: 0.75rem 0;
}

.info-list li {
  padding: 0.5rem 0;
  padding-left: 1.5rem;
  position: relative;
  color: #cbd5e1;
  font-size: 0.9375rem;
  line-height: 1.5;
}

.info-list li::before {
  content: '→';
  position: absolute;
  left: 0;
  color: #6366f1;
  font-weight: 700;
}

.threshold-comparison {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin: 1rem 0;
}

.threshold-box {
  padding: 1rem;
  border-radius: 0.5rem;
}

.threshold-verified {
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.threshold-unverified {
  background: rgba(251, 146, 60, 0.1);
  border: 1px solid rgba(251, 146, 60, 0.3);
}

.threshold-title {
  font-size: 0.9375rem;
  font-weight: 700;
  margin: 0 0 0.75rem 0;
}

.threshold-verified .threshold-title {
  color: #22c55e;
}

.threshold-unverified .threshold-title {
  color: #fb923c;
}

.badge-example {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.625rem;
  background: rgba(34, 197, 94, 0.2);
  border: 1px solid rgba(34, 197, 94, 0.3);
  border-radius: 999px;
  font-size: 0.8125rem;
  font-weight: 600;
  color: #22c55e;
}

.hierarchy-example {
  padding: 1rem;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 0.5rem;
  font-size: 0.9375rem;
  color: #60a5fa;
  text-align: center;
  font-weight: 600;
  margin: 0.75rem 0;
}

/* Results Modal */
.results-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.results-modal {
  max-width: 600px;
  width: 100%;
  max-height: 80vh;
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%);
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 1rem;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.results-header h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #f8fafc;
  margin: 0;
}

.close-btn {
  width: 32px;
  height: 32px;
  border-radius: 0.375rem;
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #ef4444;
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
  transition: all 0.2s;
}

.close-btn:hover {
  background: rgba(239, 68, 68, 0.3);
  transform: scale(1.1);
}

.results-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  padding: 1.5rem;
  background: rgba(15, 23, 42, 0.4);
}

.result-stat {
  text-align: center;
  padding: 1rem;
  border-radius: 0.5rem;
}

.result-success {
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.result-failed {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.result-value {
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 0.25rem;
}

.result-success .result-value {
  color: #22c55e;
}

.result-failed .result-value {
  color: #ef4444;
}

.result-label {
  font-size: 0.875rem;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.results-list {
  flex: 1;
  overflow-y: auto;
  padding: 1rem 1.5rem;
}

.result-item {
  display: flex;
  gap: 0.75rem;
  padding: 0.875rem;
  margin-bottom: 0.75rem;
  border-radius: 0.5rem;
  border: 1px solid;
}

.result-item-success {
  background: rgba(34, 197, 94, 0.05);
  border-color: rgba(34, 197, 94, 0.2);
}

.result-item-failed {
  background: rgba(239, 68, 68, 0.05);
  border-color: rgba(239, 68, 68, 0.2);
}

.result-icon {
  font-size: 1.25rem;
  flex-shrink: 0;
}

.result-item-success .result-icon {
  color: #22c55e;
}

.result-item-failed .result-icon {
  color: #ef4444;
}

.result-content {
  flex: 1;
}

.result-entity {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #f8fafc;
  margin-bottom: 0.25rem;
}

.result-reason {
  font-size: 0.8125rem;
  color: #94a3b8;
}

.results-close-btn {
  margin: 1.5rem;
  padding: 0.875rem;
  background: rgba(99, 102, 241, 0.2);
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 0.5rem;
  color: #a5b4fc;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.results-close-btn:hover {
  background: rgba(99, 102, 241, 0.3);
  transform: translateY(-2px);
}
</style>
