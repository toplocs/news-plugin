/**
 * 👤 USER PROFILING & PERSONALIZATION SERVICE
 * ═══════════════════════════════════════════════════════════════════
 *
 * Lernt User-Vorlieben und erstellt individuelle Profile:
 * - Was User klickt (Interaktionen)
 * - Was User mag (Likes/Ratings)
 * - Was User nicht mag (Dislikes/Skips)
 * - Präferenzen (Preis, Distanz, Kategorien)
 * - Besuchte Orte
 * - Event-Teilnahmen
 *
 * INDIVIDUALISIERUNG:
 * - Jeder User bekommt personalisierte Empfehlungen
 * - Basierend auf Historie und Vorlieben
 * - Machine Learning Algorithmen
 * - Real-time Anpassung
 *
 * Created: 2025-10-24
 * ═══════════════════════════════════════════════════════════════════
 */

export interface UserProfile {
  userId: string
  createdAt: number
  lastActive: number

  // 🎯 Interessen & Präferenzen
  interests: {
    primary: string[]           // Haupt-Interessen
    secondary: string[]         // Sekundäre Interessen
    discovered: string[]        // Neu entdeckte Interessen
    weights: Record<string, number>  // Interest scores (0-1)
  }

  // 📍 Location Präferenzen
  locationPreferences: {
    homeLocation?: { lat: number; lng: number; city?: string }
    workLocation?: { lat: number; lng: number; city?: string }
    favoriteLocations: Array<{ lat: number; lng: number; name: string; visitCount: number }>
    maxTravelDistance: number   // km
    preferredAreas: string[]    // Stadtteile/Bezirke
  }

  // 💰 Preis-Präferenzen
  pricePreferences: {
    minPrice: number
    maxPrice: number
    preferredRange: 'budget' | 'moderate' | 'premium' | 'luxury'
    willingToPayMore: string[]  // Kategorien wo User mehr zahlt
  }

  // ⏰ Zeit-Präferenzen
  timePreferences: {
    preferredDays: string[]     // Mo, Di, Mi, etc.
    preferredTimes: Array<{ start: string; end: string }>  // "18:00"-"22:00"
    avoidDays: string[]
    flexibleSchedule: boolean
  }

  // 👥 Social Präferenzen
  socialPreferences: {
    groupSize: 'solo' | 'couple' | 'small-group' | 'large-group'
    preferredAge: { min: number; max: number }
    languages: string[]
    accessibility: string[]     // wheelchair, deaf-friendly, etc.
  }

  // 🎨 Content Präferenzen
  contentPreferences: {
    favoriteCategories: string[]
    dislikedCategories: string[]
    preferredContentTypes: Array<'poi' | 'event' | 'news' | 'article' | 'video' | 'image'>
    detailLevel: 'brief' | 'moderate' | 'detailed'
    languagePreference: string[]
  }

  // 📊 User Behavior (Machine Learning Features)
  behavior: {
    clickedArticles: Array<{
      id: string
      timestamp: number
      category: string
      interestMatch: number
      timeSpent: number  // seconds
    }>

    likedContent: Array<{
      id: string
      timestamp: number
      category: string
      rating: number  // 1-5
    }>

    dislikedContent: Array<{
      id: string
      timestamp: number
      category: string
      reason?: string
    }>

    bookmarkedContent: string[]
    sharedContent: string[]

    visitedPOIs: Array<{
      poiId: string
      timestamp: number
      rating?: number
      review?: string
    }>

    attendedEvents: Array<{
      eventId: string
      timestamp: number
      rating?: number
      wouldAttendAgain: boolean
    }>

    searchHistory: Array<{
      query: string
      timestamp: number
      resultsClicked: number
    }>
  }

  // 🤖 ML-generierte Insights
  mlInsights: {
    personalityType: string     // "explorer", "planner", "spontaneous", etc.
    activityLevel: 'low' | 'medium' | 'high'
    socialScore: number         // 0-100
    adventurenessScore: number  // 0-100
    budgetConsciousness: number // 0-100
    qualityFocus: number        // 0-100

    predictedInterests: Array<{
      interest: string
      confidence: number  // 0-1
      reason: string
    }>

    recommendedCategories: Array<{
      category: string
      score: number
      reason: string
    }>

    similarUsers: Array<{
      userId: string
      similarityScore: number  // 0-1
      sharedInterests: string[]
    }>
  }

  // 📈 Statistics
  stats: {
    totalArticlesViewed: number
    totalEventsAttended: number
    totalPOIsVisited: number
    totalBookmarks: number
    totalShares: number
    averageSessionDuration: number  // seconds
    daysSinceFirstUse: number
    engagementScore: number  // 0-100
  }
}

/**
 * 🎯 Personalization Engine
 */
class UserProfilingService {
  private profiles = new Map<string, UserProfile>()

  /**
   * 📊 Create or get user profile
   */
  async getOrCreateProfile(userId: string): Promise<UserProfile> {
    if (this.profiles.has(userId)) {
      const profile = this.profiles.get(userId)!
      profile.lastActive = Date.now()
      return profile
    }

    const newProfile: UserProfile = {
      userId,
      createdAt: Date.now(),
      lastActive: Date.now(),

      interests: {
        primary: [],
        secondary: [],
        discovered: [],
        weights: {}
      },

      locationPreferences: {
        maxTravelDistance: 10,  // Default 10km
        favoriteLocations: [],
        preferredAreas: []
      },

      pricePreferences: {
        minPrice: 0,
        maxPrice: 100,
        preferredRange: 'moderate',
        willingToPayMore: []
      },

      timePreferences: {
        preferredDays: [],
        preferredTimes: [],
        avoidDays: [],
        flexibleSchedule: true
      },

      socialPreferences: {
        groupSize: 'small-group',
        preferredAge: { min: 18, max: 99 },
        languages: ['de', 'en'],
        accessibility: []
      },

      contentPreferences: {
        favoriteCategories: [],
        dislikedCategories: [],
        preferredContentTypes: ['poi', 'event', 'news', 'article'],
        detailLevel: 'detailed',
        languagePreference: ['de']
      },

      behavior: {
        clickedArticles: [],
        likedContent: [],
        dislikedContent: [],
        bookmarkedContent: [],
        sharedContent: [],
        visitedPOIs: [],
        attendedEvents: [],
        searchHistory: []
      },

      mlInsights: {
        personalityType: 'explorer',
        activityLevel: 'medium',
        socialScore: 50,
        adventurenessScore: 50,
        budgetConsciousness: 50,
        qualityFocus: 70,
        predictedInterests: [],
        recommendedCategories: [],
        similarUsers: []
      },

      stats: {
        totalArticlesViewed: 0,
        totalEventsAttended: 0,
        totalPOIsVisited: 0,
        totalBookmarks: 0,
        totalShares: 0,
        averageSessionDuration: 0,
        daysSinceFirstUse: 0,
        engagementScore: 0
      }
    }

    this.profiles.set(userId, newProfile)
    return newProfile
  }

  /**
   * 🎯 Track user interaction
   */
  async trackInteraction(
    userId: string,
    interaction: {
      type: 'click' | 'like' | 'dislike' | 'bookmark' | 'share' | 'visit' | 'attend'
      articleId: string
      category: string
      metadata?: any
    }
  ): Promise<void> {
    const profile = await this.getOrCreateProfile(userId)

    const timestamp = Date.now()

    switch (interaction.type) {
      case 'click':
        profile.behavior.clickedArticles.push({
          id: interaction.articleId,
          timestamp,
          category: interaction.category,
          interestMatch: interaction.metadata?.interestMatch || 0.5,
          timeSpent: interaction.metadata?.timeSpent || 0
        })
        profile.stats.totalArticlesViewed++
        break

      case 'like':
        profile.behavior.likedContent.push({
          id: interaction.articleId,
          timestamp,
          category: interaction.category,
          rating: interaction.metadata?.rating || 5
        })
        // Increase interest weight
        this.updateInterestWeight(profile, interaction.category, 0.1)
        break

      case 'dislike':
        profile.behavior.dislikedContent.push({
          id: interaction.articleId,
          timestamp,
          category: interaction.category,
          reason: interaction.metadata?.reason
        })
        // Decrease interest weight
        this.updateInterestWeight(profile, interaction.category, -0.1)
        break

      case 'bookmark':
        profile.behavior.bookmarkedContent.push(interaction.articleId)
        profile.stats.totalBookmarks++
        break

      case 'share':
        profile.behavior.sharedContent.push(interaction.articleId)
        profile.stats.totalShares++
        break

      case 'visit':
        profile.behavior.visitedPOIs.push({
          poiId: interaction.articleId,
          timestamp,
          rating: interaction.metadata?.rating
        })
        profile.stats.totalPOIsVisited++
        break

      case 'attend':
        profile.behavior.attendedEvents.push({
          eventId: interaction.articleId,
          timestamp,
          rating: interaction.metadata?.rating,
          wouldAttendAgain: interaction.metadata?.wouldAttendAgain || false
        })
        profile.stats.totalEventsAttended++
        break
    }

    // Update engagement score
    this.updateEngagementScore(profile)

    // Update ML insights
    await this.updateMLInsights(profile)
  }

  /**
   * 🎨 Get personalized recommendations
   */
  async getPersonalizedRecommendations(
    userId: string,
    allArticles: any[],
    limit: number = 50
  ): Promise<any[]> {
    const profile = await this.getOrCreateProfile(userId)

    console.log(`🎯 [PERSONALIZATION] Creating recommendations for ${userId}...`)

    // Score each article based on user profile
    const scoredArticles = allArticles.map(article => {
      let personalScore = 0

      // 1️⃣ Interest matching (40%)
      const interestScore = this.calculateInterestScore(profile, article)
      personalScore += interestScore * 0.4

      // 2️⃣ Category preferences (20%)
      const categoryScore = this.calculateCategoryScore(profile, article)
      personalScore += categoryScore * 0.2

      // 3️⃣ Location preferences (15%)
      const locationScore = this.calculateLocationScore(profile, article)
      personalScore += locationScore * 0.15

      // 4️⃣ Price preferences (10%)
      const priceScore = this.calculatePriceScore(profile, article)
      personalScore += priceScore * 0.1

      // 5️⃣ Time preferences (10%)
      const timeScore = this.calculateTimeScore(profile, article)
      personalScore += timeScore * 0.1

      // 6️⃣ Social preferences (5%)
      const socialScore = this.calculateSocialScore(profile, article)
      personalScore += socialScore * 0.05

      return {
        article,
        personalScore,
        breakdown: {
          interest: interestScore,
          category: categoryScore,
          location: locationScore,
          price: priceScore,
          time: timeScore,
          social: socialScore
        }
      }
    })

    // Sort by personal score
    scoredArticles.sort((a, b) => b.personalScore - a.personalScore)

    console.log(`✅ [PERSONALIZATION] Top 3 personalized:`)
    scoredArticles.slice(0, 3).forEach((item, i) => {
      console.log(`   ${i + 1}. ${item.article.title?.substring(0, 50)}...`)
      console.log(`      Personal Score: ${item.personalScore.toFixed(3)}`)
      console.log(`      Interest: ${item.breakdown.interest.toFixed(2)} | Category: ${item.breakdown.category.toFixed(2)} | Location: ${item.breakdown.location.toFixed(2)}`)
    })

    return scoredArticles.slice(0, limit).map(item => item.article)
  }

  /**
   * 🎯 Calculate interest score
   */
  private calculateInterestScore(profile: UserProfile, article: any): number {
    if (!article.topics || article.topics.length === 0) return 0.5

    let score = 0
    let matchCount = 0

    for (const topic of article.topics) {
      const topicLower = topic.toLowerCase()

      // Check primary interests (high weight)
      if (profile.interests.primary.includes(topicLower)) {
        score += 1.0
        matchCount++
      }

      // Check secondary interests (medium weight)
      else if (profile.interests.secondary.includes(topicLower)) {
        score += 0.7
        matchCount++
      }

      // Check discovered interests (low weight)
      else if (profile.interests.discovered.includes(topicLower)) {
        score += 0.4
        matchCount++
      }

      // Check interest weights
      if (profile.interests.weights[topicLower]) {
        score += profile.interests.weights[topicLower]
        matchCount++
      }
    }

    return matchCount > 0 ? score / matchCount : 0.3
  }

  /**
   * 📁 Calculate category score
   */
  private calculateCategoryScore(profile: UserProfile, article: any): number {
    const category = article.source || 'general'

    if (profile.contentPreferences.favoriteCategories.includes(category)) {
      return 1.0
    }

    if (profile.contentPreferences.dislikedCategories.includes(category)) {
      return 0.1
    }

    return 0.5
  }

  /**
   * 📍 Calculate location score
   */
  private calculateLocationScore(profile: UserProfile, article: any): number {
    if (!article.coordinates || !profile.locationPreferences.homeLocation) {
      return 0.5
    }

    const distance = this.calculateDistance(
      profile.locationPreferences.homeLocation.lat,
      profile.locationPreferences.homeLocation.lng,
      article.coordinates.lat,
      article.coordinates.lng
    )

    // Score based on distance preference
    if (distance <= profile.locationPreferences.maxTravelDistance / 2) {
      return 1.0  // Very close
    } else if (distance <= profile.locationPreferences.maxTravelDistance) {
      return 0.7  // Within range
    } else {
      return 0.3  // Too far
    }
  }

  /**
   * 💰 Calculate price score
   */
  private calculatePriceScore(profile: UserProfile, article: any): number {
    // TODO: Extract price from article content/metadata
    return 0.7  // Default neutral score
  }

  /**
   * ⏰ Calculate time score
   */
  private calculateTimeScore(profile: UserProfile, article: any): number {
    // TODO: Check if article time matches user preferences
    return 0.8  // Default neutral-positive score
  }

  /**
   * 👥 Calculate social score
   */
  private calculateSocialScore(profile: UserProfile, article: any): number {
    // TODO: Check if article matches social preferences
    return 0.7  // Default neutral score
  }

  /**
   * 📊 Update interest weight
   */
  private updateInterestWeight(profile: UserProfile, category: string, delta: number): void {
    const current = profile.interests.weights[category] || 0.5
    profile.interests.weights[category] = Math.max(0, Math.min(1, current + delta))
  }

  /**
   * 📈 Update engagement score
   */
  private updateEngagementScore(profile: UserProfile): void {
    const {
      totalArticlesViewed,
      totalEventsAttended,
      totalPOIsVisited,
      totalBookmarks,
      totalShares
    } = profile.stats

    // Weighted engagement formula
    const engagement = Math.min(100,
      (totalArticlesViewed * 1) +
      (totalEventsAttended * 5) +
      (totalPOIsVisited * 3) +
      (totalBookmarks * 2) +
      (totalShares * 4)
    )

    profile.stats.engagementScore = Math.round(engagement)
  }

  /**
   * 🤖 Update ML insights
   */
  private async updateMLInsights(profile: UserProfile): Promise<void> {
    // Analyze behavior patterns
    const recentClicks = profile.behavior.clickedArticles.slice(-50)

    // Predict personality type
    if (recentClicks.length >= 10) {
      const categories = new Set(recentClicks.map(c => c.category))

      if (categories.size > 5) {
        profile.mlInsights.personalityType = 'explorer'
        profile.mlInsights.adventurenessScore = 80
      } else if (categories.size <= 2) {
        profile.mlInsights.personalityType = 'specialist'
        profile.mlInsights.qualityFocus = 90
      } else {
        profile.mlInsights.personalityType = 'balanced'
      }
    }

    // Update activity level
    const daysSinceCreated = (Date.now() - profile.createdAt) / 86400000
    const articlesPerDay = profile.stats.totalArticlesViewed / Math.max(1, daysSinceCreated)

    if (articlesPerDay > 10) profile.mlInsights.activityLevel = 'high'
    else if (articlesPerDay > 3) profile.mlInsights.activityLevel = 'medium'
    else profile.mlInsights.activityLevel = 'low'
  }

  /**
   * 📐 Calculate distance (Haversine)
   */
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }
}

export const userProfilingService = new UserProfilingService()
