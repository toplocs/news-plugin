/**
 * 🤝 SOCIAL GRAPH SERVICE
 * ═══════════════════════════════════════════════════════════════════
 *
 * Graph Theory Algorithms für Social Network Analysis:
 * - Friend-of-Friend Discovery
 * - Community Detection
 * - Influence Scoring
 * - Path Finding
 * - Clustering
 *
 * Algorithms:
 * - PageRank für Influence Score
 * - Dijkstra für Shortest Path
 * - Community Detection (Louvain/Label Propagation)
 * - Centrality Measures
 *
 * Created: 2025-10-26
 * ═══════════════════════════════════════════════════════════════════
 */

export interface User {
  id: string
  name: string
  avatar: string
  interests: string[]
  location?: { city: string; lat: number; lng: number }
}

export interface Connection {
  userId: string
  connectedUserId: string
  strength: number           // 0-100 (interaction frequency)
  mutualFriends: number
  sharedInterests: string[]
  sharedEvents: string[]
  connectionDate: number
}

export interface SocialPath {
  from: string
  to: string
  path: string[]            // User IDs in path
  pathNames: string[]       // User names
  distance: number          // Number of hops
  strength: number          // Overall path strength
}

export interface InfluenceScore {
  userId: string
  score: number             // 0-100
  rank: number
  followers: number
  connections: number
  eventImpact: number
  communityImpact: number
}

export interface Community {
  id: string
  name: string
  members: string[]
  size: number
  density: number           // 0-1 (how connected)
  commonInterests: string[]
  topEvents: string[]
  influencers: string[]     // Top 3 influential members
}

export interface RecommendedConnection {
  user: User
  reason: string
  score: number
  mutualFriends: User[]
  sharedInterests: string[]
  connectionPath: SocialPath
}

/**
 * 🤝 Social Graph Service
 */
class SocialGraphService {
  private users = new Map<string, User>()
  private connections = new Map<string, Connection[]>()
  private influenceScores = new Map<string, InfluenceScore>()
  private communities: Community[] = []

  // Graph representation (Adjacency List)
  private graph = new Map<string, Map<string, number>>()  // userId -> (connectedId -> strength)

  /**
   * 👥 Add User
   */
  addUser(user: User): void {
    this.users.set(user.id, user)
    if (!this.graph.has(user.id)) {
      this.graph.set(user.id, new Map())
    }
  }

  /**
   * 🔗 Add Connection
   */
  addConnection(connection: Connection): void {
    // Add to connections
    if (!this.connections.has(connection.userId)) {
      this.connections.set(connection.userId, [])
    }
    this.connections.get(connection.userId)!.push(connection)

    // Update graph (bidirectional)
    this.addEdge(connection.userId, connection.connectedUserId, connection.strength)
    this.addEdge(connection.connectedUserId, connection.userId, connection.strength)
  }

  /**
   * 🔍 Find Mutual Friends
   */
  findMutualFriends(userId1: string, userId2: string): User[] {
    const friends1 = this.getConnections(userId1).map(c => c.connectedUserId)
    const friends2 = this.getConnections(userId2).map(c => c.connectedUserId)

    const mutual = friends1.filter(id => friends2.includes(id))

    return mutual
      .map(id => this.users.get(id))
      .filter((u): u is User => u !== undefined)
  }

  /**
   * 🛤️ Find Shortest Path (Dijkstra)
   */
  findShortestPath(fromUserId: string, toUserId: string): SocialPath | null {
    const distances = new Map<string, number>()
    const previous = new Map<string, string>()
    const unvisited = new Set<string>()

    // Initialize
    for (const userId of this.users.keys()) {
      distances.set(userId, Infinity)
      unvisited.add(userId)
    }
    distances.set(fromUserId, 0)

    while (unvisited.size > 0) {
      // Find min distance node
      let current: string | null = null
      let minDist = Infinity

      for (const userId of unvisited) {
        const dist = distances.get(userId)!
        if (dist < minDist) {
          minDist = dist
          current = userId
        }
      }

      if (!current || minDist === Infinity) break
      if (current === toUserId) break

      unvisited.delete(current)

      // Check neighbors
      const neighbors = this.graph.get(current)
      if (!neighbors) continue

      for (const [neighbor, strength] of neighbors.entries()) {
        if (!unvisited.has(neighbor)) continue

        // Distance = number of hops (we could weight by strength)
        const alt = distances.get(current)! + 1
        if (alt < distances.get(neighbor)!) {
          distances.set(neighbor, alt)
          previous.set(neighbor, current)
        }
      }
    }

    // Reconstruct path
    if (distances.get(toUserId) === Infinity) {
      return null // No path found
    }

    const path: string[] = []
    let current: string | undefined = toUserId

    while (current) {
      path.unshift(current)
      current = previous.get(current)
    }

    // Calculate path strength (average edge strength)
    let totalStrength = 0
    for (let i = 0; i < path.length - 1; i++) {
      const strength = this.graph.get(path[i])?.get(path[i + 1]) || 0
      totalStrength += strength
    }
    const avgStrength = totalStrength / Math.max(path.length - 1, 1)

    return {
      from: fromUserId,
      to: toUserId,
      path,
      pathNames: path.map(id => this.users.get(id)?.name || id),
      distance: path.length - 1,
      strength: Math.round(avgStrength)
    }
  }

  /**
   * 🎯 Get Recommended Connections
   */
  getRecommendedConnections(userId: string, limit: number = 10): RecommendedConnection[] {
    const currentConnections = new Set(
      this.getConnections(userId).map(c => c.connectedUserId)
    )
    currentConnections.add(userId) // Don't recommend self

    const recommendations: RecommendedConnection[] = []

    // Find friends-of-friends
    const friends = this.getConnections(userId)

    for (const friend of friends) {
      const friendsOfFriend = this.getConnections(friend.connectedUserId)

      for (const fof of friendsOfFriend) {
        if (currentConnections.has(fof.connectedUserId)) continue

        const candidate = this.users.get(fof.connectedUserId)
        if (!candidate) continue

        // Calculate recommendation score
        const mutualFriends = this.findMutualFriends(userId, candidate.id)
        const user = this.users.get(userId)
        const sharedInterests = user
          ? candidate.interests.filter(i => user.interests.includes(i))
          : []

        const score =
          mutualFriends.length * 25 +
          sharedInterests.length * 15 +
          fof.strength * 0.3

        // Find connection path
        const path = this.findShortestPath(userId, candidate.id)

        if (path) {
          recommendations.push({
            user: candidate,
            reason: this.generateRecommendationReason(mutualFriends.length, sharedInterests.length, path.distance),
            score: Math.round(score),
            mutualFriends,
            sharedInterests,
            connectionPath: path
          })
        }

        currentConnections.add(candidate.id)
      }
    }

    // Sort by score
    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
  }

  /**
   * 📊 Calculate Influence Score (PageRank-like)
   */
  calculateInfluenceScore(userId: string): InfluenceScore {
    const connections = this.getConnections(userId)
    const followers = this.getFollowers(userId).length

    // Base score from connections
    let score = connections.length * 5

    // Weighted by connection strength
    const avgStrength = connections.reduce((sum, c) => sum + c.strength, 0) / Math.max(connections.length, 1)
    score += avgStrength * 0.3

    // Bonus for high-influence connections
    for (const conn of connections) {
      const connInfluence = this.influenceScores.get(conn.connectedUserId)
      if (connInfluence && connInfluence.score > 70) {
        score += 10
      }
    }

    // Event impact (mock - would be real data in production)
    const eventImpact = Math.random() * 30

    // Community impact
    const communityImpact = this.calculateCommunityImpact(userId)

    const totalScore = Math.min(100, score + eventImpact + communityImpact)

    const influenceScore: InfluenceScore = {
      userId,
      score: Math.round(totalScore),
      rank: 0, // Will be set when calculating all scores
      followers,
      connections: connections.length,
      eventImpact: Math.round(eventImpact),
      communityImpact: Math.round(communityImpact)
    }

    this.influenceScores.set(userId, influenceScore)
    return influenceScore
  }

  /**
   * 🏘️ Detect Communities (Simple Label Propagation)
   */
  detectCommunities(): Community[] {
    const labels = new Map<string, string>()

    // Initialize: each user is their own community
    for (const userId of this.users.keys()) {
      labels.set(userId, userId)
    }

    // Iterate until convergence (max 10 iterations)
    let changed = true
    let iterations = 0

    while (changed && iterations < 10) {
      changed = false
      iterations++

      // Random order
      const userIds = Array.from(this.users.keys()).sort(() => Math.random() - 0.5)

      for (const userId of userIds) {
        // Count neighbor labels
        const neighborLabels = new Map<string, number>()

        const connections = this.getConnections(userId)
        for (const conn of connections) {
          const label = labels.get(conn.connectedUserId)!
          neighborLabels.set(label, (neighborLabels.get(label) || 0) + 1)
        }

        if (neighborLabels.size === 0) continue

        // Find most common label
        let maxCount = 0
        let maxLabel = labels.get(userId)!

        for (const [label, count] of neighborLabels.entries()) {
          if (count > maxCount) {
            maxCount = count
            maxLabel = label
          }
        }

        if (maxLabel !== labels.get(userId)) {
          labels.set(userId, maxLabel)
          changed = true
        }
      }
    }

    // Group users by community
    const communityMap = new Map<string, string[]>()

    for (const [userId, label] of labels.entries()) {
      if (!communityMap.has(label)) {
        communityMap.set(label, [])
      }
      communityMap.get(label)!.push(userId)
    }

    // Create Community objects
    this.communities = Array.from(communityMap.entries()).map(([id, members], index) => {
      const commonInterests = this.findCommonInterests(members)
      const density = this.calculateCommunityDensity(members)
      const influencers = this.findCommunityInfluencers(members)

      return {
        id,
        name: `Community ${index + 1}`,
        members,
        size: members.length,
        density,
        commonInterests,
        topEvents: [], // Would be filled with real data
        influencers
      }
    })

    return this.communities
  }

  /**
   * 📈 Get User's Community
   */
  getUserCommunity(userId: string): Community | undefined {
    return this.communities.find(c => c.members.includes(userId))
  }

  // === PRIVATE METHODS ===

  private addEdge(from: string, to: string, weight: number): void {
    if (!this.graph.has(from)) {
      this.graph.set(from, new Map())
    }
    this.graph.get(from)!.set(to, weight)
  }

  private getConnections(userId: string): Connection[] {
    return this.connections.get(userId) || []
  }

  private getFollowers(userId: string): string[] {
    const followers: string[] = []

    for (const [uid, connections] of this.connections.entries()) {
      if (connections.some(c => c.connectedUserId === userId)) {
        followers.push(uid)
      }
    }

    return followers
  }

  private calculateCommunityImpact(userId: string): number {
    // Mock - in production: based on community size, activity, etc.
    return Math.random() * 20
  }

  private generateRecommendationReason(mutualCount: number, sharedInterests: number, distance: number): string {
    if (mutualCount >= 3) {
      return `${mutualCount} gemeinsame Freunde`
    }
    if (sharedInterests >= 2) {
      return `${sharedInterests} gemeinsame Interessen`
    }
    if (distance === 2) {
      return 'Freund eines Freundes'
    }
    return 'In deinem Netzwerk'
  }

  private findCommonInterests(userIds: string[]): string[] {
    const interestCounts = new Map<string, number>()

    for (const userId of userIds) {
      const user = this.users.get(userId)
      if (!user) continue

      for (const interest of user.interests) {
        interestCounts.set(interest, (interestCounts.get(interest) || 0) + 1)
      }
    }

    // Return interests shared by >50% of members
    const threshold = userIds.length * 0.5

    return Array.from(interestCounts.entries())
      .filter(([, count]) => count >= threshold)
      .map(([interest]) => interest)
  }

  private calculateCommunityDensity(members: string[]): number {
    if (members.length < 2) return 1

    let actualEdges = 0
    const possibleEdges = (members.length * (members.length - 1)) / 2

    for (let i = 0; i < members.length; i++) {
      for (let j = i + 1; j < members.length; j++) {
        if (this.graph.get(members[i])?.has(members[j])) {
          actualEdges++
        }
      }
    }

    return actualEdges / possibleEdges
  }

  private findCommunityInfluencers(members: string[]): string[] {
    // Get influence scores for members
    const scores = members
      .map(userId => ({
        userId,
        score: this.influenceScores.get(userId)?.score || this.calculateInfluenceScore(userId).score
      }))
      .sort((a, b) => b.score - a.score)

    return scores.slice(0, 3).map(s => s.userId)
  }

  /**
   * 🧪 Generate Test Data
   */
  generateTestData(): void {
    // Create 20 test users
    const interests = ['Music', 'Food', 'Tech', 'Sports', 'Art', 'Travel']

    for (let i = 0; i < 20; i++) {
      this.addUser({
        id: `user_${i}`,
        name: `User ${i}`,
        avatar: `/avatars/${i % 10}.png`,
        interests: interests.slice(0, 2 + Math.floor(Math.random() * 3))
      })
    }

    // Create random connections (social network pattern)
    for (let i = 0; i < 20; i++) {
      // Each user connects to 3-8 others
      const connectionCount = 3 + Math.floor(Math.random() * 6)

      for (let j = 0; j < connectionCount; j++) {
        const targetId = Math.floor(Math.random() * 20)
        if (targetId === i) continue

        this.addConnection({
          userId: `user_${i}`,
          connectedUserId: `user_${targetId}`,
          strength: 30 + Math.floor(Math.random() * 70),
          mutualFriends: 0,
          sharedInterests: [],
          sharedEvents: [],
          connectionDate: Date.now() - Math.random() * 365 * 86400000
        })
      }
    }

    // Calculate influence scores
    for (let i = 0; i < 20; i++) {
      this.calculateInfluenceScore(`user_${i}`)
    }

    // Detect communities
    this.detectCommunities()

    console.log('[Social Graph] Test data generated:', {
      users: this.users.size,
      connections: Array.from(this.connections.values()).reduce((sum, conns) => sum + conns.length, 0),
      communities: this.communities.length
    })
  }
}

export const socialGraphService = new SocialGraphService()
