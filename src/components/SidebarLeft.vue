<template>
  <div class="sidebar-left">
    <!-- Quick Settings -->
    <div class="section">
      <h3 class="section-title">
        <span class="icon">⚙️</span>
        <span>Schnelleinstellungen</span>
      </h3>

      <!-- Radius Slider -->
      <div class="setting-item">
        <label class="setting-label">
          <span>Suchradius</span>
          <span class="value">{{ localSettings.radius }} km</span>
        </label>
        <input
          v-model.number="localSettings.radius"
          type="range"
          min="1"
          max="100"
          class="slider"
          @change="emitUpdate"
        />
      </div>

      <!-- Auto Refresh Toggle -->
      <div class="setting-item">
        <label class="setting-toggle">
          <input
            v-model="localSettings.autoRefresh"
            type="checkbox"
            class="toggle-input"
            @change="emitUpdate"
          />
          <span class="toggle-slider"></span>
          <span class="toggle-label">Auto-Refresh</span>
        </label>
      </div>

      <!-- Show Images Toggle -->
      <div class="setting-item">
        <label class="setting-toggle">
          <input
            v-model="localSettings.showImages"
            type="checkbox"
            class="toggle-input"
            @change="emitUpdate"
          />
          <span class="toggle-slider"></span>
          <span class="toggle-label">Bilder anzeigen</span>
        </label>
      </div>
    </div>

    <!-- News Sources -->
    <div class="section">
      <h3 class="section-title">
        <span class="icon">📰</span>
        <span>Quellen</span>
      </h3>
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
            @change="emitUpdate"
          />
          <span class="source-name">{{ source.name }}</span>
          <span v-if="source.enabled" class="source-status">●</span>
        </label>
      </div>
    </div>

    <!-- Quick Stats -->
    <div class="section">
      <h3 class="section-title">
        <span class="icon">📊</span>
        <span>Statistik</span>
      </h3>
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-value">{{ stats.total }}</div>
          <div class="stat-label">Artikel</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ stats.today }}</div>
          <div class="stat-label">Heute</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ stats.sources }}</div>
          <div class="stat-label">Quellen</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ stats.unread }}</div>
          <div class="stat-label">Ungelesen</div>
        </div>
      </div>
    </div>

    <!-- Interests Tags -->
    <div class="section">
      <h3 class="section-title">
        <span class="icon">🏷️</span>
        <span>Interessen</span>
      </h3>
      <div class="interests-tags">
        <span
          v-for="interest in localSettings.interests"
          :key="interest"
          class="interest-tag"
        >
          {{ interest }}
          <button @click="removeInterest(interest)" class="remove-tag">×</button>
        </span>
        <button @click="showAddInterest = true" class="add-interest-btn">
          + Hinzufügen
        </button>
      </div>
      <div v-if="showAddInterest" class="add-interest-form">
        <input
          v-model="newInterest"
          type="text"
          placeholder="Neues Interesse..."
          @keyup.enter="addInterest"
          class="interest-input"
        />
        <button @click="addInterest" class="confirm-btn">✓</button>
        <button @click="showAddInterest = false" class="cancel-btn">×</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { NewsSettings } from '../types'

const props = defineProps<{
  settings: NewsSettings
}>()

const emit = defineEmits<{
  'update-settings': [settings: NewsSettings]
}>()

const localSettings = ref<NewsSettings>({ ...props.settings })
const showAddInterest = ref(false)
const newInterest = ref('')

const availableSources = [
  { id: 'tagesschau', name: 'Tagesschau', enabled: true },
  { id: 'spiegel', name: 'Der Spiegel', enabled: true },
  { id: 'heise', name: 'Heise Online', enabled: true },
  { id: 'local', name: 'Lokale News', enabled: true },
  { id: 'community', name: 'Community', enabled: true }
]

const stats = computed(() => ({
  total: 47,
  today: 12,
  sources: 5,
  unread: 8
}))

watch(
  () => props.settings,
  (newVal) => {
    localSettings.value = { ...newVal }
  }
)

const emitUpdate = () => {
  emit('update-settings', localSettings.value)
}

const addInterest = () => {
  if (newInterest.value.trim() && !localSettings.value.interests.includes(newInterest.value.trim())) {
    localSettings.value.interests.push(newInterest.value.trim())
    newInterest.value = ''
    showAddInterest.value = false
    emitUpdate()
  }
}

const removeInterest = (interest: string) => {
  const index = localSettings.value.interests.indexOf(interest)
  if (index > -1) {
    localSettings.value.interests.splice(index, 1)
    emitUpdate()
  }
}
</script>

<style scoped>
.sidebar-left {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.section {
  background: rgba(30, 41, 59, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.75rem;
  padding: 1.25rem;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9375rem;
  font-weight: 700;
  color: #f8fafc;
  margin: 0 0 1rem 0;
}

.icon {
  font-size: 1.125rem;
}

/* Settings */
.setting-item {
  margin-bottom: 1rem;
}

.setting-item:last-child {
  margin-bottom: 0;
}

.setting-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  color: #cbd5e1;
}

.value {
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

.setting-toggle {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
}

.toggle-input {
  display: none;
}

.toggle-slider {
  position: relative;
  width: 42px;
  height: 22px;
  background: rgba(100, 116, 139, 0.3);
  border-radius: 11px;
  transition: all 0.3s;
}

.toggle-slider::before {
  content: '';
  position: absolute;
  width: 16px;
  height: 16px;
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
  transform: translateX(20px);
}

.toggle-label {
  font-size: 0.875rem;
  color: #cbd5e1;
  font-weight: 500;
}

/* Sources */
.sources-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.source-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem;
  background: rgba(15, 23, 42, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.source-item:hover {
  background: rgba(15, 23, 42, 0.6);
  border-color: rgba(99, 102, 241, 0.2);
}

.checkbox {
  width: 16px;
  height: 16px;
  accent-color: #6366f1;
  cursor: pointer;
}

.source-name {
  flex: 1;
  font-size: 0.875rem;
  color: #cbd5e1;
}

.source-status {
  color: #22c55e;
  font-size: 0.75rem;
}

/* Stats */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

.stat-item {
  text-align: center;
  padding: 0.875rem;
  background: rgba(15, 23, 42, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 0.5rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #6366f1;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.75rem;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Interests */
.interests-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.interest-tag {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.75rem;
  background: rgba(99, 102, 241, 0.2);
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 999px;
  color: #a5b4fc;
  font-size: 0.8125rem;
  font-weight: 500;
}

.remove-tag {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: rgba(239, 68, 68, 0.2);
  border: none;
  color: #fca5a5;
  font-size: 0.875rem;
  line-height: 1;
  cursor: pointer;
  transition: all 0.2s;
}

.remove-tag:hover {
  background: rgba(239, 68, 68, 0.4);
}

.add-interest-btn {
  padding: 0.375rem 0.75rem;
  background: rgba(30, 41, 59, 0.6);
  border: 1px dashed rgba(99, 102, 241, 0.4);
  border-radius: 999px;
  color: #6366f1;
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.add-interest-btn:hover {
  background: rgba(99, 102, 241, 0.1);
  border-color: #6366f1;
}

.add-interest-form {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.75rem;
}

.interest-input {
  flex: 1;
  padding: 0.5rem 0.75rem;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  color: #f8fafc;
  font-size: 0.875rem;
}

.interest-input:focus {
  outline: none;
  border-color: #6366f1;
}

.confirm-btn,
.cancel-btn {
  width: 32px;
  height: 32px;
  border-radius: 0.375rem;
  border: none;
  font-size: 1.125rem;
  cursor: pointer;
  transition: all 0.2s;
}

.confirm-btn {
  background: #22c55e;
  color: white;
}

.confirm-btn:hover {
  background: #16a34a;
}

.cancel-btn {
  background: rgba(239, 68, 68, 0.2);
  color: #fca5a5;
}

.cancel-btn:hover {
  background: rgba(239, 68, 68, 0.4);
}
</style>
