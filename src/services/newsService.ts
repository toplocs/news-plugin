import type { NewsArticle, NewsSource } from '../types'
import { rssService } from './rssService'

/**
 * News Service - Handles fetching and processing news from various sources
 */

export class NewsService {
  private sources: NewsSource[] = []

  constructor() {
    this.initDefaultSources()
  }

  private initDefaultSources() {
    this.sources = [
      {
        id: 'tagesschau',
        name: 'Tagesschau',
        url: 'https://www.tagesschau.de/xml/rss2/',
        type: 'rss',
        enabled: true
      },
      {
        id: 'spiegel',
        name: 'Der Spiegel',
        url: 'https://www.spiegel.de/schlagzeilen/index.rss',
        type: 'rss',
        enabled: true
      },
      {
        id: 'zeit',
        name: 'Die Zeit',
        url: 'https://www.zeit.de/index',
        type: 'rss',
        enabled: false // May not work due to CORS
      },
      {
        id: 'heise',
        name: 'Heise Online',
        url: 'https://www.heise.de/rss/heise-atom.xml',
        type: 'rss',
        enabled: true
      },
      {
        id: 'community',
        name: 'Community Posts',
        url: 'gun://community/news',
        type: 'api',
        enabled: true
      }
    ]
  }

  /**
   * Fetch news articles from RSS feed
   */
  async fetchFromRSS(url: string, location?: string): Promise<NewsArticle[]> {
    try {
      return await rssService.fetchFeed(url, location)
    } catch (error) {
      console.error('Failed to fetch RSS:', error)
      return []
    }
  }

  /**
   * Fetch news from API
   */
  async fetchFromAPI(url: string, params?: Record<string, any>): Promise<NewsArticle[]> {
    try {
      // In a real implementation, you would call the API here
      return this.generateMockArticles(5)
    } catch (error) {
      console.error('Failed to fetch from API:', error)
      return []
    }
  }

  /**
   * Scrape news from website
   */
  async scrapeWebsite(url: string): Promise<NewsArticle[]> {
    try {
      // Note: Web scraping in browser is limited due to CORS
      // In production, this would be handled by a backend service
      return this.generateMockArticles(2)
    } catch (error) {
      console.error('Failed to scrape website:', error)
      return []
    }
  }

  /**
   * Search news by location
   */
  async searchByLocation(
    lat: number,
    lng: number,
    radius: number
  ): Promise<NewsArticle[]> {
    // In production, this would query a location-aware news API
    return this.generateMockArticles(4, { location: { lat, lng, radius } })
  }

  /**
   * Search news by interests
   */
  async searchByInterests(interests: string[]): Promise<NewsArticle[]> {
    // In production, this would use semantic search
    return this.generateMockArticles(3, { interests })
  }

  /**
   * Fetch all news from enabled RSS sources
   */
  async fetchAllRSS(location?: string): Promise<NewsArticle[]> {
    const rssFeeds = this.sources
      .filter(s => s.enabled && s.type === 'rss')
      .map(s => ({ url: s.url, location }))

    if (rssFeeds.length === 0) {
      return []
    }

    return await rssService.fetchMultipleFeeds(rssFeeds)
  }

  /**
   * Extract metadata from URL
   */
  async extractMetadata(url: string): Promise<Partial<NewsArticle>> {
    try {
      // In production, this would fetch and parse Open Graph tags, etc.
      return {
        title: 'Sample Article Title',
        summary: 'This is a sample article summary...',
        imageUrl: 'https://via.placeholder.com/400x300',
        source: 'Example Source'
      }
    } catch (error) {
      console.error('Failed to extract metadata:', error)
      return {}
    }
  }

  /**
   * Generate mock articles for development
   */
  private generateMockArticles(count: number, context?: any): NewsArticle[] {
    const articles: NewsArticle[] = []
    const now = Date.now()

    const titles = [
      '🔥 Breaking: Neues Community Center eröffnet in Mitte',
      'Stadtrat beschließt Green Initiative für Berlin',
      'Tech Startup revolutioniert Local News in Kreuzberg',
      'Authentisches Restaurant eröffnet am Alexanderplatz',
      'Schulen melden verbesserte Testergebnisse',
      'Berliner Künstler gewinnt nationalen Preis',
      'U-Bahn Erweiterung: Neue Pläne enthüllt',
      'Community Garden Projekt begeistert Nachbarschaft',
      'Historisches Gebäude: Renovierung abgeschlossen',
      'Jugendsport-Programm: Rekord-Teilnehmerzahl'
    ]

    const sources = ['Berliner Morgenpost', 'Community Post', 'TagesspiEGEL', 'Kiez News']
    const authors = ['Anna Schmidt', 'Max Müller', 'Lisa Weber', 'Tom Fischer']
    const locations = ['Berlin Mitte', 'Kreuzberg', 'Prenzlauer Berg', 'Friedrichshain']

    for (let i = 0; i < count; i++) {
      const randomTitle = titles[Math.floor(Math.random() * titles.length)]
      const randomSource = sources[Math.floor(Math.random() * sources.length)]
      const randomAuthor = authors[Math.floor(Math.random() * authors.length)]
      const randomLocation = locations[Math.floor(Math.random() * locations.length)]
      const isBreaking = i === 0 && Math.random() > 0.7

      const baseTags = ['news', 'local']
      if (isBreaking) baseTags.push('breaking')
      if (context?.interests) baseTags.push(...context.interests.slice(0, 2))

      articles.push({
        id: `article_${Date.now()}_${i}`,
        title: randomTitle.replace('🔥 Breaking: ', ''),
        summary: `In ${randomLocation} gibt es spannende Neuigkeiten: ${randomTitle}. Die Community reagiert begeistert auf diese Entwicklung. Weitere Details folgen.`,
        url: `https://example.com/article/${i}`,
        source: randomSource,
        imageUrl: `https://picsum.photos/seed/${i}/600/400`,
        author: randomAuthor,
        publishedAt: now - Math.random() * 86400000 * 7,
        topics: context?.interests || ['community', 'local'],
        locations: [randomLocation],
        tags: baseTags.slice(0, Math.min(3, baseTags.length))
      })
    }

    return articles
  }

  /**
   * Get all enabled sources
   */
  getSources(): NewsSource[] {
    return this.sources.filter(s => s.enabled)
  }

  /**
   * Add a new source
   */
  addSource(source: NewsSource) {
    this.sources.push(source)
  }

  /**
   * Update source
   */
  updateSource(id: string, updates: Partial<NewsSource>) {
    const index = this.sources.findIndex(s => s.id === id)
    if (index > -1) {
      this.sources[index] = { ...this.sources[index], ...updates }
    }
  }

  /**
   * Remove source
   */
  removeSource(id: string) {
    this.sources = this.sources.filter(s => s.id !== id)
  }
}

export const newsService = new NewsService()
