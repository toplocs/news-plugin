<template>
  <div class="sync-status" :class="{ connected: isConnected, local: !isConnected }">
    <div class="indicator" :class="syncState"></div>
    <span class="status-text">{{ statusText }}</span>
    <div
      v-if="!isConnected"
      class="info-icon"
      @mouseenter="showTooltip = true"
      @mouseleave="showTooltip = false"
    >
      ℹ️
      <div v-if="showTooltip" class="tooltip">
        <div class="tooltip-title">Lokaler Modus</div>
        <div class="tooltip-text">
          Die App arbeitet offline mit lokal gespeicherten Daten.
          Deine Änderungen werden automatisch synchronisiert,
          sobald das P2P-Netzwerk verfügbar ist.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import gun from '../services/gun'

const isConnected = ref(false)
const syncState = ref<'connecting' | 'syncing' | 'synced'>('connecting')
const statusText = ref('Verbinde...')
const showTooltip = ref(false)

let peerCheckInterval: ReturnType<typeof setInterval>

onMounted(() => {
  // Monitor Gun connection status
  gun.on('hi', (peer: any) => {
    console.log('Gun peer connected:', peer)
    isConnected.value = true
    syncState.value = 'syncing'
    statusText.value = 'Synchronisiert'

    // After initial sync, mark as synced
    setTimeout(() => {
      syncState.value = 'synced'
      statusText.value = 'Synchronisiert ✓'
    }, 2000)
  })

  gun.on('bye', (peer: any) => {
    console.log('Gun peer disconnected:', peer)
    isConnected.value = false
    syncState.value = 'connecting'
    statusText.value = 'Verbinde...'
  })

  // Fallback: Check connection periodically
  peerCheckInterval = setInterval(() => {
    // @ts-ignore - Gun internal API
    const peers = gun._.opt.peers
    if (peers && Object.keys(peers).length > 0) {
      isConnected.value = true
      if (syncState.value === 'connecting') {
        syncState.value = 'synced'
        statusText.value = 'Synchronisiert ✓'
      }
    } else {
      isConnected.value = false
      syncState.value = 'connecting'
      statusText.value = 'Lokaler Modus'
    }
  }, 5000)

  // Initial state
  setTimeout(() => {
    if (!isConnected.value) {
      statusText.value = 'Lokaler Modus'
    }
  }, 2000)
})

onUnmounted(() => {
  if (peerCheckInterval) {
    clearInterval(peerCheckInterval)
  }
})
</script>

<style scoped>
.sync-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  font-size: 0.8125rem;
}

.sync-status.connected {
  border-color: rgba(34, 197, 94, 0.3);
}

.sync-status.local {
  border-color: rgba(99, 102, 241, 0.3);
}

.sync-status.local .indicator {
  background: #6366f1;
}

.sync-status.local .status-text {
  color: #a5b4fc;
}

.indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #64748b;
  transition: all 0.3s;
}

.indicator.connecting {
  background: #f59e0b;
  animation: pulse 1.5s infinite;
}

.indicator.syncing {
  background: #3b82f6;
  animation: pulse 1s infinite;
}

.indicator.synced {
  background: #22c55e;
}

.status-text {
  color: #cbd5e1;
  font-weight: 500;
}

.info-icon {
  position: relative;
  cursor: help;
  font-size: 0.875rem;
  margin-left: 0.25rem;
  user-select: none;
  opacity: 0.8;
  transition: opacity 0.2s;
}

.info-icon:hover {
  opacity: 1;
}

.tooltip {
  position: absolute;
  bottom: calc(100% + 0.5rem);
  right: 0;
  min-width: 240px;
  padding: 0.75rem;
  background: rgba(15, 23, 42, 0.95);
  border: 1px solid rgba(99, 102, 241, 0.4);
  border-radius: 0.5rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  animation: tooltipFadeIn 0.2s ease-out;
}

.tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  right: 1rem;
  border: 6px solid transparent;
  border-top-color: rgba(99, 102, 241, 0.4);
}

.tooltip-title {
  font-size: 0.875rem;
  font-weight: 700;
  color: #a5b4fc;
  margin-bottom: 0.375rem;
}

.tooltip-text {
  font-size: 0.75rem;
  line-height: 1.4;
  color: #cbd5e1;
}

@keyframes tooltipFadeIn {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>
