/**
 * Unit Tests: solidBookmarks.ts
 * Bookmarks management with import/export
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { solidBookmarks } from '@/services/solidBookmarks'

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
  createSolidDataset: vi.fn(() => ({ mock: 'empty-dataset' })),
  getThingAll: vi.fn(() => []),
  getThing: vi.fn(),
  setThing: vi.fn((dataset) => dataset),
  removeThing: vi.fn((dataset) => dataset),
  createThing: vi.fn(() => ({ url: 'mock-bookmark' })),
  getStringNoLocale: vi.fn(),
  setStringNoLocale: vi.fn((thing) => thing),
  getDatetime: vi.fn(),
  setDatetime: vi.fn((thing) => thing)
}))

describe('solidBookmarks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getBookmarks()', () => {
    it('should return empty array when not logged in', async () => {
      const { solidAuth } = await import('@/services/solidAuth')
      vi.mocked(solidAuth.getWebId).mockReturnValue(undefined)

      const bookmarks = await solidBookmarks.getBookmarks()

      expect(bookmarks).toEqual([])
    })

    it('should fetch bookmarks from Pod', async () => {
      const {
        getSolidDataset,
        getThingAll,
        getStringNoLocale,
        getDatetime
      } = await import('@inrupt/solid-client')

      const mockDataset = { mock: 'dataset' }
      const mockBookmark = { url: 'bookmark1' }

      vi.mocked(getSolidDataset).mockResolvedValue(mockDataset as any)
      vi.mocked(getThingAll).mockReturnValue([mockBookmark] as any)
      vi.mocked(getStringNoLocale).mockImplementation((thing, predicate: any) => {
        if (predicate?.includes?.('title')) return 'Example Article'
        if (predicate?.includes?.('recalls')) return 'https://example.com'
        return undefined
      })
      vi.mocked(getDatetime).mockReturnValue(new Date('2025-01-01') as any)

      const bookmarks = await solidBookmarks.getBookmarks()

      expect(bookmarks).toHaveLength(1)
      expect(bookmarks[0]).toMatchObject({
        title: 'Example Article',
        url: 'https://example.com'
      })
    })

    it('should return empty array when dataset not found', async () => {
      const { getSolidDataset } = await import('@inrupt/solid-client')
      vi.mocked(getSolidDataset).mockRejectedValue(new Error('Not found'))

      const bookmarks = await solidBookmarks.getBookmarks()

      expect(bookmarks).toEqual([])
    })
  })

  describe('addBookmark()', () => {
    it('should add bookmark to Pod', async () => {
      const {
        getSolidDataset,
        saveSolidDatasetAt,
        createThing,
        setThing
      } = await import('@inrupt/solid-client')

      const mockDataset = { mock: 'dataset' }
      vi.mocked(getSolidDataset).mockResolvedValue(mockDataset as any)
      vi.mocked(saveSolidDatasetAt).mockResolvedValue(mockDataset as any)

      const result = await solidBookmarks.addBookmark({
        title: 'New Article',
        url: 'https://example.com/article'
      })

      expect(result).toBe(true)
      expect(createThing).toHaveBeenCalled()
      expect(setThing).toHaveBeenCalled()
      expect(saveSolidDatasetAt).toHaveBeenCalled()
    })

    it('should create dataset if none exists', async () => {
      const {
        getSolidDataset,
        saveSolidDatasetAt,
        createSolidDataset
      } = await import('@inrupt/solid-client')

      vi.mocked(getSolidDataset).mockRejectedValue(new Error('Not found'))
      vi.mocked(saveSolidDatasetAt).mockResolvedValue({ mock: 'dataset' } as any)

      const result = await solidBookmarks.addBookmark({
        title: 'First Bookmark',
        url: 'https://example.com'
      })

      expect(result).toBe(true)
      expect(saveSolidDatasetAt).toHaveBeenCalledTimes(2) // Once to create, once to add bookmark
    })
  })

  describe('removeBookmark()', () => {
    it('should remove bookmark from Pod', async () => {
      const {
        getSolidDataset,
        removeThing,
        saveSolidDatasetAt
      } = await import('@inrupt/solid-client')

      const mockDataset = { mock: 'dataset' }
      vi.mocked(getSolidDataset).mockResolvedValue(mockDataset as any)
      vi.mocked(saveSolidDatasetAt).mockResolvedValue(mockDataset as any)

      const result = await solidBookmarks.removeBookmark('bookmark-id-123')

      expect(result).toBe(true)
      expect(removeThing).toHaveBeenCalled()
      expect(saveSolidDatasetAt).toHaveBeenCalled()
    })
  })

  describe('exportToJSON()', () => {
    it('should export bookmarks as JSON', async () => {
      const { getThingAll, getStringNoLocale, getDatetime } = await import('@inrupt/solid-client')

      vi.mocked(getThingAll).mockReturnValue([
        { url: 'bookmark1' },
        { url: 'bookmark2' }
      ] as any)

      vi.mocked(getStringNoLocale).mockImplementation((thing: any, predicate: any) => {
        if (thing.url === 'bookmark1') {
          if (predicate?.includes?.('title')) return 'First Bookmark'
          if (predicate?.includes?.('recalls')) return 'https://example.com/1'
        }
        if (thing.url === 'bookmark2') {
          if (predicate?.includes?.('title')) return 'Second Bookmark'
          if (predicate?.includes?.('recalls')) return 'https://example.com/2'
        }
        return undefined
      })

      vi.mocked(getDatetime).mockReturnValue(new Date('2025-01-01') as any)

      const json = await solidBookmarks.exportToJSON()
      const data = JSON.parse(json)

      expect(data.count).toBe(2)
      expect(data.bookmarks).toHaveLength(2)
      expect(data.bookmarks[0].title).toBe('First Bookmark')
      expect(data.bookmarks[1].url).toBe('https://example.com/2')
      expect(data.exportedAt).toBeDefined()
    })
  })

  describe('importFromJSON()', () => {
    it('should import bookmarks from JSON', async () => {
      const { saveSolidDatasetAt } = await import('@inrupt/solid-client')
      vi.mocked(saveSolidDatasetAt).mockResolvedValue({} as any)

      const jsonData = JSON.stringify({
        exportedAt: '2025-01-01T00:00:00Z',
        count: 2,
        bookmarks: [
          { title: 'Imported 1', url: 'https://example.com/1', createdAt: '2025-01-01T00:00:00Z' },
          { title: 'Imported 2', url: 'https://example.com/2', createdAt: '2025-01-01T00:00:00Z' }
        ]
      })

      const result = await solidBookmarks.importFromJSON(jsonData)

      expect(result.success).toBe(2)
      expect(result.failed).toBe(0)
      expect(saveSolidDatasetAt).toHaveBeenCalledTimes(2)
    })

    it('should handle partial import failures', async () => {
      const { saveSolidDatasetAt } = await import('@inrupt/solid-client')

      // First call succeeds, second fails
      vi.mocked(saveSolidDatasetAt)
        .mockResolvedValueOnce({} as any)
        .mockRejectedValueOnce(new Error('Failed'))

      const jsonData = JSON.stringify({
        count: 2,
        bookmarks: [
          { title: 'Bookmark 1', url: 'https://example.com/1' },
          { title: 'Bookmark 2', url: 'https://example.com/2' }
        ]
      })

      const result = await solidBookmarks.importFromJSON(jsonData)

      expect(result.success).toBe(1)
      expect(result.failed).toBe(1)
    })
  })

  describe('downloadAsJSON()', () => {
    it('should trigger download with correct filename', () => {
      const createObjectURL = vi.fn(() => 'blob:mock-url')
      const revokeObjectURL = vi.fn()
      global.URL.createObjectURL = createObjectURL
      global.URL.revokeObjectURL = revokeObjectURL

      const mockLink = {
        click: vi.fn(),
        href: '',
        download: ''
      }
      vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any)

      const jsonString = JSON.stringify({ test: 'data' })
      solidBookmarks.downloadAsJSON(jsonString, 'test-bookmarks.json')

      expect(createObjectURL).toHaveBeenCalled()
      expect(mockLink.download).toBe('test-bookmarks.json')
      expect(mockLink.click).toHaveBeenCalled()
    })
  })
})
