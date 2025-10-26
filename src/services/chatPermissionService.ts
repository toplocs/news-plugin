/**
 * 🔒 CHAT PERMISSION SYSTEM
 * ═══════════════════════════════════════════════════════════════════
 *
 * Das PRIVACY-FIRST Chat System:
 * Niemand kann dich anschreiben ohne deine Erlaubnis!
 *
 * Features:
 * - 3 Permission Levels: OPEN, FRIENDS_ONLY, REQUEST_ONLY
 * - Message Request System
 * - Auto-Accept basierend auf Trust Score
 * - Spam Prevention
 * - Connection Management
 *
 * Created: 2025-10-26
 * ═══════════════════════════════════════════════════════════════════
 */

export type PermissionLevel = 'OPEN' | 'FRIENDS_ONLY' | 'REQUEST_ONLY' | 'NOBODY'

export interface ChatPermissionSettings {
  userId: string

  // Permission Level
  defaultPermission: PermissionLevel

  // Auto-Accept Regeln
  autoAccept: {
    mutualFriends: boolean           // Auto-accept wenn gemeinsame Freunde
    sameEvent: boolean                // Auto-accept wenn auf gleichem Event
    highTrustScore: boolean           // Auto-accept wenn Trust Score > 80
    verifiedUsers: boolean            // Auto-accept verified users
  }

  // Spam Prevention
  spamPrevention: {
    maxRequestsPerDay: number         // Max neue Requests pro Tag
    requireProfileComplete: boolean   // Nur vollständige Profile
    minAccountAge: number             // Min Account Alter in Tagen
  }

  // Notifications
  notifications: {
    messageRequests: boolean
    newMessages: boolean
    connectionAccepted: boolean
  }
}

export interface MessageRequest {
  id: string
  fromUserId: string
  fromUserName: string
  fromUserAvatar: string
  toUserId: string

  message: string                     // Initiale Nachricht
  context?: {
    type: 'event' | 'mutual-friend' | 'interest' | 'location'
    eventId?: string
    mutualFriendId?: string
    sharedInterest?: string
  }

  status: 'pending' | 'accepted' | 'rejected' | 'expired'

  trustScore: number                  // Trust Score des Senders
  verificationLevel: 'none' | 'email' | 'phone' | 'verified'

  createdAt: number
  expiresAt: number                   // Request läuft nach 7 Tagen ab
  respondedAt?: number
}

export interface Connection {
  userId: string
  connectedUserId: string
  connectedUserName: string
  connectedUserAvatar: string

  connectionType: 'accepted' | 'mutual-friend' | 'event' | 'auto-accepted'

  canMessage: boolean
  canSeeProfile: boolean
  canSeeLocation: boolean

  sharedEvents: string[]
  sharedInterests: string[]
  mutualFriends: string[]

  trustScore: number

  createdAt: number
  lastInteraction: number
}

/**
 * 🔒 Chat Permission Service
 */
class ChatPermissionService {
  private settings = new Map<string, ChatPermissionSettings>()
  private requests = new Map<string, MessageRequest[]>()
  private connections = new Map<string, Connection[]>()
  private blockedUsers = new Map<string, Set<string>>()

  /**
   * 📋 Get Permission Settings
   */
  getSettings(userId: string): ChatPermissionSettings {
    if (!this.settings.has(userId)) {
      this.settings.set(userId, this.getDefaultSettings(userId))
    }
    return this.settings.get(userId)!
  }

  /**
   * ⚙️ Update Settings
   */
  updateSettings(userId: string, updates: Partial<ChatPermissionSettings>): void {
    const current = this.getSettings(userId)
    this.settings.set(userId, { ...current, ...updates })
    console.log(`[ChatPermission] Settings updated for ${userId}`)
  }

  /**
   * ✅ Can User Message?
   */
  canMessage(fromUserId: string, toUserId: string): {
    allowed: boolean
    reason?: string
    requiresRequest?: boolean
  } {
    // Check if blocked
    if (this.isBlocked(toUserId, fromUserId)) {
      return {
        allowed: false,
        reason: 'User has blocked you'
      }
    }

    const toUserSettings = this.getSettings(toUserId)
    const connection = this.getConnection(toUserId, fromUserId)

    // Already connected
    if (connection?.canMessage) {
      return { allowed: true }
    }

    // Check permission level
    switch (toUserSettings.defaultPermission) {
      case 'OPEN':
        return { allowed: true }

      case 'FRIENDS_ONLY':
        if (connection?.connectionType === 'mutual-friend') {
          return { allowed: true }
        }
        return {
          allowed: false,
          reason: 'User only accepts messages from friends',
          requiresRequest: true
        }

      case 'REQUEST_ONLY':
        return {
          allowed: false,
          reason: 'User requires message request approval',
          requiresRequest: true
        }

      case 'NOBODY':
        return {
          allowed: false,
          reason: 'User is not accepting messages'
        }
    }

    return { allowed: false }
  }

  /**
   * 📨 Send Message Request
   */
  async sendMessageRequest(
    fromUserId: string,
    toUserId: string,
    message: string,
    context?: MessageRequest['context']
  ): Promise<{ success: boolean; requestId?: string; error?: string; autoAccepted?: boolean }> {
    // Check if can message
    const check = this.canMessage(fromUserId, toUserId)
    if (check.allowed) {
      return {
        success: false,
        error: 'User can already message - no request needed'
      }
    }

    if (!check.requiresRequest) {
      return {
        success: false,
        error: check.reason
      }
    }

    // Check spam prevention
    const toUserSettings = this.getSettings(toUserId)
    const existingRequests = this.getPendingRequests(toUserId)

    const requestsToday = existingRequests.filter(r =>
      r.createdAt > Date.now() - 86400000
    ).length

    if (requestsToday >= toUserSettings.spamPrevention.maxRequestsPerDay) {
      return {
        success: false,
        error: 'Too many requests today - try again tomorrow'
      }
    }

    // Create request
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const request: MessageRequest = {
      id: requestId,
      fromUserId,
      fromUserName: this.getUserName(fromUserId),
      fromUserAvatar: this.getUserAvatar(fromUserId),
      toUserId,
      message,
      context,
      status: 'pending',
      trustScore: this.calculateTrustScore(fromUserId),
      verificationLevel: this.getVerificationLevel(fromUserId),
      createdAt: Date.now(),
      expiresAt: Date.now() + 7 * 86400000  // 7 Tage
    }

    // Check auto-accept
    const shouldAutoAccept = this.shouldAutoAccept(request, toUserSettings)

    if (shouldAutoAccept) {
      request.status = 'accepted'
      request.respondedAt = Date.now()
      this.createConnection(fromUserId, toUserId, 'auto-accepted')

      if (!this.requests.has(toUserId)) {
        this.requests.set(toUserId, [])
      }
      this.requests.get(toUserId)!.push(request)

      console.log(`[ChatPermission] Request auto-accepted: ${requestId}`)
      return {
        success: true,
        requestId,
        autoAccepted: true
      }
    }

    // Add to pending requests
    if (!this.requests.has(toUserId)) {
      this.requests.set(toUserId, [])
    }
    this.requests.get(toUserId)!.push(request)

    console.log(`[ChatPermission] Message request sent: ${requestId}`)
    return {
      success: true,
      requestId
    }
  }

  /**
   * ✅ Accept Request
   */
  acceptRequest(userId: string, requestId: string): boolean {
    const requests = this.requests.get(userId) || []
    const request = requests.find(r => r.id === requestId)

    if (!request || request.status !== 'pending') {
      return false
    }

    request.status = 'accepted'
    request.respondedAt = Date.now()

    // Create connection
    this.createConnection(userId, request.fromUserId, 'accepted')

    console.log(`[ChatPermission] Request accepted: ${requestId}`)
    return true
  }

  /**
   * ❌ Reject Request
   */
  rejectRequest(userId: string, requestId: string, block: boolean = false): boolean {
    const requests = this.requests.get(userId) || []
    const request = requests.find(r => r.id === requestId)

    if (!request || request.status !== 'pending') {
      return false
    }

    request.status = 'rejected'
    request.respondedAt = Date.now()

    if (block) {
      this.blockUser(userId, request.fromUserId)
    }

    console.log(`[ChatPermission] Request rejected: ${requestId}`)
    return true
  }

  /**
   * 🚫 Block User
   */
  blockUser(userId: string, blockedUserId: string): void {
    if (!this.blockedUsers.has(userId)) {
      this.blockedUsers.set(userId, new Set())
    }
    this.blockedUsers.get(userId)!.add(blockedUserId)

    // Remove connection
    const connections = this.connections.get(userId) || []
    this.connections.set(
      userId,
      connections.filter(c => c.connectedUserId !== blockedUserId)
    )

    console.log(`[ChatPermission] User blocked: ${blockedUserId}`)
  }

  /**
   * 🔓 Unblock User
   */
  unblockUser(userId: string, blockedUserId: string): void {
    this.blockedUsers.get(userId)?.delete(blockedUserId)
    console.log(`[ChatPermission] User unblocked: ${blockedUserId}`)
  }

  /**
   * 📊 Get Pending Requests
   */
  getPendingRequests(userId: string): MessageRequest[] {
    const requests = this.requests.get(userId) || []
    const now = Date.now()

    return requests.filter(r =>
      r.status === 'pending' && r.expiresAt > now
    ).sort((a, b) => b.createdAt - a.createdAt)
  }

  /**
   * 📈 Get Stats
   */
  getStats(userId: string): {
    pendingRequests: number
    connections: number
    blockedUsers: number
    requestsToday: number
  } {
    const requests = this.requests.get(userId) || []
    const connections = this.connections.get(userId) || []
    const blocked = this.blockedUsers.get(userId)?.size || 0

    const now = Date.now()
    const today = now - 86400000

    return {
      pendingRequests: requests.filter(r => r.status === 'pending' && r.expiresAt > now).length,
      connections: connections.length,
      blockedUsers: blocked,
      requestsToday: requests.filter(r => r.createdAt > today).length
    }
  }

  // === PRIVATE METHODS ===

  private getDefaultSettings(userId: string): ChatPermissionSettings {
    return {
      userId,
      defaultPermission: 'REQUEST_ONLY',
      autoAccept: {
        mutualFriends: true,
        sameEvent: true,
        highTrustScore: true,
        verifiedUsers: false
      },
      spamPrevention: {
        maxRequestsPerDay: 10,
        requireProfileComplete: true,
        minAccountAge: 1
      },
      notifications: {
        messageRequests: true,
        newMessages: true,
        connectionAccepted: true
      }
    }
  }

  private shouldAutoAccept(request: MessageRequest, settings: ChatPermissionSettings): boolean {
    const { autoAccept } = settings

    // Check trust score
    if (autoAccept.highTrustScore && request.trustScore >= 80) {
      return true
    }

    // Check verification
    if (autoAccept.verifiedUsers && request.verificationLevel === 'verified') {
      return true
    }

    // Check context
    if (request.context) {
      if (autoAccept.sameEvent && request.context.type === 'event') {
        return true
      }
      if (autoAccept.mutualFriends && request.context.type === 'mutual-friend') {
        return true
      }
    }

    return false
  }

  private createConnection(userId: string, connectedUserId: string, type: Connection['connectionType']): void {
    const connection: Connection = {
      userId,
      connectedUserId,
      connectedUserName: this.getUserName(connectedUserId),
      connectedUserAvatar: this.getUserAvatar(connectedUserId),
      connectionType: type,
      canMessage: true,
      canSeeProfile: true,
      canSeeLocation: false,
      sharedEvents: [],
      sharedInterests: [],
      mutualFriends: [],
      trustScore: this.calculateTrustScore(connectedUserId),
      createdAt: Date.now(),
      lastInteraction: Date.now()
    }

    if (!this.connections.has(userId)) {
      this.connections.set(userId, [])
    }
    this.connections.get(userId)!.push(connection)
  }

  private getConnection(userId: string, connectedUserId: string): Connection | undefined {
    const connections = this.connections.get(userId) || []
    return connections.find(c => c.connectedUserId === connectedUserId)
  }

  private isBlocked(userId: string, checkUserId: string): boolean {
    return this.blockedUsers.get(userId)?.has(checkUserId) || false
  }

  private calculateTrustScore(userId: string): number {
    // Mock - in real app: berechne basierend auf:
    // - Account age
    // - Verification status
    // - Event attendance
    // - Community contributions
    // - Reports/Blocks gegen User
    return 50 + Math.random() * 50
  }

  private getVerificationLevel(userId: string): MessageRequest['verificationLevel'] {
    // Mock
    const levels: MessageRequest['verificationLevel'][] = ['none', 'email', 'phone', 'verified']
    return levels[Math.floor(Math.random() * levels.length)]
  }

  private getUserName(userId: string): string {
    // Mock - in real app: fetch from user service
    const names = ['Max', 'Lisa', 'Tom', 'Anna', 'Paul', 'Maria']
    return names[Math.floor(Math.random() * names.length)]
  }

  private getUserAvatar(userId: string): string {
    return `/avatars/${Math.floor(Math.random() * 10)}.png`
  }

  /**
   * 🧪 Generate Test Data
   */
  generateTestData(userId: string): void {
    // Create some test requests
    for (let i = 0; i < 5; i++) {
      const senderId = `user_${i}`
      this.sendMessageRequest(
        senderId,
        userId,
        `Hey! Ich habe gesehen wir haben gemeinsame Interessen. Wollen wir uns mal austauschen?`,
        {
          type: 'interest',
          sharedInterest: ['Music', 'Tech', 'Food'][i % 3]
        }
      )
    }

    console.log('[ChatPermission] Test data generated')
  }
}

export const chatPermissionService = new ChatPermissionService()
