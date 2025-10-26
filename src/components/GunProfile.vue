<template>
  <div class="gun-profile">
    <div class="profile-header">
      <h3>👤 Mein Profil</h3>
      <button v-if="!editing" @click="startEdit" class="edit-btn">
        ✏️ Bearbeiten
      </button>
    </div>

    <!-- View Mode -->
    <div v-if="!editing" class="profile-view">
      <div class="profile-avatar">
        {{ getInitials(profile.alias) }}
      </div>

      <div class="profile-details">
        <div class="detail-group">
          <label>Username</label>
          <p>{{ profile.alias || 'Nicht gesetzt' }}</p>
        </div>

        <div class="detail-group">
          <label>Bio</label>
          <p>{{ profile.bio || 'Keine Bio vorhanden' }}</p>
        </div>

        <div class="detail-group">
          <label>Standort</label>
          <p>{{ profile.location ? `${profile.location.city}, ${profile.location.country}` : 'Kein Standort gesetzt' }}</p>
        </div>

        <div class="detail-group">
          <label>Interessen</label>
          <div v-if="profile.interests && profile.interests.length > 0" class="interests">
            <span
              v-for="interest in profile.interests"
              :key="interest"
              class="interest-tag"
            >
              {{ interest }}
            </span>
          </div>
          <p v-else>Keine Interessen gesetzt</p>
        </div>

        <div class="detail-group">
          <label>Public Key</label>
          <p class="pub-key">{{ truncatePub(userPub) }}</p>
        </div>

        <div class="detail-group">
          <label>Mitglied seit</label>
          <p>{{ profile.created ? formatDate(profile.created) : 'Unbekannt' }}</p>
        </div>
      </div>
    </div>

    <!-- Edit Mode -->
    <div v-else class="profile-edit">
      <form @submit.prevent="saveProfile" class="edit-form">
        <div class="form-group">
          <label>Username</label>
          <input
            v-model="editData.alias"
            type="text"
            class="input-field"
            readonly
            disabled
          />
          <p class="help-text">Username kann nicht geändert werden</p>
        </div>

        <div class="form-group">
          <label>Bio</label>
          <textarea
            v-model="editData.bio"
            rows="3"
            maxlength="200"
            class="input-field"
            placeholder="Erzähle etwas über dich..."
          ></textarea>
          <p class="char-count">{{ editData.bio?.length || 0 }}/200</p>
        </div>

        <div class="form-group">
          <label>Standort</label>
          <input
            v-model="locationInput"
            type="text"
            class="input-field"
            placeholder="z.B. Berlin, Deutschland"
          />
        </div>

        <div class="form-group">
          <label>Interessen (kommagetrennt)</label>
          <input
            v-model="interestsInput"
            type="text"
            class="input-field"
            placeholder="z.B. Musik, Sport, Tech, Reisen"
            @input="updateInterests"
          />
          <div v-if="editData.interests && editData.interests.length > 0" class="interests-preview">
            <span
              v-for="interest in editData.interests"
              :key="interest"
              class="interest-tag"
            >
              {{ interest }}
            </span>
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" :disabled="saving" class="save-btn">
            {{ saving ? '💾 Speichere...' : '💾 Speichern' }}
          </button>
          <button type="button" @click="cancelEdit" class="cancel-btn">
            Abbrechen
          </button>
        </div>
      </form>
    </div>

    <!-- Privacy Settings -->
    <div class="privacy-section">
      <h4>🔒 Privatsphäre</h4>
      <div class="privacy-toggle">
        <label>
          <input v-model="profile.public" type="checkbox" @change="updatePrivacy" />
          <span>Profil öffentlich sichtbar</span>
        </label>
      </div>
      <div class="privacy-toggle">
        <label>
          <input v-model="profile.showLocation" type="checkbox" @change="updatePrivacy" />
          <span>Standort für andere sichtbar</span>
        </label>
      </div>
    </div>

    <!-- Stats -->
    <div class="profile-stats">
      <div class="stat">
        <span class="stat-value">{{ stats.posts }}</span>
        <span class="stat-label">Posts</span>
      </div>
      <div class="stat">
        <span class="stat-value">{{ stats.connections }}</span>
        <span class="stat-label">Verbindungen</span>
      </div>
      <div class="stat">
        <span class="stat-value">{{ stats.messages }}</span>
        <span class="stat-label">Nachrichten</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { gunUser, type GunProfile } from '../services/gunService'

// Extended profile interface for component use
interface ComponentProfile extends Partial<GunProfile> {
  alias: string
  displayName?: string
  bio?: string
  interests?: string[]
  created?: number
  updated?: number
  public?: boolean
  showLocation?: boolean
}

const profile = reactive<ComponentProfile>({
  alias: '',
  displayName: '',
  bio: '',
  interests: [],
  public: true,
  showLocation: true,
  created: Date.now(),
  updated: Date.now()
})

const editData = reactive<Partial<GunProfile>>({})
const editing = ref(false)
const saving = ref(false)
const interestsInput = ref('')
const locationInput = ref('')

const stats = reactive({
  posts: 0,
  connections: 0,
  messages: 0
})

const userPub = ref('')

onMounted(() => {
  loadProfile()
})

const loadProfile = () => {
  if (gunUser.is) {
    profile.alias = gunUser.is.alias || 'Unknown'
    userPub.value = gunUser.is.pub || ''

    // Load profile data from Gun.js (mock for now)
    profile.displayName = gunUser.is.alias || 'Unknown'
    profile.bio = 'P2P Enthusiast | Privacy Advocate | Dezentralisierung FTW! 🌐'
    profile.location = {
      city: 'Berlin',
      country: 'Deutschland'
    }
    profile.interests = ['Blockchain', 'P2P', 'Privacy', 'Open Source']
    profile.created = Date.now() - 30 * 24 * 60 * 60 * 1000 // 30 days ago
    profile.updated = Date.now()

    // Load stats (mock)
    stats.posts = 42
    stats.connections = 17
    stats.messages = 128
  }
}

const startEdit = () => {
  Object.assign(editData, profile)
  interestsInput.value = profile.interests?.join(', ') || ''
  locationInput.value = profile.location ? `${profile.location.city}, ${profile.location.country}` : ''
  editing.value = true
}

const cancelEdit = () => {
  editing.value = false
  Object.keys(editData).forEach(key => delete editData[key as keyof typeof editData])
}

const updateInterests = () => {
  editData.interests = interestsInput.value
    .split(',')
    .map(i => i.trim())
    .filter(Boolean)
}

const saveProfile = async () => {
  saving.value = true

  try {
    // Parse location from input
    if (locationInput.value) {
      const parts = locationInput.value.split(',').map(s => s.trim())
      if (parts.length >= 2) {
        editData.location = {
          city: parts[0],
          country: parts.slice(1).join(', ')
        }
      }
    }

    // Save to Gun.js (implement actual save logic)
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Update local profile
    Object.assign(profile, editData)
    profile.updated = Date.now()

    editing.value = false
    alert('✅ Profil gespeichert!')
  } catch (error) {
    console.error('Error saving profile:', error)
    alert('❌ Fehler beim Speichern')
  } finally {
    saving.value = false
  }
}

const updatePrivacy = () => {
  // Save privacy settings to Gun.js
  console.log('Privacy updated:', { public: profile.public, showLocation: profile.showLocation })
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
  return pub.length > 16 ? `${pub.slice(0, 12)}...${pub.slice(-12)}` : pub
}

const formatDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })
}
</script>

<style scoped>
.gun-profile {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
}

.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.profile-header h3 {
  color: #e2e8f0;
  margin: 0;
}

.edit-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: transform 0.2s;
}

.edit-btn:hover {
  transform: translateY(-2px);
}

.profile-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 auto 1.5rem;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.profile-details {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.detail-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.detail-group label {
  color: #94a3b8;
  font-size: 0.875rem;
  font-weight: 600;
}

.detail-group p {
  color: #e2e8f0;
  margin: 0;
}

.pub-key {
  font-family: monospace;
  font-size: 0.875rem;
  background: rgba(0, 0, 0, 0.3);
  padding: 0.5rem;
  border-radius: 4px;
}

.interests {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.interest-tag {
  background: rgba(102, 126, 234, 0.2);
  color: #a5b4fc;
  padding: 0.375rem 0.75rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 600;
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  color: #94a3b8;
  font-size: 0.875rem;
  font-weight: 600;
}

.input-field {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  padding: 0.75rem;
  color: #e2e8f0;
  font-family: inherit;
}

.input-field:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.input-field:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.help-text {
  color: #64748b;
  font-size: 0.75rem;
  margin: 0;
}

.char-count {
  color: #64748b;
  font-size: 0.75rem;
  text-align: right;
  margin: 0;
}

.interests-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.form-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.save-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  flex: 1;
}

.save-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.cancel-btn {
  background: rgba(255, 255, 255, 0.1);
  color: #94a3b8;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 0.75rem 1rem;
  border-radius: 6px;
  cursor: pointer;
}

.privacy-section {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.privacy-section h4 {
  color: #e2e8f0;
  margin: 0 0 1rem 0;
}

.privacy-toggle {
  margin-bottom: 0.75rem;
}

.privacy-toggle label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #e2e8f0;
  cursor: pointer;
}

.privacy-toggle input[type="checkbox"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.profile-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.stat-value {
  color: #667eea;
  font-size: 2rem;
  font-weight: 700;
}

.stat-label {
  color: #94a3b8;
  font-size: 0.875rem;
}

/* Responsive */
@media (max-width: 768px) {
  .gun-profile {
    padding: 1rem;
  }

  .profile-stats {
    grid-template-columns: 1fr;
  }
}
</style>
