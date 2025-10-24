/**
 * 👥 PEOPLE DISCOVERY SERVICE
 * ═══════════════════════════════════════════════════════════════════
 *
 * Finds people with similar interests and shows their locations.
 *
 * Features:
 * - Interest-based matching (semantic)
 * - Location-based discovery (distance calculation)
 * - Privacy controls (visibility settings)
 * - Top locations aggregation
 * - Real-time updates via Gun.js
 *
 * Example:
 * User interests: ["food", "tech"]
 * → Finds people with similar interests
 * → Shows their approximate location
 * → Calculates match score & distance
 *
 * Created: 2025-10-24
 * ═══════════════════════════════════════════════════════════════════
 */

import { semanticMatchingService } from './semanticMatchingService'

export interface UserProfile {
  id: string
  username: string
  avatar?: string
  bio?: string
  interests: string[]
  location?: {
    lat: number
    lng: number
    city?: string
    country?: string
    precision: 'exact' | 'approximate' | 'city' | 'hidden' // Privacy levels
  }
  visibility: {
    profile: boolean      // Show profile to others
    location: boolean     // Show location
    interests: boolean    // Show interests
    distance: boolean     // Show distance to others
  }
  lastSeen: number
  stats?: {
    articlesRead: number
    bookmarks: number
    connections: number
  }
}

export interface PeopleMatch {
  user: UserProfile
  matchScore: number           // 0-100% interest similarity
  distance?: number            // km from you
  sharedInterests: string[]    // Common interests
  topLocations: string[]       // Their favorite spots
  matchReason: string          // Why they matched
}

export interface TopLocation {
  name: string
  lat: number
  lng: number
  city: string
  popularity: number           // How many users interested
  matchingUsers: number        // Users with your interests
  categories: string[]         // food, tech, community, etc.
  averageDistance: number      // Average distance from matching users
}

/**
 * 👥 People Discovery Engine
 */
class PeopleDiscoveryService {
  private users: UserProfile[] = []
  private userLocationsCache = new Map<string, { lat: number; lng: number }>()

  /**
   * 🎯 Main Discovery: Find people with similar interests
   */
  async discoverPeople(
    myInterests: string[],
    myLocation?: { lat: number; lng: number },
    options: {
      maxDistance?: number      // km radius (default: unlimited)
      minMatchScore?: number    // 0-100 (default: 30)
      limit?: number            // max results (default: 50)
      includeHidden?: boolean   // include users with hidden location (default: false)
    } = {}
  ): Promise<PeopleMatch[]> {
    const {
      maxDistance = Infinity,
      minMatchScore = 30,
      limit = 50,
      includeHidden = false
    } = options

    console.log(`👥 [PEOPLE DISCOVERY] Finding people...`)
    console.log(`   My Interests: ${myInterests.join(', ')}`)
    console.log(`   Max Distance: ${maxDistance === Infinity ? 'unlimited' : maxDistance + 'km'}`)

    // Get all visible users
    const availableUsers = await this.getVisibleUsers()
    console.log(`   Available Users: ${availableUsers.length}`)

    const matches: PeopleMatch[] = []

    for (const user of availableUsers) {
      // Skip if interests not visible
      if (!user.visibility.interests) continue

      // Calculate interest match score
      const matchScore = this.calculateInterestMatch(myInterests, user.interests)

      // Skip if below threshold
      if (matchScore < minMatchScore) continue

      // Calculate distance if both have locations
      let distance: number | undefined
      if (myLocation && user.location && user.visibility.location) {
        if (user.location.precision !== 'hidden') {
          distance = this.calculateDistance(
            myLocation.lat,
            myLocation.lng,
            user.location.lat,
            user.location.lng
          )

          // Skip if too far
          if (distance > maxDistance) continue
        }
      }

      // Find shared interests
      const sharedInterests = this.findSharedInterests(myInterests, user.interests)

      // Generate match reason
      const matchReason = this.generateMatchReason(matchScore, distance, sharedInterests)

      // Get user's top locations
      const topLocations = this.getUserTopLocations(user)

      matches.push({
        user,
        matchScore,
        distance,
        sharedInterests,
        topLocations,
        matchReason
      })
    }

    // Sort by match score desc, then by distance asc
    matches.sort((a, b) => {
      if (Math.abs(a.matchScore - b.matchScore) > 5) {
        return b.matchScore - a.matchScore
      }
      if (a.distance !== undefined && b.distance !== undefined) {
        return a.distance - b.distance
      }
      return b.matchScore - a.matchScore
    })

    const results = matches.slice(0, limit)

    console.log(`✅ [PEOPLE DISCOVERY] Found ${results.length} matches`)
    if (results.length > 0) {
      console.log(`🏆 Top 3 Matches:`)
      results.slice(0, 3).forEach((match, i) => {
        console.log(`   ${i + 1}. ${match.user.username}`)
        console.log(`      Match: ${match.matchScore}% | Distance: ${match.distance ? match.distance.toFixed(1) + 'km' : 'unknown'}`)
        console.log(`      Shared: ${match.sharedInterests.slice(0, 3).join(', ')}`)
      })
    }

    return results
  }

  /**
   * 📍 Top Locations Discovery
   */
  async discoverTopLocations(
    myInterests: string[],
    myLocation?: { lat: number; lng: number },
    radius: number = 10 // km
  ): Promise<TopLocation[]> {
    console.log(`📍 [TOP LOCATIONS] Finding top spots for: ${myInterests.join(', ')}`)

    // Get all users with matching interests
    const matchingUsers = await this.discoverPeople(myInterests, myLocation, {
      maxDistance: radius,
      minMatchScore: 50
    })

    // Aggregate locations
    const locationMap = new Map<string, {
      coords: { lat: number; lng: number }
      city: string
      users: UserProfile[]
      categories: Set<string>
    }>()

    for (const match of matchingUsers) {
      if (!match.user.location || match.user.location.precision === 'hidden') continue

      const key = `${match.user.location.lat.toFixed(3)},${match.user.location.lng.toFixed(3)}`

      if (!locationMap.has(key)) {
        locationMap.set(key, {
          coords: { lat: match.user.location.lat, lng: match.user.location.lng },
          city: match.user.location.city || 'Unknown',
          users: [],
          categories: new Set()
        })
      }

      const loc = locationMap.get(key)!
      loc.users.push(match.user)
      match.sharedInterests.forEach(int => loc.categories.add(int))
    }

    // Convert to TopLocation array
    const topLocations: TopLocation[] = []

    for (const [key, data] of locationMap.entries()) {
      // Calculate average distance from myLocation
      let avgDistance = 0
      if (myLocation) {
        avgDistance = this.calculateDistance(
          myLocation.lat,
          myLocation.lng,
          data.coords.lat,
          data.coords.lng
        )
      }

      topLocations.push({
        name: data.city,
        lat: data.coords.lat,
        lng: data.coords.lng,
        city: data.city,
        popularity: data.users.length,
        matchingUsers: data.users.length,
        categories: Array.from(data.categories),
        averageDistance: avgDistance
      })
    }

    // Sort by popularity
    topLocations.sort((a, b) => b.popularity - a.popularity)

    console.log(`✅ [TOP LOCATIONS] Found ${topLocations.length} hot spots`)
    topLocations.slice(0, 3).forEach((loc, i) => {
      console.log(`   ${i + 1}. ${loc.name} - ${loc.matchingUsers} people (${loc.averageDistance.toFixed(1)}km away)`)
    })

    return topLocations
  }

  /**
   * 🔍 Calculate interest match score between two users
   */
  private calculateInterestMatch(myInterests: string[], theirInterests: string[]): number {
    if (myInterests.length === 0 || theirInterests.length === 0) return 0

    // Expand both interest sets semantically
    const myExpanded = semanticMatchingService.expandAllInterests(myInterests)
    const theirExpanded = semanticMatchingService.expandAllInterests(theirInterests)

    // Calculate Jaccard similarity
    const mySet = new Set(myExpanded)
    const theirSet = new Set(theirExpanded)
    const intersection = new Set([...mySet].filter(x => theirSet.has(x)))
    const union = new Set([...mySet, ...theirSet])

    const jaccardScore = intersection.size / union.size

    // Bonus for direct interest matches
    let directMatches = 0
    for (const myInt of myInterests) {
      for (const theirInt of theirInterests) {
        const similarity = semanticMatchingService.calculateInterestSimilarity(myInt, theirInt)
        if (similarity > 0.8) directMatches++
      }
    }

    const directBonus = Math.min(0.3, directMatches * 0.1)

    // Convert to 0-100 scale
    return Math.min(100, Math.round((jaccardScore + directBonus) * 100))
  }

  /**
   * 🤝 Find shared interests
   */
  private findSharedInterests(myInterests: string[], theirInterests: string[]): string[] {
    const shared: string[] = []
    const seenLower = new Set<string>()

    for (const myInt of myInterests) {
      for (const theirInt of theirInterests) {
        const similarity = semanticMatchingService.calculateInterestSimilarity(myInt, theirInt)
        if (similarity > 0.7) {
          const key = myInt.toLowerCase()
          if (!seenLower.has(key)) {
            shared.push(myInt)
            seenLower.add(key)
          }
        }
      }
    }

    return shared
  }

  /**
   * 📐 Calculate distance between two points (Haversine)
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
   * 💬 Generate match reason
   */
  private generateMatchReason(matchScore: number, distance?: number, sharedInterests: string[] = []): string {
    const parts: string[] = []

    if (matchScore >= 80) parts.push('🔥 Sehr ähnliche Interessen')
    else if (matchScore >= 60) parts.push('🎯 Ähnliche Interessen')
    else if (matchScore >= 40) parts.push('✨ Gemeinsame Interessen')

    if (distance !== undefined) {
      if (distance < 1) parts.push('📍 In deiner Nähe (<1km)')
      else if (distance < 5) parts.push(`📍 ${distance.toFixed(1)}km entfernt`)
      else parts.push(`📍 ${Math.round(distance)}km entfernt`)
    }

    if (sharedInterests.length > 0) {
      parts.push(`💫 ${sharedInterests.slice(0, 2).join(', ')}`)
    }

    return parts.join(' • ')
  }

  /**
   * 📍 Get user's top locations
   */
  private getUserTopLocations(user: UserProfile): string[] {
    // In real implementation, this would come from user's activity data
    // For now, return location if available
    if (user.location && user.visibility.location) {
      return [user.location.city || 'Unknown location']
    }
    return []
  }

  /**
   * 👀 Get all visible users
   */
  private async getVisibleUsers(): Promise<UserProfile[]> {
    // In real implementation, this would fetch from Gun.js
    // For now, return mock data
    return this.generateMockUsers(50)
  }

  /**
   * 🎭 Generate mock users for testing
   */
  private generateMockUsers(count: number): UserProfile[] {
    const cities = [
      { name: 'Nürnberg', lat: 49.4478, lng: 11.0683 },
      { name: 'Berlin', lat: 52.5200, lng: 13.4050 },
      { name: 'München', lat: 48.1351, lng: 11.5820 },
      { name: 'Hamburg', lat: 53.5511, lng: 9.9937 },
      { name: 'Köln', lat: 50.9375, lng: 6.9603 },
      { name: 'Frankfurt', lat: 50.1109, lng: 8.6821 }
    ]

    const interestPools = [
      ['food', 'restaurant', 'cooking', 'vegan'],
      ['tech', 'startup', 'innovation', 'ai'],
      ['community', 'local', 'events', 'social'],
      ['health', 'fitness', 'yoga', 'wellness'],
      ['culture', 'art', 'music', 'theater'],
      ['travel', 'adventure', 'photography', 'nature']
    ]

    const names = [
      'Anna', 'Ben', 'Clara', 'David', 'Emma', 'Felix',
      'Hannah', 'Igor', 'Julia', 'Klaus', 'Laura', 'Max',
      'Nina', 'Oliver', 'Paula', 'Quentin', 'Rosa', 'Stefan'
    ]

    const users: UserProfile[] = []

    for (let i = 0; i < count; i++) {
      const city = cities[Math.floor(Math.random() * cities.length)]
      const interestPool = interestPools[Math.floor(Math.random() * interestPools.length)]
      const numInterests = 2 + Math.floor(Math.random() * 3)
      const interests = interestPool.slice(0, numInterests)

      // Random offset within ~5km
      const latOffset = (Math.random() - 0.5) * 0.05
      const lngOffset = (Math.random() - 0.5) * 0.05

      users.push({
        id: `user_${i}`,
        username: names[i % names.length] + Math.floor(Math.random() * 100),
        bio: `Interested in ${interests.join(', ')}`,
        interests,
        location: {
          lat: city.lat + latOffset,
          lng: city.lng + lngOffset,
          city: city.name,
          country: 'Germany',
          precision: Math.random() > 0.3 ? 'approximate' : 'city'
        },
        visibility: {
          profile: true,
          location: Math.random() > 0.2, // 80% show location
          interests: Math.random() > 0.1, // 90% show interests
          distance: Math.random() > 0.3   // 70% show distance
        },
        lastSeen: Date.now() - Math.random() * 86400000, // Last 24h
        stats: {
          articlesRead: Math.floor(Math.random() * 100),
          bookmarks: Math.floor(Math.random() * 50),
          connections: Math.floor(Math.random() * 20)
        }
      })
    }

    return users
  }

  /**
   * 🔐 Update user visibility settings
   */
  async updateVisibility(
    userId: string,
    visibility: Partial<UserProfile['visibility']>
  ): Promise<void> {
    console.log(`🔐 [VISIBILITY] Updating settings for ${userId}`)
    // In real implementation, save to Gun.js
    // For now, just log
  }

  /**
   * 📊 Get user statistics
   */
  async getUserStats(userId: string): Promise<UserProfile['stats']> {
    // In real implementation, fetch from Gun.js
    return {
      articlesRead: 42,
      bookmarks: 15,
      connections: 8
    }
  }
}

export const peopleDiscoveryService = new PeopleDiscoveryService()
