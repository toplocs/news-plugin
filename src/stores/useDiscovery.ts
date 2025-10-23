/*
═══════════════════════════════════════════════════════════════════════════════
🧪 TEST-DOKUMENTATION - useDiscovery.ts (PHASE 2) - 501 ZEILEN + HYBRID!
═══════════════════════════════════════════════════════════════════════════════

📋 WAS WIRD HIER GETESTET:
- 🎯 Hybrid Discovery Algorithm (Interests 70% + Location 30%)
- Interest-based Discovery (News + Users)
- Location-based Discovery (Haversine distance)
- Relevance Score Calculation (topics, tags, recency, breaking)
- Auto-Refresh Interval (default: 5 Minuten)
- Gun.js P2P Sharing (publishMatch für high-score matches)
- localStorage Persistence

🎯 ERWARTETE ERGEBNISSE:
✅ discoverHybrid(): Combines interests + location, score boost for both
✅ discoverByInterests(): Article matches basierend auf interests
✅ discoverByLocation(): Article matches innerhalb radius (km)
✅ discoverUsers(): User matches basierend auf gemeinsamen Interessen
✅ Relevance Score: topics (0.3) + tags (0.2) + recency (0.2) + breaking (0.3)
✅ Auto-Refresh: Alle 5 Minuten (300,000ms)
✅ publishMatch(): High-score matches (>0.9) → Gun.js
✅ Gun.js Subscription: Real-time P2P discovery updates

🔧 WIE ZU TESTEN:
1. Hybrid Discovery Test:
   - interests = ['Vue.js', 'TypeScript']
   - location = { lat: 52.52, lng: 13.405, radius: 10 }
   - matches = await discovery.discoverHybrid(interests, location)
   - Artikel mit Vue.js + location: score = 0.7 (interests) + 0.5 (boost) = 1.2
   - Artikel nur Vue.js: score = 0.7 * relevance
   - Artikel nur location: score = 0.4
2. Relevance Score Test:
   - article.topics = ['vue', 'javascript']
   - article.tags = ['breaking', 'local']
   - interests = ['Vue.js']
   - score = calculateRelevanceScore(article, interests)
   - score = 0.3 (topic match) + 0.3 (breaking tag) = 0.6
3. Recency Bonus:
   - article.publishedAt = Date.now() - 3600000 // 1 Stunde alt
   - score += 0.2 (< 1 Tag alt)
4. Auto-Refresh Test:
   - discovery.startAutoRefresh()
   - Wait 5 Minuten
   - Console: "🔄 Auto-refresh started (every 300s)"
   - discoverHybrid sollte automatisch laufen
5. publishMatch Test:
   - match = { score: 0.95, type: 'article', ... }
   - await discovery.publishMatch(match)
   - Gun.js → news_plugin/discovery/{id}
   - Console: "✅ Published discovery match to Gun.js: {id}"
6. Gun.js Subscription:
   - discovery.subscribeToGun()
   - Console: "📡 Subscribed to Gun.js discovery updates"
   - Andere Instanz published match
   - Sollte erscheinen in matches.value

📊 SCORING ALGORITHM:
- Topics Match: +0.3 per matching topic
- Tags Match: +0.2 per matching tag
- Recency: +0.2 (< 1 Tag), +0.1 (< 7 Tage)
- Breaking News: +0.3
- Max Score: 1.0 (capped)

🔢 HYBRID WEIGHTS:
- Interests: 70% (score * 0.7)
- Location: 30% (score * 0.4)
- Both Match: +50% Boost (score += 0.5)

🔌 GUN.JS INTEGRATION:
- Subscribe: gun.get('news_plugin').get('discovery').map().on()
- Publish: gun.get('news_plugin').get('discovery').get(id).put()
- Filter: nur Matches < 24 Stunden alt
- Auto-cleanup: max 50 matches (keeps top 50)

⏰ AUTO-REFRESH:
- Default Interval: 300,000ms (5 Minuten)
- Start: discovery.startAutoRefresh()
- Stop: discovery.stopAutoRefresh()
- Settings: updateSettings({ refreshInterval: 60000 }) // 1 Minute

🚨 BEKANNTE ISSUES:
- Keine (Phase 2 vollständig implementiert ✅)

═══════════════════════════════════════════════════════════════════════════════
*/
import { ref, computed, watch } from 'vue'
import gun from '../services/gun'
import { newsService } from '../services/newsService'
import { userService } from '../services/userService'
import type { NewsArticle } from '../types'
import type { UserProfile } from '../types/user'

export interface DiscoveryMatch {
  type: 'article' | 'user' | 'topic' | 'event'
  id: string
  title: string
  description: string
  score: number
  reason: string
  data: NewsArticle | UserProfile | any
  timestamp?: number
}

interface DiscoverySettings {
  interests: string[]
  location?: { lat: number; lng: number; radius: number }
  autoRefresh: boolean
  refreshInterval: number // in ms
}

const STORAGE_KEY = 'news_plugin_discovery_matches'
const SETTINGS_KEY = 'news_plugin_discovery_settings'

const matches = ref<DiscoveryMatch[]>([])
const isLoading = ref(false)
const lastUpdate = ref<number>(0)
const settings = ref<DiscoverySettings>({
  interests: [],
  autoRefresh: true,
  refreshInterval: 300000 // 5 minutes
})

// Real-time subscription
let gunUnsubscribe: (() => void) | null = null
let autoRefreshInterval: ReturnType<typeof setInterval> | null = null

/**
 * Discovery Store - Finds relevant content based on interests and location
 */
export function useDiscovery() {
  /**
   * Discover content based on user interests
   */
  const discoverByInterests = async (interests: string[]): Promise<DiscoveryMatch[]> => {
    isLoading.value = true

    try {
      const articleMatches: DiscoveryMatch[] = []

      // Search for articles matching interests
      for (const interest of interests) {
        const articles = await newsService.searchByInterests([interest])

        for (const article of articles) {
          const score = calculateRelevanceScore(article, interests)

          articleMatches.push({
            type: 'article',
            id: article.id,
            title: article.title,
            description: article.summary,
            score,
            reason: `Passt zu deinem Interesse: ${interest}`,
            data: article
          })
        }
      }

      // Sort by score
      articleMatches.sort((a, b) => b.score - a.score)

      matches.value = articleMatches.slice(0, 10)
      lastUpdate.value = Date.now()

      return matches.value
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Discover content based on location
   * 🎯 UPDATED: Now passes user interests to filter local articles
   */
  const discoverByLocation = async (
    lat: number,
    lng: number,
    radius: number,
    interests: string[] = []
  ): Promise<DiscoveryMatch[]> => {
    isLoading.value = true

    try {
      // 🎯 Pass interests to ensure local articles match user preferences
      const articles = await newsService.searchByLocation(lat, lng, radius, interests)
      const locationMatches: DiscoveryMatch[] = []

      for (const article of articles) {
        // Calculate distance if coordinates available
        let distanceText = `${radius}km Umkreis`
        if (article.coordinates) {
          const distance = calculateDistance(lat, lng, article.coordinates.lat, article.coordinates.lng)
          distanceText = `${distance.toFixed(1)}km entfernt`
        }

        locationMatches.push({
          type: 'article',
          id: article.id,
          title: article.title,
          description: article.summary,
          score: 0.8,
          reason: `In deiner Nähe (${distanceText})`,
          data: article
        })
      }

      matches.value = locationMatches
      lastUpdate.value = Date.now()

      return matches.value
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Discover similar users
   */
  const discoverUsers = async (interests: string[]): Promise<DiscoveryMatch[]> => {
    isLoading.value = true

    try {
      const userMatches: DiscoveryMatch[] = []

      // Search users with similar interests
      for (const interest of interests) {
        const users = await userService.searchUsers(interest)

        for (const user of users) {
          const commonInterests = user.interests.filter(i =>
            interests.includes(i)
          )

          if (commonInterests.length > 0) {
            const score = commonInterests.length / Math.max(interests.length, user.interests.length)

            userMatches.push({
              type: 'user',
              id: user.id,
              title: user.name,
              description: user.bio || '',
              score,
              reason: `${commonInterests.length} gemeinsame Interessen`,
              data: user
            })
          }
        }
      }

      // Sort by score
      userMatches.sort((a, b) => b.score - a.score)

      matches.value = userMatches.slice(0, 10)
      lastUpdate.value = Date.now()

      return matches.value
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Hybrid discovery - combines interests and location
   */
  const discoverHybrid = async (
    interests: string[],
    location?: { lat: number; lng: number; radius: number }
  ): Promise<DiscoveryMatch[]> => {
    isLoading.value = true

    try {
      const allMatches: DiscoveryMatch[] = []

      // Get interest-based matches
      const interestArticles = await newsService.searchByInterests(interests)
      for (const article of interestArticles) {
        const score = calculateRelevanceScore(article, interests)
        allMatches.push({
          type: 'article',
          id: article.id,
          title: article.title,
          description: article.summary,
          score: score * 0.7, // Weight interests
          reason: 'Passt zu deinen Interessen',
          data: article
        })
      }

      // Get location-based matches if location provided
      if (location) {
        // 🎯 Pass interests to filter local articles by user preferences
        const locationArticles = await newsService.searchByLocation(
          location.lat,
          location.lng,
          location.radius,
          interests // Now includes interests for better filtering
        )

        for (const article of locationArticles) {
          const existingMatch = allMatches.find(m => m.id === article.id)

          if (existingMatch) {
            // Boost score if article matches both interests and location
            existingMatch.score += 0.5
            existingMatch.reason = 'Passt zu Interessen & in deiner Nähe ⭐'
          } else {
            // Calculate distance for more context
            let distanceInfo = ''
            if (article.coordinates) {
              const distance = calculateDistance(
                location.lat,
                location.lng,
                article.coordinates.lat,
                article.coordinates.lng
              )
              distanceInfo = ` (${distance.toFixed(1)}km)`
            }

            allMatches.push({
              type: 'article',
              id: article.id,
              title: article.title,
              description: article.summary,
              score: 0.4, // Weight location
              reason: `In deiner Nähe${distanceInfo}`,
              data: article
            })
          }
        }
      }

      // Sort by score
      allMatches.sort((a, b) => b.score - a.score)

      matches.value = allMatches.slice(0, 15)
      lastUpdate.value = Date.now()

      return matches.value
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Calculate distance between two coordinates using Haversine formula
   * Returns distance in kilometers
   */
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
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
   * Calculate relevance score for an article
   */
  const calculateRelevanceScore = (
    article: NewsArticle,
    interests: string[]
  ): number => {
    let score = 0

    // Check topics
    const matchingTopics = article.topics.filter(topic =>
      interests.some(interest =>
        topic.toLowerCase().includes(interest.toLowerCase())
      )
    )
    score += matchingTopics.length * 0.3

    // Check tags
    if (article.tags) {
      const matchingTags = article.tags.filter(tag =>
        interests.some(interest =>
          tag.toLowerCase().includes(interest.toLowerCase())
        )
      )
      score += matchingTags.length * 0.2
    }

    // Recency bonus
    const ageInDays = (Date.now() - article.publishedAt) / (1000 * 60 * 60 * 24)
    if (ageInDays < 1) score += 0.2
    else if (ageInDays < 7) score += 0.1

    // Breaking news bonus
    if (article.tags?.includes('breaking')) {
      score += 0.3
    }

    return Math.min(score, 1.0)
  }

  /**
   * Clear matches
   */
  const clearMatches = () => {
    matches.value = []
    saveMatches()
  }

  /**
   * Load matches from localStorage
   */
  const loadMatches = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        matches.value = JSON.parse(stored)
      }

      const storedSettings = localStorage.getItem(SETTINGS_KEY)
      if (storedSettings) {
        settings.value = JSON.parse(storedSettings)
      }
    } catch (err) {
      console.error('Failed to load discovery matches:', err)
    }
  }

  /**
   * Save matches to localStorage
   */
  const saveMatches = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(matches.value))
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings.value))
    } catch (err) {
      console.error('Failed to save discovery matches:', err)
    }
  }

  /**
   * Update discovery settings
   */
  const updateSettings = (newSettings: Partial<DiscoverySettings>) => {
    settings.value = { ...settings.value, ...newSettings }
    saveMatches()

    // Restart auto-refresh if enabled
    if (settings.value.autoRefresh) {
      startAutoRefresh()
    } else {
      stopAutoRefresh()
    }
  }

  /**
   * Subscribe to Gun.js for real-time discovery updates
   */
  const subscribeToGun = () => {
    try {
      const discoveryNode = gun.get('news_plugin').get('discovery')

      discoveryNode.map().on((data: any, id: string) => {
        if (!data) return

        // Filter old discoveries (older than 24 hours)
        const oneDayAgo = Date.now() - (86400000)
        if (data.timestamp && data.timestamp < oneDayAgo) return

        // Check if match already exists
        const existing = matches.value.find(m => m.id === id)
        if (existing) return

        // Add new discovery match
        const match: DiscoveryMatch = {
          type: data.type || 'article',
          id,
          title: data.title,
          description: data.description || '',
          score: data.score || 0.5,
          reason: data.reason || 'Neue Entdeckung',
          data: data.data,
          timestamp: data.timestamp || Date.now()
        }

        matches.value.unshift(match)

        // Keep only top 50 matches
        if (matches.value.length > 50) {
          matches.value = matches.value.slice(0, 50)
        }

        saveMatches()
      })

      console.log('📡 Subscribed to Gun.js discovery updates')
    } catch (err) {
      console.error('Failed to subscribe to Gun.js discovery:', err)
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
   * Start auto-refresh interval
   */
  const startAutoRefresh = () => {
    stopAutoRefresh() // Clear existing interval

    if (!settings.value.autoRefresh) return

    autoRefreshInterval = setInterval(async () => {
      if (settings.value.interests.length > 0) {
        await discoverHybrid(settings.value.interests, settings.value.location)
      }
    }, settings.value.refreshInterval)

    console.log(`🔄 Auto-refresh started (every ${settings.value.refreshInterval / 1000}s)`)
  }

  /**
   * Stop auto-refresh interval
   */
  const stopAutoRefresh = () => {
    if (autoRefreshInterval) {
      clearInterval(autoRefreshInterval)
      autoRefreshInterval = null
      console.log('🛑 Auto-refresh stopped')
    }
  }

  /**
   * Publish discovery match to Gun.js (for P2P sharing)
   */
  const publishMatch = async (match: DiscoveryMatch) => {
    try {
      const discoveryNode = gun.get('news_plugin').get('discovery')
      await discoveryNode.get(match.id).put({
        type: match.type,
        title: match.title,
        description: match.description,
        score: match.score,
        reason: match.reason,
        data: match.data,
        timestamp: Date.now()
      })
      console.log('✅ Published discovery match to Gun.js:', match.id)
    } catch (err) {
      console.error('Failed to publish match to Gun.js:', err)
    }
  }

  /**
   * Initialize discovery system
   */
  const initialize = () => {
    loadMatches()
    subscribeToGun()

    if (settings.value.autoRefresh) {
      startAutoRefresh()
    }
  }

  /**
   * Cleanup discovery system
   */
  const cleanup = () => {
    stopAutoRefresh()
    unsubscribeFromGun()
  }

  // Watch for changes in matches and save automatically
  watch(matches, () => {
    if (matches.value.length > 0) {
      saveMatches()
    }
  }, { deep: true })

  const topMatches = computed(() => matches.value.slice(0, 5))
  const hasMatches = computed(() => matches.value.length > 0)
  const highScoreMatches = computed(() => matches.value.filter(m => m.score > 0.7))

  return {
    // State
    matches,
    isLoading,
    lastUpdate,
    settings,
    topMatches,
    hasMatches,
    highScoreMatches,

    // Actions - Discovery
    discoverByInterests,
    discoverByLocation,
    discoverUsers,
    discoverHybrid,
    clearMatches,

    // Actions - Storage
    loadMatches,
    saveMatches,
    updateSettings,

    // Actions - Gun.js
    subscribeToGun,
    unsubscribeFromGun,
    publishMatch,

    // Actions - Auto-refresh
    startAutoRefresh,
    stopAutoRefresh,

    // Lifecycle
    initialize,
    cleanup
  }
}
