/**
 * Simple useOnline composable
 * Tracks browser online/offline status
 */

import { ref, onMounted, onUnmounted } from 'vue'

export function useOnline() {
  const isOnline = ref(navigator.onLine)

  function updateOnlineStatus() {
    isOnline.value = navigator.onLine
  }

  onMounted(() => {
    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)
  })

  onUnmounted(() => {
    window.removeEventListener('online', updateOnlineStatus)
    window.removeEventListener('offline', updateOnlineStatus)
  })

  return isOnline
}
