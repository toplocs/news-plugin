import Gun from 'gun'
import type { NewsArticle } from '../types'

const gun = Gun()
import type { ExtractedEntities } from './nlpService'
import type { MatchResult } from './topicMatcher'

/**
 * Article Storage Service - Stores articles in Gun.js P2P database
 *
 * Gun.js Schema:
 * - gun.get('news_plugin/articles/{id}') → Full article
 * - gun.get('news_plugin/by_topic/{topic-id}') → Article references
 * - gun.get('news_plugin/by_location/{location-id}') → Article references
 * - gun.get('news_plugin/recent') → Recent articles (sorted by publishedAt)
 */

export interface ArticleReference {
  articleId: string
  relevance: number
  publishedAt: number
}

export interface StorageResult {
  success: boolean
  articleId: string
  topicsIndexed: number
  locationsIndexed: number
  error?: string
}

export class ArticleStorageService {
  /**
   * Store article with extracted entities in Gun.js
   */
  async storeArticle(
    article: NewsArticle,
    entities: ExtractedEntities,
    matchResult: MatchResult
  ): Promise<StorageResult> {
    try {
      const articleId = article.id

      // 1. Store full article
      await this.storeFullArticle(article, entities, matchResult)

      // 2. Create indexes by topic
      const topicsIndexed = await this.indexByTopics(articleId, matchResult.topicIds, matchResult.confidence, article.publishedAt)

      // 3. Create indexes by location
      const locationsIndexed = await this.indexByLocations(articleId, entities.locations, article.publishedAt)

      // 4. Add to recent articles
      await this.addToRecent(articleId, article.publishedAt)

      console.log(`✅ Stored article ${articleId}: ${topicsIndexed} topics, ${locationsIndexed} locations`)

      return {
        success: true,
        articleId,
        topicsIndexed,
        locationsIndexed
      }

    } catch (error) {
      console.error(`❌ Failed to store article ${article.id}:`, error)
      return {
        success: false,
        articleId: article.id,
        topicsIndexed: 0,
        locationsIndexed: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Store full article object
   */
  private async storeFullArticle(
    article: NewsArticle,
    entities: ExtractedEntities,
    matchResult: MatchResult
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const articleData = {
        ...article,
        // Add extracted entities
        extractedTopics: entities.topics,
        extractedLocations: entities.locations,
        extractedKeywords: entities.keywords,
        // Add matched TopLocs IDs
        toplocTopics: matchResult.topicIds,
        matchConfidence: matchResult.confidence,
        // Metadata
        processedAt: Date.now(),
        storedAt: Date.now()
      }

      gun
        .get('news_plugin')
        .get('articles')
        .get(article.id)
        .put(articleData, (ack) => {
          if (ack.err) {
            reject(new Error(ack.err))
          } else {
            resolve()
          }
        })
    })
  }

  /**
   * Index article by topics
   */
  private async indexByTopics(
    articleId: string,
    topicIds: string[],
    relevance: number,
    publishedAt: number
  ): Promise<number> {
    let indexed = 0

    for (const topicId of topicIds) {
      try {
        await new Promise<void>((resolve, reject) => {
          const ref: ArticleReference = {
            articleId,
            relevance,
            publishedAt
          }

          gun
            .get('news_plugin')
            .get('by_topic')
            .get(topicId)
            .get(articleId) // Use articleId as key to avoid duplicates
            .put(ref, (ack) => {
              if (ack.err) {
                console.error(`Failed to index by topic ${topicId}:`, ack.err)
                reject(new Error(ack.err))
              } else {
                indexed++
                resolve()
              }
            })
        })
      } catch (error) {
        console.error(`Error indexing topic ${topicId}:`, error)
      }
    }

    return indexed
  }

  /**
   * Index article by locations
   */
  private async indexByLocations(
    articleId: string,
    locations: string[],
    publishedAt: number
  ): Promise<number> {
    let indexed = 0

    for (const location of locations) {
      try {
        const locationId = this.createLocationId(location)

        await new Promise<void>((resolve, reject) => {
          const ref: ArticleReference = {
            articleId,
            relevance: 1.0, // Default relevance for locations
            publishedAt
          }

          gun
            .get('news_plugin')
            .get('by_location')
            .get(locationId)
            .get(articleId)
            .put(ref, (ack) => {
              if (ack.err) {
                console.error(`Failed to index by location ${locationId}:`, ack.err)
                reject(new Error(ack.err))
              } else {
                indexed++
                resolve()
              }
            })
        })
      } catch (error) {
        console.error(`Error indexing location ${location}:`, error)
      }
    }

    return indexed
  }

  /**
   * Add article to recent feed
   */
  private async addToRecent(articleId: string, publishedAt: number): Promise<void> {
    return new Promise((resolve, reject) => {
      gun
        .get('news_plugin')
        .get('recent')
        .get(articleId)
        .put({ articleId, publishedAt }, (ack) => {
          if (ack.err) {
            reject(new Error(ack.err))
          } else {
            resolve()
          }
        })
    })
  }

  /**
   * Fetch articles by topic
   */
  async getArticlesByTopic(topicId: string, limit: number = 50): Promise<NewsArticle[]> {
    return new Promise((resolve) => {
      const articles: NewsArticle[] = []
      const articleIds = new Set<string>()

      gun
        .get('news_plugin')
        .get('by_topic')
        .get(topicId)
        .map()
        .once(async (ref: ArticleReference) => {
          if (ref && ref.articleId && !articleIds.has(ref.articleId)) {
            articleIds.add(ref.articleId)

            // Fetch full article
            const article = await this.getArticleById(ref.articleId)
            if (article) {
              articles.push(article)
            }
          }
        })

      // Wait for Gun.js to fetch
      setTimeout(() => {
        resolve(articles.slice(0, limit))
      }, 2000)
    })
  }

  /**
   * Fetch articles by location
   */
  async getArticlesByLocation(location: string, limit: number = 50): Promise<NewsArticle[]> {
    const locationId = this.createLocationId(location)

    return new Promise((resolve) => {
      const articles: NewsArticle[] = []
      const articleIds = new Set<string>()

      gun
        .get('news_plugin')
        .get('by_location')
        .get(locationId)
        .map()
        .once(async (ref: ArticleReference) => {
          if (ref && ref.articleId && !articleIds.has(ref.articleId)) {
            articleIds.add(ref.articleId)

            const article = await this.getArticleById(ref.articleId)
            if (article) {
              articles.push(article)
            }
          }
        })

      setTimeout(() => {
        resolve(articles.slice(0, limit))
      }, 2000)
    })
  }

  /**
   * Get article by ID
   */
  async getArticleById(articleId: string): Promise<NewsArticle | null> {
    return new Promise((resolve) => {
      gun
        .get('news_plugin')
        .get('articles')
        .get(articleId)
        .once((data: any) => {
          if (data && data.id) {
            resolve(data as NewsArticle)
          } else {
            resolve(null)
          }
        })

      // Timeout after 1 second
      setTimeout(() => resolve(null), 1000)
    })
  }

  /**
   * Get recent articles
   */
  async getRecentArticles(limit: number = 50): Promise<NewsArticle[]> {
    return new Promise((resolve) => {
      const articles: NewsArticle[] = []
      const articleIds = new Set<string>()

      gun
        .get('news_plugin')
        .get('recent')
        .map()
        .once(async (data: any) => {
          if (data && data.articleId && !articleIds.has(data.articleId)) {
            articleIds.add(data.articleId)

            const article = await this.getArticleById(data.articleId)
            if (article) {
              articles.push(article)
            }
          }
        })

      setTimeout(() => {
        // Sort by publishedAt descending
        const sorted = articles.sort((a, b) => b.publishedAt - a.publishedAt)
        resolve(sorted.slice(0, limit))
      }, 2000)
    })
  }

  /**
   * Store multiple articles in batch
   */
  async storeBatch(
    articles: Array<{
      article: NewsArticle
      entities: ExtractedEntities
      matchResult: MatchResult
    }>
  ): Promise<StorageResult[]> {
    const results: StorageResult[] = []

    for (const { article, entities, matchResult } of articles) {
      const result = await this.storeArticle(article, entities, matchResult)
      results.push(result)
    }

    return results
  }

  /**
   * Create location ID from location name
   */
  private createLocationId(location: string): string {
    return `location-${location.toLowerCase().replace(/\s+/g, '-')}`
  }

  /**
   * Check if article already exists
   */
  async articleExists(articleId: string): Promise<boolean> {
    const article = await this.getArticleById(articleId)
    return article !== null
  }

  /**
   * Delete article (for testing/cleanup)
   */
  async deleteArticle(articleId: string): Promise<void> {
    return new Promise((resolve) => {
      gun
        .get('news_plugin')
        .get('articles')
        .get(articleId)
        .put(null, () => {
          resolve()
        })
    })
  }
}

// Singleton instance
export const articleStorage = new ArticleStorageService()
