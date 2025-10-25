/**
 * Solid Bookmarks Service - FULL IMPLEMENTATION
 * Manages bookmarks in Solid Pod
 */

import {
  getSolidDataset,
  saveSolidDatasetAt,
  createThing,
  setThing,
  getThingAll,
  getStringNoLocale,
  setStringNoLocale,
  setDatetime,
  removeThing,
  createSolidDataset,
  getDatetime
} from '@inrupt/solid-client'
import { DCTERMS } from '@inrupt/vocab-common-rdf'
import { solidAuth } from './solidAuth'

const BOOKMARK_NS = 'http://www.w3.org/2002/01/bookmark#'

export interface Bookmark {
  id: string
  title: string
  url: string
  createdAt: Date
}

class SolidBookmarksService {
  private getBookmarksUrl(webId: string): string {
    const podRoot = webId.split('/profile')[0]
    return `${podRoot}/toplocs/bookmarks`
  }

  /**
   * Get all bookmarks from Pod
   */
  async getBookmarks(): Promise<Bookmark[]> {
    const webId = solidAuth.getWebId()
    if (!webId) return []

    try {
      const bookmarksUrl = this.getBookmarksUrl(webId)
      const dataset = await getSolidDataset(bookmarksUrl, {
        fetch: solidAuth.getFetch()
      }).catch(() => null)

      if (!dataset) return []

      const things = getThingAll(dataset)
      return things.map(thing => ({
        id: thing.url,
        title: getStringNoLocale(thing, DCTERMS.title) || '',
        url: getStringNoLocale(thing, `${BOOKMARK_NS}recalls`) || '',
        createdAt: getDatetime(thing, DCTERMS.created) || new Date()
      })).filter(b => b.url)
    } catch (error) {
      console.error('Error loading bookmarks:', error)
      return []
    }
  }

  /**
   * Add bookmark to Pod
   */
  async addBookmark(bookmark: Omit<Bookmark, 'id' | 'createdAt'>): Promise<boolean> {
    const webId = solidAuth.getWebId()
    if (!webId) return false

    try {
      const bookmarksUrl = this.getBookmarksUrl(webId)
      let dataset = await getSolidDataset(bookmarksUrl, {
        fetch: solidAuth.getFetch()
      }).catch(() => createSolidDataset())

      const bookmarkId = `bookmark-${Date.now()}`
      let bookmarkThing = createThing({ name: bookmarkId })

      bookmarkThing = setStringNoLocale(bookmarkThing, DCTERMS.title, bookmark.title)
      bookmarkThing = setStringNoLocale(bookmarkThing, `${BOOKMARK_NS}recalls`, bookmark.url)
      bookmarkThing = setDatetime(bookmarkThing, DCTERMS.created, new Date())

      dataset = setThing(dataset, bookmarkThing)
      await saveSolidDatasetAt(bookmarksUrl, dataset, {
        fetch: solidAuth.getFetch()
      })

      return true
    } catch (error) {
      console.error('Error adding bookmark:', error)
      return false
    }
  }

  /**
   * Remove bookmark from Pod
   */
  async removeBookmark(bookmarkId: string): Promise<boolean> {
    const webId = solidAuth.getWebId()
    if (!webId) return false

    try {
      const bookmarksUrl = this.getBookmarksUrl(webId)
      let dataset = await getSolidDataset(bookmarksUrl, {
        fetch: solidAuth.getFetch()
      })

      dataset = removeThing(dataset, bookmarkId)
      await saveSolidDatasetAt(bookmarksUrl, dataset, {
        fetch: solidAuth.getFetch()
      })

      return true
    } catch (error) {
      console.error('Error removing bookmark:', error)
      return false
    }
  }

  /**
   * Check if URL is bookmarked
   */
  async isBookmarked(url: string): Promise<boolean> {
    const bookmarks = await this.getBookmarks()
    return bookmarks.some(b => b.url === url)
  }

  /**
   * Sync with localStorage bookmarks
   */
  async syncWithLocalStorage(): Promise<void> {
    const localBookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]')
    const podBookmarks = await this.getBookmarks()

    // Add local bookmarks to Pod if not exist
    for (const local of localBookmarks) {
      const exists = podBookmarks.some(pod => pod.url === local.url)
      if (!exists) {
        await this.addBookmark({ title: local.title, url: local.url })
      }
    }
  }

  /**
   * Export bookmarks to JSON
   */
  async exportToJSON(): Promise<string> {
    const bookmarks = await this.getBookmarks()
    return JSON.stringify({
      exportedAt: new Date().toISOString(),
      count: bookmarks.length,
      bookmarks: bookmarks.map(b => ({
        title: b.title,
        url: b.url,
        createdAt: b.createdAt
      }))
    }, null, 2)
  }

  /**
   * Import bookmarks from JSON
   */
  async importFromJSON(jsonString: string): Promise<{ success: number; failed: number }> {
    const result = { success: 0, failed: 0 }

    try {
      const data = JSON.parse(jsonString)
      const bookmarks = data.bookmarks || []

      for (const bookmark of bookmarks) {
        try {
          await this.addBookmark({
            title: bookmark.title,
            url: bookmark.url
          })
          result.success++
        } catch (error) {
          console.error('Failed to import bookmark:', bookmark, error)
          result.failed++
        }
      }
    } catch (error) {
      console.error('JSON parse error:', error)
      throw new Error('Invalid JSON format')
    }

    return result
  }

  /**
   * Download bookmarks as JSON file
   */
  downloadAsJSON(jsonString: string, filename: string = 'bookmarks.json'): void {
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
  }
}

export const solidBookmarks = new SolidBookmarksService()
