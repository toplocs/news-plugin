import gun from './gun'
import { geocodeService, type GeocodeResult } from './geocodeService'
import {
  useSuggestedTopics,
  TOPIC_THRESHOLDS,
  type SuggestedTopic
} from '../stores/useSuggestedTopics'
import {
  useSuggestedLocations,
  LOCATION_THRESHOLDS,
  type SuggestedLocation
} from '../stores/useSuggestedLocations'

/**
 * Auto-Promote Service - Automatically promotes topics and locations to TopLocs entities
 *
 * Features:
 * - Check if topics/locations meet auto-promotion thresholds
 * - Create TopLocs Topic entities with proper metadata
 * - Create TopLocs Location entities with hierarchy
 * - Verify locations using Nominatim API
 * - Track promotion history
 */

interface TopLocsTopic {
  name: string
  slug: string
  description: string
  articleCount: number
  createdAt: number
  autoPromoted: boolean
  metadata: {
    avgConfidence: number
    uniqueSources: string[]
    articleIds: string[]
  }
}

interface TopLocsLocation {
  name: string
  slug: string
  description: string
  articleCount: number
  createdAt: number
  autoPromoted: boolean
  verified: boolean
  coordinates: {
    lat: number
    lng: number
  }
  hierarchy: {
    city?: string
    state?: string
    country?: string
    continent?: string
  }
  metadata: {
    avgConfidence: number
    uniqueSources: string[]
    articleIds: string[]
  }
}

export interface PromotionResult {
  success: boolean
  entityId?: string
  entityType: 'topic' | 'location'
  reason?: string
  error?: string
}

class AutoPromoteService {
  private promotionHistory: Map<string, Date> = new Map()
  private readonly GUN_TOPICS_PATH = 'toplocs/topics'
  private readonly GUN_LOCATIONS_PATH = 'toplocs/locations'

  /**
   * Check if a topic should be auto-promoted
   * @param topicSlug - Slug of the suggested topic
   * @returns Boolean indicating if topic meets thresholds
   */
  checkAutoPromoteTopic(topicSlug: string): boolean {
    const { getSuggestedTopic } = useSuggestedTopics()
    const topic = getSuggestedTopic(topicSlug)

    if (!topic) {
      console.warn(`Topic ${topicSlug} not found`)
      return false
    }

    // Check all thresholds
    const meetsCount = topic.count >= TOPIC_THRESHOLDS.count
    const meetsConfidence = topic.avgConfidence >= TOPIC_THRESHOLDS.avgConfidence
    const meetsTimeSpan = (topic.lastSeen - topic.firstSeen) >= TOPIC_THRESHOLDS.timeSpan
    const meetsSources = topic.uniqueSources.length >= TOPIC_THRESHOLDS.uniqueSources

    console.log(`🔍 Auto-Promote Check for Topic "${topic.name}":`, {
      count: `${topic.count}/${TOPIC_THRESHOLDS.count}`,
      confidence: `${topic.avgConfidence.toFixed(2)}/${TOPIC_THRESHOLDS.avgConfidence}`,
      timeSpan: `${Math.floor((topic.lastSeen - topic.firstSeen) / 86400000)} days / ${TOPIC_THRESHOLDS.timeSpan / 86400000} days`,
      sources: `${topic.uniqueSources.length}/${TOPIC_THRESHOLDS.uniqueSources}`,
      result: meetsCount && meetsConfidence && meetsTimeSpan && meetsSources
    })

    return meetsCount && meetsConfidence && meetsTimeSpan && meetsSources
  }

  /**
   * Check if a location should be auto-promoted
   * @param locationSlug - Slug of the suggested location
   * @returns Boolean indicating if location meets thresholds
   */
  checkAutoPromoteLocation(locationSlug: string): boolean {
    const { getSuggestedLocation } = useSuggestedLocations()
    const location = getSuggestedLocation(locationSlug)

    if (!location) {
      console.warn(`Location ${locationSlug} not found`)
      return false
    }

    // Use different thresholds based on verification status
    const thresholds = location.verified
      ? LOCATION_THRESHOLDS.verified
      : LOCATION_THRESHOLDS.unverified

    const meetsCount = location.count >= thresholds.count
    const meetsConfidence = location.avgConfidence >= thresholds.avgConfidence
    const meetsTimeSpan = location.verified || (location.lastSeen - location.firstSeen) >= thresholds.timeSpan
    const meetsSources = location.uniqueSources.length >= thresholds.uniqueSources

    console.log(`🔍 Auto-Promote Check for Location "${location.name}" (${location.verified ? 'VERIFIED' : 'UNVERIFIED'}):`, {
      count: `${location.count}/${thresholds.count}`,
      confidence: `${location.avgConfidence.toFixed(2)}/${thresholds.avgConfidence}`,
      timeSpan: location.verified ? 'immediate' : `${Math.floor((location.lastSeen - location.firstSeen) / 86400000)} days / ${thresholds.timeSpan / 86400000} days`,
      sources: `${location.uniqueSources.length}/${thresholds.uniqueSources}`,
      result: meetsCount && meetsConfidence && meetsTimeSpan && meetsSources
    })

    return meetsCount && meetsConfidence && meetsTimeSpan && meetsSources
  }

  /**
   * Auto-promote a topic to TopLocs Topic entity
   * @param topicSlug - Slug of the suggested topic
   * @returns PromotionResult
   */
  async autoPromoteTopic(topicSlug: string): Promise<PromotionResult> {
    const { getSuggestedTopic, updateTopicStatus } = useSuggestedTopics()
    const topic = getSuggestedTopic(topicSlug)

    if (!topic) {
      return {
        success: false,
        entityType: 'topic',
        error: `Topic ${topicSlug} not found`
      }
    }

    // Check if already promoted
    if (topic.status === 'promoted') {
      return {
        success: false,
        entityType: 'topic',
        error: 'Topic already promoted'
      }
    }

    // Verify thresholds
    if (!this.checkAutoPromoteTopic(topicSlug)) {
      return {
        success: false,
        entityType: 'topic',
        error: 'Topic does not meet auto-promotion thresholds'
      }
    }

    try {
      // Create TopLocs Topic entity
      const topLocsTopic: TopLocsTopic = {
        name: topic.name,
        slug: topic.slug,
        description: `Auto-promoted topic with ${topic.count} articles from ${topic.uniqueSources.length} sources`,
        articleCount: topic.count,
        createdAt: Date.now(),
        autoPromoted: true,
        metadata: {
          avgConfidence: topic.avgConfidence,
          uniqueSources: topic.uniqueSources,
          articleIds: topic.articleIds
        }
      }

      // Save to Gun.js
      await gun.get(this.GUN_TOPICS_PATH).get(topic.slug).put(topLocsTopic)

      // Update suggested topic status
      await updateTopicStatus(topic.slug, 'promoted')

      // Track promotion
      this.promotionHistory.set(`topic:${topic.slug}`, new Date())

      console.log(`✅ Topic auto-promoted: ${topic.name}`, topLocsTopic)

      return {
        success: true,
        entityType: 'topic',
        entityId: topic.slug,
        reason: `Met all thresholds: ${topic.count} articles, ${topic.avgConfidence.toFixed(2)} confidence, ${topic.uniqueSources.length} sources`
      }
    } catch (error) {
      console.error('Failed to auto-promote topic:', error)
      return {
        success: false,
        entityType: 'topic',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Auto-promote a location to TopLocs Location entity with hierarchy
   * @param locationSlug - Slug of the suggested location
   * @param autoVerify - Whether to auto-verify location using Nominatim (default: true)
   * @returns PromotionResult
   */
  async autoPromoteLocation(
    locationSlug: string,
    autoVerify: boolean = true
  ): Promise<PromotionResult> {
    const {
      getSuggestedLocation,
      updateLocationStatus,
      markLocationAsVerified
    } = useSuggestedLocations()
    let location = getSuggestedLocation(locationSlug)

    if (!location) {
      return {
        success: false,
        entityType: 'location',
        error: `Location ${locationSlug} not found`
      }
    }

    // Check if already promoted
    if (location.status === 'promoted') {
      return {
        success: false,
        entityType: 'location',
        error: 'Location already promoted'
      }
    }

    // Auto-verify if not already verified and autoVerify is true
    if (!location.verified && autoVerify) {
      console.log(`🔍 Auto-verifying location: ${location.name}`)
      const geocodeResult = await geocodeService.geocodeLocation(location.name)

      if (geocodeResult.verified && geocodeResult.coordinates && geocodeResult.hierarchy) {
        await markLocationAsVerified(
          location.slug,
          geocodeResult.coordinates,
          geocodeResult.hierarchy
        )

        // Refresh location data
        location = getSuggestedLocation(locationSlug)!
        console.log(`✅ Location verified: ${location.name}`)
      } else {
        console.warn(`⚠️ Could not verify location: ${location.name}`)
      }
    }

    // Verify thresholds (uses appropriate thresholds based on verification status)
    if (!this.checkAutoPromoteLocation(locationSlug)) {
      return {
        success: false,
        entityType: 'location',
        error: 'Location does not meet auto-promotion thresholds'
      }
    }

    // Cannot promote unverified location without coordinates
    if (!location.coordinates) {
      return {
        success: false,
        entityType: 'location',
        error: 'Location has no coordinates (verification required)'
      }
    }

    try {
      // Create TopLocs Location entity with hierarchy
      const topLocsLocation = await this.createLocationWithHierarchy(location)

      // Save to Gun.js
      await gun.get(this.GUN_LOCATIONS_PATH).get(location.slug).put(topLocsLocation)

      // Update suggested location status
      await updateLocationStatus(location.slug, 'promoted')

      // Track promotion
      this.promotionHistory.set(`location:${location.slug}`, new Date())

      console.log(`✅ Location auto-promoted: ${location.name}`, topLocsLocation)

      return {
        success: true,
        entityType: 'location',
        entityId: location.slug,
        reason: `Met all thresholds: ${location.count} articles, ${location.avgConfidence.toFixed(2)} confidence, ${location.uniqueSources.length} sources, ${location.verified ? 'VERIFIED' : 'UNVERIFIED'}`
      }
    } catch (error) {
      console.error('Failed to auto-promote location:', error)
      return {
        success: false,
        entityType: 'location',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Create location with full hierarchy (city → state → country → continent)
   * @param location - Suggested location to promote
   * @returns TopLocsLocation with hierarchy
   */
  async createLocationWithHierarchy(location: SuggestedLocation): Promise<TopLocsLocation> {
    if (!location.coordinates) {
      throw new Error('Location must have coordinates to create hierarchy')
    }

    // Ensure hierarchy exists (fetch if missing)
    let hierarchy = location.hierarchy
    if (!hierarchy && location.coordinates) {
      const geocodeResult = await geocodeService.reverseGeocode(
        location.coordinates.lat,
        location.coordinates.lng
      )

      if (geocodeResult.verified && geocodeResult.hierarchy) {
        hierarchy = geocodeResult.hierarchy
      }
    }

    const topLocsLocation: TopLocsLocation = {
      name: location.name,
      slug: location.slug,
      description: `Auto-promoted location with ${location.count} articles from ${location.uniqueSources.length} sources`,
      articleCount: location.count,
      createdAt: Date.now(),
      autoPromoted: true,
      verified: location.verified,
      coordinates: location.coordinates,
      hierarchy: hierarchy || {},
      metadata: {
        avgConfidence: location.avgConfidence,
        uniqueSources: location.uniqueSources,
        articleIds: location.articleIds
      }
    }

    // Create parent locations in hierarchy if they don't exist
    if (hierarchy) {
      await this.createParentLocations(hierarchy, location.slug)
    }

    return topLocsLocation
  }

  /**
   * Create parent locations in hierarchy (state, country, continent)
   * @param hierarchy - Location hierarchy
   * @param childSlug - Slug of the child location
   */
  private async createParentLocations(
    hierarchy: {
      city?: string
      state?: string
      country?: string
      continent?: string
    },
    childSlug: string
  ) {
    const { state, country, continent } = hierarchy

    // Create state location (if it doesn't exist)
    if (state) {
      const stateSlug = this.slugify(state)
      const stateNode = gun.get(this.GUN_LOCATIONS_PATH).get(stateSlug)

      // Check if already exists
      const existing = await new Promise<any>((resolve) => {
        stateNode.once((data) => resolve(data))
      })

      if (!existing) {
        await stateNode.put({
          name: state,
          slug: stateSlug,
          description: `State/Region: ${state}`,
          articleCount: 0,
          createdAt: Date.now(),
          autoPromoted: true,
          verified: true,
          hierarchy: { state, country, continent },
          children: [childSlug]
        })
        console.log(`📍 Created parent state: ${state}`)
      }
    }

    // Create country location (if it doesn't exist)
    if (country) {
      const countrySlug = this.slugify(country)
      const countryNode = gun.get(this.GUN_LOCATIONS_PATH).get(countrySlug)

      const existing = await new Promise<any>((resolve) => {
        countryNode.once((data) => resolve(data))
      })

      if (!existing) {
        await countryNode.put({
          name: country,
          slug: countrySlug,
          description: `Country: ${country}`,
          articleCount: 0,
          createdAt: Date.now(),
          autoPromoted: true,
          verified: true,
          hierarchy: { country, continent },
          children: state ? [this.slugify(state)] : [childSlug]
        })
        console.log(`🌍 Created parent country: ${country}`)
      }
    }

    // Create continent location (if it doesn't exist)
    if (continent) {
      const continentSlug = this.slugify(continent)
      const continentNode = gun.get(this.GUN_LOCATIONS_PATH).get(continentSlug)

      const existing = await new Promise<any>((resolve) => {
        continentNode.once((data) => resolve(data))
      })

      if (!existing) {
        await continentNode.put({
          name: continent,
          slug: continentSlug,
          description: `Continent: ${continent}`,
          articleCount: 0,
          createdAt: Date.now(),
          autoPromoted: true,
          verified: true,
          hierarchy: { continent },
          children: country ? [this.slugify(country)] : []
        })
        console.log(`🌏 Created parent continent: ${continent}`)
      }
    }
  }

  /**
   * Run auto-promotion check for all eligible topics and locations
   * @returns Array of promotion results
   */
  async runAutoPromotion(): Promise<PromotionResult[]> {
    console.log('🚀 Running auto-promotion check...')

    const results: PromotionResult[] = []

    // Check topics
    const { getTopicsReadyForPromotion } = useSuggestedTopics()
    const topicsReady = getTopicsReadyForPromotion()

    console.log(`📊 Found ${topicsReady.length} topics ready for promotion`)

    for (const topic of topicsReady) {
      const result = await this.autoPromoteTopic(topic.slug)
      results.push(result)
    }

    // Check locations
    const { getLocationsReadyForPromotion } = useSuggestedLocations()
    const locationsReady = getLocationsReadyForPromotion()

    console.log(`📍 Found ${locationsReady.length} locations ready for promotion`)

    for (const location of locationsReady) {
      const result = await this.autoPromoteLocation(location.slug, true)
      results.push(result)
    }

    const successCount = results.filter(r => r.success).length
    console.log(`✅ Auto-promotion complete: ${successCount}/${results.length} succeeded`)

    return results
  }

  /**
   * Get promotion history
   * @returns Map of entity ID to promotion date
   */
  getPromotionHistory(): Map<string, Date> {
    return this.promotionHistory
  }

  /**
   * Convert string to URL-safe slug
   * @param text - Text to slugify
   * @returns Slugified text
   */
  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }
}

export const autoPromoteService = new AutoPromoteService()
