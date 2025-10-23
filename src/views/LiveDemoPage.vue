<template>
  <div class="live-demo">
    <!-- Hero Section mit Live Stats -->
    <div class="hero-pulse">
      <div class="pulse-overlay"></div>
      <div class="hero-content">
        <h1 class="hero-title animate-in">
          🌟 Live Community Pulse
        </h1>
        <p class="hero-subtitle">Erlebe Gamification in Echtzeit</p>

        <!-- Live Counter - zählt automatisch hoch -->
        <div class="live-counter">
          <div class="counter-item">
            <span class="counter-value">{{ animatedPoints }}</span>
            <span class="counter-label">Punkte</span>
          </div>
          <div class="counter-item">
            <span class="counter-value">{{ animatedLevel }}</span>
            <span class="counter-label">Level</span>
          </div>
          <div class="counter-item">
            <span class="counter-value">{{ liveUsers }}</span>
            <span class="counter-label">🟢 Online</span>
          </div>
        </div>

        <!-- Animated Progress Ring -->
        <div class="progress-ring-container">
          <svg class="progress-ring" width="200" height="200">
            <circle
              class="progress-ring-circle-bg"
              stroke="#1e293b"
              stroke-width="10"
              fill="transparent"
              r="90"
              cx="100"
              cy="100"
            />
            <circle
              class="progress-ring-circle"
              :stroke="levelColor"
              stroke-width="10"
              fill="transparent"
              r="90"
              cx="100"
              cy="100"
              :style="{ strokeDashoffset: progressOffset }"
            />
          </svg>
          <div class="progress-ring-text">
            <span class="ring-percentage">{{ Math.round(levelProgress) }}%</span>
            <span class="ring-label">bis Level {{ nextLevel }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Live Activity Stream - scrollt automatisch -->
    <div class="activity-stream">
      <div class="stream-header">
        <h2>🔥 Live Activity Feed</h2>
        <span class="live-badge pulse">● LIVE</span>
      </div>

      <div class="stream-container" ref="streamContainer">
        <TransitionGroup name="slide-fade">
          <div
            v-for="activity in visibleActivities"
            :key="activity.id"
            class="activity-item"
            :class="{ new: activity.isNew }"
          >
            <div class="activity-avatar">{{ activity.avatar }}</div>
            <div class="activity-content">
              <div class="activity-text">
                <strong>{{ activity.user }}</strong>
                <span>{{ activity.action }}</span>
              </div>
              <div class="activity-meta">
                <span class="activity-time">{{ activity.timeAgo }}</span>
                <span v-if="activity.points" class="activity-points">+{{ activity.points }}</span>
              </div>
            </div>
          </div>
        </TransitionGroup>
      </div>
    </div>

    <!-- Interactive Actions - sichtbare Buttons -->
    <div class="action-cards">
      <div class="action-card" @click="quickAction('vote')" :class="{ active: activeAction === 'vote' }">
        <div class="action-icon">🗳️</div>
        <h3>Abstimmen</h3>
        <p>+5 Punkte</p>
        <div class="action-glow"></div>
      </div>

      <div class="action-card" @click="quickAction('event')" :class="{ active: activeAction === 'event' }">
        <div class="action-icon">📅</div>
        <h3>Event beitreten</h3>
        <p>+20 Punkte</p>
        <div class="action-glow"></div>
      </div>

      <div class="action-card" @click="quickAction('chat')" :class="{ active: activeAction === 'chat' }">
        <div class="action-icon">💬</div>
        <h3>Nachricht</h3>
        <p>+10 Punkte</p>
        <div class="action-glow"></div>
      </div>

      <div class="action-card" @click="quickAction('share')" :class="{ active: activeAction === 'share' }">
        <div class="action-icon">📤</div>
        <h3>Artikel teilen</h3>
        <p>+15 Punkte</p>
        <div class="action-glow"></div>
      </div>
    </div>

    <!-- Visual Achievement Showcase -->
    <div class="achievements-showcase">
      <h2>🏆 Achievements</h2>
      <div class="achievements-grid">
        <div
          v-for="achievement in achievements"
          :key="achievement.id"
          class="achievement-card"
          :class="{ unlocked: achievement.unlocked, new: achievement.isNew }"
          @click="achievement.unlocked && showAchievementDetail(achievement)"
        >
          <div class="achievement-icon-large">{{ achievement.icon }}</div>
          <div class="achievement-title">{{ achievement.title }}</div>
          <div class="achievement-progress" v-if="!achievement.unlocked">
            {{ achievement.progress }}/{{ achievement.target }}
          </div>
          <div class="achievement-unlock" v-if="achievement.unlocked">
            <span class="unlock-badge">✅</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Confetti -->
    <ConfettiEffect ref="confetti" />

    <!-- Toast Container -->
    <ToastContainer />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
// import { useRewards } from '../stores/useRewards' // Removed - no gaming features
import { useToast } from '../composables/useToast'
// import ConfettiEffect from '../components/ConfettiEffect.vue' // Removed
import ToastContainer from '../components/ToastContainer.vue'

// const rewards = useRewards() // Removed - no gaming
const { success } = useToast()

// Animated counters
const animatedPoints = ref(0)
const animatedLevel = ref(1)
const liveUsers = ref(42)
const activeAction = ref<string | null>(null)

// Activity stream
const activities = ref<any[]>([])
const visibleActivities = computed(() => activities.value.slice(0, 8))

// Achievements
const achievements = ref([
  { id: '1', icon: '🎯', title: 'First Steps', progress: 1, target: 1, unlocked: true, isNew: false },
  { id: '2', icon: '💬', title: 'Social Butterfly', progress: 3, target: 10, unlocked: false, isNew: false },
  { id: '3', icon: '🗳️', title: 'Voter', progress: 5, target: 5, unlocked: true, isNew: true },
  { id: '4', icon: '📅', title: 'Event Master', progress: 2, target: 5, unlocked: false, isNew: false },
  { id: '5', icon: '🔥', title: '7-Day Streak', progress: 3, target: 7, unlocked: false, isNew: false },
  { id: '6', icon: '👑', title: 'Level 5', progress: 2, target: 5, unlocked: false, isNew: false }
])

// Progress ring
const levelProgress = ref(0)
const progressOffset = ref(565) // 2 * PI * 90
const levelColor = computed(() => {
  if (animatedLevel.value >= 5) return '#fbbf24'
  if (animatedLevel.value >= 3) return '#a78bfa'
  return '#6366f1'
})
const nextLevel = computed(() => animatedLevel.value + 1)

// Activity templates
const activityTemplates = [
  { action: 'ist einem Event beigetreten', points: 20, avatar: '👨‍💼' },
  { action: 'hat abgestimmt', points: 5, avatar: '👩‍💻' },
  { action: 'hat eine Nachricht gesendet', points: 10, avatar: '👨‍🎓' },
  { action: 'hat Level 3 erreicht!', points: null, avatar: '👩‍🎨' },
  { action: 'hat einen Artikel geteilt', points: 15, avatar: '👨‍🔬' }
]

const userNames = ['Anna M.', 'Max K.', 'Julia R.', 'Tom S.', 'Lisa W.', 'David B.', 'Sarah L.', 'Mike P.']

// Generate activity
const generateActivity = () => {
  const template = activityTemplates[Math.floor(Math.random() * activityTemplates.length)]
  const user = userNames[Math.floor(Math.random() * userNames.length)]

  return {
    id: `activity_${Date.now()}_${Math.random()}`,
    user,
    avatar: template.avatar,
    action: template.action,
    points: template.points,
    timeAgo: 'gerade eben',
    isNew: true,
    timestamp: Date.now()
  }
}

// Quick actions
const quickAction = (type: string) => {
  activeAction.value = type

  let points = 0
  let message = ''

  switch(type) {
    case 'vote':
      points = 5
      message = '🗳️ Abgestimmt!'
      break
    case 'event':
      points = 20
      message = '📅 Event beigetreten!'
      break
    case 'chat':
      points = 10
      message = '💬 Nachricht gesendet!'
      break
    case 'share':
      points = 15
      message = '📤 Artikel geteilt!'
      break
  }

  // Animate points increase
  animatePointsIncrease(points)

  // Add to activity stream
  const activity = generateActivity()
  activities.value.unshift(activity)

  // Show toast
  success(`${message} +${points} Punkte`)

  // Reset active state
  setTimeout(() => {
    activeAction.value = null
  }, 500)

  // Mark activity as not new after animation
  setTimeout(() => {
    activity.isNew = false
  }, 1000)
}

// Animate points increase
const animatePointsIncrease = (amount: number) => {
  const start = animatedPoints.value
  const end = start + amount
  const duration = 1000
  const startTime = Date.now()

  const animate = () => {
    const elapsed = Date.now() - startTime
    const progress = Math.min(elapsed / duration, 1)

    animatedPoints.value = Math.round(start + (end - start) * progress)

    if (progress < 1) {
      requestAnimationFrame(animate)
    } else {
      // Check for level up
      checkLevelUp()
    }
  }

  animate()
}

// Check level up
const checkLevelUp = () => {
  const levels = [0, 100, 300, 600, 1000]
  const currentLevel = levels.findIndex(threshold => animatedPoints.value < threshold) - 1

  if (currentLevel > animatedLevel.value) {
    animatedLevel.value = currentLevel
    // Trigger confetti
    window.dispatchEvent(new Event('show-confetti'))
    success(`🎊 Level ${currentLevel} erreicht!`)
  }

  // Update progress
  updateProgress()
}

// Update progress ring
const updateProgress = () => {
  const levels = [0, 100, 300, 600, 1000]
  const currentLevelThreshold = levels[animatedLevel.value]
  const nextLevelThreshold = levels[animatedLevel.value + 1] || 1000

  const pointsInLevel = animatedPoints.value - currentLevelThreshold
  const pointsNeeded = nextLevelThreshold - currentLevelThreshold

  levelProgress.value = (pointsInLevel / pointsNeeded) * 100

  // Update ring
  const circumference = 2 * Math.PI * 90
  progressOffset.value = circumference - (levelProgress.value / 100) * circumference
}

// Show achievement detail
const showAchievementDetail = (achievement: any) => {
  success(`🏆 ${achievement.title} - Bereits freigeschaltet!`)
}

// Auto-update functions
let activityInterval: any
let userCountInterval: any

onMounted(() => {
  // Initialize
  rewards.initialize('demo_user')
  animatedPoints.value = 0
  animatedLevel.value = 1

  // Initial activities
  for (let i = 0; i < 5; i++) {
    const activity = generateActivity()
    activity.isNew = false
    activity.timeAgo = `vor ${i + 1} Min`
    activities.value.push(activity)
  }

  // Auto-generate activities every 3 seconds
  activityInterval = setInterval(() => {
    const activity = generateActivity()
    activities.value.unshift(activity)

    // Mark as not new after 1s
    setTimeout(() => {
      activity.isNew = false
    }, 1000)

    // Keep max 20 activities
    if (activities.value.length > 20) {
      activities.value = activities.value.slice(0, 20)
    }
  }, 3000)

  // Update user count
  userCountInterval = setInterval(() => {
    liveUsers.value = Math.floor(Math.random() * 10) + 40 // 40-50 users
  }, 5000)

  // Update time ago every 30 seconds
  setInterval(() => {
    activities.value.forEach((activity, index) => {
      const elapsed = Math.floor((Date.now() - activity.timestamp) / 1000)
      if (elapsed < 60) {
        activity.timeAgo = 'gerade eben'
      } else if (elapsed < 3600) {
        activity.timeAgo = `vor ${Math.floor(elapsed / 60)} Min`
      } else {
        activity.timeAgo = `vor ${Math.floor(elapsed / 3600)}h`
      }
    })
  }, 30000)
})

onUnmounted(() => {
  if (activityInterval) clearInterval(activityInterval)
  if (userCountInterval) clearInterval(userCountInterval)
})
</script>

<style scoped>
.live-demo {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  padding-bottom: 4rem;
}

/* Hero Pulse Section */
.hero-pulse {
  position: relative;
  padding: 4rem 2rem;
  text-align: center;
  overflow: hidden;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.2));
  border-bottom: 1px solid rgba(99, 102, 241, 0.3);
}

.pulse-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.3), transparent);
  animation: pulse 3s ease-in-out infinite;
  pointer-events: none;
}

@keyframes pulse {
  0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
  50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.8; }
}

.hero-content {
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 0 auto;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 900;
  color: #f8fafc;
  margin: 0 0 1rem 0;
  animation: slideDown 0.8s ease;
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-30px); }
  to { opacity: 1; transform: translateY(0); }
}

.hero-subtitle {
  font-size: 1.25rem;
  color: #cbd5e1;
  margin-bottom: 3rem;
  animation: fadeIn 1s ease 0.3s both;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Live Counter */
.live-counter {
  display: flex;
  justify-content: center;
  gap: 4rem;
  margin-bottom: 3rem;
  animation: fadeIn 1s ease 0.5s both;
}

.counter-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.counter-value {
  font-size: 4rem;
  font-weight: 900;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1;
  transition: all 0.3s ease;
}

.counter-label {
  font-size: 0.875rem;
  color: #94a3b8;
  margin-top: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* Progress Ring */
.progress-ring-container {
  position: relative;
  display: inline-block;
  animation: fadeIn 1s ease 0.7s both;
}

.progress-ring {
  transform: rotate(-90deg);
}

.progress-ring-circle {
  stroke-dasharray: 565;
  stroke-linecap: round;
  transition: stroke-dashoffset 0.5s ease, stroke 0.5s ease;
}

.progress-ring-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.ring-percentage {
  display: block;
  font-size: 2.5rem;
  font-weight: 900;
  color: #f8fafc;
  line-height: 1;
}

.ring-label {
  display: block;
  font-size: 0.75rem;
  color: #94a3b8;
  margin-top: 0.5rem;
}

/* Activity Stream */
.activity-stream {
  max-width: 1200px;
  margin: 3rem auto;
  padding: 0 2rem;
}

.stream-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.stream-header h2 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #f8fafc;
  margin: 0;
}

.live-badge {
  font-size: 0.875rem;
  font-weight: 600;
  color: #10b981;
  background: rgba(16, 185, 129, 0.2);
  border: 1px solid rgba(16, 185, 129, 0.4);
  padding: 0.375rem 0.875rem;
  border-radius: 999px;
}

.live-badge.pulse {
  animation: glow 2s ease-in-out infinite;
}

@keyframes glow {
  0%, 100% { box-shadow: 0 0 5px rgba(16, 185, 129, 0.5); }
  50% { box-shadow: 0 0 20px rgba(16, 185, 129, 0.8); }
}

.stream-container {
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  padding: 1.5rem;
  max-height: 500px;
  overflow-y: auto;
}

.activity-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  border-radius: 0.75rem;
  margin-bottom: 0.75rem;
  transition: all 0.3s;
  background: rgba(15, 23, 42, 0.6);
}

.activity-item.new {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(99, 102, 241, 0.2));
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.activity-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.3), rgba(139, 92, 246, 0.3));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.activity-content {
  flex: 1;
  min-width: 0;
}

.activity-text {
  margin-bottom: 0.5rem;
}

.activity-text strong {
  color: #f8fafc;
  margin-right: 0.5rem;
}

.activity-text span {
  color: #cbd5e1;
  font-size: 0.875rem;
}

.activity-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.75rem;
}

.activity-time {
  color: #64748b;
}

.activity-points {
  color: #10b981;
  font-weight: 600;
  background: rgba(16, 185, 129, 0.2);
  padding: 0.125rem 0.5rem;
  border-radius: 999px;
}

/* Action Cards */
.action-cards {
  max-width: 1200px;
  margin: 3rem auto;
  padding: 0 2rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.action-card {
  position: relative;
  background: rgba(30, 41, 59, 0.6);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
}

.action-card:hover {
  transform: translateY(-8px) scale(1.02);
  border-color: rgba(99, 102, 241, 0.5);
  box-shadow: 0 12px 40px rgba(99, 102, 241, 0.3);
}

.action-card.active {
  animation: cardPulse 0.5s ease;
}

@keyframes cardPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.action-glow {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.3), transparent);
  opacity: 0;
  transition: opacity 0.3s;
  pointer-events: none;
}

.action-card:hover .action-glow {
  opacity: 1;
}

.action-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  filter: drop-shadow(0 4px 10px rgba(99, 102, 241, 0.5));
}

.action-card h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #f8fafc;
  margin: 0 0 0.5rem 0;
}

.action-card p {
  font-size: 1rem;
  font-weight: 600;
  color: #10b981;
  margin: 0;
}

/* Achievements Showcase */
.achievements-showcase {
  max-width: 1200px;
  margin: 3rem auto;
  padding: 0 2rem;
}

.achievements-showcase h2 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #f8fafc;
  margin: 0 0 2rem 0;
}

.achievements-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1.5rem;
}

.achievement-card {
  background: rgba(30, 41, 59, 0.6);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  padding: 1.5rem;
  text-align: center;
  transition: all 0.3s;
  cursor: pointer;
  position: relative;
}

.achievement-card:not(.unlocked) {
  opacity: 0.5;
  filter: grayscale(1);
}

.achievement-card.unlocked {
  border-color: rgba(99, 102, 241, 0.5);
}

.achievement-card.unlocked:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(99, 102, 241, 0.3);
}

.achievement-card.new::before {
  content: 'NEW!';
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: #ef4444;
  color: white;
  font-size: 0.625rem;
  font-weight: 700;
  padding: 0.25rem 0.5rem;
  border-radius: 999px;
  animation: bounce 1s infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

.achievement-icon-large {
  font-size: 3rem;
  margin-bottom: 0.75rem;
}

.achievement-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #f8fafc;
  margin-bottom: 0.5rem;
}

.achievement-progress {
  font-size: 0.75rem;
  color: #94a3b8;
}

.achievement-unlock {
  margin-top: 0.5rem;
}

.unlock-badge {
  font-size: 1.5rem;
}

/* Transitions */
.slide-fade-enter-active {
  transition: all 0.5s ease;
}

.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from {
  transform: translateX(-30px);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateX(30px);
  opacity: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2rem;
  }

  .live-counter {
    gap: 2rem;
  }

  .counter-value {
    font-size: 2.5rem;
  }

  .action-cards {
    grid-template-columns: 1fr;
  }
}
</style>
