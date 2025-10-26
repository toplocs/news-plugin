/**
 * 🎮 GAMIFICATION SYSTEM
 * ═══════════════════════════════════════════════════════════════════
 *
 * Das ADDICTIVE Gamification System:
 * Points, Badges, Leaderboards, Quests, Rewards!
 *
 * Features:
 * - Experience Points (XP) System
 * - Achievement Badges
 * - Daily/Weekly Quests
 * - Leaderboards (Global, Local, Friends)
 * - Reward System
 * - Streak System
 * - Social Challenges
 *
 * Created: 2025-10-26
 * ═══════════════════════════════════════════════════════════════════
 */

export interface UserGamification {
  userId: string

  // Levels & XP
  level: number
  xp: number
  xpToNextLevel: number
  totalXP: number

  // Badges
  badges: Badge[]
  badgeCount: number

  // Streaks
  loginStreak: number              // Consecutive days
  eventStreak: number              // Events attended in row
  maxLoginStreak: number
  lastLoginDate: number

  // Quests
  activeQuests: Quest[]
  completedQuests: Quest[]
  questsCompleted: number

  // Points & Rewards
  points: number                   // Währung
  lifetimePoints: number
  rewardsUnlocked: Reward[]

  // Stats
  stats: {
    eventsCreated: number
    eventsAttended: number
    messagesSent: number
    connectionsM

ade: number
    articlesShared: number
    reviewsWritten: number
    photosUploaded: number
  }

  // Ranking
  globalRank: number
  localRank: number
  friendsRank: number
}

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  category: 'social' | 'events' | 'creator' | 'explorer' | 'helper' | 'special'
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  unlockedAt: number
  progress?: number                // 0-100 for progressive badges
}

export interface Quest {
  id: string
  type: 'daily' | 'weekly' | 'special'
  title: string
  description: string
  icon: string

  // Requirements
  requirements: Array<{
    type: 'attend_events' | 'create_event' | 'send_messages' | 'make_connections' | 'share_article' | 'write_review'
    count: number
    current: number
  }>

  // Rewards
  rewards: {
    xp: number
    points: number
    badge?: string
  }

  // Status
  status: 'locked' | 'active' | 'completed' | 'expired'
  progress: number                 // 0-100
  expiresAt: number
  completedAt?: number
}

export interface Reward {
  id: string
  type: 'discount' | 'feature' | 'cosmetic' | 'boost'
  name: string
  description: string
  icon: string
  cost: number                     // Points cost
  unlocked: boolean
  equippedAt?: number
}

export interface LeaderboardEntry {
  rank: number
  userId: string
  userName: string
  userAvatar: string
  level: number
  xp: number
  points: number
  badgeCount: number
  isCurrentUser: boolean
}

/**
 * 🎮 Gamification Service
 */
class GamificationService {
  private userGamification = new Map<string, UserGamification>()
  private globalLeaderboard: LeaderboardEntry[] = []

  // XP Rewards für Actions
  private xpRewards = {
    login: 10,
    attendEvent: 50,
    createEvent: 100,
    sendMessage: 5,
    makeConnection: 25,
    shareArticle: 15,
    writeReview: 30,
    uploadPhoto: 20,
    completeQuest: 100,
    unlockBadge: 50
  }

  // Points Rewards
  private pointRewards = {
    login: 5,
    attendEvent: 25,
    createEvent: 50,
    sendMessage: 2,
    makeConnection: 10,
    shareArticle: 8,
    writeReview: 15,
    uploadPhoto: 10
  }

  /**
   * 🎯 Award XP
   */
  awardXP(userId: string, action: keyof typeof this.xpRewards, multiplier: number = 1): {
    xpGained: number
    levelUp: boolean
    newLevel?: number
  } {
    const userData = this.getUserData(userId)
    const xpGained = Math.round(this.xpRewards[action] * multiplier)

    userData.xp += xpGained
    userData.totalXP += xpGained

    // Check level up
    let levelUp = false
    let newLevel = userData.level

    while (userData.xp >= userData.xpToNextLevel) {
      userData.xp -= userData.xpToNextLevel
      userData.level++
      userData.xpToNextLevel = this.calculateXPForLevel(userData.level + 1)
      levelUp = true
      newLevel = userData.level
    }

    if (levelUp) {
      this.onLevelUp(userId, newLevel)
    }

    console.log(`[Gamification] ${userId} gained ${xpGained} XP (${action})`)

    return { xpGained, levelUp, newLevel: levelUp ? newLevel : undefined }
  }

  /**
   * 💰 Award Points
   */
  awardPoints(userId: string, action: keyof typeof this.pointRewards, multiplier: number = 1): number {
    const userData = this.getUserData(userId)
    const pointsGained = Math.round(this.pointRewards[action] * multiplier)

    userData.points += pointsGained
    userData.lifetimePoints += pointsGained

    console.log(`[Gamification] ${userId} gained ${pointsGained} points`)
    return pointsGained
  }

  /**
   * 🏆 Unlock Badge
   */
  unlockBadge(userId: string, badgeId: string): boolean {
    const userData = this.getUserData(userId)

    if (userData.badges.find(b => b.id === badgeId)) {
      return false // Already unlocked
    }

    const badge = this.getBadgeDefinition(badgeId)
    if (!badge) return false

    userData.badges.push({
      ...badge,
      unlockedAt: Date.now()
    })
    userData.badgeCount++

    this.awardXP(userId, 'unlockBadge')

    console.log(`[Gamification] ${userId} unlocked badge: ${badge.name}`)
    return true
  }

  /**
   * 📋 Get Active Quests
   */
  getActiveQuests(userId: string): Quest[] {
    const userData = this.getUserData(userId)
    const now = Date.now()

    // Remove expired quests
    userData.activeQuests = userData.activeQuests.filter(q => q.expiresAt > now)

    // Generate new quests if needed
    if (userData.activeQuests.length < 3) {
      this.generateDailyQuests(userId)
    }

    return userData.activeQuests
  }

  /**
   * ✅ Complete Quest
   */
  completeQuest(userId: string, questId: string): {
    completed: boolean
    rewards?: Quest['rewards']
  } {
    const userData = this.getUserData(userId)
    const quest = userData.activeQuests.find(q => q.id === questId)

    if (!quest || quest.status !== 'active') {
      return { completed: false }
    }

    // Check if all requirements met
    const allMet = quest.requirements.every(req => req.current >= req.count)

    if (!allMet) {
      return { completed: false }
    }

    quest.status = 'completed'
    quest.completedAt = Date.now()
    quest.progress = 100

    userData.completedQuests.push(quest)
    userData.questsCompleted++

    // Award rewards
    this.awardXP(userId, 'completeQuest')
    userData.points += quest.rewards.points

    if (quest.rewards.badge) {
      this.unlockBadge(userId, quest.rewards.badge)
    }

    console.log(`[Gamification] ${userId} completed quest: ${quest.title}`)

    return {
      completed: true,
      rewards: quest.rewards
    }
  }

  /**
   * 🔥 Update Streak
   */
  updateStreak(userId: string, type: 'login' | 'event'): {
    streak: number
    isNewRecord: boolean
  } {
    const userData = this.getUserData(userId)
    const now = Date.now()
    const oneDayAgo = now - 86400000

    if (type === 'login') {
      // Check if last login was yesterday
      if (userData.lastLoginDate > oneDayAgo && userData.lastLoginDate < now - 3600000) {
        userData.loginStreak++
      } else if (userData.lastLoginDate < oneDayAgo) {
        userData.loginStreak = 1 // Reset streak
      }

      userData.lastLoginDate = now

      const isNewRecord = userData.loginStreak > userData.maxLoginStreak
      if (isNewRecord) {
        userData.maxLoginStreak = userData.loginStreak
      }

      // Award streak bonus
      if (userData.loginStreak >= 7) {
        this.awardXP(userId, 'login', 2) // 2x XP for 7-day streak
      }

      return {
        streak: userData.loginStreak,
        isNewRecord
      }
    } else {
      userData.eventStreak++
      return {
        streak: userData.eventStreak,
        isNewRecord: false
      }
    }
  }

  /**
   * 🏅 Get Leaderboard
   */
  getLeaderboard(
    type: 'global' | 'local' | 'friends',
    userId: string,
    limit: number = 10
  ): LeaderboardEntry[] {
    // Generate/update global leaderboard
    this.updateGlobalLeaderboard()

    const leaderboard = this.globalLeaderboard
      .map((entry, index) => ({
        ...entry,
        rank: index + 1,
        isCurrentUser: entry.userId === userId
      }))
      .slice(0, limit)

    // Always include current user if not in top
    if (!leaderboard.find(e => e.userId === userId)) {
      const userEntry = this.globalLeaderboard.find(e => e.userId === userId)
      if (userEntry) {
        const userRank = this.globalLeaderboard.findIndex(e => e.userId === userId) + 1
        leaderboard.push({
          ...userEntry,
          rank: userRank,
          isCurrentUser: true
        })
      }
    }

    return leaderboard
  }

  /**
   * 📊 Get User Stats
   */
  getStats(userId: string): UserGamification {
    return this.getUserData(userId)
  }

  /**
   * 🎁 Get Available Rewards
   */
  getAvailableRewards(userId: string): Reward[] {
    const userData = this.getUserData(userId)

    return this.getAllRewards().map(reward => ({
      ...reward,
      unlocked: userData.points >= reward.cost
    }))
  }

  /**
   * 🛍️ Purchase Reward
   */
  purchaseReward(userId: string, rewardId: string): {
    success: boolean
    error?: string
  } {
    const userData = this.getUserData(userId)
    const reward = this.getAllRewards().find(r => r.id === rewardId)

    if (!reward) {
      return { success: false, error: 'Reward not found' }
    }

    if (userData.points < reward.cost) {
      return { success: false, error: 'Not enough points' }
    }

    userData.points -= reward.cost
    userData.rewardsUnlocked.push({
      ...reward,
      unlocked: true,
      equippedAt: Date.now()
    })

    console.log(`[Gamification] ${userId} purchased: ${reward.name}`)
    return { success: true }
  }

  // === PRIVATE METHODS ===

  private getUserData(userId: string): UserGamification {
    if (!this.userGamification.has(userId)) {
      this.userGamification.set(userId, this.createDefaultData(userId))
    }
    return this.userGamification.get(userId)!
  }

  private createDefaultData(userId: string): UserGamification {
    return {
      userId,
      level: 1,
      xp: 0,
      xpToNextLevel: 100,
      totalXP: 0,
      badges: [],
      badgeCount: 0,
      loginStreak: 0,
      eventStreak: 0,
      maxLoginStreak: 0,
      lastLoginDate: 0,
      activeQuests: [],
      completedQuests: [],
      questsCompleted: 0,
      points: 0,
      lifetimePoints: 0,
      rewardsUnlocked: [],
      stats: {
        eventsCreated: 0,
        eventsAttended: 0,
        messagesSent: 0,
        connectionsMade: 0,
        articlesShared: 0,
        reviewsWritten: 0,
        photosUploaded: 0
      },
      globalRank: 0,
      localRank: 0,
      friendsRank: 0
    }
  }

  private calculateXPForLevel(level: number): number {
    return Math.floor(100 * Math.pow(1.5, level - 1))
  }

  private onLevelUp(userId: string, newLevel: number): void {
    console.log(`[Gamification] 🎉 ${userId} reached level ${newLevel}!`)

    // Award level-up bonus
    const userData = this.getUserData(userId)
    userData.points += newLevel * 10

    // Check for level badges
    if (newLevel === 10) this.unlockBadge(userId, 'lvl_10')
    if (newLevel === 25) this.unlockBadge(userId, 'lvl_25')
    if (newLevel === 50) this.unlockBadge(userId, 'lvl_50')
  }

  private generateDailyQuests(userId: string): void {
    const userData = this.getUserData(userId)
    const now = Date.now()
    const tomorrow = now + 86400000

    const dailyQuests: Quest[] = [
      {
        id: `daily_events_${Date.now()}`,
        type: 'daily',
        title: 'Event Explorer',
        description: 'Attend 2 events today',
        icon: '🎉',
        requirements: [{
          type: 'attend_events',
          count: 2,
          current: 0
        }],
        rewards: { xp: 100, points: 50 },
        status: 'active',
        progress: 0,
        expiresAt: tomorrow
      },
      {
        id: `daily_social_${Date.now()}`,
        type: 'daily',
        title: 'Social Butterfly',
        description: 'Make 3 new connections',
        icon: '👥',
        requirements: [{
          type: 'make_connections',
          count: 3,
          current: 0
        }],
        rewards: { xp: 75, points: 35 },
        status: 'active',
        progress: 0,
        expiresAt: tomorrow
      }
    ]

    userData.activeQuests.push(...dailyQuests)
  }

  private getBadgeDefinition(badgeId: string): Badge | null {
    const badges: Record<string, Omit<Badge, 'unlockedAt'>> = {
      'first_event': {
        id: 'first_event',
        name: 'Erste Schritte',
        description: 'Erstes Event besucht!',
        icon: '🎉',
        category: 'events',
        rarity: 'common'
      },
      'social_10': {
        id: 'social_10',
        name: 'Netzwerker',
        description: '10 Connections gemacht',
        icon: '🤝',
        category: 'social',
        rarity: 'common'
      },
      'creator_first': {
        id: 'creator_first',
        name: 'Event Creator',
        description: 'Erstes Event erstellt!',
        icon: '✨',
        category: 'creator',
        rarity: 'rare'
      },
      'lvl_10': {
        id: 'lvl_10',
        name: 'Level 10',
        description: 'Level 10 erreicht!',
        icon: '🏆',
        category: 'special',
        rarity: 'rare'
      },
      'lvl_25': {
        id: 'lvl_25',
        name: 'Level 25',
        description: 'Level 25 erreicht!',
        icon: '👑',
        category: 'special',
        rarity: 'epic'
      },
      'lvl_50': {
        id: 'lvl_50',
        name: 'Level 50',
        description: 'Level 50 erreicht!',
        icon: '💎',
        category: 'special',
        rarity: 'legendary'
      }
    }

    return badges[badgeId] || null
  }

  private getAllRewards(): Reward[] {
    return [
      {
        id: 'profile_theme_gold',
        type: 'cosmetic',
        name: 'Gold Profile Theme',
        description: 'Glänzendes Gold Theme für dein Profil',
        icon: '✨',
        cost: 100,
        unlocked: false
      },
      {
        id: 'boost_2x_xp',
        type: 'boost',
        name: '2x XP Boost (1 Tag)',
        description: 'Verdopple deine XP für 24 Stunden',
        icon: '⚡',
        cost: 200,
        unlocked: false
      },
      {
        id: 'feature_priority_support',
        type: 'feature',
        name: 'Priority Support',
        description: 'Bevorzugter Support für 1 Monat',
        icon: '🎯',
        cost: 500,
        unlocked: false
      }
    ]
  }

  private updateGlobalLeaderboard(): void {
    this.globalLeaderboard = Array.from(this.userGamification.values())
      .map(user => ({
        rank: 0,
        userId: user.userId,
        userName: this.getUserName(user.userId),
        userAvatar: this.getUserAvatar(user.userId),
        level: user.level,
        xp: user.totalXP,
        points: user.lifetimePoints,
        badgeCount: user.badgeCount,
        isCurrentUser: false
      }))
      .sort((a, b) => b.xp - a.xp)
  }

  private getUserName(userId: string): string {
    const names = ['Max', 'Lisa', 'Tom', 'Anna', 'Paul', 'Maria', 'Tim', 'Julia']
    return names[Math.floor(Math.random() * names.length)]
  }

  private getUserAvatar(userId: string): string {
    return `/avatars/${Math.floor(Math.random() * 10)}.png`
  }

  /**
   * 🧪 Generate Test Data
   */
  generateTestData(): void {
    for (let i = 0; i < 20; i++) {
      const userId = `user_${i}`
      const user = this.getUserData(userId)

      // Simulate activity
      const events = 5 + Math.floor(Math.random() * 20)
      for (let j = 0; j < events; j++) {
        this.awardXP(userId, 'attendEvent')
        this.awardPoints(userId, 'attendEvent')
        user.stats.eventsAttended++
      }

      const connections = 3 + Math.floor(Math.random() * 15)
      for (let j = 0; j < connections; j++) {
        this.awardXP(userId, 'makeConnection')
        this.awardPoints(userId, 'makeConnection')
        user.stats.connectionsMade++
      }

      // Random badges
      if (Math.random() > 0.5) this.unlockBadge(userId, 'first_event')
      if (Math.random() > 0.7) this.unlockBadge(userId, 'social_10')
      if (Math.random() > 0.9) this.unlockBadge(userId, 'creator_first')

      user.loginStreak = Math.floor(Math.random() * 30)
      user.maxLoginStreak = user.loginStreak + Math.floor(Math.random() * 10)
    }

    this.updateGlobalLeaderboard()
    console.log('[Gamification] Test data generated')
  }
}

export const gamificationService = new GamificationService()
