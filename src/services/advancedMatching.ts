/**
 * 🚀 ADVANCED MATCHING ALGORITHMS
 * ═══════════════════════════════════════════════════════════════════
 *
 * Implements sophisticated matching algorithms for personalized content:
 * - TF-IDF (Term Frequency-Inverse Document Frequency) Scoring
 * - Collaborative Filtering based on User Behavior
 * - Multi-Layer Relevance Scoring
 * - Semantic Similarity Analysis
 * - Time-Decay Relevance
 * - Location-based Boosting
 *
 * Created: 2025-10-24
 * ═══════════════════════════════════════════════════════════════════
 */

import type { NewsArticle } from '../types'

export interface ScoredArticle {
  article: NewsArticle
  score: number
  breakdown: ScoreBreakdown
}

export interface ScoreBreakdown {
  tfIdf: number
  topicMatch: number
  tagMatch: number
  recency: number
  quality: number
  location: number
  behavior: number
  total: number
}

export interface UserBehavior {
  clickedArticles: string[]
  readArticles: string[]
  bookmarkedArticles: string[]
  sharedArticles: string[]
  preferredTopics: Map<string, number> // topic -> weight
  preferredSources: Map<string, number> // source -> weight
}

/**
 * 🧠 Advanced Matching Engine
 */
export class AdvancedMatchingEngine {
  private corpusSize: number = 0
  private documentFrequency: Map<string, number> = new Map()

  /**
   * 🎯 Main Scoring Function: Score articles by interests with multiple algorithms
   */
  scoreArticles(
    articles: NewsArticle[],
    interests: string[],
    userLocation?: { lat: number; lng: number; radius: number },
    userBehavior?: UserBehavior
  ): ScoredArticle[] {
    console.log(`🧠 [Advanced Engine] Scoring ${articles.length} articles...`)

    // Build document frequency index for TF-IDF
    this.buildDocumentFrequency(articles)

    const scoredArticles: ScoredArticle[] = []

    for (const article of articles) {
      const breakdown: ScoreBreakdown = {
        tfIdf: 0,
        topicMatch: 0,
        tagMatch: 0,
        recency: 0,
        quality: 0,
        location: 0,
        behavior: 0,
        total: 0
      }

      // 1️⃣ TF-IDF Scoring (40% weight)
      breakdown.tfIdf = this.calculateTFIDF(article, interests) * 0.4

      // 2️⃣ Exact Topic/Tag Matching (25% weight)
      breakdown.topicMatch = this.calculateTopicMatch(article, interests) * 0.15
      breakdown.tagMatch = this.calculateTagMatch(article, interests) * 0.10

      // 3️⃣ Recency Score (15% weight) - Time decay
      breakdown.recency = this.calculateRecencyScore(article) * 0.15

      // 4️⃣ Quality Indicators (10% weight)
      breakdown.quality = this.calculateQualityScore(article) * 0.10

      // 5️⃣ Location Relevance (5% weight)
      if (userLocation && article.coordinates) {
        breakdown.location = this.calculateLocationScore(article, userLocation) * 0.05
      }

      // 6️⃣ User Behavior Patterns (5% weight)
      if (userBehavior) {
        breakdown.behavior = this.calculateBehaviorScore(article, userBehavior) * 0.05
      }

      // Total Score
      breakdown.total = Object.values(breakdown).reduce((sum, val) => sum + val, 0) - breakdown.total

      scoredArticles.push({
        article,
        score: breakdown.total,
        breakdown
      })
    }

    // Sort by score descending
    return scoredArticles.sort((a, b) => b.score - a.score)
  }

  /**
   * 📊 TF-IDF: Term Frequency-Inverse Document Frequency
   * Measures how relevant a word is to a document in a collection
   */
  private calculateTFIDF(article: NewsArticle, interests: string[]): number {
    // Combine article text
    const articleText = this.getArticleText(article)
    const words = this.tokenize(articleText)
    const wordFreq = this.getWordFrequency(words)

    let tfIdfScore = 0

    for (const interest of interests) {
      const interestWords = this.tokenize(interest.toLowerCase())

      for (const word of interestWords) {
        // TF: Term frequency in this article
        const tf = (wordFreq.get(word) || 0) / words.length

        // IDF: Inverse document frequency (how rare the word is)
        const df = this.documentFrequency.get(word) || 1
        const idf = Math.log((this.corpusSize + 1) / (df + 1))

        tfIdfScore += tf * idf
      }
    }

    // Normalize to 0-1 range
    return Math.min(1, tfIdfScore / interests.length)
  }

  /**
   * 🎯 Topic Matching with Semantic Similarity
   */
  private calculateTopicMatch(article: NewsArticle, interests: string[]): number {
    let matchScore = 0

    for (const interest of interests) {
      for (const topic of article.topics) {
        const similarity = this.calculateStringSimilarity(
          interest.toLowerCase(),
          topic.toLowerCase()
        )

        // Exact match or high similarity gets full points
        if (similarity > 0.8) {
          matchScore += 1
        } else if (similarity > 0.5) {
          matchScore += 0.5
        } else if (similarity > 0.3) {
          matchScore += 0.25
        }
      }
    }

    // Normalize by number of interests
    return Math.min(1, matchScore / interests.length)
  }

  /**
   * 🏷️ Tag Matching
   */
  private calculateTagMatch(article: NewsArticle, interests: string[]): number {
    if (!article.tags || article.tags.length === 0) return 0

    let matchScore = 0

    for (const interest of interests) {
      for (const tag of article.tags) {
        const similarity = this.calculateStringSimilarity(
          interest.toLowerCase(),
          tag.toLowerCase()
        )

        if (similarity > 0.8) {
          matchScore += 1
        } else if (similarity > 0.5) {
          matchScore += 0.5
        }
      }
    }

    return Math.min(1, matchScore / interests.length)
  }

  /**
   * ⏰ Recency Score with Time Decay
   * Newer articles get higher scores with exponential decay
   */
  private calculateRecencyScore(article: NewsArticle): number {
    const ageInHours = (Date.now() - article.publishedAt) / (1000 * 60 * 60)

    // Exponential decay: score = e^(-age/24)
    // Articles fresh within 24h get high score, decays over 7 days
    const decayRate = 24 // hours
    const score = Math.exp(-ageInHours / decayRate)

    // Bonus for breaking news
    if (article.tags?.includes('breaking')) {
      return Math.min(1, score + 0.3)
    }

    return score
  }

  /**
   * ⭐ Quality Score based on article attributes
   */
  private calculateQualityScore(article: NewsArticle): number {
    let qualityScore = 0

    // Has image (+0.2)
    if (article.imageUrl) qualityScore += 0.2

    // Has coordinates/location (+0.15)
    if (article.coordinates) qualityScore += 0.15

    // Has detailed content (+0.15)
    if (article.content && article.content.length > 500) qualityScore += 0.15

    // Has tags (+0.1)
    if (article.tags && article.tags.length > 0) qualityScore += 0.1

    // Has multiple topics (+0.15)
    if (article.topics.length > 1) qualityScore += 0.15

    // Long, detailed summary (+0.15)
    if (article.summary.length > 150) qualityScore += 0.15

    // Reputable source (can be expanded)
    const reputableSources = ['Reuters', 'AP', 'BBC', 'Guardian', 'NYTimes']
    if (reputableSources.includes(article.source)) qualityScore += 0.1

    return Math.min(1, qualityScore)
  }

  /**
   * 📍 Location-based Relevance Score
   */
  private calculateLocationScore(
    article: NewsArticle,
    userLocation: { lat: number; lng: number; radius: number }
  ): number {
    if (!article.coordinates) return 0

    const distance = this.calculateDistance(
      userLocation.lat,
      userLocation.lng,
      article.coordinates.lat,
      article.coordinates.lng
    )

    // Score based on distance within radius
    if (distance <= userLocation.radius) {
      // Linear decay: closer = higher score
      return 1 - (distance / userLocation.radius)
    }

    return 0
  }

  /**
   * 👤 User Behavior-based Scoring
   * Collaborative filtering: recommend similar to what user engaged with
   */
  private calculateBehaviorScore(article: NewsArticle, behavior: UserBehavior): number {
    let behaviorScore = 0

    // Check if article topics match user's preferred topics
    for (const topic of article.topics) {
      const topicWeight = behavior.preferredTopics.get(topic.toLowerCase()) || 0
      behaviorScore += topicWeight * 0.4
    }

    // Check if source matches user's preferred sources
    const sourceWeight = behavior.preferredSources.get(article.source.toLowerCase()) || 0
    behaviorScore += sourceWeight * 0.3

    // Bonus if similar to bookmarked articles
    if (behavior.bookmarkedArticles.includes(article.id)) {
      behaviorScore += 0.3
    }

    return Math.min(1, behaviorScore)
  }

  /**
   * 🔤 String Similarity using Levenshtein Distance (Edit Distance)
   */
  private calculateStringSimilarity(str1: string, str2: string): number {
    // Check for substring matches first
    if (str1.includes(str2) || str2.includes(str1)) {
      return 0.9
    }

    // Calculate Levenshtein distance
    const len1 = str1.length
    const len2 = str2.length

    if (len1 === 0) return len2 === 0 ? 1 : 0
    if (len2 === 0) return 0

    const matrix: number[][] = []

    for (let i = 0; i <= len2; i++) {
      matrix[i] = [i]
    }

    for (let j = 0; j <= len1; j++) {
      matrix[0][j] = j
    }

    for (let i = 1; i <= len2; i++) {
      for (let j = 1; j <= len1; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1]
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // deletion
          )
        }
      }
    }

    const distance = matrix[len2][len1]
    const maxLen = Math.max(len1, len2)

    // Convert distance to similarity (0-1)
    return 1 - distance / maxLen
  }

  /**
   * 📐 Haversine Distance Formula
   */
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371 // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  /**
   * 🔧 Build Document Frequency Index for TF-IDF
   */
  private buildDocumentFrequency(articles: NewsArticle[]) {
    this.corpusSize = articles.length
    this.documentFrequency.clear()

    for (const article of articles) {
      const articleText = this.getArticleText(article)
      const words = this.tokenize(articleText)
      const uniqueWords = new Set(words)

      for (const word of uniqueWords) {
        this.documentFrequency.set(
          word,
          (this.documentFrequency.get(word) || 0) + 1
        )
      }
    }

    console.log(`📊 Built DF index: ${this.documentFrequency.size} unique terms in ${this.corpusSize} documents`)
  }

  /**
   * Get all text from article for analysis
   */
  private getArticleText(article: NewsArticle): string {
    return [
      article.title,
      article.summary,
      ...article.topics,
      ...(article.tags || []),
      ...(article.locations || [])
    ].join(' ').toLowerCase()
  }

  /**
   * Tokenize text into words
   */
  private tokenize(text: string): string[] {
    // Remove punctuation and split into words
    return text
      .toLowerCase()
      .replace(/[^\w\säöüß]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2) // Filter out short words
  }

  /**
   * Calculate word frequency in text
   */
  private getWordFrequency(words: string[]): Map<string, number> {
    const freq = new Map<string, number>()
    for (const word of words) {
      freq.set(word, (freq.get(word) || 0) + 1)
    }
    return freq
  }
}

/**
 * 🚀 Export singleton instance
 */
export const advancedMatchingEngine = new AdvancedMatchingEngine()
