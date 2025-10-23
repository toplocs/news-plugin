import Gun from 'gun'
import type { ExtractedEntities } from './nlpService'

const gun = Gun()

/**
 * Topic Matcher Service - Matches extracted topics to TopLocs topics
 *
 * Responsibilities:
 * - Fetch TopLocs topics from Gun.js
 * - Match extracted keywords to existing topics
 * - Use fuzzy matching + synonyms
 * - Return TopLocs topic IDs
 *
 * TopLocs Topics are stored as:
 * gun.get('topic/{topic-id}/{space}')
 * gun.get('topics/titles').get('AI') → topic-id
 */

export interface TopLocsTopic {
  id: string
  title: string
  slug: string
  space?: string
}

export interface MatchResult {
  topicIds: string[]        // Matched TopLocs topic IDs
  unmatchedTopics: string[] // Topics that couldn't be matched
  confidence: number        // Overall match confidence
}

export class TopicMatcherService {
  private topicsCache: Map<string, TopLocsTopic> = new Map()
  private titleIndex: Map<string, string> = new Map() // title → topic-id
  private lastCacheUpdate: number = 0
  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  // Synonym mapping for better matching
  private readonly SYNONYMS: Record<string, string[]> = {
    'ai': ['artificial intelligence', 'künstliche intelligenz', 'ki', 'machine learning', 'ml'],
    'technology': ['tech', 'technologie', 'digital', 'innovation'],
    'climate': ['klima', 'environment', 'umwelt', 'sustainability'],
    'politics': ['politik', 'government', 'regierung'],
    'economy': ['wirtschaft', 'business', 'finance', 'finanzen'],
    'health': ['gesundheit', 'medical', 'medizin'],
    'sports': ['sport'],
    'science': ['wissenschaft', 'research', 'forschung'],
    'culture': ['kultur', 'art', 'kunst'],
    'education': ['bildung', 'learning', 'lernen']
  }

  /**
   * Match extracted topics to TopLocs topics
   */
  async matchTopics(entities: ExtractedEntities): Promise<MatchResult> {
    // Ensure cache is fresh
    await this.refreshCacheIfNeeded()

    const matchedIds = new Set<string>()
    const unmatchedTopics: string[] = []

    // Try to match each extracted topic
    for (const topic of entities.topics) {
      const topicId = this.findMatchingTopic(topic)
      if (topicId) {
        matchedIds.add(topicId)
      } else {
        unmatchedTopics.push(topic)
      }
    }

    // Also try matching keywords
    for (const keyword of entities.keywords.slice(0, 5)) { // Top 5 keywords only
      const topicId = this.findMatchingTopic(keyword)
      if (topicId) {
        matchedIds.add(topicId)
      }
    }

    const confidence = this.calculateConfidence(
      entities.topics.length + entities.keywords.length,
      matchedIds.size
    )

    return {
      topicIds: Array.from(matchedIds),
      unmatchedTopics,
      confidence
    }
  }

  /**
   * Find matching TopLocs topic for a keyword
   */
  private findMatchingTopic(keyword: string): string | null {
    const normalized = keyword.toLowerCase().trim()

    // 1. Direct match in title index
    if (this.titleIndex.has(normalized)) {
      return this.titleIndex.get(normalized) || null
    }

    // 2. Check synonyms
    for (const [canonical, synonyms] of Object.entries(this.SYNONYMS)) {
      if (synonyms.includes(normalized)) {
        // Return the canonical topic ID
        return this.titleIndex.get(canonical) || this.createTopicId(canonical)
      }
    }

    // 3. Fuzzy match (check if keyword is contained in any topic title)
    for (const [title, topicId] of this.titleIndex.entries()) {
      if (title.includes(normalized) || normalized.includes(title)) {
        return topicId
      }
    }

    // 4. Check if keyword is similar to any cached topic
    for (const [title, topicId] of this.titleIndex.entries()) {
      if (this.calculateSimilarity(normalized, title) > 0.7) {
        return topicId
      }
    }

    return null
  }

  /**
   * Refresh TopLocs topics cache
   */
  private async refreshCacheIfNeeded(): Promise<void> {
    const now = Date.now()
    if (now - this.lastCacheUpdate < this.CACHE_DURATION) {
      return // Cache still fresh
    }

    try {
      console.log('🔄 Refreshing TopLocs topics cache...')

      // Fetch topics from Gun.js
      // gun.get('topics/titles') contains title → topic-id mapping
      await new Promise<void>((resolve) => {
        gun.get('topics').get('titles').map().once((topicId: string, title: string) => {
          if (topicId && title) {
            this.titleIndex.set(title.toLowerCase(), topicId)
            this.topicsCache.set(topicId, {
              id: topicId,
              title: title,
              slug: this.slugify(title)
            })
          }
        })

        // Wait a bit for Gun.js to fetch data
        setTimeout(() => resolve(), 1000)
      })

      this.lastCacheUpdate = now
      console.log(`✅ Loaded ${this.titleIndex.size} TopLocs topics`)

      // If no topics in Gun.js, use fallback defaults
      if (this.titleIndex.size === 0) {
        this.initializeDefaultTopics()
      }

    } catch (error) {
      console.error('❌ Failed to refresh topics cache:', error)
      // Use fallback defaults
      this.initializeDefaultTopics()
    }
  }

  /**
   * Initialize default topics (fallback if Gun.js is empty)
   */
  private initializeDefaultTopics(): void {
    const defaultTopics = [
      'AI', 'Technology', 'Climate', 'Politics', 'Economy',
      'Health', 'Sports', 'Science', 'Culture', 'Education'
    ]

    for (const topic of defaultTopics) {
      const topicId = this.createTopicId(topic)
      this.titleIndex.set(topic.toLowerCase(), topicId)
      this.topicsCache.set(topicId, {
        id: topicId,
        title: topic,
        slug: this.slugify(topic)
      })
    }

    console.log(`📦 Initialized ${defaultTopics.length} default topics`)
  }

  /**
   * Create topic ID from title
   */
  private createTopicId(title: string): string {
    return `topic-${this.slugify(title)}`
  }

  /**
   * Create URL-friendly slug
   */
  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/ä/g, 'ae')
      .replace(/ö/g, 'oe')
      .replace(/ü/g, 'ue')
      .replace(/ß/g, 'ss')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  /**
   * Calculate string similarity (Levenshtein-based)
   */
  private calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2
    const shorter = str1.length > str2.length ? str2 : str1

    if (longer.length === 0) return 1.0

    const editDistance = this.levenshteinDistance(shorter, longer)
    return (longer.length - editDistance) / longer.length
  }

  /**
   * Levenshtein distance (edit distance)
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = []

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i]
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
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

    return matrix[str2.length][str1.length]
  }

  /**
   * Calculate match confidence
   */
  private calculateConfidence(totalExtracted: number, matched: number): number {
    if (totalExtracted === 0) return 0
    return Math.min(matched / totalExtracted, 1.0)
  }

  /**
   * Get all cached topics
   */
  getCachedTopics(): TopLocsTopic[] {
    return Array.from(this.topicsCache.values())
  }

  /**
   * Clear cache (for testing)
   */
  clearCache(): void {
    this.topicsCache.clear()
    this.titleIndex.clear()
    this.lastCacheUpdate = 0
  }

  /**
   * Match a single keyword to topic ID
   */
  async matchSingleKeyword(keyword: string): Promise<string | null> {
    await this.refreshCacheIfNeeded()
    return this.findMatchingTopic(keyword)
  }
}

// Singleton instance
export const topicMatcher = new TopicMatcherService()
