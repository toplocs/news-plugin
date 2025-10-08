<template>
  <Teleport to="body">
    <TransitionGroup name="notification">
      <div
        v-for="request in pendingRequests"
        :key="request.id"
        class="chat-request-notification"
      >
        <div class="notification-content">
          <!-- User Avatar -->
          <div class="user-avatar">
            <img v-if="request.from.avatar" :src="request.from.avatar" :alt="request.from.name" />
            <span v-else class="avatar-placeholder">{{ request.from.name[0] }}</span>
          </div>

          <!-- Request Info -->
          <div class="request-info">
            <div class="request-header">
              <h4 class="user-name">{{ request.from.name }}</h4>
              <span class="distance">📍 {{ request.from.distance }}</span>
            </div>

            <p class="request-message">möchte mit dir chatten</p>

            <!-- Shared Interests -->
            <div v-if="request.from.interests.length > 0" class="shared-interests">
              <span
                v-for="interest in request.from.interests.slice(0, 3)"
                :key="interest"
                class="interest-tag"
              >
                {{ interest }}
              </span>
            </div>

            <!-- Custom Message -->
            <p v-if="request.message" class="custom-message">
              "{{ request.message }}"
            </p>

            <!-- Actions -->
            <div class="request-actions">
              <button @click="handleAccept(request)" class="btn-accept">
                <span>✓</span>
                Akzeptieren
              </button>
              <button @click="handleDecline(request)" class="btn-decline">
                <span>✗</span>
                Ablehnen
              </button>
              <button @click="handleIgnore(request)" class="btn-ignore">
                Ignorieren
              </button>
            </div>
          </div>

          <!-- Close Button -->
          <button @click="handleIgnore(request)" class="close-btn">×</button>
        </div>

        <!-- Auto-expire Timer -->
        <div class="expire-timer">
          <div class="timer-bar" :style="{ width: getTimerWidth(request) + '%' }"></div>
        </div>
      </div>
    </TransitionGroup>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { useChatRequests } from '../stores/useChatRequests'

const chatRequests = useChatRequests()

const emit = defineEmits<{
  'accept': [requestId: string]
  'decline': [requestId: string]
}>()

// Computed
const pendingRequests = computed(() => chatRequests.pendingRequests)

// Timer for auto-expire animation
const getTimerWidth = (request: any) => {
  const now = Date.now()
  const elapsed = now - request.timestamp
  const total = 5 * 60 * 1000 // 5 minutes
  const remaining = Math.max(0, total - elapsed)
  return (remaining / total) * 100
}

// Handlers
const handleAccept = (request: any) => {
  chatRequests.acceptRequest(request.id)
  emit('accept', request.id)
}

const handleDecline = (request: any) => {
  chatRequests.declineRequest(request.id)
  emit('decline', request.id)
}

const handleIgnore = (request: any) => {
  chatRequests.removeRequest(request.id)
}

// Auto-update timer animation
let timerInterval: number | null = null

onMounted(() => {
  timerInterval = window.setInterval(() => {
    // Trigger re-render for timer animation
    pendingRequests.value.forEach(req => {
      const elapsed = Date.now() - req.timestamp
      if (elapsed > 5 * 60 * 1000) {
        chatRequests.removeRequest(req.id)
      }
    })
  }, 1000)
})

onUnmounted(() => {
  if (timerInterval) {
    clearInterval(timerInterval)
  }
})
</script>

<style scoped>
/* Notification Container */
.chat-request-notification {
  position: fixed;
  top: 80px;
  right: 20px;
  z-index: 9999;
  width: 380px;
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.98), rgba(15, 23, 42, 0.98));
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4), 0 0 20px rgba(99, 102, 241, 0.2);
  backdrop-filter: blur(10px);
  overflow: hidden;
  margin-bottom: 12px;
}

/* Content */
.notification-content {
  padding: 1.25rem;
  display: flex;
  gap: 1rem;
  position: relative;
}

.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  font-size: 1.25rem;
  font-weight: 700;
  color: white;
}

/* Request Info */
.request-info {
  flex: 1;
  min-width: 0;
}

.request-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.user-name {
  font-size: 1rem;
  font-weight: 700;
  color: #f8fafc;
  margin: 0;
}

.distance {
  font-size: 0.75rem;
  color: #94a3b8;
}

.request-message {
  font-size: 0.875rem;
  color: #cbd5e1;
  margin: 0 0 0.75rem 0;
}

/* Shared Interests */
.shared-interests {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
  margin-bottom: 0.75rem;
}

.interest-tag {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  background: rgba(99, 102, 241, 0.2);
  color: #a5b4fc;
  border-radius: 0.25rem;
  border: 1px solid rgba(99, 102, 241, 0.3);
}

/* Custom Message */
.custom-message {
  font-size: 0.8125rem;
  color: #a5b4fc;
  font-style: italic;
  margin: 0 0 0.75rem 0;
  padding: 0.5rem;
  background: rgba(99, 102, 241, 0.1);
  border-left: 2px solid #6366f1;
  border-radius: 0.25rem;
}

/* Actions */
.request-actions {
  display: flex;
  gap: 0.5rem;
}

.request-actions button {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  padding: 0.5rem 0.75rem;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-accept {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
}

.btn-accept:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.btn-decline {
  background: rgba(239, 68, 68, 0.2);
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.btn-decline:hover {
  background: rgba(239, 68, 68, 0.3);
  border-color: rgba(239, 68, 68, 0.5);
}

.btn-ignore {
  background: rgba(100, 116, 139, 0.2);
  color: #94a3b8;
  border: 1px solid rgba(100, 116, 139, 0.3);
}

.btn-ignore:hover {
  background: rgba(100, 116, 139, 0.3);
}

/* Close Button */
.close-btn {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  width: 24px;
  height: 24px;
  border: none;
  background: rgba(100, 116, 139, 0.2);
  color: #94a3b8;
  border-radius: 50%;
  font-size: 1.25rem;
  line-height: 1;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: rgba(100, 116, 139, 0.4);
  color: #cbd5e1;
}

/* Auto-expire Timer */
.expire-timer {
  height: 3px;
  background: rgba(100, 116, 139, 0.2);
  position: relative;
  overflow: hidden;
}

.timer-bar {
  height: 100%;
  background: linear-gradient(90deg, #6366f1, #8b5cf6);
  transition: width 1s linear;
}

/* Transitions */
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100px);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100px) scale(0.9);
}

.notification-move {
  transition: transform 0.3s ease;
}

/* Mobile */
@media (max-width: 640px) {
  .chat-request-notification {
    width: calc(100vw - 40px);
    right: 20px;
    left: 20px;
  }

  .request-actions {
    flex-direction: column;
  }

  .request-actions button {
    width: 100%;
  }
}
</style>
