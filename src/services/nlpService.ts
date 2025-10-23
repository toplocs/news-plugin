import type { NewsArticle } from '../types'

/**
 * NLP Service - Extracts topics and locations from article text
 *
 * This is a simple MVP implementation using:
 * - Frequency-based keyword extraction
 * - Regex-based location detection
 * - Common NLP patterns
 *
 * Future: Can be replaced with more sophisticated NLP libraries
 */

export interface ExtractedEntities {
  topics: string[]
  locations: string[]
  keywords: string[]
}

export class NLPService {
  // Common stop words (German + English)
  private readonly STOP_WORDS = new Set([
    // German
    'der', 'die', 'das', 'und', 'oder', 'aber', 'ist', 'sind', 'war', 'waren',
    'ein', 'eine', 'einem', 'einen', 'einer', 'eines', 'für', 'mit', 'auf',
    'von', 'zu', 'im', 'am', 'um', 'an', 'als', 'auch', 'werden', 'wurde',
    'wird', 'hat', 'haben', 'hatte', 'hatten', 'sein', 'seine', 'seiner',
    'diesem', 'diese', 'dieser', 'dieses', 'dem', 'den', 'des', 'bei', 'nach',
    'über', 'durch', 'kann', 'könnte', 'sollte', 'würde', 'muss', 'müssen',
    'dass', 'wenn', 'weil', 'doch', 'noch', 'schon', 'mehr', 'viele', 'alle',
    // English
    'the', 'a', 'an', 'and', 'or', 'but', 'is', 'are', 'was', 'were',
    'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
    'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can',
    'of', 'at', 'by', 'for', 'with', 'about', 'as', 'into', 'through',
    'from', 'to', 'in', 'on', 'that', 'this', 'these', 'those', 'it',
    'its', 'if', 'when', 'where', 'why', 'how', 'which', 'who', 'what',
    'all', 'each', 'every', 'both', 'few', 'more', 'most', 'other', 'some'
  ])

  // Topic keywords mapping (can be extended)
  private readonly TOPIC_KEYWORDS: Record<string, string[]> = {
    'technology': ['tech', 'technologie', 'digital', 'software', 'hardware', 'innovation', 'startup'],
    'ai': ['ai', 'künstliche intelligenz', 'artificial intelligence', 'machine learning', 'ml', 'deep learning', 'ki', 'chatgpt', 'openai'],
    'climate': ['climate', 'klima', 'umwelt', 'environment', 'sustainability', 'nachhaltig', 'co2', 'emissions', 'green', 'renewable'],
    'politics': ['politics', 'politik', 'government', 'regierung', 'election', 'wahl', 'parliament', 'bundestag', 'congress'],
    'economy': ['economy', 'wirtschaft', 'business', 'market', 'markt', 'finance', 'finanzen', 'trade', 'handel', 'gdp', 'bip'],
    'health': ['health', 'gesundheit', 'medical', 'medizin', 'hospital', 'krankenhaus', 'doctor', 'arzt', 'pandemic', 'pandemie', 'covid'],
    'sports': ['sports', 'sport', 'football', 'fußball', 'basketball', 'tennis', 'olympics', 'olympia', 'champion'],
    'science': ['science', 'wissenschaft', 'research', 'forschung', 'study', 'studie', 'university', 'universität', 'discovery'],
    'culture': ['culture', 'kultur', 'art', 'kunst', 'music', 'musik', 'film', 'theater', 'museum', 'exhibition'],
    'education': ['education', 'bildung', 'school', 'schule', 'university', 'universität', 'student', 'teacher', 'lehrer', 'learning']
  }

  // Common location patterns (cities, countries, regions)
  private readonly LOCATION_PATTERNS = [
    // Major cities
    /\b(Berlin|München|Hamburg|Frankfurt|Köln|Stuttgart|Dresden|Leipzig|Nürnberg)\b/gi,
    /\b(London|Paris|Madrid|Rome|Vienna|Amsterdam|Brussels|Zurich|Copenhagen)\b/gi,
    /\b(New York|Los Angeles|San Francisco|Chicago|Boston|Seattle|Miami|Washington)\b/gi,
    /\b(Tokyo|Beijing|Shanghai|Hong Kong|Singapore|Seoul|Bangkok|Delhi|Mumbai)\b/gi,
    /\b(Sydney|Melbourne|Toronto|Vancouver|Dubai|Istanbul|Moscow|St\. Petersburg)\b/gi,

    // Countries
    /\b(Germany|Deutschland|France|Frankreich|Spain|Spanien|Italy|Italien)\b/gi,
    /\b(United Kingdom|UK|England|USA|America|China|Japan|India|Russia)\b/gi,
    /\b(Brazil|Brasilien|Australia|Australien|Canada|Kanada|Mexico|Mexiko)\b/gi,

    // Regions
    /\b(Europe|Europa|Asia|Asien|Africa|Afrika|America|Amerika)\b/gi,
    /\b(Middle East|Naher Osten|Latin America|Lateinamerika)\b/gi,

    // Special patterns
    /\b([A-Z][a-z]+)\s+(City|Stadt)\b/g, // "Berlin City", "München Stadt"
    /\bin\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b/g, // "in Berlin", "in New York"
  ]

  /**
   * Extract topics, locations, and keywords from article
   */
  extractEntities(article: NewsArticle): ExtractedEntities {
    const fullText = `${article.title} ${article.description || ''} ${article.content || ''}`.toLowerCase()

    return {
      topics: this.extractTopics(fullText),
      locations: this.extractLocations(article),
      keywords: this.extractKeywords(fullText)
    }
  }

  /**
   * Extract topics using keyword matching
   */
  private extractTopics(text: string): string[] {
    const topics = new Set<string>()

    // Check each topic category
    for (const [topic, keywords] of Object.entries(this.TOPIC_KEYWORDS)) {
      for (const keyword of keywords) {
        if (text.includes(keyword.toLowerCase())) {
          topics.add(topic)
          break // Only add topic once
        }
      }
    }

    return Array.from(topics)
  }

  /**
   * Extract locations using regex patterns
   */
  private extractLocations(article: NewsArticle): string[] {
    const locations = new Set<string>()
    const fullText = `${article.title} ${article.description || ''} ${article.content || ''}`

    // Apply each location pattern
    for (const pattern of this.LOCATION_PATTERNS) {
      const matches = fullText.matchAll(pattern)
      for (const match of matches) {
        if (match[1]) {
          // Clean up location name
          const location = this.cleanLocationName(match[1])
          if (location && location.length >= 3) {
            locations.add(location)
          }
        }
      }
    }

    return Array.from(locations)
  }

  /**
   * Extract keywords using frequency analysis
   */
  private extractKeywords(text: string, maxKeywords: number = 10): string[] {
    // Tokenize
    const words = text
      .toLowerCase()
      .replace(/[^\w\säöüß-]/g, ' ') // Keep umlauts and hyphens
      .split(/\s+/)
      .filter(word => word.length > 3) // At least 4 characters
      .filter(word => !this.STOP_WORDS.has(word))
      .filter(word => !/^\d+$/.test(word)) // No pure numbers

    // Count frequency
    const frequency = new Map<string, number>()
    for (const word of words) {
      frequency.set(word, (frequency.get(word) || 0) + 1)
    }

    // Sort by frequency and return top keywords
    return Array.from(frequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, maxKeywords)
      .map(([word]) => word)
  }

  /**
   * Clean location name (capitalize, remove duplicates)
   */
  private cleanLocationName(location: string): string {
    return location
      .trim()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
  }

  /**
   * Get confidence score for extracted entities
   */
  getConfidenceScore(entities: ExtractedEntities): number {
    let score = 0

    // More topics = higher confidence
    score += Math.min(entities.topics.length * 0.2, 0.4)

    // Locations found = higher confidence
    score += entities.locations.length > 0 ? 0.3 : 0

    // More keywords = higher confidence
    score += Math.min(entities.keywords.length * 0.05, 0.3)

    return Math.min(score, 1.0)
  }

  /**
   * Extract entities from multiple articles in batch
   */
  extractBatch(articles: NewsArticle[]): Map<string, ExtractedEntities> {
    const results = new Map<string, ExtractedEntities>()

    for (const article of articles) {
      const entities = this.extractEntities(article)
      results.set(article.id, entities)
    }

    return results
  }

  /**
   * Validate extracted entities (basic quality check)
   */
  validateEntities(entities: ExtractedEntities): boolean {
    // At least one topic or location should be extracted
    return entities.topics.length > 0 || entities.locations.length > 0
  }
}

// Singleton instance
export const nlpService = new NLPService()
