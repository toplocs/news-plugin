import { describe, it, expect, beforeEach } from 'vitest'
import { NewsService } from '../../src/services/newsService'

describe('NewsService', () => {
  let service: NewsService

  beforeEach(() => {
    service = new NewsService()
  })

  describe('generateMockArticles', () => {
    it('should generate correct number of articles', async () => {
      const articles = await service.searchByInterests(['tech'])

      expect(articles).toBeDefined()
      expect(articles.length).toBeGreaterThan(0)
      expect(articles.length).toBeLessThanOrEqual(20)
    })

    it('should generate articles with all required fields', async () => {
      const articles = await service.searchByInterests(['tech'])
      const article = articles[0]

      expect(article.id).toBeDefined()
      expect(article.title).toBeDefined()
      expect(article.summary).toBeDefined()
      expect(article.content).toBeDefined()
      expect(article.url).toBeDefined()
      expect(article.source).toBeDefined()
      expect(article.author).toBeDefined()
      expect(article.publishedAt).toBeDefined()
      expect(article.topics).toBeDefined()
      expect(article.locations).toBeDefined()
      expect(article.tags).toBeDefined()
    })

    it('should generate articles with extended content fields', async () => {
      const articles = await service.searchByInterests(['tech'])
      const article = articles[0]

      expect(article.contentType).toBeDefined()
      expect(article.difficulty).toBeDefined()
      expect(article.readingTime).toBeDefined()
      expect(article.readingTime).toBeGreaterThan(0)
      expect(article.resources).toBeDefined()
      expect(Array.isArray(article.resources)).toBe(true)
    })

    it('should generate articles with realistic locations', async () => {
      const articles = await service.searchByInterests(['tech'])

      articles.forEach(article => {
        expect(article.coordinates).toBeDefined()
        expect(article.coordinates?.lat).toBeDefined()
        expect(article.coordinates?.lng).toBeDefined()
        expect(article.coordinates!.lat).toBeGreaterThanOrEqual(-90)
        expect(article.coordinates!.lat).toBeLessThanOrEqual(90)
        expect(article.coordinates!.lng).toBeGreaterThanOrEqual(-180)
        expect(article.coordinates!.lng).toBeLessThanOrEqual(180)
      })
    })

    it('should generate articles with appropriate content types', async () => {
      const articles = await service.searchByInterests(['tech', 'science'])

      const contentTypes = new Set(articles.map(a => a.contentType))

      expect(contentTypes.size).toBeGreaterThan(1) // Multiple content types
      expect(Array.from(contentTypes).every(type =>
        ['news', 'tutorial', 'case-study', 'research', 'library', 'video', 'guide'].includes(type!)
      )).toBe(true)
    })

    it('should generate unique article IDs', async () => {
      const articles = await service.searchByInterests(['tech'])
      const ids = articles.map(a => a.id)
      const uniqueIds = new Set(ids)

      expect(ids.length).toBe(uniqueIds.size)
    })

    it('should generate articles with reading time', async () => {
      const articles = await service.searchByInterests(['tech'])

      articles.forEach(article => {
        expect(article.readingTime).toBeDefined()
        expect(article.readingTime!).toBeGreaterThan(0)
        expect(article.readingTime!).toBeLessThan(60) // Reasonable max
      })
    })

    it('should generate articles with difficulty levels', async () => {
      const articles = await service.searchByInterests(['tech'])

      articles.forEach(article => {
        expect(article.difficulty).toBeDefined()
        expect(['beginner', 'intermediate', 'advanced']).toContain(article.difficulty)
      })
    })
  })

  describe('searchByInterests', () => {
    it('should filter articles by interests', async () => {
      const techArticles = await service.searchByInterests(['tech'])

      expect(techArticles.length).toBeGreaterThan(0)

      // At least some articles should have tech-related topics
      const hasTechTopics = techArticles.some(article =>
        article.topics.some(topic =>
          topic.toLowerCase().includes('tech') ||
          topic.toLowerCase().includes('software') ||
          topic.toLowerCase().includes('digital')
        )
      )

      expect(hasTechTopics).toBe(true)
    })

    it('should handle multiple interests', async () => {
      const articles = await service.searchByInterests(['tech', 'science', 'business'])

      expect(articles.length).toBeGreaterThan(0)
    })

    it('should handle empty interests array', async () => {
      const articles = await service.searchByInterests([])

      expect(articles.length).toBeGreaterThan(0) // Should still return articles
    })
  })

  describe('getSources', () => {
    it('should return enabled sources', () => {
      const sources = service.getSources()

      expect(sources).toBeDefined()
      expect(Array.isArray(sources)).toBe(true)
      expect(sources.length).toBeGreaterThan(0)
      expect(sources.every(s => s.enabled)).toBe(true)
    })
  })

  describe('content generation', () => {
    it('should generate long-form content', async () => {
      const articles = await service.searchByInterests(['tech'])
      const article = articles[0]

      expect(article.content).toBeDefined()
      expect(article.content!.length).toBeGreaterThan(500) // At least 500 chars

      // Should have multiple paragraphs
      const paragraphs = article.content!.split('\n\n')
      expect(paragraphs.length).toBeGreaterThan(5)
    })

    it('should generate resources for library content', async () => {
      const articles = await service.searchByInterests(['tech'])
      const libraryArticles = articles.filter(a => a.contentType === 'library')

      if (libraryArticles.length > 0) {
        const article = libraryArticles[0]
        expect(article.resources!.length).toBeGreaterThan(0)

        const resource = article.resources![0]
        expect(resource.name).toBeDefined()
        expect(resource.url).toBeDefined()
        expect(resource.description).toBeDefined()
      }
    })
  })

  describe('article metadata', () => {
    it('should generate publishedAt timestamps', async () => {
      const articles = await service.searchByInterests(['tech'])
      const now = Date.now()

      articles.forEach(article => {
        expect(article.publishedAt).toBeDefined()
        expect(article.publishedAt).toBeLessThanOrEqual(now)

        // Should be within last 14 days
        const twoWeeksAgo = now - (14 * 24 * 60 * 60 * 1000)
        expect(article.publishedAt).toBeGreaterThan(twoWeeksAgo)
      })
    })

    it('should generate valid URLs', async () => {
      const articles = await service.searchByInterests(['tech'])

      articles.forEach(article => {
        expect(article.url).toBeDefined()
        expect(article.url).toMatch(/^https?:\/\//)
      })
    })

    it('should generate image URLs', async () => {
      const articles = await service.searchByInterests(['tech'])

      articles.forEach(article => {
        expect(article.imageUrl).toBeDefined()
        expect(article.imageUrl).toMatch(/^https?:\/\//)
      })
    })
  })

  describe('performance', () => {
    it('should generate articles quickly', async () => {
      const start = Date.now()
      await service.searchByInterests(['tech', 'science', 'business'])
      const duration = Date.now() - start

      expect(duration).toBeLessThan(100) // Should be very fast
    })
  })
})
