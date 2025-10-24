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
import { semanticMatchingService } from './semanticMatchingService'

export interface ScoredArticle {
  article: NewsArticle
  score: number
  breakdown: ScoreBreakdown
  proximityBoost?: number  // 🔥 NEW: 10x boost for ultra-close content
  semanticMatches?: string[] // 🔥 NEW: Matched semantic terms
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
    console.log(`🧠 [ADVANCED ENGINE] Scoring ${articles.length} articles...`)
    console.log(`   Interests: ${interests.join(', ')}`)

    // 🔥 SEMANTIC EXPANSION: Expand interests (food → restaurant, café, etc.)
    const expandedInterests = semanticMatchingService.expandAllInterests(interests)
    console.log(`🔥 [SEMANTIC] Expanded ${interests.length} → ${expandedInterests.length} terms`)

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

      // 1️⃣ TF-IDF Scoring (40% weight) - NOW WITH EXPANDED INTERESTS 🔥
      breakdown.tfIdf = this.calculateTFIDF(article, expandedInterests) * 0.4

      // 2️⃣ Exact Topic/Tag Matching (25% weight) - WITH EXPANDED INTERESTS 🔥
      breakdown.topicMatch = this.calculateTopicMatch(article, expandedInterests) * 0.15
      breakdown.tagMatch = this.calculateTagMatch(article, expandedInterests) * 0.10

      // 3️⃣ Recency Score (15% weight) - Time decay
      breakdown.recency = this.calculateRecencyScore(article) * 0.15

      // 4️⃣ Quality Indicators (10% weight) - ENHANCED FOR FOOD 🔥
      breakdown.quality = this.calculateQualityScoreEnhanced(article, interests) * 0.10

      // 5️⃣ Location Relevance (5% weight) - WITH PROXIMITY BOOST 🔥
      let proximityBoost = 1.0
      if (userLocation && article.coordinates) {
        const distanceKm = this.calculateDistance(
          userLocation.lat,
          userLocation.lng,
          article.coordinates.lat,
          article.coordinates.lng
        )
        const distanceMeters = distanceKm * 1000

        // 🔥 PROXIMITY MULTIPLIER: 10x boost for <100m, 5x for <250m, 2x for <500m
        if (distanceMeters < 100) proximityBoost = 10.0
        else if (distanceMeters < 250) proximityBoost = 5.0
        else if (distanceMeters < 500) proximityBoost = 2.0

        breakdown.location = this.calculateLocationScore(article, userLocation) * 0.05
      }

      // 6️⃣ User Behavior Patterns (5% weight)
      if (userBehavior) {
        breakdown.behavior = this.calculateBehaviorScore(article, userBehavior) * 0.05
      }

      // Total Score (before proximity boost)
      breakdown.total = Object.values(breakdown).reduce((sum, val) => sum + val, 0) - breakdown.total

      // 🔥 Apply proximity boost to final score
      const finalScore = breakdown.total * proximityBoost

      // 🔥 Check semantic matches
      const articleText = this.getArticleText(article)
      const semanticMatch = semanticMatchingService.matchesExpandedInterests(articleText, interests)

      scoredArticles.push({
        article,
        score: finalScore,
        breakdown,
        proximityBoost: proximityBoost > 1 ? proximityBoost : undefined,
        semanticMatches: semanticMatch.matchedTerms.slice(0, 5) // Top 5 matched terms
      })
    }

    // Sort by score descending
    const sorted = scoredArticles.sort((a, b) => b.score - a.score)

    // Log top 3 with details
    console.log(`🏆 Top 3 Scored Articles:`)
    sorted.slice(0, 3).forEach((item, i) => {
      console.log(`   ${i + 1}. ${item.article.title.substring(0, 50)}...`)
      console.log(`      Score: ${item.score.toFixed(3)} ${item.proximityBoost ? `(${item.proximityBoost}x boost 🔥)` : ''}`)
      if (item.semanticMatches && item.semanticMatches.length > 0) {
        console.log(`      Matches: ${item.semanticMatches.join(', ')}`)
      }
    })

    return sorted
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
   * 🔥 ENHANCED Quality Score - Optimized for Food & Local Content
   */
  private calculateQualityScoreEnhanced(article: NewsArticle, userInterests: string[]): number {
    let qualityScore = 0

    // Base quality (same as before)
    qualityScore += this.calculateQualityScore(article) * 0.6

    // 🔥 FOOD-SPECIFIC QUALITY INDICATORS
    const isFoodRelated = userInterests.some(int =>
      ['food', 'restaurant', 'café', 'bar', 'essen'].includes(int.toLowerCase())
    )

    if (isFoodRelated) {
      // Has high-quality image (critical for food!) (+0.25)
      if (article.imageUrl) {
        // Bonus if image URL suggests food photography
        if (article.imageUrl.match(/food|restaurant|cafe|dish|meal/i)) {
          qualityScore += 0.25
        } else {
          qualityScore += 0.15
        }
      }

      // Has price information (+0.15)
      const hasPriceInfo = article.content?.match(/€|EUR|price|preis|cost/i) ||
                           article.summary.match(/€|EUR|price|preis|cost/i)
      if (hasPriceInfo) qualityScore += 0.15

      // Has opening hours (+0.15)
      const hasHours = article.content?.match(/open|hours|opening|öffnungszeiten|geöffnet/i) ||
                       article.summary.match(/open|hours|opening|öffnungszeiten|geöffnet/i)
      if (hasHours) qualityScore += 0.15

      // Has rating/review indicators (+0.2)
      const hasRating = article.content?.match(/⭐|rating|review|stars|bewertung/i) ||
                        article.summary.match(/⭐|rating|review|stars|bewertung/i) ||
                        article.tags?.some(tag => tag.match(/rated|popular|trending/i))
      if (hasRating) qualityScore += 0.2

      // Has menu keywords (+0.1)
      const hasMenu = article.content?.match(/menu|speisekarte|dishes|gerichte/i) ||
                      article.summary.match(/menu|speisekarte|dishes|gerichte/i)
      if (hasMenu) qualityScore += 0.1

      // Has ambiance/atmosphere description (+0.1)
      const hasAmbiance = article.content?.match(/cozy|modern|traditional|atmosphere|ambiente/i) ||
                          article.summary.match(/cozy|modern|traditional|atmosphere|ambiente/i)
      if (hasAmbiance) qualityScore += 0.1
    }

    // 🔥 TIME-OF-DAY RELEVANCE
    const currentHour = new Date().getHours()
    const timeRelevantKeywords: Record<string, string[]> = {
      breakfast: ['breakfast', 'frühstück', 'morning', 'morgen', 'brunch'],
      lunch: ['lunch', 'mittagessen', 'mittag'],
      dinner: ['dinner', 'abendessen', 'evening', 'abend']
    }

    let timeBonus = 0
    if (currentHour >= 6 && currentHour < 11) {
      // Morning: boost breakfast
      if (timeRelevantKeywords.breakfast.some(kw =>
        article.title.toLowerCase().includes(kw) ||
        article.summary.toLowerCase().includes(kw)
      )) {
        timeBonus = 0.15
      }
    } else if (currentHour >= 11 && currentHour < 15) {
      // Midday: boost lunch
      if (timeRelevantKeywords.lunch.some(kw =>
        article.title.toLowerCase().includes(kw) ||
        article.summary.toLowerCase().includes(kw)
      )) {
        timeBonus = 0.15
      }
    } else if (currentHour >= 17 && currentHour < 23) {
      // Evening: boost dinner
      if (timeRelevantKeywords.dinner.some(kw =>
        article.title.toLowerCase().includes(kw) ||
        article.summary.toLowerCase().includes(kw)
      )) {
        timeBonus = 0.15
      }
    }

    qualityScore += timeBonus

    // 🔥 POPULARITY SIGNALS
    // Note: In real implementation, these would come from actual data
    // For now, we infer from tags and content
    const popularityIndicators = [
      'trending', 'popular', 'viral', 'top rated', 'best',
      'must try', 'highly recommended', 'award winning'
    ]

    const hasPopularitySignal = article.tags?.some(tag =>
      popularityIndicators.some(ind => tag.toLowerCase().includes(ind))
    ) || article.title.toLowerCase().match(/best|top|award|must/i)

    if (hasPopularitySignal) qualityScore += 0.15

    // 🔥 VISUAL QUALITY (inferred from image URL patterns)
    if (article.imageUrl) {
      // High-res indicators
      if (article.imageUrl.match(/1200|1920|2048|4k|hd/i)) {
        qualityScore += 0.1
      }
    }

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
