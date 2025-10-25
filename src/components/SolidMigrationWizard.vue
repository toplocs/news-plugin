<template>
  <div class="solid-migration-wizard">
    <h2>🚀 Daten Migration</h2>
    <p class="subtitle">Migriere deine Daten von localStorage zu deinem Solid Pod</p>

    <div v-if="!session.isLoggedIn" class="not-logged-in">
      <p>⚠️ Bitte zuerst einloggen!</p>
      <SolidLoginButton />
    </div>

    <div v-else class="wizard-container">
      <!-- Step 1: Check -->
      <div v-if="step === 1" class="step">
        <h3>Schritt 1: Daten prüfen</h3>
        <div class="data-check">
          <div class="check-item">
            <span class="icon">{{ hasLocal.profile ? '✅' : '❌' }}</span>
            <span>Profile: {{ hasLocal.profile ? 'Gefunden' : 'Nicht gefunden' }}</span>
          </div>
          <div class="check-item">
            <span class="icon">{{ hasLocal.bookmarks ? '✅' : '❌' }}</span>
            <span>Bookmarks: {{ hasLocal.bookmarks ? 'Gefunden' : 'Nicht gefunden' }}</span>
          </div>
          <div class="check-item">
            <span class="icon">{{ hasLocal.settings ? '✅' : '❌' }}</span>
            <span>Settings: {{ hasLocal.settings ? 'Gefunden' : 'Nicht gefunden' }}</span>
          </div>
        </div>

        <div class="button-group">
          <button @click="checkData" class="btn-secondary">🔄 Neu prüfen</button>
          <button
            @click="step = 2"
            :disabled="!hasAnyData"
            class="btn-primary"
          >
            Weiter →
          </button>
        </div>
      </div>

      <!-- Step 2: Migrate -->
      <div v-if="step === 2" class="step">
        <h3>Schritt 2: Migration starten</h3>
        <div class="warning-box">
          <p>⚠️ <strong>Wichtig:</strong></p>
          <p>Deine Daten werden in deinen Solid Pod kopiert.</p>
          <p>Ein Backup wird automatisch erstellt.</p>
        </div>

        <div v-if="!migrating && !result" class="button-group">
          <button @click="step = 1" class="btn-secondary">← Zurück</button>
          <button @click="startMigration" class="btn-primary">
            🚀 Migration starten
          </button>
        </div>

        <div v-if="migrating" class="loading">
          <div class="spinner"></div>
          <p>Migration läuft...</p>
        </div>

        <div v-if="result" class="result">
          <div v-if="result.success" class="success-box">
            <h4>✅ Migration erfolgreich!</h4>
            <ul>
              <li v-if="result.profile">✅ Profile migriert</li>
              <li v-if="result.bookmarks">✅ Bookmarks migriert</li>
              <li v-if="result.settings">✅ Settings migriert</li>
            </ul>
          </div>

          <div v-else class="error-box">
            <h4>❌ Migration teilweise fehlgeschlagen</h4>
            <ul>
              <li v-for="error in result.errors" :key="error">{{ error }}</li>
            </ul>
          </div>

          <div class="button-group">
            <button @click="step = 3" class="btn-primary">
              Weiter →
            </button>
          </div>
        </div>
      </div>

      <!-- Step 3: Cleanup -->
      <div v-if="step === 3" class="step">
        <h3>Schritt 3: localStorage bereinigen</h3>
        <p>Deine Daten sind jetzt im Solid Pod!</p>

        <div class="info-box">
          <p>💡 <strong>Empfehlung:</strong></p>
          <p>Du kannst die alten Daten aus localStorage löschen.</p>
          <p>Ein Backup bleibt zur Sicherheit erhalten.</p>
        </div>

        <div class="button-group">
          <button @click="clearData(true)" class="btn-primary">
            🗑️ localStorage bereinigen (mit Backup)
          </button>
          <button @click="done" class="btn-secondary">
            Fertig
          </button>
        </div>
      </div>

      <!-- Done -->
      <div v-if="step === 4" class="step">
        <div class="success-box">
          <h3>🎉 Fertig!</h3>
          <p>Deine Daten sind jetzt sicher in deinem Solid Pod gespeichert.</p>
          <p>Du kannst die Dashboard-Tabs nutzen um sie zu verwalten.</p>
        </div>

        <button @click="reset" class="btn-primary">
          Neu starten
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useSolidSession } from '../stores/useSolidSession'
import { solidMigration, type MigrationResult } from '../services/solidMigration'
import SolidLoginButton from './SolidLoginButton.vue'

const session = useSolidSession()
const step = ref(1)
const migrating = ref(false)
const result = ref<MigrationResult | null>(null)

const hasLocal = ref({
  profile: false,
  bookmarks: false,
  settings: false
})

const hasAnyData = computed(() =>
  hasLocal.value.profile || hasLocal.value.bookmarks || hasLocal.value.settings
)

function checkData() {
  hasLocal.value = solidMigration.hasLocalData()
}

async function startMigration() {
  migrating.value = true
  result.value = null

  try {
    result.value = await solidMigration.migrateAll()
  } catch (error) {
    console.error('Migration error:', error)
    result.value = {
      success: false,
      errors: [String(error)]
    }
  } finally {
    migrating.value = false
  }
}

function clearData(keepBackup: boolean) {
  solidMigration.clearLocalData(keepBackup)
  step.value = 4
}

function done() {
  step.value = 4
}

function reset() {
  step.value = 1
  result.value = null
  checkData()
}

onMounted(() => {
  checkData()
})
</script>

<style scoped>
.solid-migration-wizard {
  padding: 2rem;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

h2 {
  color: #e2e8f0;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #94a3b8;
  margin-bottom: 2rem;
}

.not-logged-in {
  text-align: center;
  padding: 2rem;
  color: #94a3b8;
}

.step {
  background: rgba(255, 255, 255, 0.05);
  padding: 2rem;
  border-radius: 8px;
}

.data-check {
  margin: 1.5rem 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.check-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  font-size: 1.1rem;
}

.icon {
  font-size: 1.5rem;
}

.button-group {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.btn-primary, .btn-secondary {
  flex: 1;
  padding: 1rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.warning-box, .info-box, .success-box, .error-box {
  padding: 1.5rem;
  border-radius: 8px;
  margin: 1.5rem 0;
}

.warning-box {
  background: rgba(251, 146, 60, 0.1);
  border: 1px solid rgba(251, 146, 60, 0.3);
  color: #fb923c;
}

.info-box {
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.3);
  color: #3b82f6;
}

.success-box {
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.3);
  color: #22c55e;
}

.error-box {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #ef4444;
}

.loading {
  text-align: center;
  padding: 3rem;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
