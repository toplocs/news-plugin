<template>
  <div class="solid-settings-manager">
    <h2>⚙️ Einstellungen (Solid Pod)</h2>

    <div v-if="!session.isLoggedIn" class="not-logged-in">
      <p>🔒 Bitte einloggen</p>
      <SolidLoginButton />
    </div>

    <div v-else class="settings-container">
      <div class="controls">
        <button @click="loadSettings" :disabled="loading" class="reload-btn">
          {{ loading ? '⏳ Laden...' : '🔄 Neu laden' }}
        </button>
        <button @click="syncFromLocal" class="sync-btn">
          🔄 Sync von localStorage
        </button>
      </div>

      <form v-if="!loading" @submit.prevent="handleSave" class="settings-form">
        <!-- Language -->
        <div class="form-group">
          <label>🌍 Sprache:</label>
          <select v-model="form.language" class="select">
            <option value="de">Deutsch</option>
            <option value="en">English</option>
          </select>
        </div>

        <!-- Theme -->
        <div class="form-group">
          <label>🎨 Theme:</label>
          <div class="radio-group">
            <label class="radio-label">
              <input v-model="form.theme" type="radio" value="light" />
              <span>☀️ Hell</span>
            </label>
            <label class="radio-label">
              <input v-model="form.theme" type="radio" value="dark" />
              <span>🌙 Dunkel</span>
            </label>
            <label class="radio-label">
              <input v-model="form.theme" type="radio" value="auto" />
              <span>🔄 Auto</span>
            </label>
          </div>
        </div>

        <!-- Notifications -->
        <div class="form-group">
          <label class="checkbox-label">
            <input v-model="form.notifications" type="checkbox" />
            <span>🔔 Benachrichtigungen aktivieren</span>
          </label>
        </div>

        <!-- Email Digest -->
        <div class="form-group">
          <label class="checkbox-label">
            <input v-model="form.emailDigest" type="checkbox" />
            <span>📧 Tägliche Email Zusammenfassung</span>
          </label>
        </div>

        <!-- RSS Feeds -->
        <div class="form-group">
          <label>📰 RSS Feeds:</label>
          <div class="feeds-list">
            <div v-for="(feed, index) in form.rssFeeds" :key="index" class="feed-item">
              <input v-model="form.rssFeeds[index]" type="url" class="input" placeholder="https://..." />
              <button @click="removeFeed(index)" type="button" class="remove-btn">🗑️</button>
            </div>
          </div>
          <button @click="addFeed" type="button" class="add-btn">➕ Feed hinzufügen</button>
        </div>

        <!-- Save Button -->
        <div class="button-group">
          <button type="submit" :disabled="saving" class="save-btn">
            {{ saving ? 'Speichert...' : '💾 Speichern' }}
          </button>
        </div>

        <div v-if="message" class="message" :class="message.type">
          {{ message.text }}
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSolidSession } from '../stores/useSolidSession'
import { solidSettings, type UserSettings } from '../services/solidSettings'
import SolidLoginButton from './SolidLoginButton.vue'

const session = useSolidSession()
const loading = ref(false)
const saving = ref(false)
const message = ref<{ text: string; type: 'success' | 'error' } | null>(null)

const form = ref<UserSettings>({
  language: 'de',
  theme: 'dark',
  notifications: true,
  emailDigest: false,
  rssFeeds: []
})

async function loadSettings() {
  if (!session.isLoggedIn) return

  loading.value = true
  try {
    const settings = await solidSettings.getSettings()
    form.value = settings
  } catch (error) {
    console.error('Error loading settings:', error)
  } finally {
    loading.value = false
  }
}

async function handleSave() {
  saving.value = true
  message.value = null

  try {
    const success = await solidSettings.saveSettings(form.value)
    if (success) {
      message.value = { text: '✅ Einstellungen gespeichert!', type: 'success' }
      setTimeout(() => message.value = null, 3000)
    } else {
      message.value = { text: '❌ Fehler beim Speichern', type: 'error' }
    }
  } catch (error) {
    message.value = { text: '❌ Fehler beim Speichern', type: 'error' }
  } finally {
    saving.value = false
  }
}

async function syncFromLocal() {
  try {
    await solidSettings.syncWithLocalStorage()
    await loadSettings()
    message.value = { text: '✅ Sync erfolgreich!', type: 'success' }
    setTimeout(() => message.value = null, 3000)
  } catch (error) {
    message.value = { text: '❌ Sync fehlgeschlagen', type: 'error' }
  }
}

function addFeed() {
  form.value.rssFeeds.push('')
}

function removeFeed(index: number) {
  form.value.rssFeeds.splice(index, 1)
}

onMounted(() => {
  if (session.isLoggedIn) {
    loadSettings()
  }
})
</script>

<style scoped>
.solid-settings-manager {
  padding: 2rem;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

h2 {
  color: #e2e8f0;
  margin-bottom: 1.5rem;
}

.not-logged-in {
  text-align: center;
  padding: 2rem;
  color: #94a3b8;
}

.controls {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.reload-btn, .sync-btn {
  padding: 0.75rem 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  cursor: pointer;
}

.settings-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

label {
  color: #cbd5e1;
  font-weight: 600;
  font-size: 0.875rem;
}

.select, .input {
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
}

.radio-group {
  display: flex;
  gap: 1rem;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  cursor: pointer;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  cursor: pointer;
}

.feeds-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.feed-item {
  display: flex;
  gap: 0.5rem;
}

.remove-btn {
  padding: 0.75rem 1rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 8px;
  color: #ef4444;
  cursor: pointer;
}

.add-btn {
  padding: 0.75rem 1.5rem;
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.3);
  border-radius: 8px;
  color: #22c55e;
  cursor: pointer;
}

.save-btn {
  padding: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 8px;
  color: white;
  font-weight: 600;
  cursor: pointer;
}

.save-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.message {
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
}

.message.success {
  background: rgba(34, 197, 94, 0.2);
  color: #22c55e;
}

.message.error {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}
</style>
