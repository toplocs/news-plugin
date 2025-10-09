<template>
  <div v-if="isActive" class="quick-setup-flow">
    <!-- Step 1: Welcome Screen -->
    <WelcomeScreen
      v-if="currentStep === 'welcome'"
      :show="true"
      @get-started="handleWelcomeComplete"
      @skip="handleSkipAll"
    />

    <!-- Step 2: Onboarding Slides -->
    <OnboardingSlides
      v-if="currentStep === 'slides'"
      :show="true"
      @complete="handleSlidesComplete"
      @skip="handleSkipSlides"
    />

    <!-- Step 3: Location Permission -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="currentStep === 'location'" class="setup-modal-overlay" @click.self="handleSkipLocation">
          <div class="setup-modal">
            <div class="setup-header">
              <div class="step-indicator">
                <span class="step-number">1</span>
                <span class="step-total">/ 2</span>
              </div>
              <button @click="handleSkipLocation" class="skip-btn">Überspringen</button>
            </div>

            <div class="setup-content">
              <div class="setup-icon">
                <HyperlocalIllustration size="150px" />
              </div>

              <h2 class="setup-title">Standort aktivieren</h2>
              <p class="setup-description">
                Erlaube uns deinen Standort zu nutzen, um dir <strong>hyperlocale News & Events</strong> in deiner Nähe zu zeigen.
              </p>

              <div class="setup-benefits">
                <div class="benefit-item">
                  <span class="benefit-icon">📍</span>
                  <span>Entdecke deinen Kiez</span>
                </div>
                <div class="benefit-item">
                  <span class="benefit-icon">📊</span>
                  <span>Sortiert nach Distanz</span>
                </div>
                <div class="benefit-item">
                  <span class="benefit-icon">🎯</span>
                  <span>Nur relevante Inhalte</span>
                </div>
              </div>

              <div v-if="locationError" class="error-message">
                <span class="error-icon">⚠️</span>
                <span>{{ locationError }}</span>
              </div>

              <div class="setup-actions">
                <button @click="handleRequestLocation" class="btn-primary" :disabled="locationLoading">
                  <span v-if="!locationLoading">📍</span>
                  <span v-if="locationLoading" class="spinner"></span>
                  <span>{{ locationLoading ? 'Wird abgerufen...' : 'Standort aktivieren' }}</span>
                </button>
                <button @click="handleSkipLocation" class="btn-secondary">
                  Später
                </button>
              </div>

              <div class="setup-note">
                <span class="note-icon">🔒</span>
                <span>Dein Standort wird niemals gespeichert oder weitergegeben</span>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Step 4: Interest Selection -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="currentStep === 'interests'" class="setup-modal-overlay" @click.self="handleSkipInterests">
          <div class="setup-modal large">
            <div class="setup-header">
              <div class="step-indicator">
                <span class="step-number">2</span>
                <span class="step-total">/ 2</span>
              </div>
              <button @click="handleSkipInterests" class="skip-btn">Überspringen</button>
            </div>

            <div class="setup-content">
              <div class="setup-icon">
                <AnimatedIcon icon="💫" animation="tada" size="lg" :particles="true" :particle-count="8" :glow="true" />
              </div>

              <h2 class="setup-title">Wähle deine Interessen</h2>
              <p class="setup-description">
                Wir zeigen dir <strong>nur Artikel</strong>, die zu deinen Interessen passen – <strong>kein Clickbait, kein FOMO</strong>.
              </p>

              <!-- Interest Selection Grid -->
              <div class="interest-grid">
                <button
                  v-for="interest in predefinedInterests"
                  :key="interest.keyword"
                  @click="toggleInterest(interest)"
                  :class="{ active: isInterestSelected(interest.keyword) }"
                  class="interest-btn">
                  <span class="interest-icon">{{ interest.icon }}</span>
                  <span class="interest-label">{{ interest.keyword }}</span>
                  <span v-if="isInterestSelected(interest.keyword)" class="interest-check">✓</span>
                </button>
              </div>

              <!-- Custom Interest Input -->
              <div class="custom-interest-input">
                <input
                  v-model="customInterest"
                  @keypress.enter="addCustomInterest"
                  type="text"
                  placeholder="Eigenes Interesse hinzufügen..."
                  class="custom-input"
                />
                <button @click="addCustomInterest" class="add-btn" :disabled="!customInterest.trim()">
                  <span>+</span>
                </button>
              </div>

              <!-- Selected Interests Count -->
              <div class="selection-summary">
                <span class="summary-icon">🎯</span>
                <span>{{ selectedInterests.length }} Interesse{{ selectedInterests.length !== 1 ? 'n' : '' }} ausgewählt</span>
              </div>

              <div class="setup-actions">
                <button @click="handleSaveInterests" class="btn-primary" :disabled="selectedInterests.length === 0">
                  <span>✓</span>
                  <span>Fertig ({{ selectedInterests.length }})</span>
                </button>
                <button @click="handleSkipInterests" class="btn-secondary">
                  Später
                </button>
              </div>

              <div class="setup-note">
                <span class="note-icon">💡</span>
                <span>Du kannst deine Interessen jederzeit ändern</span>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Step 5: Completion -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="currentStep === 'complete'" class="setup-modal-overlay">
          <div class="setup-modal">
            <div class="setup-content complete">
              <div class="complete-animation">
                <AnimatedIcon icon="🎉" animation="tada" size="xl" :particles="true" :particle-count="12" :glow="true" />
              </div>

              <h2 class="setup-title">Alles bereit!</h2>
              <p class="setup-description">
                Du bist jetzt startklar. Entdecke <strong>ehrliche News</strong> in deinem Kiez! 🚀
              </p>

              <div class="setup-summary">
                <div class="summary-item" v-if="setupResults.location">
                  <span class="summary-icon">✅</span>
                  <span>Standort aktiviert</span>
                </div>
                <div class="summary-item" v-if="setupResults.interests > 0">
                  <span class="summary-icon">✅</span>
                  <span>{{ setupResults.interests }} Interessen gespeichert</span>
                </div>
              </div>

              <div class="setup-actions">
                <button @click="handleComplete" class="btn-primary large">
                  <span>🚀</span>
                  <span>Jetzt loslegen!</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import WelcomeScreen from './WelcomeScreen.vue'
import OnboardingSlides from './OnboardingSlides.vue'
import HyperlocalIllustration from './illustrations/HyperlocalIllustration.vue'
import AnimatedIcon from './AnimatedIcon.vue'
import { useInterests } from '../stores/useInterests'
import { useLocation } from '../composables/useLocation'

type SetupStep = 'welcome' | 'slides' | 'location' | 'interests' | 'complete' | 'done'

interface PredefinedInterest {
  keyword: string
  icon: string
}

const props = withDefaults(defineProps<{
  autoStart?: boolean
  skipWelcome?: boolean
  skipSlides?: boolean
}>(), {
  autoStart: true,
  skipWelcome: false,
  skipSlides: false
})

const emit = defineEmits<{
  complete: []
  skip: []
  close: []
}>()

const interests = useInterests()
const { requestLocation } = useLocation()

// Setup State
const isActive = ref(props.autoStart)
const currentStep = ref<SetupStep>(props.skipWelcome ? (props.skipSlides ? 'location' : 'slides') : 'welcome')
const setupResults = ref({
  location: false,
  interests: 0
})

// Location State
const locationLoading = ref(false)
const locationError = ref('')

// Interests State
const customInterest = ref('')
const selectedInterests = ref<PredefinedInterest[]>([])

const predefinedInterests: PredefinedInterest[] = [
  { keyword: 'Politik', icon: '🏛️' },
  { keyword: 'Kultur', icon: '🎭' },
  { keyword: 'Sport', icon: '⚽' },
  { keyword: 'Technologie', icon: '💻' },
  { keyword: 'Nachhaltigkeit', icon: '🌱' },
  { keyword: 'Bildung', icon: '📚' },
  { keyword: 'Wirtschaft', icon: '📈' },
  { keyword: 'Gesundheit', icon: '🏥' },
  { keyword: 'Kunst', icon: '🎨' },
  { keyword: 'Musik', icon: '🎵' },
  { keyword: 'Food', icon: '🍽️' },
  { keyword: 'Wissenschaft', icon: '🔬' },
  { keyword: 'Umwelt', icon: '🌍' },
  { keyword: 'Lokales', icon: '🏘️' },
  { keyword: 'Community', icon: '👥' },
  { keyword: 'Events', icon: '🎉' }
]

// Welcome Step
const handleWelcomeComplete = () => {
  if (props.skipSlides) {
    currentStep.value = 'location'
  } else {
    currentStep.value = 'slides'
  }
}

// Slides Step
const handleSlidesComplete = () => {
  currentStep.value = 'location'
}

const handleSkipSlides = () => {
  currentStep.value = 'location'
}

// Location Step
const handleRequestLocation = async () => {
  locationLoading.value = true
  locationError.value = ''

  try {
    const success = await requestLocation()
    if (success) {
      setupResults.value.location = true
      currentStep.value = 'interests'
    } else {
      locationError.value = 'Standort konnte nicht abgerufen werden. Bitte erlaube Zugriff in den Browser-Einstellungen.'
    }
  } catch (error) {
    locationError.value = 'Fehler beim Abrufen des Standorts. Bitte versuche es später erneut.'
  } finally {
    locationLoading.value = false
  }
}

const handleSkipLocation = () => {
  currentStep.value = 'interests'
}

// Interests Step
const toggleInterest = (interest: PredefinedInterest) => {
  const index = selectedInterests.value.findIndex(i => i.keyword === interest.keyword)
  if (index > -1) {
    selectedInterests.value.splice(index, 1)
  } else {
    selectedInterests.value.push(interest)
  }
}

const isInterestSelected = (keyword: string) => {
  return selectedInterests.value.some(i => i.keyword === keyword)
}

const addCustomInterest = () => {
  const keyword = customInterest.value.trim()
  if (keyword && !isInterestSelected(keyword)) {
    selectedInterests.value.push({
      keyword,
      icon: '✨'
    })
    customInterest.value = ''
  }
}

const handleSaveInterests = () => {
  // Save interests to store
  selectedInterests.value.forEach(interest => {
    interests.addInterest(interest.keyword, 0.8)
  })

  setupResults.value.interests = selectedInterests.value.length
  currentStep.value = 'complete'

  // Auto-close after 3 seconds
  setTimeout(() => {
    handleComplete()
  }, 3000)
}

const handleSkipInterests = () => {
  currentStep.value = 'complete'

  // Auto-close after 2 seconds if nothing was set up
  setTimeout(() => {
    handleComplete()
  }, 2000)
}

// Complete Step
const handleComplete = () => {
  currentStep.value = 'done'
  isActive.value = false
  emit('complete')
  emit('close')

  // Save setup completion to localStorage
  localStorage.setItem('localconnect_setup_completed', 'true')
  localStorage.setItem('localconnect_setup_date', new Date().toISOString())
}

// Skip All
const handleSkipAll = () => {
  isActive.value = false
  emit('skip')
  emit('close')

  // Mark as skipped
  localStorage.setItem('localconnect_setup_skipped', 'true')
  localStorage.setItem('localconnect_setup_date', new Date().toISOString())
}

// Public Methods (exposed to parent)
defineExpose({
  start: () => {
    isActive.value = true
    currentStep.value = 'welcome'
  },
  skip: handleSkipAll
})
</script>

<style scoped>
.quick-setup-flow {
  position: relative;
  z-index: 10000;
}

/* Modal Overlay */
.setup-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(20px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  overflow-y: auto;
  z-index: 10000;
}

.setup-modal {
  position: relative;
  width: 100%;
  max-width: 600px;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95));
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 1.5rem;
  padding: 2.5rem;
  backdrop-filter: blur(24px);
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
}

.setup-modal.large {
  max-width: 700px;
}

/* Header */
.setup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.step-indicator {
  font-size: 0.875rem;
  color: #94a3b8;
}

.step-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: #6366f1;
}

.step-total {
  color: #64748b;
}

.skip-btn {
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.5rem;
  color: #cbd5e1;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.skip-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
}

/* Content */
.setup-content {
  text-align: center;
}

.setup-icon {
  margin-bottom: 2rem;
  display: flex;
  justify-content: center;
}

.setup-title {
  font-size: 2rem;
  font-weight: 800;
  background: linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 1rem 0;
}

.setup-description {
  font-size: 1.125rem;
  color: #cbd5e1;
  line-height: 1.6;
  margin: 0 0 2rem 0;
}

.setup-description strong {
  color: #a5b4fc;
  font-weight: 700;
}

/* Benefits */
.setup-benefits {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.benefit-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  background: rgba(99, 102, 241, 0.1);
  border: 1px solid rgba(99, 102, 241, 0.2);
  border-radius: 0.75rem;
  font-size: 0.9375rem;
  color: #cbd5e1;
  font-weight: 600;
}

.benefit-icon {
  font-size: 1.25rem;
}

/* Error Message */
.error-message {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 0.75rem;
  color: #fca5a5;
  font-size: 0.875rem;
  margin-bottom: 1.5rem;
}

.error-icon {
  font-size: 1.25rem;
}

/* Interest Grid */
.interest-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  max-height: 300px;
  overflow-y: auto;
  padding: 0.5rem;
}

.interest-btn {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: rgba(30, 41, 59, 0.6);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.3s;
}

.interest-btn:hover {
  border-color: rgba(99, 102, 241, 0.4);
  background: rgba(30, 41, 59, 0.8);
  transform: translateY(-2px);
}

.interest-btn.active {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.2));
  border-color: #6366f1;
}

.interest-icon {
  font-size: 1.75rem;
}

.interest-label {
  font-size: 0.8125rem;
  font-weight: 600;
  color: #cbd5e1;
}

.interest-check {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #10b981;
  border-radius: 50%;
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
}

/* Custom Interest Input */
.custom-interest-input {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.custom-input {
  flex: 1;
  padding: 0.875rem 1rem;
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  color: #f8fafc;
  font-size: 0.9375rem;
}

.custom-input::placeholder {
  color: #64748b;
}

.custom-input:focus {
  outline: none;
  border-color: #6366f1;
}

.add-btn {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border: none;
  border-radius: 0.5rem;
  color: white;
  font-size: 1.5rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.add-btn:hover:not(:disabled) {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}

.add-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Selection Summary */
.selection-summary {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: 0.75rem;
  color: #6ee7b7;
  font-weight: 600;
  margin-bottom: 2rem;
}

.summary-icon {
  font-size: 1.25rem;
}

/* Actions */
.setup-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.btn-primary,
.btn-secondary {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1rem 2rem;
  border-radius: 0.75rem;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
  border: none;
}

.btn-primary {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.4);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary.large {
  padding: 1.25rem 2.5rem;
  font-size: 1.125rem;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #cbd5e1;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
}

/* Spinner */
.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Note */
.setup-note {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.8125rem;
  color: #94a3b8;
}

.note-icon {
  font-size: 1rem;
}

/* Complete State */
.setup-content.complete {
  padding: 2rem 0;
}

.complete-animation {
  margin-bottom: 2rem;
}

.setup-summary {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 2rem;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1.25rem;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: 0.75rem;
  color: #6ee7b7;
  font-weight: 600;
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

/* Mobile Responsive */
@media (max-width: 768px) {
  .setup-modal-overlay {
    padding: 1rem;
  }

  .setup-modal {
    padding: 2rem 1.5rem;
  }

  .setup-title {
    font-size: 1.5rem;
  }

  .setup-description {
    font-size: 1rem;
  }

  .interest-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 0.5rem;
  }

  .setup-actions {
    gap: 0.5rem;
  }
}
</style>
