<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="modelValue"
        class="survey-overlay"
        @keydown.esc="skip"
      >
        <div class="survey-content" role="dialog" aria-modal="true" aria-labelledby="survey-title">
          <!-- Header -->
          <div class="survey-header">
            <h2 id="survey-title">🎯 Personalisiere deine Nachrichten</h2>
            <p class="survey-subtitle">
              Wähle 3-5 Themen aus, die dich interessieren. Wir lernen automatisch dazu!
            </p>
          </div>

          <!-- Interest Categories -->
          <div class="categories-grid">
            <button
              v-for="category in categories"
              :key="category.id"
              @click="toggleCategory(category.id)"
              class="category-btn"
              :class="{ active: selectedCategories.includes(category.id) }"
              :aria-pressed="selectedCategories.includes(category.id)"
            >
              <span class="category-icon">{{ category.icon }}</span>
              <span class="category-name">{{ category.name }}</span>
              <span v-if="selectedCategories.includes(category.id)" class="checkmark">✓</span>
            </button>
          </div>

          <!-- Custom Interest Input -->
          <div class="custom-input">
            <label for="custom-interest" class="sr-only">Weitere Interessen hinzufügen</label>
            <input
              id="custom-interest"
              v-model="customInterest"
              type="text"
              placeholder="Weitere Interessen... (Enter zum Hinzufügen)"
              @keyup.enter="addCustomInterest"
              class="custom-input-field"
            />
            <button
              @click="addCustomInterest"
              class="add-btn"
              :disabled="!customInterest.trim()"
              aria-label="Interesse hinzufügen"
            >
              +
            </button>
          </div>

          <!-- Custom Interests Tags -->
          <div v-if="customInterests.length > 0" class="custom-tags">
            <span
              v-for="interest in customInterests"
              :key="interest"
              class="custom-tag"
            >
              {{ interest }}
              <button
                @click="removeCustomInterest(interest)"
                class="remove-tag"
                :aria-label="`${interest} entfernen`"
              >
                ×
              </button>
            </span>
          </div>

          <!-- Actions -->
          <div class="survey-actions">
            <button @click="skip" class="btn-secondary">
              Überspringen
            </button>
            <button
              @click="submit"
              class="btn-primary"
              :disabled="totalSelected < 3"
            >
              Weiter ({{ totalSelected }}/3)
            </button>
          </div>

          <!-- Info -->
          <p class="survey-info">
            💡 Keine Sorge: Wir lernen automatisch aus deinem Leseverhalten und passen die Auswahl an.
          </p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  submit: [interests: string[]]
  skip: []
}>()

const categories = [
  { id: 'tech', name: 'Technologie', icon: '💻' },
  { id: 'science', name: 'Wissenschaft', icon: '🔬' },
  { id: 'politics', name: 'Politik', icon: '🏛️' },
  { id: 'business', name: 'Wirtschaft', icon: '💼' },
  { id: 'sports', name: 'Sport', icon: '⚽' },
  { id: 'culture', name: 'Kultur', icon: '🎭' },
  { id: 'health', name: 'Gesundheit', icon: '🏥' },
  { id: 'environment', name: 'Umwelt', icon: '🌍' },
  { id: 'education', name: 'Bildung', icon: '📚' },
  { id: 'local', name: 'Lokal', icon: '📍' },
  { id: 'community', name: 'Community', icon: '👥' },
  { id: 'food', name: 'Essen & Trinken', icon: '🍽️' }
]

const selectedCategories = ref<string[]>([])
const customInterests = ref<string[]>([])
const customInterest = ref('')

const totalSelected = computed(() => selectedCategories.value.length + customInterests.value.length)

const toggleCategory = (id: string) => {
  const index = selectedCategories.value.indexOf(id)
  if (index > -1) {
    selectedCategories.value.splice(index, 1)
  } else {
    selectedCategories.value.push(id)
  }
}

const addCustomInterest = () => {
  const cleaned = customInterest.value.trim().toLowerCase()
  if (cleaned && !customInterests.value.includes(cleaned)) {
    customInterests.value.push(cleaned)
    customInterest.value = ''
  }
}

const removeCustomInterest = (interest: string) => {
  const index = customInterests.value.indexOf(interest)
  if (index > -1) {
    customInterests.value.splice(index, 1)
  }
}

const submit = () => {
  const allInterests = [...selectedCategories.value, ...customInterests.value]
  emit('submit', allInterests)
  emit('update:modelValue', false)
}

const skip = () => {
  emit('skip')
  emit('update:modelValue', false)
}
</script>

<style scoped>
.survey-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 2rem;
  overflow-y: auto;
}

.survey-content {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 1.5rem;
  max-width: 700px;
  width: 100%;
  padding: 2.5rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.survey-header {
  text-align: center;
  margin-bottom: 2rem;
}

.survey-header h2 {
  font-size: 1.875rem;
  font-weight: 800;
  background: linear-gradient(135deg, #6366f1, #a855f7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 0.75rem 0;
}

.survey-subtitle {
  font-size: 1rem;
  color: #94a3b8;
  margin: 0;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.category-btn {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1.25rem 0.75rem;
  background: rgba(30, 41, 59, 0.6);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
}

.category-btn:hover {
  background: rgba(30, 41, 59, 0.8);
  border-color: rgba(99, 102, 241, 0.4);
  transform: translateY(-2px);
}

.category-btn.active {
  background: rgba(99, 102, 241, 0.2);
  border-color: #6366f1;
  box-shadow: 0 0 20px rgba(99, 102, 241, 0.3);
}

.category-icon {
  font-size: 2rem;
}

.category-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #f8fafc;
}

.checkmark {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 24px;
  height: 24px;
  background: #6366f1;
  border-radius: 50%;
  color: white;
  font-size: 0.875rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.custom-input {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.custom-input-field {
  flex: 1;
  padding: 0.875rem 1rem;
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  color: #f8fafc;
  font-size: 0.9375rem;
}

.custom-input-field:focus {
  outline: none;
  border-color: #6366f1;
  background: rgba(30, 41, 59, 0.8);
}

.add-btn {
  width: 48px;
  height: 48px;
  background: rgba(99, 102, 241, 0.2);
  border: 1px solid #6366f1;
  border-radius: 0.5rem;
  color: #6366f1;
  font-size: 1.5rem;
  font-weight: 300;
  cursor: pointer;
  transition: all 0.2s;
}

.add-btn:hover:not(:disabled) {
  background: #6366f1;
  color: white;
}

.add-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.custom-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.custom-tag {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: rgba(168, 85, 247, 0.2);
  border: 1px solid rgba(168, 85, 247, 0.4);
  border-radius: 999px;
  color: #e9d5ff;
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

.survey-actions {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.btn-secondary {
  padding: 0.875rem 1.5rem;
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  color: #cbd5e1;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: rgba(30, 41, 59, 0.8);
}

.btn-primary {
  flex: 1;
  padding: 0.875rem 1.5rem;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border: none;
  border-radius: 0.5rem;
  color: white;
  font-size: 0.9375rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(99, 102, 241, 0.4);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.survey-info {
  text-align: center;
  font-size: 0.875rem;
  color: #64748b;
  margin: 0;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

/* Fade Transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .survey-content {
    padding: 1.5rem;
  }

  .categories-grid {
    grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
    gap: 0.5rem;
  }

  .category-btn {
    padding: 1rem 0.5rem;
  }

  .category-icon {
    font-size: 1.5rem;
  }

  .category-name {
    font-size: 0.75rem;
  }
}
</style>
