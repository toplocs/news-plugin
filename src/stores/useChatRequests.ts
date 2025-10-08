import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useToast } from '../composables/useToast'

export interface ChatRequest {
  id: string
  from: {
    id: string
    name: string
    avatar?: string
    distance: string
    interests: string[]
  }
  to: string
  timestamp: number
  status: 'pending' | 'accepted' | 'declined' | 'expired'
  message?: string
}

export const useChatRequests = defineStore('chatRequests', () => {
  const { success, info, error } = useToast()

  // State
  const requests = ref<ChatRequest[]>([])
  const currentUserId = ref<string>('user-' + Math.random().toString(36).substr(2, 9))

  // Computed
  const pendingRequests = computed(() =>
    requests.value.filter(r => r.status === 'pending' && r.to === currentUserId.value)
  )

  const sentRequests = computed(() =>
    requests.value.filter(r => r.from.id === currentUserId.value)
  )

  const hasUnreadRequests = computed(() => pendingRequests.value.length > 0)

  // Actions
  const sendChatRequest = (toUser: {
    id: string
    name: string
    avatar?: string
    distance: string
    interests: string[]
  }, message?: string) => {
    // Check if request already exists
    const existing = requests.value.find(
      r => r.from.id === currentUserId.value &&
           r.to === toUser.id &&
           r.status === 'pending'
    )

    if (existing) {
      info('Anfrage bereits gesendet')
      return null
    }

    const request: ChatRequest = {
      id: 'req-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
      from: {
        id: currentUserId.value,
        name: 'Du', // Will be replaced with actual user name
        avatar: undefined,
        distance: toUser.distance,
        interests: []
      },
      to: toUser.id,
      timestamp: Date.now(),
      status: 'pending',
      message
    }

    requests.value.push(request)

    // Auto-expire after 5 minutes
    setTimeout(() => {
      expireRequest(request.id)
    }, 5 * 60 * 1000)

    success(`Chat-Anfrage an ${toUser.name} gesendet`)

    // Save to localStorage
    saveToLocalStorage()

    return request
  }

  const acceptRequest = (requestId: string) => {
    const request = requests.value.find(r => r.id === requestId)
    if (!request) return null

    request.status = 'accepted'
    success(`Chat mit ${request.from.name} gestartet`)

    saveToLocalStorage()
    return request
  }

  const declineRequest = (requestId: string) => {
    const request = requests.value.find(r => r.id === requestId)
    if (!request) return

    request.status = 'declined'
    info('Anfrage abgelehnt')

    saveToLocalStorage()
  }

  const expireRequest = (requestId: string) => {
    const request = requests.value.find(r => r.id === requestId)
    if (!request || request.status !== 'pending') return

    request.status = 'expired'

    saveToLocalStorage()
  }

  const removeRequest = (requestId: string) => {
    const index = requests.value.findIndex(r => r.id === requestId)
    if (index !== -1) {
      requests.value.splice(index, 1)
      saveToLocalStorage()
    }
  }

  const canSendRequestTo = (userId: string): boolean => {
    // Check if already have pending request
    const pending = requests.value.find(
      r => r.from.id === currentUserId.value &&
           r.to === userId &&
           r.status === 'pending'
    )

    return !pending
  }

  const hasActiveChat = (userId: string): boolean => {
    // Check if there's an accepted request
    return requests.value.some(
      r => r.status === 'accepted' &&
           (r.from.id === userId || r.to === userId)
    )
  }

  // Persistence
  const saveToLocalStorage = () => {
    try {
      localStorage.setItem('chatRequests', JSON.stringify(requests.value))
    } catch (err) {
      console.error('Failed to save chat requests:', err)
    }
  }

  const loadFromLocalStorage = () => {
    try {
      const stored = localStorage.getItem('chatRequests')
      if (stored) {
        requests.value = JSON.parse(stored)

        // Clean up old requests (>24h)
        const now = Date.now()
        requests.value = requests.value.filter(
          r => now - r.timestamp < 24 * 60 * 60 * 1000
        )
      }
    } catch (err) {
      console.error('Failed to load chat requests:', err)
    }
  }

  // Initialize User ID
  const initializeUserId = () => {
    const stored = localStorage.getItem('userId')
    if (stored) {
      currentUserId.value = stored
    } else {
      localStorage.setItem('userId', currentUserId.value)
    }
  }

  // Auto-init
  initializeUserId()
  loadFromLocalStorage()

  return {
    // State
    requests,
    currentUserId,

    // Computed
    pendingRequests,
    sentRequests,
    hasUnreadRequests,

    // Actions
    sendChatRequest,
    acceptRequest,
    declineRequest,
    removeRequest,
    canSendRequestTo,
    hasActiveChat,

    // Persistence
    loadFromLocalStorage
  }
})
