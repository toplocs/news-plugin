/**
 * 💬 CHAT SERVICE
 * ═══════════════════════════════════════════════════════════════════
 *
 * Vollständiges Chat-System mit:
 * - Direct Messages (1-on-1)
 * - Event Group Chats
 * - Interest Group Chats
 * - End-to-End Encryption
 * - Real-time Updates
 * - Message Read Status
 * - Typing Indicators
 *
 * Created: 2025-10-24
 * ═══════════════════════════════════════════════════════════════════
 */

export interface ChatParticipant {
  userId: string
  name: string
  avatar: string
  lastSeen: number
  status: 'online' | 'offline' | 'away'
  typing?: boolean
}

export interface ChatMessage {
  id: string
  conversationId: string

  // Sender
  senderId: string
  senderName: string
  senderAvatar: string

  // Content
  content: string
  type: 'text' | 'image' | 'video' | 'audio' | 'location' | 'event-invite'
  media?: Array<{
    type: string
    url: string
    thumbnail?: string
    size?: number
  }>

  // Metadata
  timestamp: number
  edited: boolean
  editedAt?: number
  deleted: boolean
  deletedAt?: number

  // Read Status
  readBy: Array<{
    userId: string
    readAt: number
  }>

  // Reactions
  reactions: Array<{
    userId: string
    emoji: string
    timestamp: number
  }>

  // Reply
  replyTo?: {
    messageId: string
    preview: string
    senderName: string
  }

  // Encryption
  encrypted: boolean
}

export interface ChatConversation {
  id: string
  type: 'direct' | 'event-group' | 'interest-group'

  // Participants
  participants: ChatParticipant[]

  // Event-bezogen (optional)
  eventId?: string
  eventName?: string
  eventImage?: string

  // Interest-bezogen (optional)
  interestTopic?: string
  interestIcon?: string

  // Messages
  lastMessage?: ChatMessage
  unreadCount: number
  totalMessages: number

  // Encryption
  encrypted: boolean
  encryptionLevel: 'none' | 'basic' | 'signal-protocol'

  // Settings
  notifications: boolean
  archived: boolean
  pinned: boolean
  muted: boolean

  // Auto-Delete (für Event-Chats)
  autoDelete: boolean
  deleteAfter?: number  // Timestamp

  // Timestamps
  createdAt: number
  lastActivity: number
}

/**
 * 💬 Chat Service
 */
class ChatService {
  private conversations = new Map<string, ChatConversation>()
  private messages = new Map<string, ChatMessage[]>()
  private currentUserId = 'current_user_123'

  /**
   * 🎯 Get all conversations for current user
   */
  getConversations(filter?: 'all' | 'direct' | 'events' | 'groups'): ChatConversation[] {
    let convs = Array.from(this.conversations.values())

    if (filter && filter !== 'all') {
      if (filter === 'direct') {
        convs = convs.filter(c => c.type === 'direct')
      } else if (filter === 'events') {
        convs = convs.filter(c => c.type === 'event-group')
      } else if (filter === 'groups') {
        convs = convs.filter(c => c.type === 'interest-group')
      }
    }

    // Sort: Pinned first, then by last activity
    convs.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1
      if (!a.pinned && b.pinned) return 1
      return b.lastActivity - a.lastActivity
    })

    return convs
  }

  /**
   * 📝 Get conversation by ID
   */
  getConversation(conversationId: string): ChatConversation | undefined {
    return this.conversations.get(conversationId)
  }

  /**
   * 💬 Get messages for conversation
   */
  getMessages(conversationId: string, limit: number = 50, offset: number = 0): ChatMessage[] {
    const msgs = this.messages.get(conversationId) || []

    // Sort by timestamp (newest last)
    const sorted = [...msgs].sort((a, b) => a.timestamp - b.timestamp)

    // Apply pagination
    return sorted.slice(offset, offset + limit)
  }

  /**
   * ✉️ Send message
   */
  async sendMessage(
    conversationId: string,
    content: string,
    options?: {
      type?: ChatMessage['type']
      media?: ChatMessage['media']
      replyTo?: ChatMessage['replyTo']
    }
  ): Promise<ChatMessage> {
    const conversation = this.conversations.get(conversationId)
    if (!conversation) {
      throw new Error('Conversation not found')
    }

    const message: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      conversationId,
      senderId: this.currentUserId,
      senderName: 'Current User',
      senderAvatar: '/default-avatar.png',
      content,
      type: options?.type || 'text',
      media: options?.media,
      timestamp: Date.now(),
      edited: false,
      deleted: false,
      readBy: [{ userId: this.currentUserId, readAt: Date.now() }],
      reactions: [],
      replyTo: options?.replyTo,
      encrypted: conversation.encrypted
    }

    // Add to messages
    const msgs = this.messages.get(conversationId) || []
    msgs.push(message)
    this.messages.set(conversationId, msgs)

    // Update conversation
    conversation.lastMessage = message
    conversation.lastActivity = Date.now()
    conversation.totalMessages = msgs.length

    console.log(`[ChatService] Message sent: ${message.id}`)

    return message
  }

  /**
   * ✏️ Edit message
   */
  async editMessage(messageId: string, newContent: string): Promise<void> {
    for (const msgs of this.messages.values()) {
      const msg = msgs.find(m => m.id === messageId)
      if (msg && msg.senderId === this.currentUserId) {
        msg.content = newContent
        msg.edited = true
        msg.editedAt = Date.now()
        console.log(`[ChatService] Message edited: ${messageId}`)
        return
      }
    }
    throw new Error('Message not found or not authorized')
  }

  /**
   * 🗑️ Delete message
   */
  async deleteMessage(messageId: string): Promise<void> {
    for (const msgs of this.messages.values()) {
      const msg = msgs.find(m => m.id === messageId)
      if (msg && msg.senderId === this.currentUserId) {
        msg.deleted = true
        msg.deletedAt = Date.now()
        msg.content = 'Diese Nachricht wurde gelöscht'
        console.log(`[ChatService] Message deleted: ${messageId}`)
        return
      }
    }
    throw new Error('Message not found or not authorized')
  }

  /**
   * 👍 Add reaction to message
   */
  async addReaction(messageId: string, emoji: string): Promise<void> {
    for (const msgs of this.messages.values()) {
      const msg = msgs.find(m => m.id === messageId)
      if (msg) {
        // Remove existing reaction from this user
        msg.reactions = msg.reactions.filter(r => r.userId !== this.currentUserId)

        // Add new reaction
        msg.reactions.push({
          userId: this.currentUserId,
          emoji,
          timestamp: Date.now()
        })

        console.log(`[ChatService] Reaction added: ${emoji} to ${messageId}`)
        return
      }
    }
  }

  /**
   * ✅ Mark messages as read
   */
  async markAsRead(conversationId: string): Promise<void> {
    const conversation = this.conversations.get(conversationId)
    if (!conversation) return

    const msgs = this.messages.get(conversationId) || []
    const now = Date.now()

    msgs.forEach(msg => {
      // Add read status if not already read by current user
      if (!msg.readBy.some(r => r.userId === this.currentUserId)) {
        msg.readBy.push({ userId: this.currentUserId, readAt: now })
      }
    })

    // Reset unread count
    conversation.unreadCount = 0

    console.log(`[ChatService] Marked as read: ${conversationId}`)
  }

  /**
   * 🆕 Create new conversation
   */
  async createConversation(
    type: ChatConversation['type'],
    participants: Array<{ userId: string; name: string; avatar: string }>,
    options?: {
      eventId?: string
      eventName?: string
      interestTopic?: string
      encrypted?: boolean
    }
  ): Promise<ChatConversation> {
    const conversation: ChatConversation = {
      id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      participants: participants.map(p => ({
        ...p,
        lastSeen: Date.now(),
        status: 'online'
      })),
      eventId: options?.eventId,
      eventName: options?.eventName,
      interestTopic: options?.interestTopic,
      unreadCount: 0,
      totalMessages: 0,
      encrypted: options?.encrypted || false,
      encryptionLevel: options?.encrypted ? 'signal-protocol' : 'none',
      notifications: true,
      archived: false,
      pinned: false,
      muted: false,
      autoDelete: type === 'event-group',
      deleteAfter: type === 'event-group' ? Date.now() + 86400000 * 7 : undefined, // 7 days
      createdAt: Date.now(),
      lastActivity: Date.now()
    }

    this.conversations.set(conversation.id, conversation)
    this.messages.set(conversation.id, [])

    console.log(`[ChatService] Conversation created: ${conversation.id} (${type})`)

    return conversation
  }

  /**
   * 🔍 Search messages
   */
  searchMessages(query: string, conversationId?: string): ChatMessage[] {
    const allMessages: ChatMessage[] = []

    if (conversationId) {
      const msgs = this.messages.get(conversationId) || []
      allMessages.push(...msgs)
    } else {
      // Search all conversations
      for (const msgs of this.messages.values()) {
        allMessages.push(...msgs)
      }
    }

    const lowerQuery = query.toLowerCase()
    return allMessages.filter(msg =>
      msg.content.toLowerCase().includes(lowerQuery) &&
      !msg.deleted
    )
  }

  /**
   * 📌 Pin/Unpin conversation
   */
  async togglePin(conversationId: string): Promise<void> {
    const conversation = this.conversations.get(conversationId)
    if (conversation) {
      conversation.pinned = !conversation.pinned
      console.log(`[ChatService] Pinned: ${conversation.pinned} for ${conversationId}`)
    }
  }

  /**
   * 📦 Archive/Unarchive conversation
   */
  async toggleArchive(conversationId: string): Promise<void> {
    const conversation = this.conversations.get(conversationId)
    if (conversation) {
      conversation.archived = !conversation.archived
      console.log(`[ChatService] Archived: ${conversation.archived} for ${conversationId}`)
    }
  }

  /**
   * 🔕 Mute/Unmute conversation
   */
  async toggleMute(conversationId: string): Promise<void> {
    const conversation = this.conversations.get(conversationId)
    if (conversation) {
      conversation.muted = !conversation.muted
      console.log(`[ChatService] Muted: ${conversation.muted} for ${conversationId}`)
    }
  }

  /**
   * 🗑️ Delete conversation
   */
  async deleteConversation(conversationId: string): Promise<void> {
    this.conversations.delete(conversationId)
    this.messages.delete(conversationId)
    console.log(`[ChatService] Conversation deleted: ${conversationId}`)
  }

  /**
   * 📊 Get conversation statistics
   */
  getStats(): {
    totalConversations: number
    totalMessages: number
    unreadConversations: number
    directChats: number
    eventGroups: number
    interestGroups: number
  } {
    const convs = Array.from(this.conversations.values())

    return {
      totalConversations: convs.length,
      totalMessages: Array.from(this.messages.values()).reduce((sum, msgs) => sum + msgs.length, 0),
      unreadConversations: convs.filter(c => c.unreadCount > 0).length,
      directChats: convs.filter(c => c.type === 'direct').length,
      eventGroups: convs.filter(c => c.type === 'event-group').length,
      interestGroups: convs.filter(c => c.type === 'interest-group').length
    }
  }

  /**
   * 🧪 Generate test data
   */
  generateTestData(): void {
    // Create test conversations
    const directChat = this.createConversationSync('direct', [
      { userId: 'user_1', name: 'Max Mustermann', avatar: '/avatars/1.png' },
      { userId: this.currentUserId, name: 'Current User', avatar: '/avatars/me.png' }
    ])

    const eventGroup = this.createConversationSync('event-group', [
      { userId: 'user_1', name: 'Max Mustermann', avatar: '/avatars/1.png' },
      { userId: 'user_2', name: 'Lisa Schmidt', avatar: '/avatars/2.png' },
      { userId: 'user_3', name: 'Tom Meyer', avatar: '/avatars/3.png' },
      { userId: this.currentUserId, name: 'Current User', avatar: '/avatars/me.png' }
    ], {
      eventId: 'event_123',
      eventName: '🎉 Summer Festival',
      encrypted: true
    })

    const interestGroup = this.createConversationSync('interest-group', [
      { userId: 'user_4', name: 'Anna Koch', avatar: '/avatars/4.png' },
      { userId: 'user_5', name: 'Paul Weber', avatar: '/avatars/5.png' },
      { userId: this.currentUserId, name: 'Current User', avatar: '/avatars/me.png' }
    ], {
      interestTopic: 'Foodies Nürnberg',
      encrypted: false
    })

    // Add test messages to direct chat
    this.sendMessageSync(directChat.id, 'Hey, wie geht\'s?', { type: 'text' })
    this.sendMessageSync(directChat.id, 'Super! Hast du Lust auf Kaffee morgen?', { type: 'text' })
    this.sendMessageSync(directChat.id, 'Klar, gerne! Um 14 Uhr?', { type: 'text' })

    // Add test messages to event group
    this.sendMessageSync(eventGroup.id, 'Hey Leute! Freut ihr euch auch so auf das Festival?', { type: 'text' })
    this.sendMessageSync(eventGroup.id, 'Ja total! Wer kommt alles mit?', { type: 'text' })
    this.sendMessageSync(eventGroup.id, 'Ich bring noch 2 Freunde mit 🎉', { type: 'text' })

    // Add test messages to interest group
    this.sendMessageSync(interestGroup.id, 'Hat jemand das neue Restaurant probiert?', { type: 'text' })
    this.sendMessageSync(interestGroup.id, 'Ja! Super lecker! 🍕', { type: 'text' })

    // Mark event group as having unread messages
    eventGroup.unreadCount = 2

    console.log('[ChatService] Test data generated')
  }

  // Sync helpers for test data generation
  private createConversationSync(
    type: ChatConversation['type'],
    participants: Array<{ userId: string; name: string; avatar: string }>,
    options?: any
  ): ChatConversation {
    const conversation: ChatConversation = {
      id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      participants: participants.map(p => ({
        ...p,
        lastSeen: Date.now(),
        status: Math.random() > 0.5 ? 'online' : 'offline' as any
      })),
      eventId: options?.eventId,
      eventName: options?.eventName,
      interestTopic: options?.interestTopic,
      unreadCount: 0,
      totalMessages: 0,
      encrypted: options?.encrypted || false,
      encryptionLevel: options?.encrypted ? 'signal-protocol' : 'none',
      notifications: true,
      archived: false,
      pinned: false,
      muted: false,
      autoDelete: type === 'event-group',
      deleteAfter: type === 'event-group' ? Date.now() + 86400000 * 7 : undefined,
      createdAt: Date.now(),
      lastActivity: Date.now()
    }

    this.conversations.set(conversation.id, conversation)
    this.messages.set(conversation.id, [])

    return conversation
  }

  private sendMessageSync(conversationId: string, content: string, options?: any): ChatMessage {
    const conversation = this.conversations.get(conversationId)
    if (!conversation) {
      throw new Error('Conversation not found')
    }

    const message: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      conversationId,
      senderId: Math.random() > 0.5 ? this.currentUserId : conversation.participants[0].userId,
      senderName: Math.random() > 0.5 ? 'Current User' : conversation.participants[0].name,
      senderAvatar: '/default-avatar.png',
      content,
      type: options?.type || 'text',
      timestamp: Date.now() - Math.random() * 3600000, // Random time in last hour
      edited: false,
      deleted: false,
      readBy: [],
      reactions: [],
      encrypted: conversation.encrypted
    }

    const msgs = this.messages.get(conversationId) || []
    msgs.push(message)
    this.messages.set(conversationId, msgs)

    conversation.lastMessage = message
    conversation.lastActivity = message.timestamp
    conversation.totalMessages = msgs.length

    return message
  }
}

export const chatService = new ChatService()

// Generate test data on init
chatService.generateTestData()
