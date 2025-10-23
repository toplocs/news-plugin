<template>
  <div class="demo-page">
    <!-- Header -->
    <header class="demo-header">
      <div class="demo-header-content">
        <h1>🎮 Phase 3: Gamification & Engagement Demo</h1>
        <p class="demo-subtitle">Teste alle implementierten Features der User-Engagement-Strategie</p>
      </div>
    </header>

    <!-- Navigation Cards -->
    <div class="demo-container">
      <!-- Progress Overview -->
      <div class="progress-overview">
        <div class="progress-card">
          <div class="progress-header">
            <span class="progress-icon">🎯</span>
            <h3>Dein Fortschritt</h3>
          </div>
          <div class="progress-stats">
            <div class="stat">
              <span class="stat-value">{{ rewards.userProgress.points }}</span>
              <span class="stat-label">Punkte</span>
            </div>
            <div class="stat">
              <span class="stat-value">Level {{ rewards.userProgress.level }}</span>
              <span class="stat-label">{{ rewards.currentLevel.title }}</span>
            </div>
            <div class="stat">
              <span class="stat-value">{{ unlockedCount }}/{{ totalAchievements }}</span>
              <span class="stat-label">Achievements</span>
            </div>
          </div>
          <div class="progress-bar-demo">
            <div class="progress-fill" :style="{ width: levelProgress + '%' }"></div>
          </div>
          <p class="progress-text">{{ pointsToNextLevel }} Punkte bis Level {{ nextLevel.level }}</p>
        </div>
      </div>

      <!-- Feature Cards Grid -->
      <div class="features-grid">
        <!-- 1. Points & Levels System -->
        <div class="feature-card" @click="testRewards">
          <div class="feature-icon">🎁</div>
          <h3 class="feature-title">Punkte & Levels</h3>
          <p class="feature-description">
            Verdiene Punkte durch Aktionen und steige in Levels auf
          </p>
          <div class="feature-status completed">✅ Implementiert</div>
          <button class="btn-test">Punkte testen</button>
        </div>

        <!-- 2. Chat System -->
        <div class="feature-card" @click="openTestChat">
          <div class="feature-icon">💬</div>
          <h3 class="feature-title">Real-time Chat</h3>
          <p class="feature-description">
            P2P Chat mit Gun.js + Rewards Integration
          </p>
          <div class="feature-status completed">✅ Implementiert</div>
          <button class="btn-test">Chat öffnen</button>
        </div>

        <!-- 3. Achievement System -->
        <div class="feature-card" @click="showAchievements = true">
          <div class="feature-icon">🏆</div>
          <h3 class="feature-title">Achievements</h3>
          <p class="feature-description">
            6 Achievements freischalten durch verschiedene Aktionen
          </p>
          <div class="feature-status completed">✅ Implementiert</div>
          <button class="btn-test">Achievements ansehen</button>
        </div>

        <!-- 4. Event System -->
        <div class="feature-card" @click="activeSection = 'events'">
          <div class="feature-icon">📅</div>
          <h3 class="feature-title">Event System</h3>
          <p class="feature-description">
            Events mit RSVP, Countdown und Quick-Meet Button
          </p>
          <div class="feature-status active">🔧 In Entwicklung</div>
          <button class="btn-test">Events ansehen</button>
        </div>

        <!-- 5. Voting System -->
        <div class="feature-card" @click="activeSection = 'voting'">
          <div class="feature-icon">🗳️</div>
          <h3 class="feature-title">Voting System</h3>
          <p class="feature-description">
            Community-Abstimmungen mit +5 Punkte pro Vote
          </p>
          <div class="feature-status active">🔧 In Entwicklung</div>
          <button class="btn-test">Voting testen</button>
        </div>

        <!-- 6. Live Activity Feed -->
        <div class="feature-card" @click="activeSection = 'activity'">
          <div class="feature-icon">📊</div>
          <h3 class="feature-title">Live Activity Feed</h3>
          <p class="feature-description">
            Echtzeitaktivitäten der Community (Social Proof)
          </p>
          <div class="feature-status active">🔧 In Entwicklung</div>
          <button class="btn-test">Activity Feed</button>
        </div>

        <!-- 7. Onboarding Progress -->
        <div class="feature-card" @click="activeSection = 'onboarding'">
          <div class="feature-icon">🎯</div>
          <h3 class="feature-title">Onboarding</h3>
          <p class="feature-description">
            Progress Bar für neue User (0-100%)
          </p>
          <div class="feature-status active">🔧 In Entwicklung</div>
          <button class="btn-test">Onboarding testen</button>
        </div>

        <!-- 8. FOMO Triggers -->
        <div class="feature-card" @click="activeSection = 'fomo'">
          <div class="feature-icon">⏰</div>
          <h3 class="feature-title">FOMO Triggers</h3>
          <p class="feature-description">
            Countdowns, Limited Spots, Streak Warnings
          </p>
          <div class="feature-status active">🔧 In Entwicklung</div>
          <button class="btn-test">FOMO testen</button>
        </div>

        <!-- 9. Confetti Effect -->
        <div class="feature-card" @click="triggerConfetti">
          <div class="feature-icon">🎊</div>
          <h3 class="feature-title">Confetti Animation</h3>
          <p class="feature-description">
            Feiere Level-Ups und Achievements
          </p>
          <div class="feature-status completed">✅ Implementiert</div>
          <button class="btn-test">Konfetti auslösen</button>
        </div>
      </div>

      <!-- Detailed Section Views -->
      <div v-if="activeSection" class="detail-section">
        <div class="detail-header">
          <h2>{{ getSectionTitle(activeSection) }}</h2>
          <button @click="activeSection = null" class="btn-close">×</button>
        </div>

        <!-- Events Section -->
        <div v-if="activeSection === 'events'" class="section-content">
          <EventsDemo @points-earned="handlePointsEarned" />
        </div>

        <!-- Voting Section -->
        <div v-if="activeSection === 'voting'" class="section-content">
          <VotingDemo @points-earned="handlePointsEarned" />
        </div>

        <!-- Activity Feed Section -->
        <div v-if="activeSection === 'activity'" class="section-content">
          <ActivityFeedDemo />
        </div>

        <!-- Onboarding Section -->
        <div v-if="activeSection === 'onboarding'" class="section-content">
          <OnboardingDemo @progress-updated="handleOnboardingProgress" />
        </div>

        <!-- FOMO Section -->
        <div v-if="activeSection === 'fomo'" class="section-content">
          <FOMODemo />
        </div>
      </div>

      <!-- Test Instructions -->
      <div class="test-instructions">
        <h2>📝 Test-Anleitung</h2>
        <div class="instruction-grid">
          <div class="instruction-card">
            <h4>1. Punkte System testen</h4>
            <p>Klicke auf "Punkte testen" → Du erhältst +50 Punkte → Toast-Notification erscheint</p>
          </div>
          <div class="instruction-card">
            <h4>2. Chat testen</h4>
            <p>Klicke auf "Chat öffnen" → Sende eine Nachricht → +10 Punkte bei erster Nachricht</p>
          </div>
          <div class="instruction-card">
            <h4>3. Level-Up auslösen</h4>
            <p>Sammle 100 Punkte → Konfetti-Animation → Level 2 erreicht</p>
          </div>
          <div class="instruction-card">
            <h4>4. Achievements freischalten</h4>
            <p>Klicke auf "Achievements" → Sehe welche noch locked sind → Schalte sie durch Aktionen frei</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Chat Modal -->
    <ChatModal
      v-if="chatPartner"
      v-model="showChatModal"
      :partner="chatPartner"
      :current-user-id="currentUserId"
    />

    <!-- Achievements Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showAchievements" class="modal-overlay" @click="showAchievements = false">
          <div class="modal-content achievements-modal" @click.stop>
            <div class="modal-header">
              <h3>🏆 Achievements</h3>
              <button @click="showAchievements = false" class="modal-close">×</button>
            </div>
            <div class="achievements-grid-modal">
              <div
                v-for="achievement in rewards.userProgress.achievements"
                :key="achievement.id"
                class="achievement-item-modal"
                :class="{ unlocked: achievement.unlocked }"
              >
                <span class="achievement-icon-large">{{ achievement.icon }}</span>
                <h4>{{ achievement.title }}</h4>
                <p>{{ achievement.description }}</p>
                <div class="achievement-points">{{ achievement.points }} Punkte</div>
                <div v-if="!achievement.unlocked" class="achievement-locked">🔒 Noch nicht freigeschaltet</div>
                <div v-else class="achievement-unlocked">✅ Freigeschaltet!</div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Confetti Effect -->
    <ConfettiEffect />

    <!-- Toast Container -->
    <ToastContainer />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRewards } from '../stores/useRewards'
import { useToast } from '../composables/useToast'
import ChatModal from '../components/ChatModal.vue'
import ConfettiEffect from '../components/ConfettiEffect.vue'
import ToastContainer from '../components/ToastContainer.vue'
import EventsDemo from '../components/demos/EventsDemo.vue'
import VotingDemo from '../components/demos/VotingDemo.vue'
import ActivityFeedDemo from '../components/demos/ActivityFeedDemo.vue'
import OnboardingDemo from '../components/demos/OnboardingDemo.vue'
import FOMODemo from '../components/demos/FOMODemo.vue'

const rewards = useRewards()
const { success } = useToast()

const currentUserId = ref(localStorage.getItem('userId') || `user_${Date.now()}`)
const activeSection = ref<string | null>(null)
const showChatModal = ref(false)
const showAchievements = ref(false)
const chatPartner = ref<any>(null)

// Initialize rewards
rewards.initialize(currentUserId.value)

// Computed
const levelProgress = computed(() => rewards.levelProgress)
const nextLevel = computed(() => rewards.nextLevel)
const pointsToNextLevel = computed(() => rewards.pointsToNextLevel)
const unlockedCount = computed(() => rewards.unlockedAchievements.length)
const totalAchievements = computed(() => rewards.userProgress.achievements.length)

// Test Functions
const testRewards = () => {
  rewards.awardPoints('profile_complete') // +50 points
  success('🎉 Test: +50 Punkte erhalten!')
}

const openTestChat = () => {
  chatPartner.value = {
    id: 'demo_user_123',
    name: 'Test User',
    avatar: '👤',
    online: true
  }
  showChatModal.value = true
}

const triggerConfetti = () => {
  rewards.showConfetti()
  success('🎊 Konfetti ausgelöst!')
}

const handlePointsEarned = (points: number) => {
  success(`🎉 +${points} Punkte erhalten!`)
}

const handleOnboardingProgress = (progress: number) => {
  rewards.updateOnboardingProgress(progress)
}

const getSectionTitle = (section: string) => {
  const titles: Record<string, string> = {
    events: '📅 Event System Demo',
    voting: '🗳️ Voting System Demo',
    activity: '📊 Live Activity Feed',
    onboarding: '🎯 Onboarding Progress',
    fomo: '⏰ FOMO Triggers'
  }
  return titles[section] || ''
}
</script>

<style scoped>
.demo-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
}

.demo-header {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  padding: 3rem 2rem;
  text-align: center;
  box-shadow: 0 4px 20px rgba(99, 102, 241, 0.3);
}

.demo-header-content h1 {
  font-size: 2.5rem;
  font-weight: 900;
  color: white;
  margin: 0 0 1rem 0;
}

.demo-subtitle {
  font-size: 1.125rem;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
}

.demo-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

/* Progress Overview */
.progress-overview {
  margin-bottom: 3rem;
}

.progress-card {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1));
  border: 2px solid rgba(99, 102, 241, 0.3);
  border-radius: 1rem;
  padding: 2rem;
}

.progress-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.progress-icon {
  font-size: 2.5rem;
}

.progress-header h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #f8fafc;
  margin: 0;
}

.progress-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  margin-bottom: 2rem;
}

.stat {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 2.5rem;
  font-weight: 900;
  color: #a5b4fc;
  line-height: 1;
}

.stat-label {
  display: block;
  font-size: 0.875rem;
  color: #94a3b8;
  margin-top: 0.5rem;
}

.progress-bar-demo {
  height: 12px;
  background: rgba(15, 23, 42, 0.6);
  border-radius: 999px;
  overflow: hidden;
  margin-bottom: 1rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #6366f1, #8b5cf6);
  border-radius: 999px;
  transition: width 0.5s ease;
}

.progress-text {
  text-align: center;
  font-size: 0.875rem;
  color: #cbd5e1;
  margin: 0;
}

/* Features Grid */
.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.feature-card {
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-4px);
  border-color: rgba(99, 102, 241, 0.5);
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.2);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.feature-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #f8fafc;
  margin: 0 0 0.75rem 0;
}

.feature-description {
  font-size: 0.875rem;
  color: #94a3b8;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.feature-status {
  display: inline-block;
  padding: 0.375rem 0.875rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.feature-status.completed {
  background: rgba(16, 185, 129, 0.2);
  border: 1px solid rgba(16, 185, 129, 0.4);
  color: #10b981;
}

.feature-status.active {
  background: rgba(251, 191, 36, 0.2);
  border: 1px solid rgba(251, 191, 36, 0.4);
  color: #fbbf24;
}

.btn-test {
  width: 100%;
  padding: 0.75rem;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border: none;
  border-radius: 0.5rem;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-test:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}

/* Detail Section */
.detail-section {
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 1rem;
  padding: 2rem;
  margin-bottom: 3rem;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.detail-header h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #f8fafc;
  margin: 0;
}

.btn-close {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(15, 23, 42, 0.6);
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-close:hover {
  background: rgba(239, 68, 68, 0.3);
  transform: rotate(90deg);
}

/* Test Instructions */
.test-instructions {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(99, 102, 241, 0.1));
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: 1rem;
  padding: 2rem;
}

.test-instructions h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #f8fafc;
  margin: 0 0 1.5rem 0;
}

.instruction-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.instruction-card {
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.75rem;
  padding: 1.5rem;
}

.instruction-card h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #10b981;
  margin: 0 0 0.75rem 0;
}

.instruction-card p {
  font-size: 0.875rem;
  color: #cbd5e1;
  line-height: 1.6;
  margin: 0;
}

/* Achievements Modal */
.achievements-modal {
  max-width: 900px;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
}

.modal-content {
  background: #1e293b;
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 1rem;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-header h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #f8fafc;
  margin: 0;
}

.modal-close {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(15, 23, 42, 0.6);
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
}

.achievements-grid-modal {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
  padding: 2rem;
}

.achievement-item-modal {
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.75rem;
  padding: 1.5rem;
  text-align: center;
  transition: all 0.3s;
}

.achievement-item-modal.unlocked {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.2));
  border-color: rgba(99, 102, 241, 0.4);
}

.achievement-item-modal:not(.unlocked) {
  opacity: 0.6;
  filter: grayscale(0.8);
}

.achievement-icon-large {
  font-size: 3rem;
  display: block;
  margin-bottom: 1rem;
}

.achievement-item-modal h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #f8fafc;
  margin: 0 0 0.5rem 0;
}

.achievement-item-modal p {
  font-size: 0.875rem;
  color: #94a3b8;
  margin: 0 0 1rem 0;
  line-height: 1.5;
}

.achievement-points {
  font-size: 0.875rem;
  font-weight: 600;
  color: #fbbf24;
  margin-bottom: 0.75rem;
}

.achievement-locked {
  font-size: 0.75rem;
  color: #64748b;
}

.achievement-unlocked {
  font-size: 0.75rem;
  font-weight: 600;
  color: #10b981;
}

/* Modal Transitions */
.modal-enter-active, .modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from, .modal-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .demo-header-content h1 {
    font-size: 1.75rem;
  }

  .progress-stats {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .instruction-grid {
    grid-template-columns: 1fr;
  }
}
</style>
