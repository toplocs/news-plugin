import { ref, computed } from 'vue'
import type { NewsArticle } from '../types'

export interface Interest {
  keyword: string
  confidence: number // 0-1
  source: 'survey' | 'behavioral' | 'extracted'
  lastUpdated: number
  clickCount?: number
  readTime?: number // in seconds
}

export interface ArticleBehavior {
  articleId: string
  clicked: boolean
  readTime: number // seconds
  scrollDepth: number // 0-100%
  timestamp: number
}

const STORAGE_KEY = 'news_plugin_interests'
const BEHAVIOR_KEY = 'news_plugin_behavior'

const interests = ref<Interest[]>([])
const behaviors = ref<ArticleBehavior[]>([])
const isInitialized = ref(false)

/**
 * Smart Interest Detection System
 * - Initial Survey for bootstrap
 * - Behavioral learning from clicks/reads
 * - Auto-keyword extraction from read articles
 */
export function useInterests() {
  /**
   * Load interests from localStorage
   */
  const loadInterests = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        interests.value = JSON.parse(stored)
      }

      const storedBehavior = localStorage.getItem(BEHAVIOR_KEY)
      if (storedBehavior) {
        behaviors.value = JSON.parse(storedBehavior)
      }

      isInitialized.value = interests.value.length > 0
    } catch (err) {
      console.error('Failed to load interests:', err)
    }
  }

  /**
   * Save interests to localStorage
   */
  const saveInterests = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(interests.value))
      localStorage.setItem(BEHAVIOR_KEY, JSON.stringify(behaviors.value))
    } catch (err) {
      console.error('Failed to save interests:', err)
    }
  }

  /**
   * Initialize with survey interests
   */
  const initializeWithSurvey = (keywords: string[]) => {
    const surveyInterests: Interest[] = keywords.map(keyword => ({
      keyword: keyword.trim(), // Preserve capitalization
      confidence: 0.8, // High confidence for explicit input
      source: 'survey',
      lastUpdated: Date.now()
    }))

    interests.value = surveyInterests
    isInitialized.value = true
    saveInterests()

    console.log('✅ Interests initialized from survey:', keywords)
  }

  /**
   * Track article click behavior
   */
  const trackArticleClick = (article: NewsArticle) => {
    const behavior: ArticleBehavior = {
      articleId: article.id,
      clicked: true,
      readTime: 0,
      scrollDepth: 0,
      timestamp: Date.now()
    }

    behaviors.value.push(behavior)

    // Extract keywords from clicked article
    extractInterestsFromArticle(article)

    // Keep only last 100 behaviors
    if (behaviors.value.length > 100) {
      behaviors.value = behaviors.value.slice(-100)
    }

    saveInterests()
  }

  /**
   * Track article read time
   */
  const trackReadTime = (articleId: string, seconds: number) => {
    const behavior = behaviors.value.find(b => b.articleId === articleId)
    if (behavior) {
      behavior.readTime = seconds
      saveInterests()
    }
  }

  /**
   * Extract interests from article (behavioral learning)
   */
  const extractInterestsFromArticle = (article: NewsArticle) => {
    const extractedKeywords = new Set<string>()

    // Extract from topics
    article.topics.forEach(topic => {
      extractedKeywords.add(topic.toLowerCase())
    })

    // Extract from tags
    article.tags?.forEach(tag => {
      extractedKeywords.add(tag.toLowerCase())
    })

    // Extract from title (simple keyword extraction)
    const titleWords = article.title
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 4) // Only words >4 chars

    titleWords.forEach(word => {
      // Remove punctuation
      const cleaned = word.replace(/[^\w]/g, '')
      if (cleaned.length > 4) {
        extractedKeywords.add(cleaned)
      }
    })

    // Add or update interests
    extractedKeywords.forEach(keyword => {
      const existing = interests.value.find(i => i.keyword === keyword)

      if (existing) {
        // Increase confidence for repeated exposure
        existing.confidence = Math.min(1.0, existing.confidence + 0.05)
        existing.lastUpdated = Date.now()
        if (existing.clickCount !== undefined) {
          existing.clickCount++
        }
      } else {
        // New extracted interest
        interests.value.push({
          keyword,
          confidence: 0.3, // Low initial confidence
          source: 'extracted',
          lastUpdated: Date.now(),
          clickCount: 1
        })
      }
    })

    // Keep only top 50 interests (by confidence)
    interests.value.sort((a, b) => b.confidence - a.confidence)
    if (interests.value.length > 50) {
      interests.value = interests.value.slice(0, 50)
    }

    saveInterests()
  }

  /**
   * Calculate match score for article
   */
  const calculateArticleScore = (article: NewsArticle): number => {
    if (interests.value.length === 0) {
      return 1.0 // Show all articles if no interests defined
    }

    let totalScore = 0
    let matchCount = 0

    interests.value.forEach(interest => {
      let matched = false
      const keyword = interest.keyword.toLowerCase()

      // ✅ FLEXIBLES MATCHING: Partial match in beide Richtungen!
      // Check topics (flexibel)
      if (article.topics.some(t => {
        const topic = t.toLowerCase()
        return topic.includes(keyword) || keyword.includes(topic)
      })) {
        totalScore += interest.confidence * 0.5
        matched = true
      }

      // Check tags (flexibel)
      if (article.tags?.some(tag => {
        const tagLower = tag.toLowerCase()
        return tagLower.includes(keyword) || keyword.includes(tagLower)
      })) {
        totalScore += interest.confidence * 0.4
        matched = true
      }

      // Check title (flexibel)
      const titleLower = article.title.toLowerCase()
      if (titleLower.includes(keyword) || keyword.includes(titleLower)) {
        totalScore += interest.confidence * 0.3
        matched = true
      }

      // Check summary (bonus)
      if (article.summary.toLowerCase().includes(keyword)) {
        totalScore += interest.confidence * 0.2
        matched = true
      }

      if (matched) matchCount++
    })

    // Mehr Gewicht wenn IRGENDEIN Interest matched
    const baseScore = matchCount > 0 ? totalScore / Math.max(interests.value.length, 3) : 0

    // Recency bonus
    const ageInDays = (Date.now() - article.publishedAt) / (1000 * 60 * 60 * 24)
    const recencyBonus = ageInDays < 1 ? 0.2 : ageInDays < 7 ? 0.1 : 0.05

    const finalScore = Math.min(1.0, baseScore + recencyBonus)

    // Debug
    if (matchCount > 0) {
      console.log(`📊 Article "${article.title.substring(0, 40)}..." - Score: ${finalScore.toFixed(2)} (${matchCount} matches)`)
    }

    return finalScore
  }

  /**
   * Filter articles by interest score
   */
  const filterArticlesByInterests = (articles: NewsArticle[], minScore = 0.1): NewsArticle[] => {
    if (interests.value.length === 0) {
      console.log('📊 No interests defined - showing all articles')
      return articles // No filtering if no interests
    }

    const scored = articles.map(article => ({
      article,
      score: calculateArticleScore(article)
    }))

    const filtered = scored.filter(({ score }) => score >= minScore)

    console.log(`📊 Filter Results: ${filtered.length}/${articles.length} articles passed (minScore: ${minScore})`)

    if (filtered.length === 0) {
      console.warn('⚠️ NO ARTICLES passed filter! Showing debug info:')
      console.log('Interests:', interests.value.map(i => i.keyword))
      console.log('Sample scores:', scored.slice(0, 5).map(s => ({
        title: s.article.title.substring(0, 40),
        score: s.score.toFixed(3),
        topics: s.article.topics
      })))
    }

    return filtered
      .sort((a, b) => b.score - a.score)
      .map(({ article }) => article)
  }

  /**
   * Get top interests
   */
  const topInterests = computed(() => {
    return interests.value
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 10)
  })

  /**
   * Get suggested interests (based on behavior)
   */
  const suggestedInterests = computed(() => {
    const clickedArticleIds = behaviors.value
      .filter(b => b.clicked && b.readTime > 10) // Read >10 seconds
      .map(b => b.articleId)

    // Extract keywords from well-read articles
    const suggestions = new Set<string>()

    behaviors.value
      .filter(b => b.readTime > 30) // Well-read (>30s)
      .forEach(b => {
        // Would need article data here - simplified for now
        // In production, store article metadata with behavior
      })

    return Array.from(suggestions)
  })

  /**
   * Add manual interest
   */
  const addInterest = (keyword: string) => {
    const normalized = keyword.trim()
    if (!normalized) return

    const existing = interests.value.find(i => i.keyword.toLowerCase() === normalized.toLowerCase())
    if (existing) {
      existing.confidence = Math.min(1.0, existing.confidence + 0.2)
      existing.lastUpdated = Date.now()
    } else {
      interests.value.push({
        keyword: normalized, // Preserve capitalization
        confidence: 0.9,
        source: 'survey',
        lastUpdated: Date.now()
      })
    }

    saveInterests()
  }

  /**
   * Remove interest
   */
  const removeInterest = (keyword: string) => {
    const index = interests.value.findIndex(i => i.keyword.toLowerCase() === keyword.toLowerCase())
    if (index > -1) {
      interests.value.splice(index, 1)
      saveInterests()
    }
  }

  /**
   * Clear all data
   */
  const clearAll = () => {
    interests.value = []
    behaviors.value = []
    isInitialized.value = false
    saveInterests()
  }

  return {
    // State
    interests: computed(() => interests.value),
    behaviors: computed(() => behaviors.value),
    isInitialized: computed(() => isInitialized.value),
    topInterests,
    suggestedInterests,

    // Methods
    loadInterests,
    saveInterests,
    initializeWithSurvey,
    trackArticleClick,
    trackReadTime,
    calculateArticleScore,
    filterArticlesByInterests,
    addInterest,
    removeInterest,
    clearAll
  }
}
