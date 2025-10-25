<template>
  <div class="image-upload">
    <div v-if="!imagePreview" class="upload-zone" @click="triggerFileInput">
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        @change="handleFileSelect"
        class="file-input"
      />
      <div class="upload-content">
        <span class="upload-icon">📷</span>
        <p class="upload-text">Bild hochladen</p>
        <p class="upload-hint">Klicken oder Datei hierher ziehen</p>
      </div>
    </div>

    <div v-else class="image-preview">
      <img :src="imagePreview" :alt="fileName" class="preview-image" />
      <div class="preview-overlay">
        <button @click="removeImage" class="remove-btn">
          🗑️ Entfernen
        </button>
      </div>
      <div class="image-info">
        <span class="file-name">{{ fileName }}</span>
        <span class="file-size">{{ fileSize }}</span>
      </div>
    </div>

    <div v-if="uploading" class="upload-progress">
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: `${uploadProgress}%` }"></div>
      </div>
      <span class="progress-text">{{ uploadProgress }}% hochgeladen</span>
    </div>

    <div v-if="error" class="upload-error">
      ❌ {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const emit = defineEmits<{
  (e: 'image-selected', file: File, preview: string): void
  (e: 'image-removed'): void
}>()

const fileInput = ref<HTMLInputElement | null>(null)
const imagePreview = ref<string | null>(null)
const fileName = ref('')
const fileSize = ref('')
const uploading = ref(false)
const uploadProgress = ref(0)
const error = ref('')

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  // Validate file type
  if (!file.type.startsWith('image/')) {
    error.value = 'Bitte wähle eine Bilddatei'
    return
  }

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    error.value = 'Bild ist zu groß (max. 5MB)'
    return
  }

  error.value = ''
  fileName.value = file.name
  fileSize.value = formatFileSize(file.size)

  // Create preview
  const reader = new FileReader()
  reader.onload = (e) => {
    imagePreview.value = e.target?.result as string
    emit('image-selected', file, imagePreview.value)
  }
  reader.readAsDataURL(file)

  // Simulate upload progress
  simulateUpload()
}

const simulateUpload = () => {
  uploading.value = true
  uploadProgress.value = 0

  const interval = setInterval(() => {
    uploadProgress.value += 10
    if (uploadProgress.value >= 100) {
      clearInterval(interval)
      uploading.value = false
    }
  }, 100)
}

const removeImage = () => {
  imagePreview.value = null
  fileName.value = ''
  fileSize.value = ''
  uploadProgress.value = 0
  error.value = ''

  if (fileInput.value) {
    fileInput.value.value = ''
  }

  emit('image-removed')
}

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}
</script>

<style scoped>
.image-upload {
  width: 100%;
}

.upload-zone {
  border: 2px dashed rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  background: rgba(255, 255, 255, 0.03);
}

.upload-zone:hover {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.1);
}

.file-input {
  display: none;
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.upload-icon {
  font-size: 3rem;
}

.upload-text {
  color: #e2e8f0;
  font-weight: 600;
  margin: 0;
}

.upload-hint {
  color: #94a3b8;
  font-size: 0.875rem;
  margin: 0;
}

.image-preview {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
}

.preview-image {
  width: 100%;
  height: auto;
  display: block;
  border-radius: 8px;
}

.preview-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.image-preview:hover .preview-overlay {
  opacity: 1;
}

.remove-btn {
  background: rgba(239, 68, 68, 0.9);
  border: none;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: transform 0.2s;
}

.remove-btn:hover {
  transform: scale(1.05);
}

.image-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
}

.file-name {
  color: #e2e8f0;
  font-size: 0.875rem;
  font-weight: 500;
}

.file-size {
  color: #94a3b8;
  font-size: 0.75rem;
}

.upload-progress {
  margin-top: 1rem;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  transition: width 0.3s ease;
}

.progress-text {
  color: #94a3b8;
  font-size: 0.875rem;
}

.upload-error {
  margin-top: 0.5rem;
  padding: 0.75rem;
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.4);
  border-radius: 6px;
  color: #fca5a5;
  font-size: 0.875rem;
}
</style>
