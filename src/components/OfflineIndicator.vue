<!--
🎯 OFFLINE INDICATOR - SELF-DOC
═══════════════════════════════════════════

✅ IMPLEMENTIERT (2025-10-23):
- Real-time Offline Detection (window.addEventListener)
- Top-Center Banner when offline
- Reconnect Toast (Top-Right, 3s auto-dismiss)
- Animations: offline-rotate, offline-pulse, reconnect-bounce
- Mobile Responsive (full-width on small screens)
- ARIA Labels: role="alert", aria-live="assertive/polite"

🧪 ZU TESTEN:
1. Toggle offline (DevTools → Network → Offline) → banner should appear
2. Toggle online → reconnect toast should show
3. Auto-dismiss → toast should disappear after 3 seconds
4. Mobile view → banner should be full-width
5. Screen reader → should announce offline/online state

🔧 ZU FIXEN:
- Keine Issues ✅

📖 USAGE:
<OfflineIndicator />
<!-- Add to main layout (CleanLayout.vue, NewsLayout.vue) -->

🔌 INTEGRIERT IN:
- CleanLayout.vue (top-level)

📊 STATS:
- Lines: ~200
- Events: window.online, window.offline
- Created: 2025-10-23
═══════════════════════════════════════════
-->
<template>
  <Transition name="offline-slide">
    <div v-if="!isOnline" class="offline-indicator" role="alert" aria-live="assertive">
      <div class="offline-content">
        <div class="offline-icon">📡</div>
        <div class="offline-text">
          <span class="offline-title">Offline</span>
          <span class="offline-message">Keine Internetverbindung</span>
        </div>
        <div class="offline-pulse"></div>
      </div>
    </div>
  </Transition>

  <Transition name="reconnect-toast">
    <div v-if="wasOffline && isOnline" class="reconnect-toast" role="status" aria-live="polite">
      <div class="reconnect-content">
        <span class="reconnect-icon">✅</span>
        <span class="reconnect-text">Verbindung wiederhergestellt</span>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const isOnline = ref(navigator.onLine)
const wasOffline = ref(false)
let reconnectTimeout: ReturnType<typeof setTimeout> | null = null

const handleOnline = () => {
  isOnline.value = true
  wasOffline.value = true

  // Hide reconnect toast after 3 seconds
  if (reconnectTimeout) clearTimeout(reconnectTimeout)
  reconnectTimeout = setTimeout(() => {
    wasOffline.value = false
  }, 3000)
}

const handleOffline = () => {
  isOnline.value = false
  wasOffline.value = false
}

onMounted(() => {
  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)
})

onUnmounted(() => {
  window.removeEventListener('online', handleOnline)
  window.removeEventListener('offline', handleOffline)
  if (reconnectTimeout) clearTimeout(reconnectTimeout)
})
</script>

<style scoped>
.offline-indicator {
  position: fixed;
  top: 1rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.95), rgba(220, 38, 38, 0.95));
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(239, 68, 68, 0.5);
  padding: 0.75rem 1.5rem;
  min-width: 280px;
}

.offline-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  position: relative;
}

.offline-icon {
  font-size: 1.5rem;
  animation: offline-rotate 3s linear infinite;
}

@keyframes offline-rotate {
  0%, 100% { transform: rotate(-15deg); }
  50% { transform: rotate(15deg); }
}

.offline-text {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  flex: 1;
}

.offline-title {
  font-weight: 700;
  font-size: 0.875rem;
  color: white;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.offline-message {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
}

.offline-pulse {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: white;
  animation: offline-pulse 1.5s ease-in-out infinite;
}

@keyframes offline-pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.4;
    transform: scale(1.3);
  }
}

/* Reconnect Toast */
.reconnect-toast {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 9999;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.95), rgba(5, 150, 105, 0.95));
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(16, 185, 129, 0.5);
  padding: 0.875rem 1.25rem;
}

.reconnect-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.reconnect-icon {
  font-size: 1.25rem;
  animation: reconnect-bounce 0.5s ease-out;
}

@keyframes reconnect-bounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

.reconnect-text {
  font-weight: 600;
  font-size: 0.875rem;
  color: white;
}

/* Transitions */
.offline-slide-enter-active,
.offline-slide-leave-active {
  transition: all 0.3s ease;
}

.offline-slide-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(-20px);
}

.offline-slide-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-20px);
}

.reconnect-toast-enter-active,
.reconnect-toast-leave-active {
  transition: all 0.3s ease;
}

.reconnect-toast-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.reconnect-toast-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

/* Mobile Responsiveness */
@media (max-width: 640px) {
  .offline-indicator {
    top: 0.5rem;
    left: 0.5rem;
    right: 0.5rem;
    transform: none;
    min-width: auto;
  }

  .reconnect-toast {
    top: 0.5rem;
    right: 0.5rem;
    left: 0.5rem;
  }
}
</style>
