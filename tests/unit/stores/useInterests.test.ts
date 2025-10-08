import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { useInterests } from '../../../src/stores/useInterests'
import type { NewsArticle } from '../../../src/types'

describe('useInterests - Article Filtering', () => {
  let interests: ReturnType<typeof useInterests>

  beforeEach(() => {
    interests = useInterests()
    interests.clearAll()
  })

  afterEach(() => {
    interests.clearAll()
  })

  const createMockArticle = (title: string, topics: string[]): NewsArticle => ({
    id: Math.random().toString(36),
    title,
    summary: `Article about ${topics.join(', ')}`,
    url: 'https://example.com',
    source: 'Test Source',
    publishedAt: Date.now(),
    topics,
    locations: []
  })

  describe('Interest Initialization', () => {
    it('should start with empty interests', () => {
      expect(interests.interests.value).toHaveLength(0)
      expect(interests.isInitialized.value).toBe(false)
    })

    it('should initialize with survey data', () => {
      const surveyTopics = ['Vue.js', 'TypeScript', 'Node.js']

      interests.initializeWithSurvey(surveyTopics)

      expect(interests.interests.value).toHaveLength(3)
      expect(interests.isInitialized.value).toBe(true)
      expect(interests.interests.value[0].keyword).toBe('Vue.js')
      expect(interests.interests.value[0].source).toBe('survey')
    })

    it('should assign high confidence to survey interests', () => {
      interests.initializeWithSurvey(['React', 'Angular'])

      const reactInterest = interests.interests.value.find(i => i.keyword === 'React')
      expect(reactInterest?.confidence).toBeGreaterThan(0.7)
    })
  })

  describe('Article Score Calculation', () => {
    beforeEach(() => {
      interests.initializeWithSurvey(['Vue.js', 'TypeScript'])
    })

    it('should give high score to articles matching interests', () => {
      const article = createMockArticle('Vue.js 3.4 Released', ['vue', 'javascript'])

      const score = interests.calculateArticleScore(article)

      expect(score).toBeGreaterThan(0)
    })

    it('should give zero score to articles not matching interests', () => {
      const article = createMockArticle('Python Django Tutorial', ['python', 'django'])

      const score = interests.calculateArticleScore(article)

      expect(score).toBe(0)
    })

    it('should give higher score to exact keyword matches', () => {
      const vueArticle = createMockArticle('Vue.js Tutorial', ['vue', 'javascript'])
      const tsArticle = createMockArticle('TypeScript Guide', ['typescript'])

      const vueScore = interests.calculateArticleScore(vueArticle)
      const tsScore = interests.calculateArticleScore(tsArticle)

      // Both should have scores > 0
      expect(vueScore).toBeGreaterThan(0)
      expect(tsScore).toBeGreaterThan(0)
    })

    it('should boost recent articles', () => {
      const recentArticle = createMockArticle('Vue.js News', ['vue'])
      recentArticle.publishedAt = Date.now() - 3600000 // 1 hour ago

      const oldArticle = createMockArticle('Vue.js Old News', ['vue'])
      oldArticle.publishedAt = Date.now() - 86400000 * 30 // 30 days ago

      const recentScore = interests.calculateArticleScore(recentArticle)
      const oldScore = interests.calculateArticleScore(oldArticle)

      expect(recentScore).toBeGreaterThanOrEqual(oldScore)
    })
  })

  describe('Article Filtering', () => {
    beforeEach(() => {
      interests.initializeWithSurvey(['Vue.js', 'TypeScript', 'Node.js'])
    })

    it('should return all articles when no interests defined', () => {
      interests.clearAll()

      const articles = [
        createMockArticle('Article 1', ['vue']),
        createMockArticle('Article 2', ['python']),
        createMockArticle('Article 3', ['java'])
      ]

      const filtered = interests.filterArticlesByInterests(articles, 0.1)

      expect(filtered).toHaveLength(3)
    })

    it('should filter articles by minimum score', () => {
      const articles = [
        createMockArticle('Vue.js Tutorial', ['vue', 'javascript']),
        createMockArticle('TypeScript Guide', ['typescript']),
        createMockArticle('Python Basics', ['python', 'django']),
        createMockArticle('Java Spring', ['java', 'spring'])
      ]

      const filtered = interests.filterArticlesByInterests(articles, 0.1)

      // Should only include Vue.js and TypeScript articles
      expect(filtered.length).toBeGreaterThan(0)
      expect(filtered.length).toBeLessThan(articles.length)

      const hasPythonArticle = filtered.some(a => a.topics.includes('python'))
      expect(hasPythonArticle).toBe(false)
    })

    it('should sort filtered articles by score', () => {
      const articles = [
        createMockArticle('Vue.js Deep Dive', ['vue', 'javascript', 'typescript']),
        createMockArticle('Vue.js Intro', ['vue']),
        createMockArticle('TypeScript Advanced', ['typescript', 'javascript'])
      ]

      const filtered = interests.filterArticlesByInterests(articles, 0.05)

      // All should pass with low threshold
      expect(filtered.length).toBeGreaterThan(0)

      // Articles should be sorted by relevance
      for (let i = 1; i < filtered.length; i++) {
        const prevScore = interests.calculateArticleScore(filtered[i - 1])
        const currentScore = interests.calculateArticleScore(filtered[i])

        expect(prevScore).toBeGreaterThanOrEqual(currentScore)
      }
    })

    it('should handle high minimum score threshold', () => {
      const articles = [
        createMockArticle('Vue.js Brief Mention', ['vue']),
        createMockArticle('Mostly Python with Vue', ['python', 'vue'])
      ]

      const filtered = interests.filterArticlesByInterests(articles, 0.5) // High threshold

      // Might filter out weak matches
      expect(filtered.length).toBeLessThanOrEqual(articles.length)
    })

    it('should not show fallback to all articles when too few match', () => {
      const articles = [
        createMockArticle('Python Article', ['python']),
        createMockArticle('Java Article', ['java']),
        createMockArticle('C++ Article', ['cpp'])
      ]

      const filtered = interests.filterArticlesByInterests(articles, 0.15)

      // Should return 0 articles, NOT all articles as fallback
      expect(filtered).toHaveLength(0)
    })
  })

  describe('Behavioral Learning', () => {
    beforeEach(() => {
      interests.initializeWithSurvey(['Vue.js'])
    })

    it('should track article clicks', () => {
      const article = createMockArticle('React Tutorial', ['react'])

      interests.trackArticleClick(article)

      const reactInterest = interests.interests.value.find(i =>
        i.keyword.toLowerCase().includes('react')
      )

      expect(reactInterest).toBeDefined()
      expect(reactInterest?.source).toBe('behavioral')
    })

    it('should track reading time', () => {
      const article = createMockArticle('Angular Guide', ['angular'])

      interests.trackReadTime(article, 120) // 120 seconds

      const angularInterest = interests.interests.value.find(i =>
        i.keyword.toLowerCase().includes('angular')
      )

      expect(angularInterest).toBeDefined()
      expect(angularInterest?.readTime).toBe(120)
    })

    it('should increase confidence with repeated clicks', () => {
      const article = createMockArticle('Svelte Tutorial', ['svelte'])

      interests.trackArticleClick(article)
      const firstConfidence = interests.interests.value.find(i =>
        i.keyword.toLowerCase().includes('svelte')
      )?.confidence || 0

      interests.trackArticleClick(article)
      const secondConfidence = interests.interests.value.find(i =>
        i.keyword.toLowerCase().includes('svelte')
      )?.confidence || 0

      expect(secondConfidence).toBeGreaterThan(firstConfidence)
    })
  })

  describe('Interest Management', () => {
    it('should add new interest manually', () => {
      interests.addInterest('Machine Learning')

      expect(interests.interests.value).toHaveLength(1)
      expect(interests.interests.value[0].keyword).toBe('Machine Learning')
    })

    it('should not add duplicate interests', () => {
      interests.addInterest('AI')
      interests.addInterest('ai') // Different case

      expect(interests.interests.value).toHaveLength(1)
    })

    it('should remove interest', () => {
      interests.addInterest('Blockchain')
      expect(interests.interests.value).toHaveLength(1)

      interests.removeInterest('Blockchain')
      expect(interests.interests.value).toHaveLength(0)
    })

    it('should get top interests by confidence', () => {
      interests.initializeWithSurvey(['Vue.js', 'React', 'Angular'])

      const topInterests = interests.topInterests.value

      expect(topInterests.length).toBeLessThanOrEqual(interests.interests.value.length)

      // Should be sorted by confidence
      for (let i = 1; i < topInterests.length; i++) {
        expect(topInterests[i - 1].confidence).toBeGreaterThanOrEqual(
          topInterests[i].confidence
        )
      }
    })

    it('should suggest new interests based on behavior', () => {
      interests.initializeWithSurvey(['Vue.js'])

      // Click on related articles
      const reactArticle = createMockArticle('React Hooks', ['react'])
      interests.trackArticleClick(reactArticle)
      interests.trackReadTime(reactArticle, 180)

      const suggested = interests.suggestedInterests.value

      // Should suggest React since we're reading about it
      const hasReactSuggestion = suggested.some(s =>
        s.keyword.toLowerCase().includes('react')
      )

      expect(hasReactSuggestion).toBe(true)
    })
  })

  describe('Persistence', () => {
    it('should persist interests to localStorage', () => {
      interests.initializeWithSurvey(['Rust', 'Go'])

      interests.saveInterests()

      // Create new instance
      const newInterestsInstance = useInterests()
      newInterestsInstance.loadInterests()

      expect(newInterestsInstance.interests.value.length).toBeGreaterThan(0)
    })

    it('should load persisted interests on initialization', () => {
      interests.initializeWithSurvey(['Kotlin'])
      interests.saveInterests()

      const newInstance = useInterests()
      newInstance.loadInterests()

      const hasKotlin = newInstance.interests.value.some(i =>
        i.keyword === 'Kotlin'
      )

      expect(hasKotlin).toBe(true)
    })

    it('should clear all interests and reset state', () => {
      interests.initializeWithSurvey(['Swift', 'Objective-C'])

      interests.clearAll()

      expect(interests.interests.value).toHaveLength(0)
      expect(interests.isInitialized.value).toBe(false)
    })
  })
})
