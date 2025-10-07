import type { NewsArticle, NewsSource } from '../types'

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
        id: 'local',
        name: 'Local News',
        url: 'https://example.com/rss',
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
  async fetchFromRSS(url: string): Promise<NewsArticle[]> {
    try {
      // In a real implementation, you would parse RSS here
      // For now, return mock data
      return this.generateMockArticles(3)
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
      'Local Community Center Opens New Facilities',
      'City Council Announces Green Initiative',
      'Tech Startup Launches in Downtown Area',
      'New Restaurant Brings Authentic Cuisine to Town',
      'Schools Report Improved Test Scores',
      'Local Artist Wins National Award',
      'Public Transit Expansion Plans Revealed',
      'Community Garden Project Gains Support',
      'Historical Building Renovation Complete',
      'Youth Sports Program Sees Record Participation'
    ]

    const sources = ['Local News', 'Community Post', 'City Herald', 'Downtown Journal']

    for (let i = 0; i < count; i++) {
      const randomTitle = titles[Math.floor(Math.random() * titles.length)]
      const randomSource = sources[Math.floor(Math.random() * sources.length)]

      articles.push({
        id: `article_${Date.now()}_${i}`,
        title: randomTitle,
        summary: `${randomTitle.slice(0, 100)}... Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.`,
        url: `https://example.com/article/${i}`,
        source: randomSource,
        imageUrl: Math.random() > 0.5 ? `https://via.placeholder.com/400x300?text=Article+${i}` : undefined,
        author: Math.random() > 0.5 ? 'John Doe' : undefined,
        publishedAt: now - Math.random() * 86400000 * 7, // Random time in last week
        topics: context?.interests || ['community', 'local'],
        locations: ['default_location'],
        tags: ['news', 'local', 'community'].slice(0, Math.floor(Math.random() * 3) + 1)
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
