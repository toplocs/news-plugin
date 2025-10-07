<template>
  <div class="sync-status" :class="{ connected: isConnected }">
    <div class="indicator" :class="syncState"></div>
    <span class="status-text">{{ statusText }}</span>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import gun from '../services/gun'

const isConnected = ref(false)
const syncState = ref<'connecting' | 'syncing' | 'synced'>('connecting')
const statusText = ref('Verbinde...')

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
      statusText.value = 'Offline'
    }
  }, 5000)
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
