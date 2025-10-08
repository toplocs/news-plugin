import { ref, computed } from 'vue'
import gun from '../services/gun'

export interface Notification {
  id: string
  type: 'article' | 'user' | 'discovery' | 'system' | 'message'
  title: string
  message: string
  timestamp: number
  read: boolean
  data?: any
}

export interface DMThread {
  id: string
  userId: string
  userName: string
  lastMessage: string
  lastMessageTime: number
  unreadCount: number
}

const STORAGE_KEY = 'news_plugin_notifications'
const DM_STORAGE_KEY = 'news_plugin_dm_threads'

// State
const notifications = ref<Notification[]>([])
const dmThreads = ref<DMThread[]>([])
const isLoading = ref(false)

// Computed
const unreadCount = computed(() => notifications.value.filter(n => !n.read).length)
const unreadDMCount = computed(() => dmThreads.value.reduce((sum, thread) => sum + thread.unreadCount, 0))
const totalUnreadCount = computed(() => unreadCount.value + unreadDMCount.value)

// Throttle helper
let updateThrottle: ReturnType<typeof setTimeout> | null = null
const THROTTLE_MS = 1000 // Update badge max once per second

/**
 * Composable for managing notifications and DM threads
 */
export function useNotifications() {
  // Load from localStorage
  const loadNotifications = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        notifications.value = JSON.parse(stored)
      }

      const storedDMs = localStorage.getItem(DM_STORAGE_KEY)
      if (storedDMs) {
        dmThreads.value = JSON.parse(storedDMs)
      }
    } catch (err) {
      console.error('Failed to load notifications:', err)
    }
  }

  // Save to localStorage (throttled)
  const saveNotifications = () => {
    if (updateThrottle) return // Skip if already pending

    updateThrottle = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications.value))
        localStorage.setItem(DM_STORAGE_KEY, JSON.stringify(dmThreads.value))
      } catch (err) {
        console.error('Failed to save notifications:', err)
      }
      updateThrottle = null
    }, THROTTLE_MS)
  }

  // Add notification
  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      read: false
    }

    notifications.value.unshift(newNotification)

    // Keep only last 50 notifications
    if (notifications.value.length > 50) {
      notifications.value = notifications.value.slice(0, 50)
    }

    saveNotifications()
    return newNotification
  }

  // Mark as read
  const markAsRead = (id: string) => {
    const notification = notifications.value.find(n => n.id === id)
    if (notification && !notification.read) {
      notification.read = true
      saveNotifications()
    }
  }

  // Mark all as read
  const markAllAsRead = () => {
    let changed = false
    notifications.value.forEach(n => {
      if (!n.read) {
        n.read = true
        changed = true
      }
    })
    if (changed) {
      saveNotifications()
    }
  }

  // Clear all notifications
  const clearAll = () => {
    notifications.value = []
    saveNotifications()
  }

  // Remove specific notification
  const removeNotification = (id: string) => {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
      saveNotifications()
    }
  }

  // DM Thread Management
  const updateDMThread = (thread: Omit<DMThread, 'id'> & { id?: string }) => {
    const existingIndex = dmThreads.value.findIndex(t => t.userId === thread.userId)

    if (existingIndex > -1) {
      // Update existing thread
      dmThreads.value[existingIndex] = {
        ...dmThreads.value[existingIndex],
        ...thread,
        id: dmThreads.value[existingIndex].id
      }
    } else {
      // Add new thread
      dmThreads.value.unshift({
        ...thread,
        id: thread.id || `dm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      })
    }

    saveNotifications()
  }

  const markDMThreadAsRead = (threadId: string) => {
    const thread = dmThreads.value.find(t => t.id === threadId)
    if (thread) {
      thread.unreadCount = 0
      saveNotifications()
    }
  }

  const incrementDMUnread = (userId: string) => {
    const thread = dmThreads.value.find(t => t.userId === userId)
    if (thread) {
      thread.unreadCount++
      saveNotifications()
    }
  }

  // Gun.js Subscription
  let gunUnsubscribe: (() => void) | null = null

  const subscribeToGun = () => {
    try {
      const notificationNode = gun.get('news_plugin').get('notifications')

      notificationNode.map().on((data: any, id: string) => {
        if (!data) return

        // Filter old notifications (older than 7 days)
        const sevenDaysAgo = Date.now() - (86400000 * 7)
        if (data.timestamp && data.timestamp < sevenDaysAgo) return

        // Check if notification already exists
        const existing = notifications.value.find(n => n.id === id)
        if (existing) return

        // Add new notification from Gun.js
        addNotification({
          type: data.type || 'system',
          title: data.title,
          message: data.message,
          data: data.data
        })
      })

      console.log('📡 Subscribed to Gun.js notifications')
    } catch (err) {
      console.error('Failed to subscribe to Gun.js notifications:', err)
    }
  }

  const unsubscribeFromGun = () => {
    if (gunUnsubscribe) {
      gunUnsubscribe()
      gunUnsubscribe = null
    }
  }

  // Get filtered notifications
  const getNotificationsByType = (type: Notification['type']) => {
    return computed(() => notifications.value.filter(n => n.type === type))
  }

  const getUnreadNotificationsByType = (type: Notification['type']) => {
    return computed(() => notifications.value.filter(n => n.type === type && !n.read))
  }

  return {
    // State
    notifications: computed(() => notifications.value),
    dmThreads: computed(() => dmThreads.value),
    isLoading: computed(() => isLoading.value),

    // Computed
    unreadCount,
    unreadDMCount,
    totalUnreadCount,

    // Methods - Notifications
    loadNotifications,
    saveNotifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
    removeNotification,
    getNotificationsByType,
    getUnreadNotificationsByType,

    // Methods - DM Threads
    updateDMThread,
    markDMThreadAsRead,
    incrementDMUnread,

    // Methods - Gun.js
    subscribeToGun,
    unsubscribeFromGun
  }
}
