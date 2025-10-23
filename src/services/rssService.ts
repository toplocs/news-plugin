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
  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
  private cache = new Map<string, { data: NewsArticle[]; timestamp: number }>()

  /**
   * Fetch and parse RSS feed with caching
   */
  async fetchFeed(feedUrl: string, location?: string): Promise<NewsArticle[]> {
    // Check cache first
    const cacheKey = `${feedUrl}_${location || 'default'}`
    const cached = this.cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      console.log(`📦 RSS Cache HIT for ${feedUrl}`)
      return cached.data
    }

    try {
      // ✅ Validate feed URL
      if (!feedUrl || !feedUrl.startsWith('http')) {
        console.error(`❌ Invalid RSS feed URL: ${feedUrl}`)
        return []
      }

      const url = `${this.RSS2JSON_API}?rss_url=${encodeURIComponent(feedUrl)}&count=${this.MAX_ITEMS}&api_key=no`

      // ✅ Add timeout to fetch (10 seconds)
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        // ✅ Detailed error messages
        if (response.status === 429) {
          console.error(`❌ RSS rate limit exceeded for ${feedUrl}`)
        } else if (response.status === 404) {
          console.error(`❌ RSS feed not found: ${feedUrl}`)
        } else if (response.status >= 500) {
          console.error(`❌ RSS server error (${response.status}) for ${feedUrl}`)
        } else {
          console.error(`❌ RSS fetch failed: ${response.status} ${response.statusText}`)
        }
        return []
      }

      const data: RSSFeed = await response.json()

      // ✅ Validate RSS response
      if (!data || typeof data !== 'object') {
        console.error(`❌ Invalid RSS response format for ${feedUrl}`)
        return []
      }

      if (data.status !== 'ok') {
        console.warn(`⚠️  RSS feed status not OK for ${feedUrl}: ${data.status}`)
        return []
      }

      if (!data.items || !Array.isArray(data.items)) {
        console.error(`❌ RSS feed has no items array for ${feedUrl}`)
        return []
      }

      const articles = this.convertToArticles(data, location)

      // ✅ Only cache if we got valid articles
      if (articles.length > 0) {
        this.cache.set(cacheKey, {
          data: articles,
          timestamp: Date.now()
        })
        console.log(`✅ RSS fetched ${articles.length} articles from ${feedUrl}`)
      } else {
        console.warn(`⚠️  RSS returned 0 articles from ${feedUrl}`)
      }

      return articles

    } catch (error) {
      // ✅ Detailed error handling
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          console.error(`❌ RSS fetch timeout (10s) for ${feedUrl}`)
        } else if (error.message.includes('Failed to fetch')) {
          console.error(`❌ Network error fetching RSS ${feedUrl}`)
        } else {
          console.error(`❌ RSS fetch error for ${feedUrl}:`, error.message)
        }
      } else {
        console.error(`❌ Unknown error fetching RSS ${feedUrl}:`, error)
      }
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
    return feed.items.map(item => {
      const category = this.detectCategory(item)
      const contentType = this.determineContentType(item, category)
      const difficulty = this.determineDifficulty(item)

      return {
        id: this.generateId(item.guid || item.link),
        title: this.cleanTitle(item.title),
        summary: this.extractSummary(item.description || item.content || ''),
        content: this.extractFullContent(item),
        url: item.link,
        source: feed.feed.title || 'RSS Feed',
        imageUrl: this.extractImage(item) || this.getPlaceholderImage(category),
        author: item.author || feed.feed.author || 'Redaktion',
        publishedAt: new Date(item.pubDate).getTime(),
        topics: item.categories || ['news'],
        locations: location ? [location] : [],
        tags: this.extractTags(item),
        // 📚 ERWEITERTE FELDER
        contentType,
        difficulty,
        readingTime: this.estimateReadingTime(item.content || item.description || ''),
        resources: [],
        relatedContent: []
      }
    })
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

  /**
   * Detect category from item data
   */
  private detectCategory(item: RSSItem): string {
    const allText = `${item.title} ${item.description || ''} ${(item.categories || []).join(' ')}`.toLowerCase()

    if (allText.includes('tech') || allText.includes('software') || allText.includes('digital')) return 'tech'
    if (allText.includes('local') || allText.includes('community') || allText.includes('stadt')) return 'local'
    if (allText.includes('science') || allText.includes('research') || allText.includes('studie')) return 'science'
    if (allText.includes('business') || allText.includes('wirtschaft') || allText.includes('market')) return 'business'
    if (allText.includes('kultur') || allText.includes('culture') || allText.includes('art')) return 'culture'

    return 'news'
  }

  /**
   * Determine content type from item
   */
  private determineContentType(item: RSSItem, category: string): 'news' | 'tutorial' | 'case-study' | 'research' | 'library' | 'video' | 'guide' {
    const title = item.title.toLowerCase()
    const desc = (item.description || '').toLowerCase()

    if (title.includes('tutorial') || title.includes('how to') || title.includes('guide')) return 'tutorial'
    if (title.includes('case study') || title.includes('fallstudie')) return 'case-study'
    if (title.includes('research') || title.includes('study') || title.includes('forschung')) return 'research'
    if (title.includes('library') || title.includes('framework') || title.includes('tool')) return 'library'
    if (title.includes('video') || item.enclosure?.type?.startsWith('video/')) return 'video'
    if (desc.includes('step by step') || desc.includes('schritt für schritt')) return 'guide'

    // Category-based fallback
    if (category === 'science') return Math.random() < 0.5 ? 'research' : 'news'
    if (category === 'tech') return Math.random() < 0.3 ? 'tutorial' : 'news'

    return 'news'
  }

  /**
   * Determine difficulty level from content
   */
  private determineDifficulty(item: RSSItem): 'beginner' | 'intermediate' | 'advanced' {
    const text = `${item.title} ${item.description || ''}`.toLowerCase()

    if (text.includes('beginner') || text.includes('anfänger') || text.includes('introduction') || text.includes('basics')) return 'beginner'
    if (text.includes('advanced') || text.includes('expert') || text.includes('fortgeschritten') || text.includes('deep dive')) return 'advanced'

    // Default to intermediate
    return 'intermediate'
  }

  /**
   * Estimate reading time based on content length
   */
  private estimateReadingTime(content: string): number {
    const text = content.replace(/<[^>]*>/g, '')
    const wordCount = text.split(/\s+/).length
    // Average reading speed: 200 words per minute
    return Math.max(3, Math.ceil(wordCount / 200))
  }

  /**
   * Extract full content from RSS item
   */
  private extractFullContent(item: RSSItem): string {
    const content = item.content || item.description || ''
    // Remove HTML tags but keep structure with paragraphs
    return content
      .replace(/<br\s*\/?>/gi, '\n\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim()
  }

  /**
   * Get placeholder image based on category
   */
  private getPlaceholderImage(category: string): string {
    const placeholders: Record<string, string> = {
      'tech': 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=400&fit=crop',
      'science': 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=600&h=400&fit=crop',
      'business': 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&h=400&fit=crop',
      'culture': 'https://images.unsplash.com/photo-1499364615650-ec38552f4f34?w=600&h=400&fit=crop',
      'local': 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=600&h=400&fit=crop',
      'news': 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&h=400&fit=crop'
    }

    return placeholders[category] || placeholders['news']
  }
}

export const rssService = new RSSService()
