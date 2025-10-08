import { ref, computed } from 'vue'
import Gun from 'gun'

const gun = Gun()

export interface ChatMessage {
  id: string
  from: string
  to: string
  message: string
  timestamp: number
  read: boolean
  type: 'text' | 'article' | 'location'
  metadata?: {
    articleId?: string
    articleTitle?: string
    locationName?: string
    coordinates?: { lat: number; lng: number }
  }
}

export interface ChatThread {
  userId: string
  userName: string
  userAvatar?: string
  lastMessage: string
  lastMessageTime: number
  unreadCount: number
  online: boolean
}

const STORAGE_KEY = 'news_plugin_chat_messages'
const THREADS_KEY = 'news_plugin_chat_threads'

const messages = ref<ChatMessage[]>([])
const threads = ref<ChatThread[]>([])
const currentChat = ref<string | null>(null)

/**
 * P2P Chat System mit Gun.js
 */
export function useChat() {
  const currentUserId = ref('user_' + Math.random().toString(36).substr(2, 9))

  /**
   * Load messages from localStorage
   */
  const loadMessages = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        messages.value = JSON.parse(stored)
      }

      const storedThreads = localStorage.getItem(THREADS_KEY)
      if (storedThreads) {
        threads.value = JSON.parse(storedThreads)
      }
    } catch (err) {
      console.error('Failed to load chat:', err)
    }
  }

  /**
   * Save messages to localStorage
   */
  const saveMessages = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.value))
      localStorage.setItem(THREADS_KEY, JSON.stringify(threads.value))
    } catch (err) {
      console.error('Failed to save chat:', err)
    }
  }

  /**
   * Subscribe to Gun.js chat node
   */
  const subscribeToGun = () => {
    const chatNode = gun.get('news_plugin').get('chat').get(currentUserId.value)

    chatNode.map().on((data: any, id: string) => {
      if (!data) return

      const message: ChatMessage = {
        id: id,
        from: data.from || 'unknown',
        to: data.to || currentUserId.value,
        message: data.message || '',
        timestamp: data.timestamp || Date.now(),
        read: data.read || false,
        type: data.type || 'text',
        metadata: data.metadata
      }

      // Add if new
      if (!messages.value.find(m => m.id === id)) {
        messages.value.unshift(message)
        updateThreadFromMessage(message)
        saveMessages()
      }
    })

    console.log('✅ Chat subscribed to Gun.js')
  }

  /**
   * Update thread from incoming message
   */
  const updateThreadFromMessage = (message: ChatMessage) => {
    const otherUserId = message.from === currentUserId.value ? message.to : message.from
    let thread = threads.value.find(t => t.userId === otherUserId)

    if (!thread) {
      thread = {
        userId: otherUserId,
        userName: otherUserId.split('_')[1] || 'User',
        lastMessage: message.message,
        lastMessageTime: message.timestamp,
        unreadCount: message.from !== currentUserId.value ? 1 : 0,
        online: Math.random() > 0.5
      }
      threads.value.unshift(thread)
    } else {
      thread.lastMessage = message.message
      thread.lastMessageTime = message.timestamp
      if (message.from !== currentUserId.value && !message.read) {
        thread.unreadCount++
      }

      // Move to top
      threads.value = [thread, ...threads.value.filter(t => t.userId !== otherUserId)]
    }

    saveMessages()
  }

  /**
   * Send a message
   */
  const sendMessage = async (to: string, message: string, type: 'text' | 'article' | 'location' = 'text', metadata?: any) => {
    const newMessage: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      from: currentUserId.value,
      to,
      message,
      timestamp: Date.now(),
      read: false,
      type,
      metadata
    }

    // Add locally
    messages.value.unshift(newMessage)
    updateThreadFromMessage(newMessage)
    saveMessages()

    // Send via Gun.js
    try {
      const recipientNode = gun.get('news_plugin').get('chat').get(to)
      recipientNode.get(newMessage.id).put({
        from: newMessage.from,
        to: newMessage.to,
        message: newMessage.message,
        timestamp: newMessage.timestamp,
        read: false,
        type: newMessage.type,
        metadata: newMessage.metadata
      })

      console.log('✅ Message sent via Gun.js')
    } catch (err) {
      console.error('Failed to send via Gun:', err)
    }
  }

  /**
   * Mark messages as read
   */
  const markAsRead = (userId: string) => {
    messages.value
      .filter(m => m.from === userId && m.to === currentUserId.value && !m.read)
      .forEach(m => {
        m.read = true
      })

    const thread = threads.value.find(t => t.userId === userId)
    if (thread) {
      thread.unreadCount = 0
    }

    saveMessages()
  }

  /**
   * Get messages for a specific user
   */
  const getMessagesForUser = (userId: string) => {
    return computed(() =>
      messages.value
        .filter(m =>
          (m.from === userId && m.to === currentUserId.value) ||
          (m.from === currentUserId.value && m.to === userId)
        )
        .sort((a, b) => a.timestamp - b.timestamp)
    )
  }

  /**
   * Total unread count
   */
  const totalUnreadCount = computed(() => {
    return threads.value.reduce((sum, t) => sum + t.unreadCount, 0)
  })

  /**
   * Open chat with user
   */
  const openChat = (userId: string) => {
    currentChat.value = userId
    markAsRead(userId)
  }

  /**
   * Close current chat
   */
  const closeChat = () => {
    currentChat.value = null
  }

  /**
   * Generate mock messages for demo (optional)
   */
  const generateMockMessages = () => {
    const mockUsers = [
      { id: 'user_anna', name: 'Anna Schmidt', avatar: '👩‍💼' },
      { id: 'user_max', name: 'Max Müller', avatar: '👨‍💻' },
      { id: 'user_lisa', name: 'Lisa Weber', avatar: '👩‍🎨' }
    ]

    const mockTexts = [
      'Hey! Hast du den Artikel über die Community Initiative gesehen?',
      'Super interessanter Artikel! Sollten wir darüber reden?',
      'Ich bin auch in der Gegend. Lust auf Kaffee?',
      'Tolles Event gestern! Bist du nächste Woche auch dabei?',
      'Danke für den Tipp! Der Artikel war wirklich gut.',
      'Können wir uns mal austauschen? Ich arbeite an etwas Ähnlichem.'
    ]

    mockUsers.forEach((user, idx) => {
      // Create thread
      threads.value.push({
        userId: user.id,
        userName: user.name,
        userAvatar: user.avatar,
        lastMessage: mockTexts[idx],
        lastMessageTime: Date.now() - (idx * 3600000), // Hours ago
        unreadCount: idx === 0 ? 2 : 0,
        online: idx < 2
      })

      // Create some messages
      for (let i = 0; i < 3 + Math.floor(Math.random() * 3); i++) {
        const isFromUser = Math.random() > 0.5
        messages.value.push({
          id: `msg_${user.id}_${i}`,
          from: isFromUser ? user.id : currentUserId.value,
          to: isFromUser ? currentUserId.value : user.id,
          message: mockTexts[Math.floor(Math.random() * mockTexts.length)],
          timestamp: Date.now() - ((idx + i) * 1800000),
          read: isFromUser ? i > 1 : true,
          type: 'text'
        })
      }
    })

    saveMessages()
    console.log('✅ Mock chat data generated')
  }

  /**
   * Cleanup
   */
  const cleanup = () => {
    // Could unsubscribe from Gun.js here if needed
    console.log('🧹 Chat cleaned up')
  }

  return {
    // State
    messages: computed(() => messages.value),
    threads: computed(() => threads.value),
    currentChat: computed(() => currentChat.value),
    currentUserId: computed(() => currentUserId.value),
    totalUnreadCount,

    // Methods
    loadMessages,
    saveMessages,
    subscribeToGun,
    sendMessage,
    markAsRead,
    getMessagesForUser,
    openChat,
    closeChat,
    generateMockMessages,
    cleanup
  }
}
