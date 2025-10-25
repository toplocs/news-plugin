<template>
  <button
    v-if="canInstall && !isInstalled"
    @click="install"
    class="pwa-install-btn"
    :class="{ 'installing': installing }"
  >
    <span class="icon">📱</span>
    <span class="text">{{ buttonText }}</span>
  </button>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  registerServiceWorker,
  captureInstallPrompt,
  showInstallPrompt,
  canInstall as checkCanInstall,
  isAppInstalled
} from '@/utils/pwa'

const canInstall = ref(false)
const isInstalled = ref(false)
const installing = ref(false)

const buttonText = computed(() => {
  if (installing.value) return 'Installiere...'
  return 'App installieren'
})

async function install() {
  installing.value = true

  try {
    const accepted = await showInstallPrompt()
    if (accepted) {
      console.log('[PWA] App installation accepted')
      canInstall.value = false
    }
  } catch (error) {
    console.error('[PWA] Installation failed:', error)
  } finally {
    installing.value = false
  }
}

onMounted(async () => {
  // Check if already installed
  isInstalled.value = isAppInstalled()

  // Register service worker
  await registerServiceWorker()

  // Capture install prompt
  captureInstallPrompt()

  // Check periodically if install prompt is available
  setInterval(() => {
    canInstall.value = checkCanInstall()
  }, 1000)
})
</script>

<style scoped>
.pwa-install-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 50px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.pwa-install-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
}

.pwa-install-btn:active {
  transform: translateY(0);
}

.pwa-install-btn.installing {
  opacity: 0.7;
  cursor: wait;
}

.icon {
  font-size: 1.25rem;
  line-height: 1;
}

.text {
  line-height: 1;
}

@media (max-width: 640px) {
  .pwa-install-btn {
    padding: 0.625rem 1.25rem;
    font-size: 0.875rem;
  }
}
</style>
