import type { NewsArticle } from '../types'

/**
 * RSS Service - Fetches and parses RSS feeds
 * Uses rss2json.com API to bypass CORS restrictions
 */

interface RSSItem {
  title: string
  pubDate: string
  link: string
  guid: string
  author?: string
  thumbnail?: string
  description?: string
  content?: string
  enclosure?: {
    link: string
    type: string
  }
  categories?: string[]
}

interface RSSFeed {
  status: string
  feed: {
    url: string
    title: string
    link: string
    author?: string
    description?: string
    image?: string
  }
  items: RSSItem[]
}

export class RSSService {
  private readonly RSS2JSON_API = 'https://api.rss2json.com/v1/api.json'
  private readonly MAX_ITEMS = 10

  /**
   * Fetch and parse RSS feed
   */
  async fetchFeed(feedUrl: string, location?: string): Promise<NewsArticle[]> {
    try {
      const url = `${this.RSS2JSON_API}?rss_url=${encodeURIComponent(feedUrl)}&count=${this.MAX_ITEMS}`

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`RSS fetch failed: ${response.statusText}`)
      }

      const data: RSSFeed = await response.json()

      if (data.status !== 'ok') {
        throw new Error('RSS feed parsing failed')
      }

      return this.convertToArticles(data, location)
    } catch (error) {
      console.error('Failed to fetch RSS feed:', feedUrl, error)
      return []
    }
  }

  /**
   * Fetch multiple feeds in parallel
   */
  async fetchMultipleFeeds(
    feeds: Array<{ url: string; location?: string }>,
  ): Promise<NewsArticle[]> {
    const promises = feeds.map(feed => this.fetchFeed(feed.url, feed.location))
    const results = await Promise.allSettled(promises)

    return results
      .filter(result => result.status === 'fulfilled')
      .flatMap(result => (result as PromiseFulfilledResult<NewsArticle[]>).value)
      .sort((a, b) => b.publishedAt - a.publishedAt)
  }

  /**
   * Convert RSS items to NewsArticle format
   */
  private convertToArticles(feed: RSSFeed, location?: string): NewsArticle[] {
    return feed.items.map(item => ({
      id: this.generateId(item.guid || item.link),
      title: this.cleanTitle(item.title),
      summary: this.extractSummary(item.description || item.content || ''),
      url: item.link,
      source: feed.feed.title || 'RSS Feed',
      imageUrl: this.extractImage(item),
      author: item.author || feed.feed.author,
      publishedAt: new Date(item.pubDate).getTime(),
      topics: item.categories || ['news'],
      locations: location ? [location] : [],
      tags: this.extractTags(item)
    }))
  }

  /**
   * Generate consistent article ID from GUID/URL
   */
  private generateId(guid: string): string {
    return `rss_${btoa(guid).replace(/[^a-zA-Z0-9]/g, '').slice(0, 16)}`
  }

  /**
   * Clean HTML tags from title
   */
  private cleanTitle(title: string): string {
    return title.replace(/<[^>]*>/g, '').trim()
  }

  /**
   * Extract summary from HTML content
   */
  private extractSummary(html: string): string {
    // Remove HTML tags
    const text = html.replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()

    // Limit to ~200 characters
    if (text.length > 200) {
      return text.slice(0, 197) + '...'
    }

    return text
  }

  /**
   * Extract image from RSS item
   */
  private extractImage(item: RSSItem): string | undefined {
    // Check thumbnail
    if (item.thumbnail) {
      return item.thumbnail
    }

    // Check enclosure
    if (item.enclosure?.type?.startsWith('image/')) {
      return item.enclosure.link
    }

    // Extract from content/description
    const content = item.content || item.description || ''
    const imgMatch = content.match(/<img[^>]+src="([^">]+)"/i)
    if (imgMatch) {
      return imgMatch[1]
    }

    return undefined
  }

  /**
   * Extract tags from categories and content
   */
  private extractTags(item: RSSItem): string[] {
    const tags: string[] = []

    if (item.categories) {
      tags.push(...item.categories.slice(0, 3))
    }

    return tags
  }
}

export const rssService = new RSSService()
