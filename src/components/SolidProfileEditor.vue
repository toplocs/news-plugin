<template>
  <div class="solid-profile-editor">
    <div v-if="!session.isLoggedIn" class="not-logged-in">
      <p>🔒 Bitte einloggen um Profil zu bearbeiten</p>
      <SolidLoginButton />
    </div>

    <div v-else class="editor-container">
      <h2>✏️ Profil bearbeiten</h2>

      <div v-if="loading" class="loading">Lade Profil...</div>

      <form v-else @submit.prevent="handleSave" class="profile-form">
        <!-- Name -->
        <div class="form-group">
          <label>Name:</label>
          <input v-model="form.name" type="text" required class="input" />
        </div>

        <!-- Avatar Upload -->
        <div class="form-group">
          <label>Avatar:</label>
          <div class="avatar-upload">
            <img v-if="form.avatar" :src="form.avatar" class="avatar-preview" />
            <div class="upload-actions">
              <input ref="fileInput" type="file" accept="image/*" @change="handleAvatarUpload" style="display: none" />
              <button @click="$refs.fileInput.click()" type="button" class="upload-btn">📤 Upload</button>
              <input v-model="form.avatar" type="url" class="input" placeholder="oder URL eingeben..." />
            </div>
            <p v-if="uploadStatus" :class="uploadStatus.type">{{ uploadStatus.message }}</p>
          </div>
        </div>

        <!-- Bio -->
        <div class="form-group">
          <label>Bio (max 200 Zeichen):</label>
          <textarea v-model="form.bio" maxlength="200" class="textarea"></textarea>
          <div class="char-count">{{ form.bio?.length || 0 }}/200</div>
        </div>

        <!-- Interests -->
        <div class="form-group">
          <label>Interests:</label>
          <div class="interests-list">
            <span v-for="interest in form.interests" :key="interest" class="interest-tag">
              {{ interest }}
              <button @click="removeInterest(interest)" type="button" class="remove-btn">×</button>
            </span>
          </div>
          <div class="add-interest">
            <input v-model="newInterest" @keyup.enter="addInterest" type="text" class="input" placeholder="Neues Interest..." />
            <button @click="addInterest" type="button" class="add-btn">+</button>
          </div>
        </div>

        <!-- Buttons -->
        <div class="button-group">
          <button type="submit" :disabled="saving" class="save-btn">
            {{ saving ? 'Speichert...' : '💾 Speichern' }}
          </button>
          <button @click="loadProfile" type="button" class="reload-btn">🔄 Neu laden</button>
        </div>

        <div v-if="saveMessage" class="message" :class="saveMessage.type">
          {{ saveMessage.text }}
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSolidSession } from '../stores/useSolidSession'
import { solidProfile } from '../services/solidProfile'
import { solidAvatarUpload } from '../services/solidAvatarUpload'
import SolidLoginButton from './SolidLoginButton.vue'

const session = useSolidSession()
const loading = ref(false)
const saving = ref(false)
const saveMessage = ref<{ text: string; type: 'success' | 'error' } | null>(null)
const uploadStatus = ref<{ message: string; type: 'success' | 'error' } | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

const form = ref({
  name: '',
  avatar: '',
  bio: '',
  interests: [] as string[]
})

const newInterest = ref('')

async function loadProfile() {
  if (!session.isLoggedIn) return

  loading.value = true
  try {
    const profile = await solidProfile.getProfile()
    if (profile) {
      form.value = {
        name: profile.name,
        avatar: profile.avatar || '',
        bio: profile.bio || '',
        interests: profile.interests
      }
    }
  } catch (error) {
    console.error('Error loading profile:', error)
  } finally {
    loading.value = false
  }
}

async function handleSave() {
  saving.value = true
  saveMessage.value = null

  try {
    const success = await solidProfile.saveProfile(form.value)
    if (success) {
      saveMessage.value = { text: '✅ Profil gespeichert!', type: 'success' }
      setTimeout(() => saveMessage.value = null, 3000)
    } else {
      saveMessage.value = { text: '❌ Fehler beim Speichern', type: 'error' }
    }
  } catch (error) {
    saveMessage.value = { text: '❌ Fehler beim Speichern', type: 'error' }
  } finally {
    saving.value = false
  }
}

function addInterest() {
  if (newInterest.value.trim()) {
    form.value.interests.push(newInterest.value.trim())
    newInterest.value = ''
  }
}

function removeInterest(interest: string) {
  form.value.interests = form.value.interests.filter(i => i !== interest)
}

async function handleAvatarUpload(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  uploadStatus.value = { message: 'Uploading...', type: 'success' }

  try {
    const resized = await solidAvatarUpload.resizeImage(file, 400, 400)
    const result = await solidAvatarUpload.uploadAvatar(resized)

    if (result.success && result.url) {
      form.value.avatar = result.url
      uploadStatus.value = { message: '✅ Upload erfolgreich!', type: 'success' }
      setTimeout(() => uploadStatus.value = null, 3000)
    } else {
      uploadStatus.value = { message: result.error || 'Upload fehlgeschlagen', type: 'error' }
    }
  } catch (error) {
    uploadStatus.value = { message: 'Upload fehlgeschlagen', type: 'error' }
  }
}

onMounted(() => {
  if (session.isLoggedIn) {
    loadProfile()
  }
})
</script>

<style scoped>
.solid-profile-editor {
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

.loading {
  text-align: center;
  color: #94a3b8;
  padding: 2rem;
}

.profile-form {
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

.input, .textarea {
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  font-size: 1rem;
}

.textarea {
  min-height: 100px;
  resize: vertical;
}

.input::placeholder, .textarea::placeholder {
  color: #64748b;
}

.char-count {
  text-align: right;
  font-size: 0.75rem;
  color: #64748b;
}

.avatar-preview {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.interests-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.interest-tag {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(102, 126, 234, 0.2);
  border: 1px solid rgba(102, 126, 234, 0.3);
  border-radius: 20px;
  color: #a5b4fc;
  font-size: 0.875rem;
}

.remove-btn {
  background: none;
  border: none;
  color: #ef4444;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 0;
  line-height: 1;
}

.add-interest {
  display: flex;
  gap: 0.5rem;
}

.add-btn {
  padding: 0.75rem 1.5rem;
  background: rgba(34, 197, 94, 0.2);
  border: 1px solid rgba(34, 197, 94, 0.3);
  border-radius: 8px;
  color: #22c55e;
  cursor: pointer;
  font-size: 1.2rem;
}

.button-group {
  display: flex;
  gap: 1rem;
}

.save-btn, .reload-btn {
  flex: 1;
  padding: 1rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.save-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.save-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.save-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.reload-btn {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.message {
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
}

.message.success {
  background: rgba(34, 197, 94, 0.2);
  border: 1px solid rgba(34, 197, 94, 0.3);
  color: #22c55e;
}

.message.error {
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #ef4444;
}
</style>
