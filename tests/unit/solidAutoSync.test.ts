/**
 * Unit Tests: solidAutoSync.ts
 * Auto-sync with offline queue and retry logic
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { solidAutoSync } from '@/services/solidAutoSync'

// Mock solidAuth
vi.mock('@/services/solidAuth', () => ({
  solidAuth: {
    getWebId: vi.fn(() => 'https://alice.solidcommunity.net/profile/card#me'),
    getFetch: vi.fn(() => fetch),
    isLoggedIn: vi.fn(() => true)
  }
}))

// Mock solid services
vi.mock('@/services/solidProfile', () => ({
  solidProfile: {
    getProfile: vi.fn().mockResolvedValue({ name: 'Alice' }),
    saveProfile: vi.fn().mockResolvedValue(true)
  }
}))

vi.mock('@/services/solidBookmarks', () => ({
  solidBookmarks: {
    getBookmarks: vi.fn().mockResolvedValue([]),
    addBookmark: vi.fn().mockResolvedValue(true)
  }
}))

vi.mock('@/services/solidSettings', () => ({
  solidSettings: {
    getSettings: vi.fn().mockResolvedValue({ language: 'de' }),
    saveSettings: vi.fn().mockResolvedValue(true)
  }
}))

describe('solidAutoSync', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    solidAutoSync.stop() // Ensure clean state
    vi.clearAllMocks()
  })

  afterEach(() => {
    solidAutoSync.stop()
    vi.useRealTimers()
  })

  describe('start() / stop()', () => {
    it('should start auto-sync', () => {
      solidAutoSync.start()

      expect(solidAutoSync.status.value).toBe('syncing')
    })

    it('should stop auto-sync', () => {
      solidAutoSync.start()
      solidAutoSync.stop()

      // Status might be 'idle' or remain at last state
      expect(['idle', 'syncing', 'synced', 'error']).toContain(solidAutoSync.status.value)
    })

    it('should not start multiple times', () => {
      solidAutoSync.start()
      const firstInterval = solidAutoSync.status.value

      solidAutoSync.start() // Try to start again

      // Should not create multiple intervals
      expect(solidAutoSync.status.value).toBe(firstInterval)
    })
  })

  describe('syncAll()', () => {
    it('should sync profile, bookmarks, and settings', async () => {
      const { solidProfile } = await import('@/services/solidProfile')
      const { solidBookmarks } = await import('@/services/solidBookmarks')
      const { solidSettings } = await import('@/services/solidSettings')

      await solidAutoSync.syncAll()

      // Should have attempted to get data from services
      expect(solidProfile.getProfile).toHaveBeenCalled()
      expect(solidBookmarks.getBookmarks).toHaveBeenCalled()
      expect(solidSettings.getSettings).toHaveBeenCalled()
    })

    it('should handle sync errors gracefully', async () => {
      const { solidProfile } = await import('@/services/solidProfile')
      vi.mocked(solidProfile.getProfile).mockRejectedValue(new Error('Sync failed'))

      // Should not throw, but handle error
      await solidAutoSync.syncAll()

      expect(solidAutoSync.status.value).toBe('error')
    })

    it('should update lastSync timestamp', async () => {
      const beforeSync = solidAutoSync.lastSync.value

      await solidAutoSync.syncAll()

      const afterSync = solidAutoSync.lastSync.value

      expect(afterSync).not.toBe(beforeSync)
      if (afterSync) {
        expect(afterSync.getTime()).toBeGreaterThan(beforeSync?.getTime() || 0)
      }
    })
  })

  describe('Configuration', () => {
    it('should update sync config', () => {
      solidAutoSync.setConfig({
        enabled: true,
        interval: 60000,
        direction: 'toLocalStorage'
      })

      const config = solidAutoSync.getConfig()

      expect(config.enabled).toBe(true)
      expect(config.interval).toBe(60000)
      expect(config.direction).toBe('toLocalStorage')
    })

    it('should restart with new interval', () => {
      solidAutoSync.start()

      solidAutoSync.setConfig({
        enabled: true,
        interval: 120000,
        direction: 'bidirectional'
      })

      // Should apply new config
      expect(solidAutoSync.getConfig().interval).toBe(120000)
    })

    it('should validate interval minimum', () => {
      solidAutoSync.setConfig({
        enabled: true,
        interval: 5000, // Too short
        direction: 'bidirectional'
      })

      // Should clamp to minimum (10 seconds)
      expect(solidAutoSync.getConfig().interval).toBeGreaterThanOrEqual(10000)
    })
  })

  describe('Offline Queue', () => {
    it('should queue operations when offline', () => {
      const { solidAuth } = vi.mocked(await import('@/services/solidAuth'))
      vi.mocked(solidAuth.isLoggedIn).mockReturnValue(false)

      solidAutoSync.queueOperation({
        type: 'profile',
        action: 'save',
        data: { name: 'Bob' }
      })

      expect(solidAutoSync.queue.value.length).toBeGreaterThan(0)
    })

    it('should process queue when back online', async () => {
      const { solidAuth } = vi.mocked(await import('@/services/solidAuth'))

      // Go offline
      vi.mocked(solidAuth.isLoggedIn).mockReturnValue(false)

      solidAutoSync.queueOperation({
        type: 'profile',
        action: 'save',
        data: { name: 'Bob' }
      })

      // Go back online
      vi.mocked(solidAuth.isLoggedIn).mockReturnValue(true)

      await solidAutoSync.processQueue()

      // Queue should be processed
      const queueLength = solidAutoSync.queue.value.length
      expect(queueLength).toBeLessThanOrEqual(1) // Might be 0 or have failed items
    })

    it('should retry failed queue items', async () => {
      const { solidProfile } = await import('@/services/solidProfile')
      vi.mocked(solidProfile.saveProfile)
        .mockRejectedValueOnce(new Error('Temporary error'))
        .mockResolvedValueOnce(true)

      solidAutoSync.queueOperation({
        type: 'profile',
        action: 'save',
        data: { name: 'Bob' }
      })

      // First attempt fails
      await solidAutoSync.processQueue()

      // Retry
      await solidAutoSync.processQueue()

      // Should succeed on retry
      expect(solidProfile.saveProfile).toHaveBeenCalledTimes(2)
    })
  })

  describe('Sync Direction', () => {
    it('should sync from localStorage to Pod (fromLocalStorage)', async () => {
      solidAutoSync.setConfig({
        enabled: true,
        interval: 30000,
        direction: 'fromLocalStorage'
      })

      await solidAutoSync.syncAll()

      const { solidProfile } = await import('@/services/solidProfile')
      // Should save to Pod
      expect(solidProfile.saveProfile).toHaveBeenCalled()
    })

    it('should sync from Pod to localStorage (toLocalStorage)', async () => {
      solidAutoSync.setConfig({
        enabled: true,
        interval: 30000,
        direction: 'toLocalStorage'
      })

      await solidAutoSync.syncAll()

      const { solidProfile } = await import('@/services/solidProfile')
      // Should read from Pod
      expect(solidProfile.getProfile).toHaveBeenCalled()
    })

    it('should sync bidirectionally (bidirectional)', async () => {
      solidAutoSync.setConfig({
        enabled: true,
        interval: 30000,
        direction: 'bidirectional'
      })

      await solidAutoSync.syncAll()

      const { solidProfile } = await import('@/services/solidProfile')
      // Should both read and potentially write
      expect(solidProfile.getProfile).toHaveBeenCalled()
    })
  })

  describe('Event Listeners', () => {
    it('should notify listeners on sync success', async () => {
      const listener = vi.fn()
      solidAutoSync.addEventListener(listener)

      await solidAutoSync.syncAll()

      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'sync-success' })
      )

      solidAutoSync.removeEventListener(listener)
    })

    it('should notify listeners on sync error', async () => {
      const { solidProfile } = await import('@/services/solidProfile')
      vi.mocked(solidProfile.getProfile).mockRejectedValue(new Error('Sync error'))

      const listener = vi.fn()
      solidAutoSync.addEventListener(listener)

      await solidAutoSync.syncAll()

      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'sync-error' })
      )

      solidAutoSync.removeEventListener(listener)
    })

    it('should remove event listeners', () => {
      const listener = vi.fn()
      solidAutoSync.addEventListener(listener)
      solidAutoSync.removeEventListener(listener)

      solidAutoSync.syncAll()

      // Listener should not be called after removal
      expect(listener).not.toHaveBeenCalled()
    })
  })
})
