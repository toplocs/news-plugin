/**
 * Unit Tests: solidMigration.ts
 * Migration wizard from localStorage to Solid Pod
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { solidMigration } from '@/services/solidMigration'

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
    saveProfile: vi.fn().mockResolvedValue(true)
  }
}))

vi.mock('@/services/solidBookmarks', () => ({
  solidBookmarks: {
    addBookmark: vi.fn().mockResolvedValue(true)
  }
}))

vi.mock('@/services/solidSettings', () => ({
  solidSettings: {
    saveSettings: vi.fn().mockResolvedValue(true)
  }
}))

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
    get length() {
      return Object.keys(store).length
    },
    key: (index: number) => Object.keys(store)[index] || null
  }
})()

global.localStorage = localStorageMock as any

describe('solidMigration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  describe('checkLocalStorage()', () => {
    it('should detect existing profile data', () => {
      localStorage.setItem('userProfile', JSON.stringify({
        name: 'Alice',
        bio: 'Developer'
      }))

      const result = solidMigration.checkLocalStorage()

      expect(result.hasProfile).toBe(true)
      expect(result.profileData).toEqual({
        name: 'Alice',
        bio: 'Developer'
      })
    })

    it('should detect existing bookmarks', () => {
      localStorage.setItem('bookmarks', JSON.stringify([
        { title: 'Bookmark 1', url: 'https://example.com/1' },
        { title: 'Bookmark 2', url: 'https://example.com/2' }
      ]))

      const result = solidMigration.checkLocalStorage()

      expect(result.hasBookmarks).toBe(true)
      expect(result.bookmarks).toHaveLength(2)
    })

    it('should detect existing settings', () => {
      localStorage.setItem('settings', JSON.stringify({
        language: 'en',
        theme: 'dark'
      }))

      const result = solidMigration.checkLocalStorage()

      expect(result.hasSettings).toBe(true)
      expect(result.settings).toEqual({
        language: 'en',
        theme: 'dark'
      })
    })

    it('should return empty result when no data exists', () => {
      const result = solidMigration.checkLocalStorage()

      expect(result.hasProfile).toBe(false)
      expect(result.hasBookmarks).toBe(false)
      expect(result.hasSettings).toBe(false)
    })
  })

  describe('createBackup()', () => {
    it('should create backup of existing data', () => {
      localStorage.setItem('userProfile', JSON.stringify({ name: 'Alice' }))
      localStorage.setItem('bookmarks', JSON.stringify([{ title: 'Test' }]))

      solidMigration.createBackup()

      const backup = localStorage.getItem('migration-backup')
      expect(backup).toBeTruthy()

      if (backup) {
        const backupData = JSON.parse(backup)
        expect(backupData.profile).toEqual({ name: 'Alice' })
        expect(backupData.bookmarks).toHaveLength(1)
        expect(backupData.timestamp).toBeTruthy()
      }
    })

    it('should include timestamp in backup', () => {
      localStorage.setItem('userProfile', JSON.stringify({ name: 'Alice' }))

      solidMigration.createBackup()

      const backup = localStorage.getItem('migration-backup')
      if (backup) {
        const backupData = JSON.parse(backup)
        const timestamp = new Date(backupData.timestamp)
        expect(timestamp.getTime()).toBeLessThanOrEqual(Date.now())
      }
    })
  })

  describe('migrateAll()', () => {
    beforeEach(() => {
      localStorage.setItem('userProfile', JSON.stringify({
        name: 'Alice',
        bio: 'Developer'
      }))
      localStorage.setItem('bookmarks', JSON.stringify([
        { title: 'Bookmark 1', url: 'https://example.com/1' }
      ]))
      localStorage.setItem('settings', JSON.stringify({
        language: 'en',
        theme: 'dark'
      }))
    })

    it('should migrate all data to Pod', async () => {
      const { solidProfile } = await import('@/services/solidProfile')
      const { solidBookmarks } = await import('@/services/solidBookmarks')
      const { solidSettings } = await import('@/services/solidSettings')

      const result = await solidMigration.migrateAll()

      expect(result.success).toBe(true)
      expect(result.migratedProfile).toBe(true)
      expect(result.migratedBookmarks).toBeGreaterThan(0)
      expect(result.migratedSettings).toBe(true)

      expect(solidProfile.saveProfile).toHaveBeenCalled()
      expect(solidBookmarks.addBookmark).toHaveBeenCalled()
      expect(solidSettings.saveSettings).toHaveBeenCalled()
    })

    it('should create backup before migration', async () => {
      await solidMigration.migrateAll()

      const backup = localStorage.getItem('migration-backup')
      expect(backup).toBeTruthy()
    })

    it('should handle partial failures gracefully', async () => {
      const { solidProfile } = await import('@/services/solidProfile')
      vi.mocked(solidProfile.saveProfile).mockRejectedValue(new Error('Profile save failed'))

      const result = await solidMigration.migrateAll()

      // Should still attempt bookmarks and settings
      expect(result.success).toBe(false)
      expect(result.errors).toContain('Profile migration failed')
    })

    it('should not proceed if user not logged in', async () => {
      const { solidAuth } = await import('@/services/solidAuth')
      vi.mocked(solidAuth.isLoggedIn).mockReturnValue(false)

      const result = await solidMigration.migrateAll()

      expect(result.success).toBe(false)
      expect(result.errors).toContain('Not logged in')
    })

    it('should track migration progress', async () => {
      const progressCallback = vi.fn()

      await solidMigration.migrateAll({ onProgress: progressCallback })

      expect(progressCallback).toHaveBeenCalled()
      expect(progressCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          current: expect.any(Number),
          total: expect.any(Number),
          step: expect.any(String)
        })
      )
    })
  })

  describe('cleanup()', () => {
    beforeEach(() => {
      localStorage.setItem('userProfile', JSON.stringify({ name: 'Alice' }))
      localStorage.setItem('bookmarks', JSON.stringify([{ title: 'Test' }]))
      localStorage.setItem('settings', JSON.stringify({ language: 'en' }))
      localStorage.setItem('migration-backup', JSON.stringify({
        profile: { name: 'Alice' },
        timestamp: new Date().toISOString()
      }))
    })

    it('should remove migrated data from localStorage', () => {
      solidMigration.cleanup()

      expect(localStorage.getItem('userProfile')).toBeNull()
      expect(localStorage.getItem('bookmarks')).toBeNull()
      expect(localStorage.getItem('settings')).toBeNull()
    })

    it('should keep backup after cleanup', () => {
      solidMigration.cleanup()

      const backup = localStorage.getItem('migration-backup')
      expect(backup).toBeTruthy()
    })

    it('should not cleanup if keepLocalData is true', () => {
      solidMigration.cleanup({ keepLocalData: true })

      expect(localStorage.getItem('userProfile')).toBeTruthy()
      expect(localStorage.getItem('bookmarks')).toBeTruthy()
    })
  })

  describe('restoreFromBackup()', () => {
    it('should restore data from backup', () => {
      const backupData = {
        profile: { name: 'Alice', bio: 'Developer' },
        bookmarks: [{ title: 'Test', url: 'https://example.com' }],
        settings: { language: 'en' },
        timestamp: new Date().toISOString()
      }

      localStorage.setItem('migration-backup', JSON.stringify(backupData))
      localStorage.removeItem('userProfile')
      localStorage.removeItem('bookmarks')

      const result = solidMigration.restoreFromBackup()

      expect(result).toBe(true)
      expect(localStorage.getItem('userProfile')).toBeTruthy()
      expect(localStorage.getItem('bookmarks')).toBeTruthy()

      const restoredProfile = JSON.parse(localStorage.getItem('userProfile')!)
      expect(restoredProfile.name).toBe('Alice')
    })

    it('should return false if no backup exists', () => {
      localStorage.removeItem('migration-backup')

      const result = solidMigration.restoreFromBackup()

      expect(result).toBe(false)
    })

    it('should handle corrupted backup gracefully', () => {
      localStorage.setItem('migration-backup', 'invalid-json')

      const result = solidMigration.restoreFromBackup()

      expect(result).toBe(false)
    })
  })

  describe('getMigrationStatus()', () => {
    it('should return status of migration', () => {
      localStorage.setItem('migration-complete', 'true')
      localStorage.setItem('migration-timestamp', new Date().toISOString())

      const status = solidMigration.getMigrationStatus()

      expect(status.completed).toBe(true)
      expect(status.timestamp).toBeTruthy()
    })

    it('should indicate no migration yet', () => {
      const status = solidMigration.getMigrationStatus()

      expect(status.completed).toBe(false)
      expect(status.timestamp).toBeNull()
    })

    it('should show backup availability', () => {
      localStorage.setItem('migration-backup', JSON.stringify({
        profile: {},
        timestamp: new Date().toISOString()
      }))

      const status = solidMigration.getMigrationStatus()

      expect(status.hasBackup).toBe(true)
    })
  })
})
