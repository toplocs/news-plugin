/**
 * Unit Tests: solidProfile.ts
 * Profile CRUD operations for Solid Pods
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { solidProfile } from '@/services/solidProfile'
import type { SolidProfile } from '@/services/solidProfile'

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
  setThing: vi.fn((dataset, thing) => dataset),
  createThing: vi.fn(() => ({ url: 'mock-thing' })),
  getStringNoLocale: vi.fn(),
  setStringNoLocale: vi.fn((thing, predicate, value) => thing)
}))

describe('solidProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getProfile()', () => {
    it('should return null when not logged in', async () => {
      const { solidAuth } = await import('@/services/solidAuth')
      vi.mocked(solidAuth.getWebId).mockReturnValue(undefined)

      const profile = await solidProfile.getProfile()

      expect(profile).toBeNull()
    })

    it('should fetch profile data from Pod', async () => {
      const {
        getSolidDataset,
        getThing,
        getStringNoLocale
      } = await import('@inrupt/solid-client')

      const mockDataset = { mock: 'dataset' }
      const mockProfile = { url: 'mock-profile' }

      vi.mocked(getSolidDataset).mockResolvedValue(mockDataset as any)
      vi.mocked(getThing).mockReturnValue(mockProfile as any)
      vi.mocked(getStringNoLocale).mockImplementation((thing, predicate: any) => {
        if (predicate.value?.includes('name')) return 'Alice'
        if (predicate.value?.includes('note')) return 'Developer'
        if (predicate.value?.includes('Photo')) return 'https://example.com/avatar.png'
        return undefined
      })

      const profile = await solidProfile.getProfile()

      expect(profile).toEqual({
        name: 'Alice',
        avatar: 'https://example.com/avatar.png',
        bio: 'Developer',
        interests: []
      })
    })

    it('should handle errors gracefully', async () => {
      const { getSolidDataset } = await import('@inrupt/solid-client')
      vi.mocked(getSolidDataset).mockRejectedValue(new Error('Network error'))

      const profile = await solidProfile.getProfile()

      expect(profile).toBeNull()
    })
  })

  describe('saveProfile()', () => {
    it('should save profile data to Pod', async () => {
      const {
        getSolidDataset,
        saveSolidDatasetAt,
        getThing,
        createThing,
        setStringNoLocale
      } = await import('@inrupt/solid-client')

      const mockDataset = { mock: 'dataset' }
      const mockProfile = { url: 'mock-profile' }

      vi.mocked(getSolidDataset).mockResolvedValue(mockDataset as any)
      vi.mocked(getThing).mockReturnValue(mockProfile as any)
      vi.mocked(saveSolidDatasetAt).mockResolvedValue(mockDataset as any)

      const profileData: Partial<SolidProfile> = {
        name: 'Alice Updated',
        bio: 'Senior Developer'
      }

      const result = await solidProfile.saveProfile(profileData)

      expect(result).toBe(true)
      expect(saveSolidDatasetAt).toHaveBeenCalled()
      expect(setStringNoLocale).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        'Alice Updated'
      )
    })

    it('should create new profile if none exists', async () => {
      const {
        getSolidDataset,
        getThing,
        createThing,
        saveSolidDatasetAt
      } = await import('@inrupt/solid-client')

      const mockDataset = { mock: 'dataset' }

      vi.mocked(getSolidDataset).mockResolvedValue(mockDataset as any)
      vi.mocked(getThing).mockReturnValue(null)
      vi.mocked(saveSolidDatasetAt).mockResolvedValue(mockDataset as any)

      const result = await solidProfile.saveProfile({ name: 'New User' })

      expect(createThing).toHaveBeenCalled()
      expect(result).toBe(true)
    })

    it('should handle save errors', async () => {
      const { getSolidDataset } = await import('@inrupt/solid-client')
      vi.mocked(getSolidDataset).mockRejectedValue(new Error('Save failed'))

      const result = await solidProfile.saveProfile({ name: 'Test' })

      expect(result).toBe(false)
    })
  })

  describe('Field updates', () => {
    it('should update name only', async () => {
      const { saveSolidDatasetAt, setStringNoLocale } = await import('@inrupt/solid-client')

      await solidProfile.saveProfile({ name: 'Bob' })

      expect(setStringNoLocale).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        'Bob'
      )
    })

    it('should update avatar only', async () => {
      await solidProfile.saveProfile({ avatar: 'https://example.com/new-avatar.png' })

      const { setStringNoLocale } = await import('@inrupt/solid-client')
      expect(setStringNoLocale).toHaveBeenCalled()
    })

    it('should update bio only', async () => {
      await solidProfile.saveProfile({ bio: 'Updated bio text' })

      const { setStringNoLocale } = await import('@inrupt/solid-client')
      expect(setStringNoLocale).toHaveBeenCalled()
    })

    it('should update multiple fields at once', async () => {
      await solidProfile.saveProfile({
        name: 'Charlie',
        bio: 'Product Manager',
        avatar: 'https://example.com/charlie.jpg'
      })

      const { setStringNoLocale } = await import('@inrupt/solid-client')
      expect(setStringNoLocale).toHaveBeenCalledTimes(3)
    })
  })
})
