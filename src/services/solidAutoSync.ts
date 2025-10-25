/**
 * Solid Auto-Sync Service
 * Automatically synchronizes data between localStorage and Solid Pod
 */

import { ref, watch } from 'vue'
import { useOnline } from '../composables/useOnline'
import { solidAuth } from './solidAuth'
import { solidProfile } from './solidProfile'
import { solidBookmarks } from './solidBookmarks'
import { solidSettings } from './solidSettings'

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error' | 'offline'
export type SyncDirection = 'local-to-pod' | 'pod-to-local' | 'bidirectional'

export interface SyncConfig {
  enabled: boolean
  interval: number // milliseconds
  direction: SyncDirection
  autoResolveConflicts: boolean // true = last-write-wins
}

export interface SyncEvent {
  type: 'profile' | 'bookmarks' | 'settings'
  action: 'sync-start' | 'sync-success' | 'sync-error'
  timestamp: Date
  error?: string
}

export interface QueuedOperation {
  id: string
  type: 'profile' | 'bookmarks' | 'settings'
  action: 'save' | 'delete'
  data: any
  timestamp: Date
  retries: number
}

class SolidAutoSyncService {
  private config: SyncConfig = {
    enabled: false,
    interval: 30000, // 30 seconds
    direction: 'bidirectional',
    autoResolveConflicts: true
  }

  private syncIntervalId: number | null = null
  private isOnline = useOnline()
  public status = ref<SyncStatus>('idle')
  public lastSync = ref<Date | null>(null)
  public queue = ref<QueuedOperation[]>([])
  private eventListeners: ((event: SyncEvent) => void)[] = []

  /**
   * Initialize auto-sync service
   */
  async init(config?: Partial<SyncConfig>): Promise<void> {
    if (config) {
      this.config = { ...this.config, ...config }
    }

    // Load queue from localStorage
    this.loadQueue()

    // Watch online status
    watch(this.isOnline, (online) => {
      if (online && this.queue.value.length > 0) {
        console.log('🌐 Back online - processing queue')
        this.processQueue()
      }
    })

    // Start sync if enabled
    if (this.config.enabled) {
      this.start()
    }
  }

  /**
   * Start auto-sync
   */
  start(): void {
    if (this.syncIntervalId !== null) {
      console.warn('Auto-sync already running')
      return
    }

    this.config.enabled = true
    console.log('✅ Auto-sync started')

    // Initial sync
    this.syncAll()

    // Set up interval
    this.syncIntervalId = window.setInterval(() => {
      this.syncAll()
    }, this.config.interval)
  }

  /**
   * Stop auto-sync
   */
  stop(): void {
    if (this.syncIntervalId !== null) {
      clearInterval(this.syncIntervalId)
      this.syncIntervalId = null
    }

    this.config.enabled = false
    this.status.value = 'idle'
    console.log('⏸️ Auto-sync stopped')
  }

  /**
   * Sync all data types
   */
  async syncAll(): Promise<void> {
    if (!solidAuth.isLoggedIn()) {
      this.status.value = 'idle'
      return
    }

    if (!this.isOnline.value) {
      this.status.value = 'offline'
      return
    }

    this.status.value = 'syncing'

    try {
      // Sync in parallel for performance
      await Promise.all([
        this.syncProfile(),
        this.syncBookmarks(),
        this.syncSettings()
      ])

      this.status.value = 'synced'
      this.lastSync.value = new Date()
    } catch (error) {
      console.error('Sync error:', error)
      this.status.value = 'error'
      this.emitEvent({
        type: 'profile',
        action: 'sync-error',
        timestamp: new Date(),
        error: String(error)
      })
    }
  }

  /**
   * Sync profile data
   */
  private async syncProfile(): Promise<void> {
    try {
      this.emitEvent({
        type: 'profile',
        action: 'sync-start',
        timestamp: new Date()
      })

      if (this.config.direction === 'local-to-pod' || this.config.direction === 'bidirectional') {
        // Check if local has data
        const localProfile = localStorage.getItem('user_profile')
        if (localProfile) {
          const profile = JSON.parse(localProfile)
          const podProfile = await solidProfile.getProfile()

          // Check if local is newer (simple timestamp check)
          const localTimestamp = profile.updatedAt || 0
          const podTimestamp = podProfile?.updatedAt || 0

          if (this.config.autoResolveConflicts && localTimestamp > podTimestamp) {
            await solidProfile.saveProfile(profile)
            console.log('✅ Profile synced: local → pod')
          }
        }
      }

      if (this.config.direction === 'pod-to-local' || this.config.direction === 'bidirectional') {
        // Fetch from pod and update local if newer
        const podProfile = await solidProfile.getProfile()
        if (podProfile) {
          const localProfile = localStorage.getItem('user_profile')
          const local = localProfile ? JSON.parse(localProfile) : null

          const localTimestamp = local?.updatedAt || 0
          const podTimestamp = (podProfile as any).updatedAt || 0

          if (this.config.autoResolveConflicts && podTimestamp > localTimestamp) {
            localStorage.setItem('user_profile', JSON.stringify({
              ...podProfile,
              updatedAt: Date.now()
            }))
            console.log('✅ Profile synced: pod → local')
          }
        }
      }

      this.emitEvent({
        type: 'profile',
        action: 'sync-success',
        timestamp: new Date()
      })
    } catch (error) {
      console.error('Profile sync error:', error)
      throw error
    }
  }

  /**
   * Sync bookmarks data
   */
  private async syncBookmarks(): Promise<void> {
    try {
      this.emitEvent({
        type: 'bookmarks',
        action: 'sync-start',
        timestamp: new Date()
      })

      if (this.config.direction === 'local-to-pod' || this.config.direction === 'bidirectional') {
        const localBookmarks = localStorage.getItem('bookmarks')
        if (localBookmarks) {
          const bookmarks = JSON.parse(localBookmarks)
          const podBookmarks = await solidBookmarks.getBookmarks()

          // Simple sync: add missing bookmarks to pod
          for (const bookmark of bookmarks) {
            const existsInPod = podBookmarks.some((pb: any) => pb.url === bookmark.url)
            if (!existsInPod) {
              await solidBookmarks.addBookmark(bookmark)
              console.log('✅ Bookmark synced to pod:', bookmark.url)
            }
          }
        }
      }

      if (this.config.direction === 'pod-to-local' || this.config.direction === 'bidirectional') {
        const podBookmarks = await solidBookmarks.getBookmarks()
        const localBookmarks = localStorage.getItem('bookmarks')
        const local = localBookmarks ? JSON.parse(localBookmarks) : []

        // Add missing bookmarks from pod to local
        for (const podBookmark of podBookmarks) {
          const existsInLocal = local.some((lb: any) => lb.url === podBookmark.url)
          if (!existsInLocal) {
            local.push(podBookmark)
            console.log('✅ Bookmark synced from pod:', podBookmark.url)
          }
        }

        localStorage.setItem('bookmarks', JSON.stringify(local))
      }

      this.emitEvent({
        type: 'bookmarks',
        action: 'sync-success',
        timestamp: new Date()
      })
    } catch (error) {
      console.error('Bookmarks sync error:', error)
      throw error
    }
  }

  /**
   * Sync settings data
   */
  private async syncSettings(): Promise<void> {
    try {
      this.emitEvent({
        type: 'settings',
        action: 'sync-start',
        timestamp: new Date()
      })

      if (this.config.direction === 'local-to-pod' || this.config.direction === 'bidirectional') {
        const localSettings = localStorage.getItem('settings')
        if (localSettings) {
          const settings = JSON.parse(localSettings)
          const podSettings = await solidSettings.getSettings()

          const localTimestamp = settings.updatedAt || 0
          const podTimestamp = (podSettings as any).updatedAt || 0

          if (this.config.autoResolveConflicts && localTimestamp > podTimestamp) {
            await solidSettings.saveSettings(settings)
            console.log('✅ Settings synced: local → pod')
          }
        }
      }

      if (this.config.direction === 'pod-to-local' || this.config.direction === 'bidirectional') {
        const podSettings = await solidSettings.getSettings()
        const localSettings = localStorage.getItem('settings')
        const local = localSettings ? JSON.parse(localSettings) : null

        const localTimestamp = local?.updatedAt || 0
        const podTimestamp = (podSettings as any).updatedAt || 0

        if (this.config.autoResolveConflicts && podTimestamp > localTimestamp) {
          localStorage.setItem('settings', JSON.stringify({
            ...podSettings,
            updatedAt: Date.now()
          }))
          console.log('✅ Settings synced: pod → local')
        }
      }

      this.emitEvent({
        type: 'settings',
        action: 'sync-success',
        timestamp: new Date()
      })
    } catch (error) {
      console.error('Settings sync error:', error)
      throw error
    }
  }

  /**
   * Add operation to queue (for offline mode)
   */
  queueOperation(operation: Omit<QueuedOperation, 'id' | 'timestamp' | 'retries'>): void {
    const queuedOp: QueuedOperation = {
      ...operation,
      id: `${operation.type}-${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
      retries: 0
    }

    this.queue.value.push(queuedOp)
    this.saveQueue()
    console.log('📝 Operation queued:', queuedOp.id)
  }

  /**
   * Process queued operations
   */
  private async processQueue(): Promise<void> {
    if (this.queue.value.length === 0) return

    console.log(`📤 Processing ${this.queue.value.length} queued operations`)

    const processed: string[] = []

    for (const operation of this.queue.value) {
      try {
        await this.executeQueuedOperation(operation)
        processed.push(operation.id)
        console.log('✅ Queued operation processed:', operation.id)
      } catch (error) {
        console.error('❌ Failed to process queued operation:', operation.id, error)

        // Retry logic
        operation.retries++
        if (operation.retries >= 3) {
          console.error('⚠️ Max retries reached, removing from queue:', operation.id)
          processed.push(operation.id)
        }
      }
    }

    // Remove processed operations
    this.queue.value = this.queue.value.filter(op => !processed.includes(op.id))
    this.saveQueue()
  }

  /**
   * Execute a queued operation
   */
  private async executeQueuedOperation(operation: QueuedOperation): Promise<void> {
    switch (operation.type) {
      case 'profile':
        await solidProfile.saveProfile(operation.data)
        break
      case 'bookmarks':
        if (operation.action === 'save') {
          await solidBookmarks.addBookmark(operation.data)
        } else if (operation.action === 'delete') {
          await solidBookmarks.removeBookmark(operation.data.id)
        }
        break
      case 'settings':
        await solidSettings.saveSettings(operation.data)
        break
    }
  }

  /**
   * Save queue to localStorage
   */
  private saveQueue(): void {
    try {
      localStorage.setItem('solid_sync_queue', JSON.stringify(this.queue.value))
    } catch (error) {
      console.error('Failed to save queue:', error)
    }
  }

  /**
   * Load queue from localStorage
   */
  private loadQueue(): void {
    try {
      const saved = localStorage.getItem('solid_sync_queue')
      if (saved) {
        this.queue.value = JSON.parse(saved)
      }
    } catch (error) {
      console.error('Failed to load queue:', error)
      this.queue.value = []
    }
  }

  /**
   * Add event listener
   */
  addEventListener(listener: (event: SyncEvent) => void): void {
    this.eventListeners.push(listener)
  }

  /**
   * Remove event listener
   */
  removeEventListener(listener: (event: SyncEvent) => void): void {
    const index = this.eventListeners.indexOf(listener)
    if (index > -1) {
      this.eventListeners.splice(index, 1)
    }
  }

  /**
   * Emit sync event
   */
  private emitEvent(event: SyncEvent): void {
    this.eventListeners.forEach(listener => listener(event))
  }

  /**
   * Update configuration
   */
  setConfig(config: Partial<SyncConfig>): void {
    const wasEnabled = this.config.enabled

    this.config = { ...this.config, ...config }

    // Restart sync if needed
    if (wasEnabled && !this.config.enabled) {
      this.stop()
    } else if (!wasEnabled && this.config.enabled) {
      this.start()
    } else if (this.config.enabled) {
      // Restart with new interval
      this.stop()
      this.start()
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): SyncConfig {
    return { ...this.config }
  }
}

export const solidAutoSync = new SolidAutoSyncService()
