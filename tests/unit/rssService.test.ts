import { describe, it, expect, vi, beforeEach } from 'vitest'
import { RSSService } from '../../src/services/rssService'

describe('RSSService', () => {
  let service: RSSService

  beforeEach(() => {
    service = new RSSService()
    vi.clearAllMocks()
  })

  describe('fetchFeed', () => {
    it('should return empty array on fetch failure', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

      const articles = await service.fetchFeed('https://example.com/feed.xml')

      expect(articles).toEqual([])
    })

    it('should parse RSS feed successfully', async () => {
      const mockRSSResponse = {
        status: 'ok',
        feed: {
          url: 'https://example.com/feed',
          title: 'Test Feed',
          link: 'https://example.com',
          author: 'Test Author',
          description: 'Test Description'
        },
        items: [
          {
            title: 'Test Article',
            pubDate: new Date().toISOString(),
            link: 'https://example.com/article1',
            guid: 'article1',
            author: 'John Doe',
            thumbnail: 'https://example.com/image.jpg',
            description: 'This is a test article description',
            categories: ['tech', 'news']
          }
        ]
      }

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockRSSResponse
      } as Response)

      const articles = await service.fetchFeed('https://example.com/feed.xml')

      expect(articles).toHaveLength(1)
      expect(articles[0].title).toBe('Test Article')
      expect(articles[0].source).toBe('Test Feed')
      expect(articles[0].author).toBe('John Doe')
      expect(articles[0].topics).toContain('tech')
      expect(articles[0].imageUrl).toBe('https://example.com/image.jpg')
    })

    it('should add all extended fields to parsed articles', async () => {
      const mockRSSResponse = {
        status: 'ok',
        feed: { title: 'Test Feed', url: '', link: '' },
        items: [{
          title: 'How to build a REST API',
          pubDate: new Date().toISOString(),
          link: 'https://example.com/article',
          guid: 'article1',
          description: 'This is a tutorial on building REST APIs step by step for beginners',
          content: 'Full content here'.repeat(100)
        }]
      }

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockRSSResponse
      } as Response)

      const articles = await service.fetchFeed('https://example.com/feed.xml', 'Berlin')

      const article = articles[0]

      expect(article.contentType).toBeDefined()
      expect(article.difficulty).toBeDefined()
      expect(article.readingTime).toBeDefined()
      expect(article.content).toBeDefined()
      expect(article.resources).toBeDefined()
      expect(article.locations).toContain('Berlin')
    })

    it('should detect content type from title keywords', async () => {
      const testCases = [
        { title: 'Tutorial: Learn React', expectedType: 'tutorial' },
        { title: 'Case Study: Startup Success', expectedType: 'case-study' },
        { title: 'Research: AI in Healthcare', expectedType: 'research' },
        { title: 'React Library v18 Released', expectedType: 'library' },
        { title: 'How to guide for beginners', expectedType: 'tutorial' } // 'how to' returns tutorial
      ]

      for (const testCase of testCases) {
        const mockResponse = {
          status: 'ok',
          feed: { title: 'Test', url: '', link: '' },
          items: [{
            title: testCase.title,
            pubDate: new Date().toISOString(),
            link: 'https://example.com/article',
            guid: 'article1',
            description: testCase.title
          }]
        }

        global.fetch = vi.fn().mockResolvedValue({
          ok: true,
          json: async () => mockResponse
        } as Response)

        const articles = await service.fetchFeed('https://example.com/feed.xml')

        expect(articles[0].contentType).toBe(testCase.expectedType)
      }
    })

    it('should detect difficulty from keywords', async () => {
      const testCases = [
        { title: 'Introduction to Programming for Beginners', expected: 'beginner' },
        { title: 'Advanced Machine Learning Techniques', expected: 'advanced' },
        { title: 'Deep Dive into Kubernetes', expected: 'advanced' }
      ]

      for (const testCase of testCases) {
        const mockResponse = {
          status: 'ok',
          feed: { title: 'Test', url: '', link: '' },
          items: [{
            title: testCase.title,
            pubDate: new Date().toISOString(),
            link: 'https://example.com/article',
            guid: 'article1',
            description: testCase.title
          }]
        }

        global.fetch = vi.fn().mockResolvedValue({
          ok: true,
          json: async () => mockResponse
        } as Response)

        const articles = await service.fetchFeed('https://example.com/feed.xml')

        expect(articles[0].difficulty).toBe(testCase.expected)
      }
    })

    it('should estimate reading time from content', async () => {
      const shortContent = 'Short article. '.repeat(50) // ~100 words
      const longContent = 'Long article. '.repeat(500) // ~1000 words

      const testCases = [
        { content: shortContent, minTime: 1, maxTime: 5 },
        { content: longContent, minTime: 4, maxTime: 10 }
      ]

      for (const testCase of testCases) {
        const mockResponse = {
          status: 'ok',
          feed: { title: 'Test', url: '', link: '' },
          items: [{
            title: 'Test Article',
            pubDate: new Date().toISOString(),
            link: 'https://example.com/article',
            guid: 'article1',
            content: testCase.content
          }]
        }

        global.fetch = vi.fn().mockResolvedValue({
          ok: true,
          json: async () => mockResponse
        } as Response)

        const articles = await service.fetchFeed('https://example.com/feed.xml')

        expect(articles[0].readingTime).toBeGreaterThanOrEqual(testCase.minTime)
        expect(articles[0].readingTime).toBeLessThanOrEqual(testCase.maxTime)
      }
    })

    it('should provide placeholder image if none available', async () => {
      const mockResponse = {
        status: 'ok',
        feed: { title: 'Test', url: '', link: '' },
        items: [{
          title: 'Tech News',
          pubDate: new Date().toISOString(),
          link: 'https://example.com/article',
          guid: 'article1',
          description: 'Technology article',
          categories: ['tech']
        }]
      }

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      } as Response)

      const articles = await service.fetchFeed('https://example.com/feed.xml')

      expect(articles[0].imageUrl).toBeDefined()
      expect(articles[0].imageUrl).toMatch(/^https?:\/\//)
    })

    it('should clean HTML from title and description', async () => {
      const mockResponse = {
        status: 'ok',
        feed: { title: 'Test', url: '', link: '' },
        items: [{
          title: '<p>Test <strong>Article</strong></p>',
          pubDate: new Date().toISOString(),
          link: 'https://example.com/article',
          guid: 'article1',
          description: '<div>Test <em>description</em> with <a href="#">link</a></div>'
        }]
      }

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      } as Response)

      const articles = await service.fetchFeed('https://example.com/feed.xml')

      expect(articles[0].title).not.toContain('<')
      expect(articles[0].title).not.toContain('>')
      expect(articles[0].summary).not.toContain('<')
      expect(articles[0].summary).not.toContain('>')
    })
  })

  describe('fetchMultipleFeeds', () => {
    it('should fetch multiple feeds in parallel', async () => {
      const mockResponse = {
        status: 'ok',
        feed: { title: 'Test', url: '', link: '' },
        items: [{
          title: 'Article',
          pubDate: new Date().toISOString(),
          link: 'https://example.com/article',
          guid: 'article1'
        }]
      }

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      } as Response)

      const feeds = [
        { url: 'https://feed1.com/rss' },
        { url: 'https://feed2.com/rss' },
        { url: 'https://feed3.com/rss' }
      ]

      const articles = await service.fetchMultipleFeeds(feeds)

      expect(global.fetch).toHaveBeenCalledTimes(3)
      expect(articles.length).toBeGreaterThan(0)
    })

    it('should handle partial failures gracefully', async () => {
      let callCount = 0

      global.fetch = vi.fn().mockImplementation(() => {
        callCount++
        if (callCount === 2) {
          return Promise.reject(new Error('Network error'))
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({
            status: 'ok',
            feed: { title: 'Test', url: '', link: '' },
            items: [{
              title: 'Article',
              pubDate: new Date().toISOString(),
              link: 'https://example.com/article',
              guid: 'article1'
            }]
          })
        } as Response)
      })

      const feeds = [
        { url: 'https://feed1.com/rss' },
        { url: 'https://feed2.com/rss' },
        { url: 'https://feed3.com/rss' }
      ]

      const articles = await service.fetchMultipleFeeds(feeds)

      // Should have articles from 2 successful feeds
      expect(articles.length).toBeGreaterThan(0)
    })

    it('should sort articles by publish date', async () => {
      const now = Date.now()

      global.fetch = vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            status: 'ok',
            feed: { title: 'Test', url: '', link: '' },
            items: [{
              title: 'Old Article',
              pubDate: new Date(now - 86400000).toISOString(),
              link: 'https://example.com/old',
              guid: 'old'
            }]
          })
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            status: 'ok',
            feed: { title: 'Test', url: '', link: '' },
            items: [{
              title: 'New Article',
              pubDate: new Date(now).toISOString(),
              link: 'https://example.com/new',
              guid: 'new'
            }]
          })
        } as Response)

      const feeds = [
        { url: 'https://feed1.com/rss' },
        { url: 'https://feed2.com/rss' }
      ]

      const articles = await service.fetchMultipleFeeds(feeds)

      // Newest first
      expect(articles[0].title).toBe('New Article')
      expect(articles[1].title).toBe('Old Article')
    })
  })

  describe('category detection', () => {
    it('should detect tech category', async () => {
      const techKeywords = ['software', 'tech', 'digital', 'programming']

      for (const keyword of techKeywords) {
        const mockResponse = {
          status: 'ok',
          feed: { title: 'Test', url: '', link: '' },
          items: [{
            title: `Article about ${keyword}`,
            pubDate: new Date().toISOString(),
            link: 'https://example.com/article',
            guid: 'article1',
            description: `This is about ${keyword}`
          }]
        }

        global.fetch = vi.fn().mockResolvedValue({
          ok: true,
          json: async () => mockResponse
        } as Response)

        const articles = await service.fetchFeed('https://example.com/feed.xml')

        // Category detection affects content type
        expect(articles[0].contentType).toBeDefined()
      }
    })
  })

  describe('performance', () => {
    it('should fetch feed quickly', async () => {
      const mockResponse = {
        status: 'ok',
        feed: { title: 'Test', url: '', link: '' },
        items: Array(10).fill(null).map((_, i) => ({
          title: `Article ${i}`,
          pubDate: new Date().toISOString(),
          link: `https://example.com/article${i}`,
          guid: `article${i}`
        }))
      }

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      } as Response)

      const start = Date.now()
      await service.fetchFeed('https://example.com/feed.xml')
      const duration = Date.now() - start

      expect(duration).toBeLessThan(100)
    })
  })
})
