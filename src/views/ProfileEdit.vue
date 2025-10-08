<template>
  <div class="profile-edit">
    <div class="container">
      <!-- Header -->
      <div class="page-header">
        <button @click="handleCancel" class="btn-back">
          ← Zurück
        </button>
        <h1>Profil bearbeiten</h1>
      </div>

      <div class="edit-layout">
        <!-- Left: Form -->
        <div class="form-container">
          <ProfileForm
            :profile="currentProfile"
            @save="handleSave"
            @cancel="handleCancel"
          />
        </div>

        <!-- Right: Preview -->
        <div class="preview-container">
          <div class="preview-sticky">
            <h3 class="preview-title">Vorschau</h3>
            <ProfilePreview :profile="currentProfile" />
          </div>
        </div>
      </div>
    </div>

    <!-- Loading Overlay -->
    <div v-if="isSaving" class="loading-overlay">
      <div class="loading-spinner">
        <div class="spinner"></div>
        <span>Speichere Profil...</span>
      </div>
    </div>

    <!-- Toast Notifications -->
    <ToastContainer />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { userService } from '../services/userService'
import { useToast } from '../composables/useToast'
import ProfileForm from '../components/ProfileForm.vue'
import ProfilePreview from '../components/ProfilePreview.vue'
import ToastContainer from '../components/ToastContainer.vue'
import type { UserProfile } from '../types/user'

const props = defineProps<{
  userId?: string
}>()

const emit = defineEmits<{
  close: []
}>()

const { success, error } = useToast()

const isSaving = ref(false)
const currentProfile = ref<UserProfile>({
  id: props.userId || `user_${Date.now()}`,
  name: '',
  username: '',
  bio: '',
  interests: [],
  following: [],
  followers: [],
  createdAt: Date.now(),
  updatedAt: Date.now()
})

onMounted(async () => {
  if (props.userId) {
    const profile = await userService.getUserProfile(props.userId)
    if (profile) {
      currentProfile.value = profile
    }
  }
})

const handleSave = async (profile: UserProfile) => {
  isSaving.value = true

  try {
    await userService.saveUserProfile(profile)
    currentProfile.value = profile
    success('Profil erfolgreich gespeichert')

    // Close after 1 second
    setTimeout(() => {
      emit('close')
    }, 1000)
  } catch (err) {
    console.error('Failed to save profile:', err)
    error('Fehler beim Speichern des Profils')
  } finally {
    isSaving.value = false
  }
}

const handleCancel = () => {
  emit('close')
}
</script>

<style scoped>
.profile-edit {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  padding: 2rem 0;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.btn-back {
  padding: 0.75rem 1.25rem;
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  color: #cbd5e1;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-back:hover {
  background: rgba(30, 41, 59, 0.8);
  transform: translateX(-4px);
}

.page-header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #f8fafc;
  margin: 0;
}

.edit-layout {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 2rem;
}

.form-container {
  background: rgba(30, 41, 59, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  padding: 2rem;
}

.preview-container {
  position: relative;
}

.preview-sticky {
  position: sticky;
  top: 2rem;
}

.preview-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #f8fafc;
  margin: 0 0 1rem 0;
}

.loading-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.9);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(99, 102, 241, 0.2);
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-spinner span {
  color: #f8fafc;
  font-size: 1.125rem;
  font-weight: 600;
}

@media (max-width: 1024px) {
  .edit-layout {
    grid-template-columns: 1fr;
  }

  .preview-sticky {
    position: static;
  }
}

@media (max-width: 768px) {
  .profile-edit {
    padding: 1rem 0;
  }

  .page-header {
    flex-direction: column;
    align-items: stretch;
  }

  .btn-back {
    width: fit-content;
  }

  .page-header h1 {
    font-size: 1.5rem;
  }

  .form-container {
    padding: 1.5rem;
  }
}
</style>
