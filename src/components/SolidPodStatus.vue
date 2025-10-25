<template>
  <div class="solid-pod-status">
    <div class="status-indicator" :class="statusClass">
      <div class="status-dot"></div>
      <div class="status-info">
        <span class="status-label">{{ statusLabel }}</span>
        <span v-if="lastSync" class="last-sync">{{ lastSyncText }}</span>
      </div>
    </div>

    <div v-if="showDetails" class="status-details">
      <div class="detail-item">
        <span class="detail-label">Pod:</span>
        <span class="detail-value">{{ podUrl || 'Nicht verbunden' }}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">WebID:</span>
        <span class="detail-value webid">{{ webId || 'Nicht eingeloggt' }}</span>
      </div>
      <div v-if="syncStatus !== 'idle'" class="detail-item">
        <span class="detail-label">Sync:</span>
        <span class="detail-value">{{ syncStatusText }}</span>
      </div>
      <div v-if="queue.length > 0" class="detail-item">
        <span class="detail-label">Queue:</span>
        <span class="detail-value">{{ queue.length }} ausstehend</span>
      </div>
      <div v-if="error" class="detail-item error-item">
        <span class="detail-label">Fehler:</span>
        <span class="detail-value">{{ error }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useSolidSession } from '../stores/useSolidSession'
import { useOnline } from '../composables/useOnline'
import { solidAutoSync, type SyncEvent } from '../services/solidAutoSync'

interface Props {
  showDetails?: boolean
  compact?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showDetails: false,
  compact: false
})

const session = useSolidSession()
const isOnline = useOnline()

// Use auto-sync service's status
const syncStatus = solidAutoSync.status
const lastSync = solidAutoSync.lastSync
const queue = solidAutoSync.queue
const error = ref<string | null>(null)

const statusClass = computed(() => {
  if (!isOnline.value) return 'offline'
  if (!session.isLoggedIn) return 'disconnected'
  if (syncStatus.value === 'error') return 'error'
  if (syncStatus.value === 'syncing') return 'syncing'
  return 'connected'
})

const statusLabel = computed(() => {
  if (!isOnline.value) return 'Offline'
  if (!session.isLoggedIn) return 'Nicht verbunden'
  if (syncStatus.value === 'error') return 'Fehler'
  if (syncStatus.value === 'syncing') return 'Synchronisiert...'
  return 'Verbunden'
})

const podUrl = computed(() => session.podUrl)
const webId = computed(() => session.webId)

const lastSyncText = computed(() => {
  if (!lastSync.value) return ''
  const now = Date.now()
  const diff = now - lastSync.value.getTime()

  if (diff < 60000) return 'Gerade eben'
  if (diff < 3600000) return `Vor ${Math.floor(diff / 60000)} Min.`
  if (diff < 86400000) return `Vor ${Math.floor(diff / 3600000)} Std.`
  return `Vor ${Math.floor(diff / 86400000)} Tagen`
})

const syncStatusText = computed(() => {
  switch (syncStatus.value) {
    case 'syncing': return 'Daten werden synchronisiert...'
    case 'synced': return 'Alle Daten synchronisiert'
    case 'error': return 'Synchronisierung fehlgeschlagen'
    default: return 'Bereit'
  }
})

function handleSyncEvent(event: SyncEvent) {
  if (event.action === 'sync-error' && event.error) {
    error.value = event.error
  } else if (event.action === 'sync-success') {
    error.value = null
  }
}

onMounted(() => {
  // Listen to sync events
  solidAutoSync.addEventListener(handleSyncEvent)
})

onUnmounted(() => {
  // Remove event listener
  solidAutoSync.removeEventListener(handleSyncEvent)
})

// Expose method to manually trigger sync
defineExpose({
  manualSync: () => solidAutoSync.syncAll()
})
</script>

<style scoped>
.solid-pod-status {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 0.75rem;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.status-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  position: relative;
  flex-shrink: 0;
}

/* Status Colors */
.connected .status-dot {
  background: #22c55e;
  box-shadow: 0 0 8px rgba(34, 197, 94, 0.5);
}

.syncing .status-dot {
  background: #3b82f6;
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.error .status-dot,
.disconnected .status-dot {
  background: #fb923c;
  box-shadow: 0 0 8px rgba(251, 146, 60, 0.5);
}

.offline .status-dot {
  background: #94a3b8;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.status-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
  min-width: 0;
}

.status-label {
  color: #e2e8f0;
  font-weight: 600;
  font-size: 0.875rem;
}

.last-sync {
  color: #94a3b8;
  font-size: 0.75rem;
}

.status-details {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.detail-item {
  display: flex;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.detail-label {
  color: #94a3b8;
  font-weight: 600;
  min-width: 60px;
}

.detail-value {
  color: #e2e8f0;
  word-break: break-word;
}

.detail-value.webid {
  font-family: monospace;
  font-size: 0.75rem;
  background: rgba(0, 0, 0, 0.3);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.error-item .detail-value {
  color: #ef4444;
}

/* Compact Mode */
.solid-pod-status.compact {
  padding: 0.5rem;
}

.compact .status-indicator {
  gap: 0.5rem;
}

.compact .status-dot {
  width: 8px;
  height: 8px;
}

.compact .status-label {
  font-size: 0.75rem;
}

.compact .last-sync {
  display: none;
}
</style>
