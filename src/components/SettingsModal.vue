<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="modal-overlay"
      @click="close"
      @keydown.esc="close"
    >
      <div
        class="modal-content"
        @click.stop
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-modal-title"
      >
        <div class="modal-header">
          <h2 id="settings-modal-title">Einstellungen</h2>
          <button class="close-btn" @click="close" aria-label="Einstellungen schließen">×</button>
        </div>

        <div class="modal-body">
          <!-- Radius Settings -->
          <div class="setting-section">
            <label class="setting-label" for="radius-slider">
              <span class="label-text">Suchradius</span>
              <span class="label-value">{{ localSettings.radius }} km</span>
            </label>
            <input
              id="radius-slider"
              v-model.number="localSettings.radius"
              type="range"
              min="1"
              max="100"
              step="1"
              class="slider"
              aria-label="Suchradius in Kilometern"
              :aria-valuenow="localSettings.radius"
              aria-valuemin="1"
              aria-valuemax="100"
            />
            <div class="slider-labels" aria-hidden="true">
              <span>1 km</span>
              <span>100 km</span>
            </div>
          </div>

          <!-- Auto Refresh -->
          <div class="setting-section">
            <label class="setting-toggle">
              <input
                v-model="localSettings.autoRefresh"
                type="checkbox"
                class="toggle-input"
              />
              <span class="toggle-slider"></span>
              <span class="toggle-label">Automatische Aktualisierung</span>
            </label>
            <p class="setting-description">
              News werden automatisch alle {{ localSettings.refreshInterval / 60000 }} Minuten aktualisiert
            </p>
          </div>

          <!-- Refresh Interval -->
          <div v-if="localSettings.autoRefresh" class="setting-section">
            <label class="setting-label">
              <span class="label-text">Aktualisierungsintervall</span>
              <span class="label-value">{{ localSettings.refreshInterval / 60000 }} min</span>
            </label>
            <input
              v-model.number="localSettings.refreshInterval"
              type="range"
              min="60000"
              max="1800000"
              step="60000"
              class="slider"
            />
            <div class="slider-labels">
              <span>1 min</span>
              <span>30 min</span>
            </div>
          </div>

          <!-- Show Images -->
          <div class="setting-section">
            <label class="setting-toggle">
              <input
                v-model="localSettings.showImages"
                type="checkbox"
                class="toggle-input"
              />
              <span class="toggle-slider"></span>
              <span class="toggle-label">Bilder anzeigen</span>
            </label>
          </div>

          <!-- Notifications -->
          <div class="setting-section">
            <label class="setting-toggle">
              <input
                v-model="localSettings.notificationsEnabled"
                type="checkbox"
                class="toggle-input"
              />
              <span class="toggle-slider"></span>
              <span class="toggle-label">Benachrichtigungen aktivieren</span>
            </label>
          </div>

          <!-- News Sources -->
          <div class="setting-section">
            <h3 class="section-title">Nachrichtenquellen</h3>
            <div class="sources-list">
              <label
                v-for="source in availableSources"
                :key="source.id"
                class="source-item"
              >
                <input
                  v-model="localSettings.sources"
                  :value="source.id"
                  type="checkbox"
                  class="checkbox"
                />
                <span class="source-name">{{ source.name }}</span>
              </label>
            </div>
          </div>

          <!-- Interests -->
          <div class="setting-section">
            <h3 class="section-title">Interessen</h3>
            <div class="interests-input">
              <input
                v-model="newInterest"
                type="text"
                placeholder="Interesse hinzufügen..."
                @keyup.enter="addInterest"
                class="text-input"
              />
              <button @click="addInterest" class="add-btn">+</button>
            </div>
            <div class="interests-tags">
              <span
                v-for="interest in localSettings.interests"
                :key="interest"
                class="interest-tag"
              >
                {{ interest }}
                <button @click="removeInterest(interest)" class="remove-tag">×</button>
              </span>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="close" class="btn btn-secondary">Abbrechen</button>
          <button @click="save" class="btn btn-primary">Speichern</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { NewsSettings } from '../types'

const props = defineProps<{
  modelValue: boolean
  settings: NewsSettings
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  save: [settings: NewsSettings]
}>()

const availableSources = [
  { id: 'tagesschau', name: 'Tagesschau' },
  { id: 'spiegel', name: 'Der Spiegel' },
  { id: 'heise', name: 'Heise Online' },
  { id: 'local', name: 'Lokale Nachrichten' },
  { id: 'community', name: 'Community Posts' }
]

const localSettings = ref<NewsSettings>({ ...props.settings })
const newInterest = ref('')

watch(
  () => props.settings,
  (newVal) => {
    localSettings.value = { ...newVal }
  }
)

const close = () => {
  emit('update:modelValue', false)
}

const save = () => {
  emit('save', localSettings.value)
  close()
}

const addInterest = () => {
  if (newInterest.value.trim() && !localSettings.value.interests.includes(newInterest.value.trim())) {
    localSettings.value.interests.push(newInterest.value.trim())
    newInterest.value = ''
  }
}

const removeInterest = (interest: string) => {
  const index = localSettings.value.interests.indexOf(interest)
  if (index > -1) {
    localSettings.value.interests.splice(index, 1)
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
}

.modal-content {
  background: #1e293b;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-header h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #f8fafc;
  margin: 0;
}

.close-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(15, 23, 42, 0.9);
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.close-btn:hover {
  background: rgba(99, 102, 241, 0.3);
}

.modal-body {
  padding: 1.5rem;
}

.setting-section {
  margin-bottom: 2rem;
}

.setting-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.label-text {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #f8fafc;
}

.label-value {
  font-size: 0.9375rem;
  font-weight: 700;
  color: #6366f1;
}

.slider {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: rgba(99, 102, 241, 0.2);
  outline: none;
  -webkit-appearance: none;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #6366f1;
  cursor: pointer;
}

.slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #6366f1;
  cursor: pointer;
  border: none;
}

.slider-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 0.5rem;
  font-size: 0.8125rem;
  color: #94a3b8;
}

.setting-toggle {
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
}

.toggle-input {
  display: none;
}

.toggle-slider {
  position: relative;
  width: 48px;
  height: 24px;
  background: rgba(100, 116, 139, 0.3);
  border-radius: 12px;
  transition: all 0.3s;
}

.toggle-slider::before {
  content: '';
  position: absolute;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #64748b;
  top: 3px;
  left: 3px;
  transition: all 0.3s;
}

.toggle-input:checked + .toggle-slider {
  background: rgba(99, 102, 241, 0.3);
}

.toggle-input:checked + .toggle-slider::before {
  background: #6366f1;
  transform: translateX(24px);
}

.toggle-label {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #f8fafc;
}

.setting-description {
  font-size: 0.8125rem;
  color: #94a3b8;
  margin: 0.5rem 0 0 4rem;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: #f8fafc;
  margin: 0 0 1rem 0;
}

.sources-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.source-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.source-item:hover {
  background: rgba(99, 102, 241, 0.1);
  border-color: rgba(99, 102, 241, 0.3);
}

.checkbox {
  width: 18px;
  height: 18px;
  accent-color: #6366f1;
  cursor: pointer;
}

.source-name {
  font-size: 0.9375rem;
  color: #f8fafc;
}

.interests-input {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.text-input {
  flex: 1;
  padding: 0.625rem 1rem;
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  color: #f8fafc;
  font-size: 0.9375rem;
}

.text-input:focus {
  outline: none;
  border-color: #6366f1;
}

.add-btn {
  width: 40px;
  height: 40px;
  background: #6366f1;
  border: none;
  border-radius: 0.5rem;
  color: white;
  font-size: 1.5rem;
  font-weight: 300;
  cursor: pointer;
  transition: all 0.2s;
}

.add-btn:hover {
  background: #4f46e5;
}

.interests-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.interest-tag {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: rgba(99, 102, 241, 0.2);
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 999px;
  color: #a5b4fc;
  font-size: 0.875rem;
  font-weight: 500;
}

.remove-tag {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: rgba(239, 68, 68, 0.2);
  border: none;
  color: #fca5a5;
  font-size: 1rem;
  line-height: 1;
  cursor: pointer;
  transition: all 0.2s;
}

.remove-tag:hover {
  background: rgba(239, 68, 68, 0.4);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary {
  background: rgba(30, 41, 59, 0.6);
  color: #cbd5e1;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.btn-secondary:hover {
  background: rgba(30, 41, 59, 0.8);
}

.btn-primary {
  background: #6366f1;
  color: white;
}

.btn-primary:hover {
  background: #4f46e5;
}
</style>
