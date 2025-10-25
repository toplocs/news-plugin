/**
 * PWA utilities for service worker registration and install prompts
 */

let deferredPrompt: any = null

/**
 * Register service worker
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      })

      console.log('[PWA] Service Worker registered:', registration.scope)

      // Check for updates periodically
      setInterval(() => {
        registration.update()
      }, 60000) // Check every minute

      // Handle updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker available
              console.log('[PWA] New version available')
              notifyUpdate()
            }
          })
        }
      })

      return registration
    } catch (error) {
      console.error('[PWA] Service Worker registration failed:', error)
      return null
    }
  }
  return null
}

/**
 * Unregister service worker
 */
export async function unregisterServiceWorker(): Promise<boolean> {
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.getRegistration()
    if (registration) {
      return registration.unregister()
    }
  }
  return false
}

/**
 * Capture install prompt event
 */
export function captureInstallPrompt(): void {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredPrompt = e
    console.log('[PWA] Install prompt captured')
  })
}

/**
 * Show install prompt
 */
export async function showInstallPrompt(): Promise<boolean> {
  if (!deferredPrompt) {
    console.log('[PWA] No install prompt available')
    return false
  }

  deferredPrompt.prompt()
  const { outcome } = await deferredPrompt.userChoice
  console.log('[PWA] User choice:', outcome)

  deferredPrompt = null
  return outcome === 'accepted'
}

/**
 * Check if app is installed
 */
export function isAppInstalled(): boolean {
  // Check if running in standalone mode
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as any).standalone === true
}

/**
 * Check if install prompt is available
 */
export function canInstall(): boolean {
  return deferredPrompt !== null
}

/**
 * Notify user about update
 */
function notifyUpdate(): void {
  if (Notification.permission === 'granted') {
    new Notification('Update verfügbar', {
      body: 'Eine neue Version ist verfügbar. Bitte Seite neu laden.',
      icon: '/icons/icon-192x192.svg'
    })
  }
}

/**
 * Skip waiting and activate new service worker
 */
export async function skipWaiting(): Promise<void> {
  const registration = await navigator.serviceWorker.getRegistration()
  if (registration && registration.waiting) {
    registration.waiting.postMessage({ type: 'SKIP_WAITING' })
  }
}

/**
 * Clear service worker cache
 */
export async function clearCache(): Promise<boolean> {
  const registration = await navigator.serviceWorker.getRegistration()
  if (registration && registration.active) {
    return new Promise((resolve) => {
      const messageChannel = new MessageChannel()
      messageChannel.port1.onmessage = (event) => {
        resolve(event.data.success)
      }
      registration.active!.postMessage(
        { type: 'CLEAR_CACHE' },
        [messageChannel.port2]
      )
    })
  }
  return false
}
