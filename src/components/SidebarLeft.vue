<template>
  <div class="sidebar-left">
    <!-- Navigation Menu -->
    <div class="nav-menu">
      <button
        v-for="item in menuItems"
        :key="item.id"
        @click="activeView = item.id"
        :class="{ active: activeView === item.id }"
        class="nav-item"
        :aria-label="`${item.label} anzeigen`"
      >
        <span class="nav-icon">{{ item.icon }}</span>
        <span class="nav-label">{{ item.label }}</span>
        <span v-if="item.badge" class="nav-badge">{{ item.badge }}</span>
      </button>
    </div>

    <!-- View Content -->
    <div class="view-content">
      <!-- Quick Settings View -->
      <div v-if="activeView === 'settings'" class="view-panel">
        <h3 class="panel-title">
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

        <!-- Notifications Toggle -->
        <div class="setting-item">
          <label class="setting-toggle">
            <input
              v-model="localSettings.notificationsEnabled"
              type="checkbox"
              class="toggle-input"
              @change="emitUpdate"
            />
            <span class="toggle-slider"></span>
            <span class="toggle-label">Benachrichtigungen</span>
          </label>
        </div>

        <!-- Profile Edit Button -->
        <div class="setting-item" style="margin-top: 2rem;">
          <button @click="$emit('edit-profile')" class="profile-edit-btn">
            <span>👤</span>
            <span>Profil bearbeiten</span>
          </button>
        </div>
      </div>

      <!-- Discovery View -->
      <div v-if="activeView === 'discovery'" class="view-panel">
        <DiscoveryPanel
          :matches="discoveryMatches || []"
          :highScoreMatches="discoveryHighScoreMatches"
          :isLoading="discoveryLoading || false"
          :lastUpdate="discoveryLastUpdate || 0"
          @refresh="$emit('refresh-discovery')"
          @select="$emit('select-discovery', $event)"
        />
      </div>

      <!-- Bookmarks View - Gespeicherte Artikel -->
      <div v-if="activeView === 'bookmarks'" class="view-panel">
        <h3 class="panel-title">
          <span class="icon">🔖</span>
          <span>Gespeicherte Artikel</span>
        </h3>
        <p class="panel-description">Deine gemerkten Artikel zum späteren Lesen</p>

        <!-- Empty State -->
        <div v-if="bookmarkCount === 0" class="bookmarks-empty-state">
          <div class="empty-illustration-small">
            <span class="empty-icon-medium">📚</span>
            <span class="empty-sparkle">✨</span>
          </div>
          <p class="empty-text">Noch keine gespeicherten Artikel</p>
          <p class="empty-hint-small">
            Hover über einen Artikel im Feed und klicke auf das 🔖 Lesezeichen-Icon, um ihn hier zu speichern
          </p>
          <div class="empty-features">
            <div class="empty-feature-item">
              <span class="feature-icon">📖</span>
              <span>Später lesen</span>
            </div>
            <div class="empty-feature-item">
              <span class="feature-icon">🔄</span>
              <span>Sync über Geräte</span>
            </div>
          </div>
        </div>

        <!-- Bookmarks List -->
        <div v-else class="bookmarks-list">
          <div
            v-for="article in sortedBookmarks"
            :key="article.id"
            class="bookmark-item"
          >
            <div class="bookmark-content" @click="emit('article-click', article)">
              <h4 class="bookmark-title">{{ article.title }}</h4>
              <p class="bookmark-meta">
                <span>{{ article.source }}</span>
                <span class="separator">•</span>
                <span>{{ formatDate(article.publishedAt) }}</span>
              </p>
            </div>
            <button
              @click.stop="removeBookmark(article.id)"
              class="bookmark-remove-btn"
              title="Lesezeichen entfernen"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>

      <!-- Revenue View - Einnahmen Dashboard -->
      <div v-if="activeView === 'revenue'" class="view-panel">
        <RevenueDashboard />
      </div>

      <!-- Transparency Dashboard View -->
      <div v-if="activeView === 'transparency'" class="view-panel">
        <TransparencyDashboard
          :parent-id="'default'"
          :sort-by="'distance'"
          @edit-interests="activeView = 'interests'"
          @view-algorithm="activeView = 'transparency'"
        />
      </div>

      <!-- Channels View -->
      <div v-if="activeView === 'channels'" class="view-panel">
        <ChannelView />
      </div>

      <!-- Interests View -->
      <div v-if="activeView === 'interests'" class="view-panel">
        <h3 class="panel-title">
          <span class="icon">🏷️</span>
          <span>Meine Interessen</span>
        </h3>
        <p class="panel-description">Verwalte deine Interessen für personalisierte News</p>

        <div class="interests-tags">
          <div
            v-for="interest in localSettings.interests"
            :key="interest"
            class="interest-tag"
          >
            <span class="interest-name">{{ interest }}</span>
            <button @click="removeInterest(interest)" class="remove-tag" :aria-label="`${interest} entfernen`">×</button>
          </div>
        </div>

        <button @click="showAddInterest = true" class="add-interest-btn">
          <span>+</span>
          <span>Neues Interesse hinzufügen</span>
        </button>

        <div v-if="showAddInterest" class="add-interest-form">
          <input
            v-model="newInterest"
            type="text"
            placeholder="z.B. Technologie, Sport, Kultur..."
            @keyup.enter="addInterest"
            class="interest-input"
            ref="interestInput"
          />
          <button @click="addInterest" class="confirm-btn" aria-label="Bestätigen">✓</button>
          <button @click="cancelAddInterest" class="cancel-btn" aria-label="Abbrechen">×</button>
        </div>

        <!-- Suggested Interests -->
        <div v-if="!showAddInterest && localSettings.interests.length < 10" class="suggested-section">
          <h4 class="suggested-title">Vorschläge</h4>
          <div class="suggested-tags">
            <button
              v-for="suggestion in suggestedInterests"
              :key="suggestion"
              @click="addSuggestedInterest(suggestion)"
              class="suggested-tag"
            >
              + {{ suggestion }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, nextTick, onMounted, type ComputedRef } from 'vue'
import type { NewsSettings } from '../types'
import DiscoveryPanel from './DiscoveryPanel.vue'
import RevenueDashboard from './RevenueDashboard.vue'
import TransparencyDashboard from './TransparencyDashboard.vue'
import ChannelView from './ChannelView.vue'
import { useBookmarks } from '../stores/useBookmarks'
import { useChannels } from '../stores/useChannels'

const props = defineProps<{
  settings: NewsSettings
  discoveryMatches?: any[]
  discoveryLoading?: boolean
  discoveryLastUpdate?: number
}>()

const emit = defineEmits<{
  'update-settings': [settings: NewsSettings]
  'edit-profile': []
  'refresh-discovery': []
  'select-discovery': [match: any]
  'article-click': [article: any]
}>()

type ViewType = 'interests' | 'settings' | 'bookmarks' | 'discovery' | 'revenue' | 'channels' | 'transparency'

const activeView = ref<ViewType>('interests') // Start with Interests - most important!
const localSettings = ref<NewsSettings>({ ...props.settings })
const showAddInterest = ref(false)
const newInterest = ref('')
const interestInput = ref<HTMLInputElement | null>(null)

// Bookmarks management
const bookmarksStore = useBookmarks()
const { bookmarks, sortedBookmarks, bookmarkCount, removeBookmark } = bookmarksStore

// Channels management
const channelsStore = useChannels()

// ONLY ESSENTIAL TABS - Each must have REAL user value!
const menuItems: Array<{ id: ViewType; icon: string; label: string; badge?: string | ComputedRef<string> }> = [
  {
    id: 'interests',
    icon: '🏷️',
    label: 'Meine Interessen',
    badge: computed(() => localSettings.value.interests.length.toString())
  },
  {
    id: 'channels',
    icon: '🏛️',
    label: 'Channels',
    badge: computed(() => channelsStore.myChannels.length > 0 ? channelsStore.myChannels.length.toString() : '')
  },
  {
    id: 'bookmarks',
    icon: '🔖',
    label: 'Gespeichert',
    badge: computed(() => bookmarkCount.value > 0 ? bookmarkCount.value.toString() : '')
  },
  {
    id: 'revenue',
    icon: '💰',
    label: 'Einnahmen'
  },
  {
    id: 'transparency',
    icon: '🔍',
    label: 'Transparenz'
  },
  {
    id: 'settings',
    icon: '⚙️',
    label: 'Einstellungen'
  },
  {
    id: 'discovery',
    icon: '✨',
    label: 'Community'
  }
]

// Removed: availableSources, stats, weeklyActivity - no longer needed after tab simplification

const suggestedInterests = computed(() => {
  const all = ['Technologie', 'Politik', 'Sport', 'Kultur', 'Wissenschaft', 'Wirtschaft', 'Gesundheit', 'Reisen']
  return all.filter(s => !localSettings.value.interests.includes(s)).slice(0, 5)
})

const discoveryHighScoreMatches = computed(() => {
  if (!props.discoveryMatches) return []
  return props.discoveryMatches.filter(m => m.score > 0.7)
})

watch(
  () => props.settings,
  (newVal) => {
    localSettings.value = { ...newVal }
  }
)

watch(activeView, () => {
  showAddInterest.value = false
  newInterest.value = ''
})

watch(showAddInterest, async (show) => {
  if (show) {
    await nextTick()
    interestInput.value?.focus()
  }
})

const emitUpdate = () => {
  emit('update-settings', localSettings.value)
}

const addInterest = () => {
  const interest = newInterest.value.trim()
  if (interest && !localSettings.value.interests.includes(interest)) {
    localSettings.value.interests.push(interest)
    newInterest.value = ''
    showAddInterest.value = false
    emitUpdate()
  }
}

const addSuggestedInterest = (interest: string) => {
  if (!localSettings.value.interests.includes(interest)) {
    localSettings.value.interests.push(interest)
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

const cancelAddInterest = () => {
  showAddInterest.value = false
  newInterest.value = ''
}

// Format date helper
const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp)
  const now = Date.now()
  const diff = now - timestamp

  // Less than 1 hour
  if (diff < 60 * 60 * 1000) {
    const minutes = Math.floor(diff / (60 * 1000))
    return `vor ${minutes} Min`
  }

  // Less than 24 hours
  if (diff < 24 * 60 * 60 * 1000) {
    const hours = Math.floor(diff / (60 * 60 * 1000))
    return `vor ${hours} Std`
  }

  // Less than 7 days
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    const days = Math.floor(diff / (24 * 60 * 60 * 1000))
    return `vor ${days} Tag${days > 1 ? 'en' : ''}`
  }

  // Older than 7 days - show date
  return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })
}

// Load bookmarks on mount
onMounted(() => {
  bookmarksStore.loadBookmarks()
})
</script>

<style scoped>
.sidebar-left {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 0;
}

/* Navigation Menu */
.nav-menu {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.75rem;
  background: rgba(15, 23, 42, 0.6);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 0.5rem;
  color: #cbd5e1;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.nav-item:hover {
  background: rgba(99, 102, 241, 0.1);
  border-color: rgba(99, 102, 241, 0.2);
  color: #f8fafc;
}

.nav-item.active {
  background: rgba(99, 102, 241, 0.2);
  border-color: rgba(99, 102, 241, 0.3);
  color: #a5b4fc;
}

.nav-icon {
  font-size: 1.125rem;
}

.nav-label {
  flex: 1;
  text-align: left;
}

.nav-badge {
  padding: 0.125rem 0.5rem;
  background: rgba(99, 102, 241, 0.3);
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #a5b4fc;
}

/* View Content */
.view-content {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

.view-panel {
  animation: fadeIn 0.2s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.panel-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.125rem;
  font-weight: 700;
  color: #f8fafc;
  margin: 0 0 0.5rem 0;
}

.panel-description {
  font-size: 0.8125rem;
  color: #94a3b8;
  margin: 0 0 1.5rem 0;
}

.icon {
  font-size: 1.25rem;
}

/* Settings */
.setting-item {
  margin-bottom: 1.25rem;
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
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #6366f1;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
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

/* Profile Edit Button */
.profile-edit-btn {
  width: 100%;
  padding: 0.875rem 1.25rem;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.profile-edit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(99, 102, 241, 0.4);
}

/* Removed: Sources, Stats, Activity CSS - tabs have been removed */

/* Interests */
.interests-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.interest-tag {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.875rem;
  background: rgba(99, 102, 241, 0.2);
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 999px;
  transition: all 0.2s;
}

.interest-tag:hover {
  background: rgba(99, 102, 241, 0.25);
}

.interest-name {
  color: #a5b4fc;
  font-size: 0.8125rem;
  font-weight: 500;
}

.remove-tag {
  width: 18px;
  height: 18px;
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
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.875rem;
  background: rgba(30, 41, 59, 0.6);
  border: 1px dashed rgba(99, 102, 241, 0.4);
  border-radius: 0.5rem;
  color: #6366f1;
  font-size: 0.875rem;
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
  margin-top: 1rem;
}

.interest-input {
  flex: 1;
  padding: 0.625rem 0.875rem;
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
  width: 36px;
  height: 36px;
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

.suggested-section {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.suggested-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #cbd5e1;
  margin-bottom: 1rem;
}

.suggested-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.suggested-tag {
  padding: 0.375rem 0.75rem;
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 999px;
  color: #94a3b8;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.suggested-tag:hover {
  background: rgba(99, 102, 241, 0.1);
  border-color: rgba(99, 102, 241, 0.3);
  color: #a5b4fc;
}

/* Profile */
.profile-section {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: rgba(15, 23, 42, 0.4);
  border-radius: 0.75rem;
  margin-bottom: 1.5rem;
}

.profile-avatar {
  position: relative;
}

.avatar-circle {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
}

.avatar-edit {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #6366f1;
  border: 2px solid #1e293b;
  font-size: 0.75rem;
  cursor: pointer;
}

.profile-info {
  flex: 1;
}

.profile-name {
  font-size: 1.125rem;
  font-weight: 700;
  color: #f8fafc;
  margin: 0 0 0.25rem 0;
}

.profile-email {
  font-size: 0.875rem;
  color: #94a3b8;
  margin: 0;
}

.profile-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.profile-action-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  background: rgba(15, 23, 42, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 0.5rem;
  color: #cbd5e1;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.profile-action-btn:hover {
  background: rgba(15, 23, 42, 0.6);
  border-color: rgba(99, 102, 241, 0.2);
  color: #f8fafc;
}

/* Removed: About CSS - tab has been removed */

/* Bookmarks List */
.bookmarks-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.bookmark-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.875rem;
  background: rgba(15, 23, 42, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 0.5rem;
  transition: all 0.2s;
}

.bookmark-item:hover {
  background: rgba(15, 23, 42, 0.6);
  border-color: rgba(99, 102, 241, 0.2);
  transform: translateX(2px);
}

.bookmark-content {
  flex: 1;
  cursor: pointer;
  min-width: 0;
}

.bookmark-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #f8fafc;
  margin: 0 0 0.375rem 0;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.bookmark-meta {
  font-size: 0.75rem;
  color: #94a3b8;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  flex-wrap: wrap;
}

.bookmark-meta .separator {
  color: rgba(255, 255, 255, 0.2);
}

.bookmark-remove-btn {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  padding: 0;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 0.375rem;
  color: #ef4444;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bookmark-remove-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.4);
  transform: scale(1.05);
}

/* Bookmarks Empty State */
.bookmarks-empty-state {
  text-align: center;
  padding: 2rem 1rem;
}

.empty-illustration-small {
  position: relative;
  display: inline-block;
  margin-bottom: 1rem;
}

.empty-icon-medium {
  font-size: 3rem;
  opacity: 0.5;
  display: inline-block;
  animation: float 3s ease-in-out infinite;
}

.empty-sparkle {
  position: absolute;
  top: -5px;
  right: -10px;
  font-size: 1.25rem;
  animation: sparkle 2s ease-in-out infinite;
}

.empty-text {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #cbd5e1;
  margin: 0 0 0.5rem 0;
}

.empty-hint-small {
  font-size: 0.8125rem;
  color: #64748b;
  line-height: 1.5;
  margin: 0 0 1.5rem 0;
}

.empty-features {
  display: flex;
  gap: 1rem;
  justify-content: center;
  padding-top: 0.5rem;
}

.empty-feature-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8125rem;
  color: #64748b;
}

.feature-icon {
  font-size: 1.125rem;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

@keyframes sparkle {
  0%, 100% { opacity: 0.3; transform: scale(0.8) rotate(0deg); }
  50% { opacity: 1; transform: scale(1.2) rotate(15deg); }
}
</style>
