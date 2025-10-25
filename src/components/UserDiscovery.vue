<template>
  <div class="user-discovery">
    <div class="discovery-header">
      <h3>🔍 User Discovery</h3>
      <p class="subtitle">Finde Gleichgesinnte in deiner Nähe</p>
    </div>

    <!-- Search Filters -->
    <div class="filters">
      <div class="filter-group">
        <label>Interessen</label>
        <input
          v-model="filters.interests"
          type="text"
          placeholder="z.B. Musik, Sport, Tech..."
          class="filter-input"
          @input="debouncedSearch"
        />
      </div>

      <div class="filter-group">
        <label>Standort</label>
        <input
          v-model="filters.location"
          type="text"
          placeholder="Stadt oder Region"
          class="filter-input"
          @input="debouncedSearch"
        />
      </div>

      <div class="filter-group">
        <label>Radius (km)</label>
        <select v-model="filters.radius" class="filter-input" @change="debouncedSearch">
          <option value="5">5 km</option>
          <option value="10">10 km</option>
          <option value="25">25 km</option>
          <option value="50">50 km</option>
          <option value="100">100 km</option>
          <option value="0">Weltweit</option>
        </select>
      </div>

      <div class="filter-actions">
        <button @click="searchUsers" :disabled="searching" class="search-btn">
          {{ searching ? '🔄 Suche...' : '🔍 Suchen' }}
        </button>
        <button @click="resetFilters" class="reset-btn">
          🔄 Zurücksetzen
        </button>
      </div>
    </div>

    <!-- Search Results -->
    <div class="results">
      <div class="results-header">
        <h4>{{ users.length }} {{ users.length === 1 ? 'User gefunden' : 'Users gefunden' }}</h4>
        <div class="view-toggle">
          <button
            @click="viewMode = 'grid'"
            :class="{ active: viewMode === 'grid' }"
            class="toggle-btn"
          >
            ▦
          </button>
          <button
            @click="viewMode = 'list'"
            :class="{ active: viewMode === 'list' }"
            class="toggle-btn"
          >
            ☰
          </button>
        </div>
      </div>

      <div v-if="searching" class="loading">
        <div class="spinner"></div>
        <p>Suche nach Usern...</p>
      </div>

      <div v-else-if="users.length === 0" class="empty-state">
        <p>🔍 Keine Users gefunden</p>
        <p class="hint">Versuche andere Suchkriterien</p>
      </div>

      <div v-else class="users-grid" :class="{ 'list-view': viewMode === 'list' }">
        <div
          v-for="user in users"
          :key="user.pub"
          class="user-card"
        >
          <div class="user-avatar">
            {{ getInitials(user.alias) }}
          </div>
          <div class="user-info">
            <h5 class="user-name">{{ user.alias }}</h5>
            <p class="user-pub">{{ truncatePub(user.pub) }}</p>
            <div v-if="user.interests && user.interests.length > 0" class="user-interests">
              <span
                v-for="interest in user.interests.slice(0, 3)"
                :key="interest"
                class="interest-tag"
              >
                {{ interest }}
              </span>
            </div>
            <div v-if="user.location" class="user-location">
              📍 {{ user.location }}
              <span v-if="user.distance" class="distance">
                ({{ user.distance }} km)
              </span>
            </div>
          </div>
          <div class="user-actions">
            <button @click="connectUser(user)" class="action-btn primary">
              👋 Verbinden
            </button>
            <button @click="messageUser(user)" class="action-btn">
              💬 Nachricht
            </button>
            <button @click="viewProfile(user)" class="action-btn">
              👤 Profil
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Connection Status -->
    <div v-if="connectionStatus" class="status-toast" :class="connectionStatus.type">
      {{ connectionStatus.message }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { findUsers, type GunProfile } from '../services/gunService'

interface UserWithDistance extends GunProfile {
  distance?: number
}

const users = ref<UserWithDistance[]>([])
const searching = ref(false)
const viewMode = ref<'grid' | 'list'>('grid')
const connectionStatus = ref<{ type: string; message: string } | null>(null)

const filters = reactive({
  interests: '',
  location: '',
  radius: '25'
})

let debounceTimer: NodeJS.Timeout | null = null

const debouncedSearch = () => {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }
  debounceTimer = setTimeout(() => {
    searchUsers()
  }, 500)
}

const searchUsers = async () => {
  searching.value = true

  try {
    const interestsArray = filters.interests
      .split(',')
      .map(i => i.trim())
      .filter(Boolean)

    const results = await findUsers({
      interests: interestsArray.length > 0 ? interestsArray : undefined,
      location: filters.location || undefined,
      radius: parseInt(filters.radius) || undefined
    })

    // Simulate distance calculation (in real app, use geolocation)
    users.value = results.map(user => ({
      ...user,
      distance: filters.radius !== '0' && filters.location
        ? Math.floor(Math.random() * parseInt(filters.radius))
        : undefined
    }))
  } catch (error) {
    console.error('Error searching users:', error)
    showStatus('error', '❌ Fehler bei der Suche')
  } finally {
    searching.value = false
  }
}

const resetFilters = () => {
  filters.interests = ''
  filters.location = ''
  filters.radius = '25'
  users.value = []
}

const connectUser = (user: UserWithDistance) => {
  // In real app, send connection request
  showStatus('success', `✅ Verbindungsanfrage an ${user.alias} gesendet`)
}

const messageUser = (user: UserWithDistance) => {
  // Emit event to open message composer
  emit('message-user', user)
  showStatus('info', `💬 Nachricht an ${user.alias} wird geöffnet`)
}

const viewProfile = (user: UserWithDistance) => {
  // Emit event to view profile
  emit('view-profile', user)
}

const getInitials = (alias: string): string => {
  if (!alias) return '?'
  const parts = alias.split(' ')
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return alias.slice(0, 2).toUpperCase()
}

const truncatePub = (pub: string): string => {
  if (!pub) return 'Unknown'
  return pub.length > 16 ? `${pub.slice(0, 8)}...${pub.slice(-8)}` : pub
}

const showStatus = (type: string, message: string) => {
  connectionStatus.value = { type, message }
  setTimeout(() => {
    connectionStatus.value = null
  }, 3000)
}

const emit = defineEmits<{
  (e: 'message-user', user: UserWithDistance): void
  (e: 'view-profile', user: UserWithDistance): void
}>()

// Auto-search on mount with default filters
searchUsers()
</script>

<style scoped>
.user-discovery {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
}

.discovery-header h3 {
  color: #e2e8f0;
  margin: 0 0 0.5rem 0;
}

.subtitle {
  color: #94a3b8;
  font-size: 0.875rem;
  margin: 0 0 1.5rem 0;
}

.filters {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-group label {
  color: #94a3b8;
  font-size: 0.875rem;
  font-weight: 600;
}

.filter-input {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  padding: 0.75rem;
  color: #e2e8f0;
  font-family: inherit;
}

.filter-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.filter-actions {
  grid-column: 1 / -1;
  display: flex;
  gap: 0.5rem;
}

.search-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  flex: 1;
}

.search-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.reset-btn {
  background: rgba(255, 255, 255, 0.1);
  color: #94a3b8;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 0.75rem 1rem;
  border-radius: 6px;
  cursor: pointer;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.results-header h4 {
  color: #e2e8f0;
  margin: 0;
}

.view-toggle {
  display: flex;
  gap: 0.25rem;
  background: rgba(0, 0, 0, 0.3);
  padding: 0.25rem;
  border-radius: 6px;
}

.toggle-btn {
  background: transparent;
  border: none;
  color: #94a3b8;
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  border-radius: 4px;
  font-size: 1rem;
}

.toggle-btn.active {
  background: rgba(102, 126, 234, 0.3);
  color: #667eea;
}

.loading {
  text-align: center;
  padding: 3rem 1rem;
  color: #94a3b8;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #64748b;
}

.empty-state .hint {
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

.users-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

.users-grid.list-view {
  grid-template-columns: 1fr;
}

.user-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  transition: transform 0.2s, box-shadow 0.2s;
}

.user-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.list-view .user-card {
  flex-direction: row;
  align-items: center;
}

.user-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  font-weight: 700;
  flex-shrink: 0;
}

.list-view .user-avatar {
  width: 50px;
  height: 50px;
  font-size: 1.25rem;
}

.user-info {
  flex: 1;
}

.user-name {
  color: #e2e8f0;
  margin: 0 0 0.25rem 0;
  font-size: 1.125rem;
}

.user-pub {
  color: #64748b;
  font-size: 0.75rem;
  font-family: monospace;
  margin: 0 0 0.75rem 0;
}

.user-interests {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.interest-tag {
  background: rgba(102, 126, 234, 0.2);
  color: #a5b4fc;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.user-location {
  color: #94a3b8;
  font-size: 0.875rem;
}

.distance {
  color: #64748b;
  font-size: 0.75rem;
}

.user-actions {
  display: flex;
  gap: 0.5rem;
}

.list-view .user-actions {
  flex-direction: column;
}

.action-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #94a3b8;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  flex: 1;
  transition: all 0.2s;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  color: #e2e8f0;
  transform: scale(1.05);
}

.action-btn.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
}

.action-btn.primary:hover {
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.4);
}

.status-toast {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  animation: slideIn 0.3s ease-out;
}

.status-toast.success {
  border-left: 4px solid #22c55e;
}

.status-toast.error {
  border-left: 4px solid #ef4444;
}

.status-toast.info {
  border-left: 4px solid #3b82f6;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .filters {
    grid-template-columns: 1fr;
  }

  .users-grid {
    grid-template-columns: 1fr;
  }

  .status-toast {
    bottom: 1rem;
    right: 1rem;
    left: 1rem;
  }
}
</style>
