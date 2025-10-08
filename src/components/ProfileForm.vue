<template>
  <div class="profile-form">
    <!-- Avatar Upload -->
    <div class="form-section">
      <label class="section-label">Profilbild</label>
      <div class="avatar-upload">
        <div class="avatar-preview">
          <img v-if="localProfile.avatar" :src="localProfile.avatar" alt="Avatar" />
          <div v-else class="avatar-placeholder">
            {{ localProfile.name ? localProfile.name[0] : '?' }}
          </div>
        </div>
        <div class="avatar-actions">
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            @change="handleAvatarUpload"
            class="file-input"
          />
          <button @click="fileInput?.click()" class="btn-upload">
            📷 Foto hochladen
          </button>
          <button v-if="localProfile.avatar" @click="removeAvatar" class="btn-remove">
            Entfernen
          </button>
        </div>
      </div>
    </div>

    <!-- Name -->
    <div class="form-section">
      <label class="section-label">Name *</label>
      <input
        v-model="localProfile.name"
        type="text"
        placeholder="Dein Name"
        class="form-input"
        required
      />
    </div>

    <!-- Username -->
    <div class="form-section">
      <label class="section-label">Benutzername</label>
      <input
        v-model="localProfile.username"
        type="text"
        placeholder="@benutzername"
        class="form-input"
      />
    </div>

    <!-- Bio -->
    <div class="form-section">
      <label class="section-label">Bio</label>
      <textarea
        v-model="localProfile.bio"
        placeholder="Erzähle etwas über dich..."
        rows="4"
        class="form-textarea"
        maxlength="300"
      ></textarea>
      <div class="char-count">{{ bioLength }}/300</div>
    </div>

    <!-- Interests -->
    <div class="form-section">
      <label class="section-label">Interessen</label>
      <div class="interests-input">
        <input
          v-model="newInterest"
          type="text"
          placeholder="Interesse hinzufügen..."
          @keyup.enter="addInterest"
          class="form-input"
        />
        <button @click="addInterest" class="btn-add">+</button>
      </div>
      <div class="interests-tags">
        <span
          v-for="interest in localProfile.interests"
          :key="interest"
          class="interest-tag"
        >
          {{ interest }}
          <button @click="removeInterest(interest)" class="remove-tag">×</button>
        </span>
      </div>
    </div>

    <!-- Private Fields (SEA Encrypted) -->
    <div class="form-section private-section">
      <div class="private-header">
        <span class="section-label">🔒 Private Informationen</span>
        <span class="private-hint">Verschlüsselt gespeichert</span>
      </div>

      <!-- Email -->
      <div class="form-field">
        <label class="field-label">E-Mail</label>
        <input
          v-model="localProfile.email"
          type="email"
          placeholder="email@example.com"
          class="form-input"
        />
      </div>

      <!-- Phone -->
      <div class="form-field">
        <label class="field-label">Telefon</label>
        <input
          v-model="localProfile.phone"
          type="tel"
          placeholder="+49 123 456789"
          class="form-input"
        />
      </div>
    </div>

    <!-- Location -->
    <div class="form-section">
      <label class="section-label">Standort</label>
      <div class="location-field">
        <input
          v-model="locationName"
          type="text"
          placeholder="Stadt, Land"
          class="form-input"
          readonly
        />
        <button @click="detectLocation" class="btn-location" :disabled="isDetecting">
          <span v-if="isDetecting">🔍 Suche...</span>
          <span v-else>📍 Standort erkennen</span>
        </button>
      </div>
    </div>

    <!-- Actions -->
    <div class="form-actions">
      <button @click="$emit('cancel')" class="btn-cancel">
        Abbrechen
      </button>
      <button @click="handleSave" class="btn-save" :disabled="!isValid">
        💾 Speichern
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useLocation } from '../composables/useLocation'
import { useToast } from '../composables/useToast'
import type { UserProfile } from '../types/user'

const props = defineProps<{
  profile: UserProfile
}>()

const emit = defineEmits<{
  save: [profile: UserProfile]
  cancel: []
}>()

const { getCurrentLocation } = useLocation()
const { success, error: showError } = useToast()

const localProfile = ref<UserProfile>({ ...props.profile })
const newInterest = ref('')
const fileInput = ref<HTMLInputElement | null>(null)
const locationName = ref(props.profile.location?.name || '')
const isDetecting = ref(false)

const bioLength = computed(() => localProfile.value.bio?.length || 0)

const isValid = computed(() => {
  return localProfile.value.name && localProfile.value.name.trim().length > 0
})

watch(
  () => props.profile,
  (newVal) => {
    localProfile.value = { ...newVal }
    locationName.value = newVal.location?.name || ''
  }
)

const handleAvatarUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  // Check file size (max 2MB)
  if (file.size > 2 * 1024 * 1024) {
    showError('Bild ist zu groß (max 2MB)')
    return
  }

  // Check file type
  if (!file.type.startsWith('image/')) {
    showError('Bitte wähle ein Bild')
    return
  }

  // Convert to Base64
  const reader = new FileReader()
  reader.onload = (e) => {
    const base64 = e.target?.result as string
    localProfile.value.avatar = base64
    success('Profilbild hochgeladen')
  }
  reader.onerror = () => {
    showError('Fehler beim Hochladen')
  }
  reader.readAsDataURL(file)
}

const removeAvatar = () => {
  localProfile.value.avatar = undefined
}

const addInterest = () => {
  const interest = newInterest.value.trim()
  if (interest && !localProfile.value.interests.includes(interest)) {
    localProfile.value.interests.push(interest)
    newInterest.value = ''
  }
}

const removeInterest = (interest: string) => {
  const index = localProfile.value.interests.indexOf(interest)
  if (index > -1) {
    localProfile.value.interests.splice(index, 1)
  }
}

const detectLocation = async () => {
  isDetecting.value = true
  try {
    const location = await getCurrentLocation()
    if (location) {
      localProfile.value.location = location
      locationName.value = location.name || `${location.lat.toFixed(2)}, ${location.lng.toFixed(2)}`
      success('Standort erkannt')
    }
  } catch (err) {
    showError('Standort konnte nicht ermittelt werden')
  } finally {
    isDetecting.value = false
  }
}

const handleSave = () => {
  if (!isValid.value) {
    showError('Bitte fülle alle Pflichtfelder aus')
    return
  }

  emit('save', localProfile.value)
}
</script>

<style scoped>
.profile-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.section-label {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #f8fafc;
}

.avatar-upload {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.avatar-preview {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 4px solid rgba(99, 102, 241, 0.3);
}

.avatar-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  font-size: 3rem;
  font-weight: 700;
  color: white;
}

.avatar-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.file-input {
  display: none;
}

.btn-upload,
.btn-remove,
.btn-add,
.btn-location {
  padding: 0.625rem 1.25rem;
  background: rgba(99, 102, 241, 0.2);
  border: 1px solid #6366f1;
  border-radius: 0.5rem;
  color: #a5b4fc;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-upload:hover,
.btn-add:hover,
.btn-location:hover {
  background: #6366f1;
  color: white;
  transform: translateY(-2px);
}

.btn-remove {
  background: rgba(239, 68, 68, 0.2);
  border-color: #ef4444;
  color: #fca5a5;
}

.btn-remove:hover {
  background: #ef4444;
  color: white;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  color: #f8fafc;
  font-size: 0.9375rem;
  transition: all 0.2s;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #6366f1;
  background: rgba(15, 23, 42, 0.8);
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.char-count {
  font-size: 0.75rem;
  color: #64748b;
  text-align: right;
}

.interests-input {
  display: flex;
  gap: 0.5rem;
}

.btn-add {
  width: 48px;
  padding: 0.75rem;
  font-size: 1.25rem;
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
  cursor: pointer;
  transition: all 0.2s;
}

.remove-tag:hover {
  background: rgba(239, 68, 68, 0.4);
}

.private-section {
  padding: 1.25rem;
  background: rgba(99, 102, 241, 0.05);
  border: 1px solid rgba(99, 102, 241, 0.2);
  border-radius: 0.75rem;
}

.private-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.private-hint {
  font-size: 0.75rem;
  color: #64748b;
  font-style: italic;
}

.form-field {
  margin-top: 0.75rem;
}

.field-label {
  display: block;
  font-size: 0.875rem;
  color: #cbd5e1;
  margin-bottom: 0.5rem;
}

.location-field {
  display: flex;
  gap: 0.5rem;
}

.btn-location {
  flex-shrink: 0;
  white-space: nowrap;
}

.btn-location:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.btn-cancel,
.btn-save {
  padding: 0.875rem 2rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel {
  background: rgba(30, 41, 59, 0.6);
  color: #cbd5e1;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.btn-cancel:hover {
  background: rgba(30, 41, 59, 0.8);
}

.btn-save {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
}

.btn-save:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(99, 102, 241, 0.3);
}

.btn-save:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
