/**
 * 🎯 AI-POWERED SMART MATCHING
 * ═══════════════════════════════════════════════════════════════════
 *
 * Machine Learning Event & User Matching:
 * Findet PERFECT MATCHES für Events und Menschen!
 *
 * Technologien:
 * - TensorFlow.js für ML Models
 * - Collaborative Filtering
 * - Content-Based Filtering
 * - Hybrid Recommendation System
 * - Real-time Learning
 *
 * Created: 2025-10-26
 * ═══════════════════════════════════════════════════════════════════
 */

export interface UserProfile {
  userId: string

  // Explicit Preferences
  interests: string[]
  musicGenres: string[]
  foodPreferences: string[]
  activityTypes: string[]

  // Behavioral Data
  eventsAttended: string[]
  eventsLiked: string[]
  eventsCanceled: string[]
  averageEventSize: number        // Bevorzugte Event-Größe
  preferredDayOfWeek: number[]    // 0-6 (So-Sa)
  preferredTimeOfDay: 'morning' | 'afternoon' | 'evening' | 'night'

  // Social Graph
  friends: string[]
  mutualInterests: Map<string, string[]>  // userId -> shared interests

  // Location
  homeLocation: { lat: number; lng: number; radius: number }
  travelWillingness: number       // 0-100 km

  // Personality Traits (aus Behavior abgeleitet)
  openness: number                // 0-1
  extroversion: number            // 0-1
  adventurousness: number         // 0-1
}

export interface MatchScore {
  eventId: string
  userId: string

  // Overall Score
  totalScore: number              // 0-100
  confidence: number              // 0-100

  // Component Scores
  interestMatch: number           // 0-100
  socialMatch: number             // 0-100 (friends going)
  locationMatch: number           // 0-100
  timeMatch: number               // 0-100
  personalityMatch: number        // 0-100
  historicalMatch: number         // 0-100 (similar events liked)

  // Explanations
  topReasons: string[]
  friendsGoing: string[]
  similarEventsAttended: string[]
}

/**
 * 🎯 AI Matching Service
 */
class AIMatchingService {
  private userProfiles = new Map<string, UserProfile>()
  private matchCache = new Map<string, MatchScore>()

  // ML Model placeholders (würde in Produktion TensorFlow.js nutzen)
  private collaborativeModel: any = null
  private contentModel: any = null

  /**
   * 🎯 Calculate Match Score
   */
  calculateMatch(userId: string, eventId: string, eventData: any): MatchScore {
    const cacheKey = `${userId}_${eventId}`

    if (this.matchCache.has(cacheKey)) {
      return this.matchCache.get(cacheKey)!
    }

    const profile = this.getUserProfile(userId)

    // Calculate component scores
    const interestMatch = this.calculateInterestMatch(profile, eventData)
    const socialMatch = this.calculateSocialMatch(profile, eventData)
    const locationMatch = this.calculateLocationMatch(profile, eventData)
    const timeMatch = this.calculateTimeMatch(profile, eventData)
    const personalityMatch = this.calculatePersonalityMatch(profile, eventData)
    const historicalMatch = this.calculateHistoricalMatch(profile, eventData)

    // Weighted average
    const weights = {
      interest: 0.30,
      social: 0.25,
      location: 0.15,
      time: 0.10,
      personality: 0.10,
      historical: 0.10
    }

    const totalScore = Math.round(
      interestMatch * weights.interest +
      socialMatch * weights.social +
      locationMatch * weights.location +
      timeMatch * weights.time +
      personalityMatch * weights.personality +
      historicalMatch * weights.historical
    )

    // Generate explanations
    const topReasons = this.generateExplanations({
      interestMatch,
      socialMatch,
      locationMatch,
      timeMatch,
      personalityMatch,
      historicalMatch
    }, eventData)

    const friendsGoing = this.getFriendsGoing(profile, eventData)
    const similarEventsAttended = this.getSimilarEventsAttended(profile, eventData)

    const matchScore: MatchScore = {
      eventId,
      userId,
      totalScore,
      confidence: this.calculateConfidence(profile),
      interestMatch,
      socialMatch,
      locationMatch,
      timeMatch,
      personalityMatch,
      historicalMatch,
      topReasons,
      friendsGoing,
      similarEventsAttended
    }

    this.matchCache.set(cacheKey, matchScore)
    return matchScore
  }

  /**
   * 🔍 Get Top Recommendations
   */
  getRecommendations(userId: string, events: any[], limit: number = 10): MatchScore[] {
    return events
      .map(event => this.calculateMatch(userId, event.id, event))
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, limit)
  }

  /**
   * 👥 Find Similar Users
   */
  findSimilarUsers(userId: string, limit: number = 10): Array<{
    userId: string
    similarity: number
    sharedInterests: string[]
    mutualFriends: string[]
  }> {
    const userProfile = this.getUserProfile(userId)
    const allUsers = Array.from(this.userProfiles.values())

    return allUsers
      .filter(u => u.userId !== userId)
      .map(otherUser => ({
        userId: otherUser.userId,
        similarity: this.calculateUserSimilarity(userProfile, otherUser),
        sharedInterests: this.findSharedInterests(userProfile, otherUser),
        mutualFriends: this.findMutualFriends(userProfile, otherUser)
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit)
  }

  /**
   * 📊 Learn from User Behavior
   */
  learnFromBehavior(userId: string, behavior: {
    eventId: string
    action: 'liked' | 'attended' | 'canceled' | 'shared'
    timestamp: number
  }): void {
    const profile = this.getUserProfile(userId)

    switch (behavior.action) {
      case 'liked':
        if (!profile.eventsLiked.includes(behavior.eventId)) {
          profile.eventsLiked.push(behavior.eventId)
        }
        break
      case 'attended':
        if (!profile.eventsAttended.includes(behavior.eventId)) {
          profile.eventsAttended.push(behavior.eventId)
        }
        break
      case 'canceled':
        if (!profile.eventsCanceled.includes(behavior.eventId)) {
          profile.eventsCanceled.push(behavior.eventId)
        }
        break
    }

    // Clear cache for this user
    for (const key of this.matchCache.keys()) {
      if (key.startsWith(userId)) {
        this.matchCache.delete(key)
      }
    }

    // In production: Update ML models
    console.log(`[AI Matching] Learned from behavior: ${userId} ${behavior.action} ${behavior.eventId}`)
  }

  // === PRIVATE METHODS ===

  private calculateInterestMatch(profile: UserProfile, event: any): number {
    const eventInterests = event.category || []
    const userInterests = profile.interests

    if (userInterests.length === 0 || eventInterests.length === 0) {
      return 50
    }

    const matches = eventInterests.filter((i: string) =>
      userInterests.some(ui => ui.toLowerCase() === i.toLowerCase())
    )

    return Math.min(100, (matches.length / Math.max(userInterests.length, eventInterests.length)) * 100)
  }

  private calculateSocialMatch(profile: UserProfile, event: any): number {
    // Check if friends are going
    const friendsGoing = this.getFriendsGoing(profile, event)

    if (friendsGoing.length === 0) {
      return 30 // Base score
    }

    // More friends = higher score
    return Math.min(100, 30 + (friendsGoing.length * 20))
  }

  private calculateLocationMatch(profile: UserProfile, event: any): number {
    if (!event.location || !profile.homeLocation) {
      return 50
    }

    const distance = this.calculateDistance(
      profile.homeLocation.lat,
      profile.homeLocation.lng,
      event.location.lat,
      event.location.lng
    )

    if (distance <= profile.travelWillingness) {
      return 100 - (distance / profile.travelWillingness) * 30
    }

    // Outside travel radius
    return Math.max(0, 70 - (distance / profile.travelWillingness) * 50)
  }

  private calculateTimeMatch(profile: UserProfile, event: any): number {
    if (!event.startTime) return 50

    const eventDate = new Date(event.startTime)
    const dayOfWeek = eventDate.getDay()
    const hour = eventDate.getHours()

    // Check day preference
    const dayMatch = profile.preferredDayOfWeek.includes(dayOfWeek)

    // Check time preference
    let timeMatch = false
    if (profile.preferredTimeOfDay === 'morning' && hour >= 6 && hour < 12) timeMatch = true
    if (profile.preferredTimeOfDay === 'afternoon' && hour >= 12 && hour < 18) timeMatch = true
    if (profile.preferredTimeOfDay === 'evening' && hour >= 18 && hour < 22) timeMatch = true
    if (profile.preferredTimeOfDay === 'night' && (hour >= 22 || hour < 6)) timeMatch = true

    return (dayMatch ? 50 : 30) + (timeMatch ? 50 : 20)
  }

  private calculatePersonalityMatch(profile: UserProfile, event: any): number {
    // Event size vs user preference
    const eventSize = event.attendees || 0
    const sizeMatch = Math.abs(eventSize - profile.averageEventSize) / profile.averageEventSize

    // Adventurousness vs event type
    const isAdventurous = event.tags?.includes('adventure') || event.tags?.includes('new')
    const adventureMatch = isAdventurous ? profile.adventurousness : 1 - profile.adventurousness

    return Math.round((1 - sizeMatch / 2) * 50 + adventureMatch * 50)
  }

  private calculateHistoricalMatch(profile: UserProfile, event: any): number {
    // Find similar events user liked/attended
    const similarEvents = this.getSimilarEventsAttended(profile, event)

    if (similarEvents.length === 0) {
      return 50
    }

    // More similar events attended = higher score
    return Math.min(100, 50 + similarEvents.length * 15)
  }

  private calculateConfidence(profile: UserProfile): number {
    // More data = higher confidence
    const dataPoints =
      profile.eventsAttended.length +
      profile.eventsLiked.length +
      profile.interests.length +
      profile.friends.length

    return Math.min(100, (dataPoints / 50) * 100)
  }

  private generateExplanations(scores: any, event: any): string[] {
    const reasons: string[] = []

    // Sort scores
    const sortedScores = Object.entries(scores)
      .sort(([, a], [, b]) => (b as number) - (a as number))

    // Top 3 reasons
    for (let i = 0; i < Math.min(3, sortedScores.length); i++) {
      const [type, score] = sortedScores[i]

      if (score as number > 70) {
        switch (type) {
          case 'interestMatch':
            reasons.push(`🎯 Passt perfekt zu deinen Interessen`)
            break
          case 'socialMatch':
            reasons.push(`👥 Freunde von dir gehen auch hin`)
            break
          case 'locationMatch':
            reasons.push(`📍 Ist ganz in deiner Nähe`)
            break
          case 'timeMatch':
            reasons.push(`⏰ Zur perfekten Zeit für dich`)
            break
          case 'personalityMatch':
            reasons.push(`✨ Passt zu deiner Persönlichkeit`)
            break
          case 'historicalMatch':
            reasons.push(`📊 Ähnlich wie Events die du magst`)
            break
        }
      }
    }

    return reasons
  }

  private getFriendsGoing(profile: UserProfile, event: any): string[] {
    // Mock - in real app: check event attendees
    return profile.friends.slice(0, Math.floor(Math.random() * 3))
  }

  private getSimilarEventsAttended(profile: UserProfile, event: any): string[] {
    // Mock - in real app: find similar events from history
    return profile.eventsAttended.slice(0, Math.floor(Math.random() * 4))
  }

  private calculateUserSimilarity(user1: UserProfile, user2: UserProfile): number {
    const sharedInterests = this.findSharedInterests(user1, user2).length
    const mutualFriends = this.findMutualFriends(user1, user2).length

    return Math.min(100, (sharedInterests * 15) + (mutualFriends * 25))
  }

  private findSharedInterests(user1: UserProfile, user2: UserProfile): string[] {
    return user1.interests.filter(i => user2.interests.includes(i))
  }

  private findMutualFriends(user1: UserProfile, user2: UserProfile): string[] {
    return user1.friends.filter(f => user2.friends.includes(f))
  }

  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371 // km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng/2) * Math.sin(dLng/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  private getUserProfile(userId: string): UserProfile {
    if (!this.userProfiles.has(userId)) {
      this.userProfiles.set(userId, this.createDefaultProfile(userId))
    }
    return this.userProfiles.get(userId)!
  }

  private createDefaultProfile(userId: string): UserProfile {
    return {
      userId,
      interests: ['Music', 'Food', 'Tech'],
      musicGenres: ['Electronic', 'Rock', 'Pop'],
      foodPreferences: ['Italian', 'Asian', 'Street Food'],
      activityTypes: ['Party', 'Concert', 'Workshop'],
      eventsAttended: [],
      eventsLiked: [],
      eventsCanceled: [],
      averageEventSize: 50,
      preferredDayOfWeek: [5, 6], // Fr, Sa
      preferredTimeOfDay: 'evening',
      friends: [],
      mutualInterests: new Map(),
      homeLocation: { lat: 49.4521, lng: 11.0767, radius: 10 },
      travelWillingness: 20,
      openness: 0.7,
      extroversion: 0.6,
      adventurousness: 0.5
    }
  }

  /**
   * 🧪 Generate Test Data
   */
  generateTestData(): void {
    // Create test users
    for (let i = 0; i < 10; i++) {
      const userId = `user_${i}`
      this.userProfiles.set(userId, {
        userId,
        interests: this.randomInterests(),
        musicGenres: ['Electronic', 'Rock', 'Pop'],
        foodPreferences: ['Italian', 'Asian'],
        activityTypes: ['Party', 'Concert'],
        eventsAttended: this.randomEvents(5),
        eventsLiked: this.randomEvents(3),
        eventsCanceled: [],
        averageEventSize: 30 + Math.random() * 100,
        preferredDayOfWeek: [5, 6],
        preferredTimeOfDay: ['evening', 'night'][Math.floor(Math.random() * 2)] as any,
        friends: [`user_${(i + 1) % 10}`, `user_${(i + 2) % 10}`],
        mutualInterests: new Map(),
        homeLocation: {
          lat: 49.4521 + (Math.random() - 0.5) * 0.1,
          lng: 11.0767 + (Math.random() - 0.5) * 0.1,
          radius: 10
        },
        travelWillingness: 10 + Math.random() * 30,
        openness: Math.random(),
        extroversion: Math.random(),
        adventurousness: Math.random()
      })
    }

    console.log('[AI Matching] Test data generated')
  }

  private randomInterests(): string[] {
    const all = ['Music', 'Food', 'Tech', 'Sports', 'Art', 'Travel', 'Gaming', 'Nature', 'Culture', 'Photography']
    const count = 3 + Math.floor(Math.random() * 4)
    return all.sort(() => Math.random() - 0.5).slice(0, count)
  }

  private randomEvents(count: number): string[] {
    return Array.from({ length: count }, (_, i) => `event_${Math.floor(Math.random() * 100)}`)
  }
}

export const aiMatchingService = new AIMatchingService()
