<template>
  <div class="solid-dashboard">
    <div class="header-row">
      <div>
        <h1 class="title">🔒 Solid Pods Dashboard</h1>
        <p class="subtitle">Deine Daten, dein Pod, deine Kontrolle</p>
      </div>
      <PWAInstallButton />
    </div>

    <!-- Pod Status -->
    <div class="status-container">
      <Suspense>
        <template #default>
          <SolidPodStatus :show-details="true" />
        </template>
        <template #fallback>
          <div class="loading">Lade Status...</div>
        </template>
      </Suspense>
    </div>

    <!-- Tab Navigation -->
    <div class="tabs">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="activeTab = tab.id"
        :class="{ active: activeTab === tab.id }"
        class="tab-btn"
      >
        <span>{{ tab.icon }}</span>
        <span>{{ tab.label }}</span>
      </button>
    </div>

    <!-- Tab Content -->
    <div class="tab-content">
      <!-- Login Tab -->
      <div v-show="activeTab === 'login'" class="tab-panel">
        <Suspense>
          <template #default>
            <SolidLoginButton />
          </template>
          <template #fallback>
            <div class="loading">Lade Login...</div>
          </template>
        </Suspense>
        <div v-if="session.isLoggedIn" class="pod-info">
          <h3>✅ Verbunden mit:</h3>
          <p class="webid">{{ session.webId }}</p>
          <p class="pod-url">Pod URL: {{ session.podUrl }}</p>
        </div>
      </div>

      <!-- Profile Tab -->
      <div v-show="activeTab === 'profile'" class="tab-panel">
        <Suspense>
          <template #default>
            <SolidProfileEditor />
          </template>
          <template #fallback>
            <div class="loading">Lade Profil Editor...</div>
          </template>
        </Suspense>
      </div>

      <!-- Bookmarks Tab -->
      <div v-show="activeTab === 'bookmarks'" class="tab-panel">
        <Suspense>
          <template #default>
            <SolidBookmarksManager />
          </template>
          <template #fallback>
            <div class="loading">Lade Bookmarks...</div>
          </template>
        </Suspense>
      </div>

      <!-- Settings Tab -->
      <div v-show="activeTab === 'settings'" class="tab-panel">
        <Suspense>
          <template #default>
            <SolidSettingsManager />
          </template>
          <template #fallback>
            <div class="loading">Lade Einstellungen...</div>
          </template>
        </Suspense>
      </div>

      <!-- Migration Tab -->
      <div v-show="activeTab === 'migration'" class="tab-panel">
        <Suspense>
          <template #default>
            <SolidMigrationWizard />
          </template>
          <template #fallback>
            <div class="loading">Lade Migration Wizard...</div>
          </template>
        </Suspense>
      </div>

      <!-- Info Tab -->
      <div v-show="activeTab === 'info'" class="tab-panel">
        <div class="info-content">
          <h2>Was ist Solid?</h2>
          <p>
            Solid Pods sind persönliche Datenspeicher, die DIR gehören.
            Du entscheidest, wo deine Daten gespeichert werden und wer Zugriff hat.
          </p>

          <h3 style="margin-top: 1.5rem;">🌟 Vorteile:</h3>
          <ul class="benefits-list">
            <li>✅ <strong>Datenselbstbestimmung</strong> - Deine Daten gehören DIR</li>
            <li>✅ <strong>GDPR Compliant</strong> - EU-konforme Speicherung</li>
            <li>✅ <strong>Portabilität</strong> - Nimm deine Daten überall hin mit</li>
            <li>✅ <strong>Interoperabilität</strong> - Apps können deine Daten teilen</li>
          </ul>

          <h3 style="margin-top: 1.5rem;">🚀 Schnellstart:</h3>
          <ol class="steps-list">
            <li>Gehe zum "Login" Tab</li>
            <li>Wähle einen Provider (z.B. solidcommunity.net)</li>
            <li>Erstelle einen Account oder logge dich ein</li>
            <li>Bearbeite dein Profil im "Profile" Tab</li>
            <li>Verwalte Bookmarks im "Bookmarks" Tab</li>
          </ol>

          <div class="warning-box">
            <h4>⚠️ Wichtig:</h4>
            <p>
              solidcommunity.net ist ein kostenloser Test-Provider.
              Für Production solltest du einen eigenen Pod Server hosten (Community Solid Server).
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineAsyncComponent } from 'vue'
import { useSolidSession } from '../stores/useSolidSession'
import { LazySolidComponents } from '../utils/lazyLoad'

// Lazy load all Solid components for better performance
const SolidLoginButton = defineAsyncComponent(LazySolidComponents.SolidLoginButton)
const SolidProfileEditor = defineAsyncComponent(LazySolidComponents.SolidProfileEditor)
const SolidBookmarksManager = defineAsyncComponent(() => import('../components/SolidBookmarksManager.vue'))
const SolidSettingsManager = defineAsyncComponent(() => import('../components/SolidSettingsManager.vue'))
const SolidPodStatus = defineAsyncComponent(LazySolidComponents.SolidPodStatus)
const SolidMigrationWizard = defineAsyncComponent(LazySolidComponents.SolidMigrationWizard)
const PWAInstallButton = defineAsyncComponent(() => import('../components/PWAInstallButton.vue'))

const session = useSolidSession()

const activeTab = ref('login')

const tabs = [
  { id: 'login', icon: '🔐', label: 'Login' },
  { id: 'profile', icon: '👤', label: 'Profil' },
  { id: 'bookmarks', icon: '📚', label: 'Bookmarks' },
  { id: 'settings', icon: '⚙️', label: 'Einstellungen' },
  { id: 'migration', icon: '🚀', label: 'Migration' },
  { id: 'info', icon: 'ℹ️', label: 'Info' }
]
</script>

<style scoped>
.solid-dashboard {
  padding: 2rem;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.title {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  text-align: center;
}

.subtitle {
  text-align: center;
  opacity: 0.9;
  margin-bottom: 0;
  font-size: 1.1rem;
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  font-size: 1.1rem;
  opacity: 0.8;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.8; }
  50% { opacity: 0.5; }
}

.status-container {
  max-width: 600px;
  margin: 0 auto 2rem auto;
}

.tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  justify-content: center;
  flex-wrap: wrap;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 1rem;
}

.tab-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

.tab-btn.active {
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.4);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.tab-content {
  max-width: 1000px;
  margin: 0 auto;
}

.tab-panel {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 2rem;
  min-height: 400px;
}

.pod-info {
  margin-top: 2rem;
  padding: 1.5rem;
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.3);
  border-radius: 8px;
}

.pod-info h3 {
  color: #22c55e;
  margin-bottom: 1rem;
}

.webid, .pod-url {
  font-family: monospace;
  background: rgba(0, 0, 0, 0.3);
  padding: 0.5rem;
  border-radius: 4px;
  margin: 0.5rem 0;
  word-break: break-all;
}

.info-content {
  line-height: 1.8;
}

.info-content h2 {
  margin-bottom: 1rem;
  font-size: 1.8rem;
}

.info-content h3, .info-content h4 {
  color: #e2e8f0;
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
}

.benefits-list, .steps-list {
  margin: 1rem 0;
  padding-left: 1.5rem;
}

.benefits-list li, .steps-list li {
  margin: 0.75rem 0;
}

.warning-box {
  margin-top: 2rem;
  padding: 1.5rem;
  background: rgba(251, 146, 60, 0.1);
  border: 1px solid rgba(251, 146, 60, 0.3);
  border-radius: 8px;
}

.warning-box h4 {
  color: #fb923c;
  margin-top: 0;
  margin-bottom: 0.75rem;
}

.warning-box p {
  margin: 0.5rem 0;
}
</style>
