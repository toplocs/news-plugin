/**
 * Unit Tests: solidSettings.ts
 * User settings persistence in Solid Pods
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { solidSettings } from '@/services/solidSettings'

// Mock solidAuth
vi.mock('@/services/solidAuth', () => ({
  solidAuth: {
    getWebId: vi.fn(() => 'https://alice.solidcommunity.net/profile/card#me'),
    getFetch: vi.fn(() => fetch),
    isLoggedIn: vi.fn(() => true)
  }
}))

// Mock @inrupt/solid-client
vi.mock('@inrupt/solid-client', () => ({
  getSolidDataset: vi.fn(),
  saveSolidDatasetAt: vi.fn(),
  getThing: vi.fn(),
  setThing: vi.fn((dataset) => dataset),
  createThing: vi.fn(() => ({ url: 'mock-settings' })),
  getStringNoLocale: vi.fn(),
  setStringNoLocale: vi.fn((thing) => thing),
  getBoolean: vi.fn(),
  setBoolean: vi.fn((thing) => thing),
  getInteger: vi.fn(),
  setInteger: vi.fn((thing) => thing)
}))

describe('solidSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getSettings()', () => {
    it('should return default settings when not logged in', async () => {
      const { solidAuth } = await import('@/services/solidAuth')
      vi.mocked(solidAuth.getWebId).mockReturnValue(undefined)

      const settings = await solidSettings.getSettings()

      expect(settings).toEqual({
        language: 'de',
        theme: 'dark',
        notifications: true,
        rssFeeds: [],
        autoSync: {
          enabled: false,
          interval: 30000,
          direction: 'bidirectional'
        }
      })
    })

    it('should fetch settings from Pod', async () => {
      const {
        getSolidDataset,
        getThing,
        getStringNoLocale,
        getBoolean,
        getInteger
      } = await import('@inrupt/solid-client')

      const mockDataset = { mock: 'dataset' }
      const mockSettings = { url: 'mock-settings' }

      vi.mocked(getSolidDataset).mockResolvedValue(mockDataset as any)
      vi.mocked(getThing).mockReturnValue(mockSettings as any)
      vi.mocked(getStringNoLocale).mockImplementation((thing, predicate: any) => {
        if (predicate?.includes?.('language')) return 'en'
        if (predicate?.includes?.('theme')) return 'light'
        return undefined
      })
      vi.mocked(getBoolean).mockReturnValue(false)
      vi.mocked(getInteger).mockReturnValue(60000)

      const settings = await solidSettings.getSettings()

      expect(settings.language).toBe('en')
      expect(settings.theme).toBe('light')
    })

    it('should handle errors gracefully and return defaults', async () => {
      const { getSolidDataset } = await import('@inrupt/solid-client')
      vi.mocked(getSolidDataset).mockRejectedValue(new Error('Network error'))

      const settings = await solidSettings.getSettings()

      expect(settings.language).toBe('de') // Default
    })
  })

  describe('saveSettings()', () => {
    it('should save settings to Pod', async () => {
      const {
        getSolidDataset,
        saveSolidDatasetAt,
        setStringNoLocale,
        setBoolean,
        setInteger
      } = await import('@inrupt/solid-client')

      const mockDataset = { mock: 'dataset' }
      vi.mocked(getSolidDataset).mockResolvedValue(mockDataset as any)
      vi.mocked(saveSolidDatasetAt).mockResolvedValue(mockDataset as any)

      const result = await solidSettings.saveSettings({
        language: 'en',
        theme: 'light'
      })

      expect(result).toBe(true)
      expect(saveSolidDatasetAt).toHaveBeenCalled()
    })

    it('should handle save errors', async () => {
      const { getSolidDataset } = await import('@inrupt/solid-client')
      vi.mocked(getSolidDataset).mockRejectedValue(new Error('Save failed'))

      const result = await solidSettings.saveSettings({ theme: 'dark' })

      expect(result).toBe(false)
    })
  })

  describe('RSS Feeds Management', () => {
    it('should add RSS feed', async () => {
      const { saveSolidDatasetAt } = await import('@inrupt/solid-client')
      vi.mocked(saveSolidDatasetAt).mockResolvedValue({} as any)

      const result = await solidSettings.saveSettings({
        rssFeeds: ['https://example.com/rss']
      })

      expect(result).toBe(true)
    })

    it('should remove RSS feed', async () => {
      const result = await solidSettings.saveSettings({
        rssFeeds: []
      })

      expect(result).toBe(true)
    })
  })

  describe('Auto-Sync Configuration', () => {
    it('should update auto-sync settings', async () => {
      const result = await solidSettings.saveSettings({
        autoSync: {
          enabled: true,
          interval: 60000,
          direction: 'toLocalStorage'
        }
      })

      expect(result).toBe(true)
    })

    it('should validate interval range', async () => {
      const result = await solidSettings.saveSettings({
        autoSync: {
          enabled: true,
          interval: 10000, // Should be at least 10s
          direction: 'bidirectional'
        }
      })

      expect(result).toBe(true)
    })
  })
})
