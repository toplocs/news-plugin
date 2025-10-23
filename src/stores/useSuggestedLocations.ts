import { ref, computed, watch } from 'vue'
import gun from '../services/gun'

/**
 * Suggested Location - A location that has appeared frequently in news articles
 * and may be promoted to a TopLocs Location entity
 */
export interface SuggestedLocation {
  name: string                    // Display name: "Berlin Mitte"
  slug: string                    // URL-safe identifier: "berlin-mitte"
  count: number                   // Number of articles from this location
  avgConfidence: number           // Average NLP confidence score (0-1)
  firstSeen: number              // Timestamp of first appearance
  lastSeen: number               // Timestamp of last appearance
  articleIds: string[]           // IDs of articles from this location
  uniqueSources: string[]        // Unique news sources
  verified: boolean              // Verified via Nominatim API
  coordinates?: {                // GPS coordinates (if verified)
    lat: number
    lng: number
  }
  hierarchy?: {                  // Location hierarchy (if verified)
    city?: string
    state?: string
    country?: string
    continent?: string
  }
  status: 'pending' | 'approved' | 'rejected' | 'promoted'  // Curation status
}

/**
 * Thresholds for auto-promoting locations
 */
export const LOCATION_THRESHOLDS = {
  verified: {
    count: 3,                     // Only 3 articles if verified
    avgConfidence: 0.95,          // High confidence required
    timeSpan: 0,                  // Immediate (no waiting)
    uniqueSources: 2              // Min. 2 different sources
  },
  unverified: {
    count: 15,                    // 15 articles if not verified
    avgConfidence: 0.85,          // Lower confidence acceptable
    timeSpan: 14 * 86400000,      // 14 days (in milliseconds)
    uniqueSources: 5              // Min. 5 different sources
  }
}

const STORAGE_KEY = 'news_plugin_suggested_locations'
const GUN_PATH = 'news_plugin/suggested_locations'

const suggestedLocations = ref<Map<string, SuggestedLocation>>(new Map())
const isLoading = ref(false)
const lastUpdate = ref<number>(0)

// Gun.js subscription
let gunUnsubscribe: (() => void) | null = null

/**
 * Suggested Locations Store - Tracks locations from news articles for auto-promotion
 */
export function useSuggestedLocations() {
  /**
   * Increment location count when mentioned in an article
   * @param locationSlug - URL-safe location identifier
   * @param articleId - ID of the article
   * @param confidence - NLP confidence score (0-1)
   * @param source - News source name
   * @param locationName - Display name of the location
   * @param coordinates - Optional GPS coordinates
   */
  const incrementLocationCount = async (
    locationSlug: string,
    articleId: string,
    confidence: number,
    source: string,
    locationName: string,
    coordinates?: { lat: number; lng: number }
  ): Promise<SuggestedLocation> => {
    const existing = suggestedLocations.value.get(locationSlug)

    if (existing) {
      // Update existing location
      const newCount = existing.count + 1
      const newAvgConfidence =
        (existing.avgConfidence * existing.count + confidence) / newCount

      // Add article ID if not already present
      if (!existing.articleIds.includes(articleId)) {
        existing.articleIds.push(articleId)
      }

      // Add source if not already present
      if (!existing.uniqueSources.includes(source)) {
        existing.uniqueSources.push(source)
      }

      const updated: SuggestedLocation = {
        ...existing,
        count: newCount,
        avgConfidence: newAvgConfidence,
        lastSeen: Date.now(),
        articleIds: existing.articleIds,
        uniqueSources: existing.uniqueSources,
        // Update coordinates if provided and not already set
        coordinates: existing.coordinates || coordinates
      }

      suggestedLocations.value.set(locationSlug, updated)
      await saveSuggestedLocation(locationSlug, updated)

      return updated
    } else {
      // Create new suggested location
      const newLocation: SuggestedLocation = {
        name: locationName,
        slug: locationSlug,
        count: 1,
        avgConfidence: confidence,
        firstSeen: Date.now(),
        lastSeen: Date.now(),
        articleIds: [articleId],
        uniqueSources: [source],
        verified: false,
        coordinates,
        status: 'pending'
      }

      suggestedLocations.value.set(locationSlug, newLocation)
      await saveSuggestedLocation(locationSlug, newLocation)

      return newLocation
    }
  }

  /**
   * Get a suggested location by slug
   * @param slug - Location slug
   * @returns SuggestedLocation or undefined
   */
  const getSuggestedLocation = (slug: string): SuggestedLocation | undefined => {
    return suggestedLocations.value.get(slug)
  }

  /**
   * Get all suggested locations
   * @returns Array of suggested locations
   */
  const getAllSuggestedLocations = (): SuggestedLocation[] => {
    return Array.from(suggestedLocations.value.values())
  }

  /**
   * Mark location as verified with Nominatim data
   * @param slug - Location slug
   * @param coordinates - GPS coordinates
   * @param hierarchy - Location hierarchy (city, state, country, continent)
   */
  const markLocationAsVerified = async (
    slug: string,
    coordinates: { lat: number; lng: number },
    hierarchy?: {
      city?: string
      state?: string
      country?: string
      continent?: string
    }
  ): Promise<boolean> => {
    const location = suggestedLocations.value.get(slug)

    if (!location) {
      console.error(`Location ${slug} not found`)
      return false
    }

    const updated: SuggestedLocation = {
      ...location,
      verified: true,
      coordinates,
      hierarchy
    }

    suggestedLocations.value.set(slug, updated)
    await saveSuggestedLocation(slug, updated)

    console.log(`✅ Location ${slug} verified with Nominatim`)
    return true
  }

  /**
   * Update location status (approve/reject/promote)
   * @param slug - Location slug
   * @param status - New status
   */
  const updateLocationStatus = async (
    slug: string,
    status: SuggestedLocation['status']
  ): Promise<boolean> => {
    const location = suggestedLocations.value.get(slug)

    if (!location) {
      console.error(`Location ${slug} not found`)
      return false
    }

    const updated: SuggestedLocation = {
      ...location,
      status
    }

    suggestedLocations.value.set(slug, updated)
    await saveSuggestedLocation(slug, updated)

    console.log(`✅ Location ${slug} status updated to ${status}`)
    return true
  }

  /**
   * Check if a location meets auto-promotion thresholds
   * @param slug - Location slug
   * @returns Boolean indicating if location should be auto-promoted
   */
  const meetsAutoPromoteThresholds = (slug: string): boolean => {
    const location = suggestedLocations.value.get(slug)

    if (!location) return false

    // Use different thresholds based on verification status
    const thresholds = location.verified
      ? LOCATION_THRESHOLDS.verified
      : LOCATION_THRESHOLDS.unverified

    // Check count threshold
    if (location.count < thresholds.count) return false

    // Check confidence threshold
    if (location.avgConfidence < thresholds.avgConfidence) return false

    // Check time span (only for unverified locations)
    if (!location.verified) {
      const timeSpan = location.lastSeen - location.firstSeen
      if (timeSpan < thresholds.timeSpan) return false
    }

    // Check unique sources
    if (location.uniqueSources.length < thresholds.uniqueSources) return false

    return true
  }

  /**
   * Get all locations that meet auto-promotion thresholds
   * @returns Array of locations ready for promotion
   */
  const getLocationsReadyForPromotion = (): SuggestedLocation[] => {
    return getAllSuggestedLocations().filter(location =>
      location.status === 'pending' && meetsAutoPromoteThresholds(location.slug)
    )
  }

  /**
   * Get pending locations (awaiting curation)
   * @returns Array of pending locations, sorted by count
   */
  const getPendingLocations = (): SuggestedLocation[] => {
    return getAllSuggestedLocations()
      .filter(location => location.status === 'pending')
      .sort((a, b) => b.count - a.count)
  }

  /**
   * Get verified locations
   * @returns Array of verified locations
   */
  const getVerifiedLocations = (): SuggestedLocation[] => {
    return getAllSuggestedLocations()
      .filter(location => location.verified)
      .sort((a, b) => b.count - a.count)
  }

  /**
   * Get unverified locations
   * @returns Array of unverified locations
   */
  const getUnverifiedLocations = (): SuggestedLocation[] => {
    return getAllSuggestedLocations()
      .filter(location => !location.verified)
      .sort((a, b) => b.count - a.count)
  }

  /**
   * Get approved locations
   * @returns Array of approved locations
   */
  const getApprovedLocations = (): SuggestedLocation[] => {
    return getAllSuggestedLocations()
      .filter(location => location.status === 'approved')
      .sort((a, b) => b.count - a.count)
  }

  /**
   * Save suggested location to Gun.js
   * @param slug - Location slug
   * @param location - Location data
   */
  const saveSuggestedLocation = async (slug: string, location: SuggestedLocation) => {
    try {
      const locationNode = gun.get(GUN_PATH).get(slug)
      await locationNode.put({
        name: location.name,
        slug: location.slug,
        count: location.count,
        avgConfidence: location.avgConfidence,
        firstSeen: location.firstSeen,
        lastSeen: location.lastSeen,
        articleIds: JSON.stringify(location.articleIds),
        uniqueSources: JSON.stringify(location.uniqueSources),
        verified: location.verified,
        coordinates: location.coordinates ? JSON.stringify(location.coordinates) : null,
        hierarchy: location.hierarchy ? JSON.stringify(location.hierarchy) : null,
        status: location.status
      })
    } catch (err) {
      console.error('Failed to save suggested location to Gun.js:', err)
    }
  }

  /**
   * Load suggested locations from localStorage
   */
  const loadSuggestedLocations = () => {
    try {
      if (typeof localStorage === 'undefined') return

      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        suggestedLocations.value = new Map(
          Object.entries(parsed).map(([slug, location]) => [slug, location as SuggestedLocation])
        )
      }
    } catch (err) {
      console.error('Failed to load suggested locations:', err)
    }
  }

  /**
   * Save suggested locations to localStorage
   */
  const saveSuggestedLocationsToStorage = () => {
    try {
      if (typeof localStorage === 'undefined') return

      const obj = Object.fromEntries(suggestedLocations.value)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(obj))
    } catch (err) {
      console.error('Failed to save suggested locations:', err)
    }
  }

  /**
   * Subscribe to Gun.js for real-time updates
   */
  const subscribeToGun = () => {
    try {
      const locationsNode = gun.get(GUN_PATH)

      locationsNode.map().on((data: any, slug: string) => {
        if (!data) return

        // Parse arrays and objects from JSON strings
        const articleIds = data.articleIds
          ? JSON.parse(data.articleIds)
          : []
        const uniqueSources = data.uniqueSources
          ? JSON.parse(data.uniqueSources)
          : []
        const coordinates = data.coordinates
          ? JSON.parse(data.coordinates)
          : undefined
        const hierarchy = data.hierarchy
          ? JSON.parse(data.hierarchy)
          : undefined

        const location: SuggestedLocation = {
          name: data.name,
          slug: data.slug,
          count: data.count || 0,
          avgConfidence: data.avgConfidence || 0,
          firstSeen: data.firstSeen || Date.now(),
          lastSeen: data.lastSeen || Date.now(),
          articleIds,
          uniqueSources,
          verified: data.verified || false,
          coordinates,
          hierarchy,
          status: data.status || 'pending'
        }

        suggestedLocations.value.set(slug, location)
      })

      console.log('📡 Subscribed to Gun.js suggested locations updates')
    } catch (err) {
      console.error('Failed to subscribe to Gun.js suggested locations:', err)
    }
  }

  /**
   * Unsubscribe from Gun.js
   */
  const unsubscribeFromGun = () => {
    if (gunUnsubscribe) {
      gunUnsubscribe()
      gunUnsubscribe = null
    }
  }

  /**
   * Clear all suggested locations
   */
  const clearSuggestedLocations = () => {
    suggestedLocations.value.clear()
    saveSuggestedLocationsToStorage()
  }

  /**
   * Initialize suggested locations system
   */
  const initialize = () => {
    loadSuggestedLocations()
    subscribeToGun()
    console.log('✅ Suggested Locations system initialized')
  }

  /**
   * Cleanup suggested locations system
   */
  const cleanup = () => {
    unsubscribeFromGun()
  }

  // Watch for changes and save automatically
  watch(
    suggestedLocations,
    () => {
      saveSuggestedLocationsToStorage()
      lastUpdate.value = Date.now()
    },
    { deep: true }
  )

  // Computed values
  const totalLocations = computed(() => suggestedLocations.value.size)
  const pendingCount = computed(() => getPendingLocations().length)
  const verifiedCount = computed(() => getVerifiedLocations().length)
  const readyForPromotionCount = computed(() => getLocationsReadyForPromotion().length)

  return {
    // State
    suggestedLocations: computed(() => Array.from(suggestedLocations.value.values())),
    isLoading,
    lastUpdate,
    totalLocations,
    pendingCount,
    verifiedCount,
    readyForPromotionCount,

    // Actions - Location Management
    incrementLocationCount,
    getSuggestedLocation,
    getAllSuggestedLocations,
    markLocationAsVerified,
    updateLocationStatus,
    clearSuggestedLocations,

    // Actions - Auto-Promote
    meetsAutoPromoteThresholds,
    getLocationsReadyForPromotion,
    getPendingLocations,
    getVerifiedLocations,
    getUnverifiedLocations,
    getApprovedLocations,

    // Actions - Gun.js
    subscribeToGun,
    unsubscribeFromGun,

    // Lifecycle
    initialize,
    cleanup
  }
}
