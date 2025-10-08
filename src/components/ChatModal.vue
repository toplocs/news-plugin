<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="modal-overlay" @click="$emit('update:modelValue', false)">
        <div class="chat-container" @click.stop>
          <!-- Chat Header -->
          <div class="chat-header">
            <div class="header-left">
              <div class="user-avatar">
                <img v-if="partner.avatar" :src="partner.avatar" :alt="partner.name" />
                <span v-else>{{ partner.name[0] }}</span>
              </div>
              <div class="header-info">
                <h3 class="partner-name">{{ partner.name }}</h3>
                <p v-if="partner.online" class="online-status">
                  <span class="online-dot"></span>
                  Online
                </p>
                <p v-else class="offline-status">Zuletzt aktiv {{ lastSeenText }}</p>
              </div>
            </div>
            <button @click="$emit('update:modelValue', false)" class="close-btn">×</button>
          </div>

          <!-- Messages List -->
          <div ref="messagesContainer" class="messages-container">
            <div v-if="isLoading" class="loading-state">
              <div class="spinner"></div>
              <p>Nachrichten werden geladen...</p>
            </div>

            <div v-else-if="messages.length === 0" class="empty-state">
              <div class="empty-icon">💬</div>
              <p>Noch keine Nachrichten</p>
              <small>Schreibe die erste Nachricht an {{ partner.name }}</small>
            </div>

            <div v-else class="messages-list">
              <div
                v-for="(message, index) in messages"
                :key="message.id"
                :class="['message', message.sender === currentUserId ? 'sent' : 'received']"
              >
                <div v-if="showDateSeparator(index)" class="date-separator">
                  {{ formatDate(message.timestamp) }}
                </div>

                <div class="message-bubble">
                  <p class="message-text">{{ message.text }}</p>
                  <div class="message-footer">
                    <span class="message-time">{{ formatTime(message.timestamp) }}</span>
                    <span v-if="message.sender === currentUserId" class="message-status">
                      <span v-if="message.read" class="read-icon">✓✓</span>
                      <span v-else class="sent-icon">✓</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Typing Indicator -->
            <div v-if="partnerIsTyping" class="typing-indicator">
              <div class="typing-avatar">
                <span>{{ partner.name[0] }}</span>
              </div>
              <div class="typing-bubbles">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>

          <!-- Message Input -->
          <div class="message-input-container">
            <button class="attach-btn" title="Datei anhängen">
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
            </button>
            <input
              ref="messageInput"
              v-model="newMessage"
              type="text"
              placeholder="Nachricht schreiben..."
              class="message-input"
              @keypress.enter="sendMessage"
              @input="handleTyping"
            />
            <button
              @click="sendMessage"
              :disabled="!newMessage.trim()"
              class="send-btn"
            >
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useToast } from '../composables/useToast'
import gun from '../services/gun'

interface ChatPartner {
  id: string
  name: string
  avatar?: string
  online?: boolean
  lastSeen?: number
}

interface Message {
  id: string
  sender: string
  text: string
  timestamp: number
  read?: boolean
}

const props = defineProps<{
  modelValue: boolean
  partner: ChatPartner
  currentUserId: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const { success, error } = useToast()

const messages = ref<Message[]>([])
const newMessage = ref('')
const isLoading = ref(false)
const partnerIsTyping = ref(false)
const messagesContainer = ref<HTMLElement | null>(null)
const messageInput = ref<HTMLInputElement | null>(null)

let typingTimeout: ReturnType<typeof setTimeout> | null = null
let gunUnsubscribe: (() => void) | null = null

// Computed
const lastSeenText = computed(() => {
  if (!props.partner.lastSeen) return 'kürzlich'

  const diff = Date.now() - props.partner.lastSeen
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'gerade eben'
  if (minutes < 60) return `vor ${minutes}m`
  if (hours < 24) return `vor ${hours}h`
  return `vor ${days}d`
})

// Methods
const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (date.toDateString() === today.toDateString()) {
    return 'Heute'
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Gestern'
  } else {
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: 'long',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
    })
  }
}

const formatTime = (timestamp: number): string => {
  return new Date(timestamp).toLocaleTimeString('de-DE', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const showDateSeparator = (index: number): boolean => {
  if (index === 0) return true

  const currentMsg = messages.value[index]
  const previousMsg = messages.value[index - 1]

  const currentDate = new Date(currentMsg.timestamp).toDateString()
  const previousDate = new Date(previousMsg.timestamp).toDateString()

  return currentDate !== previousDate
}

const scrollToBottom = async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

const loadMessages = async () => {
  isLoading.value = true

  try {
    // Generate thread ID (sorted user IDs for consistency)
    const threadId = [props.currentUserId, props.partner.id].sort().join('_')

    // Load from Gun.js
    const chatNode = gun.get('news_plugin').get('chats').get(threadId)

    const loadedMessages: Message[] = []
    let messageCount = 0

    // Use .on() for initial load to get all existing messages
    const unsubscribe = chatNode.get('messages').map().on((data: any, id: string) => {
      if (data && data.text) {
        // Check if message already exists
        const exists = loadedMessages.some(m => m.id === id)
        if (!exists) {
          loadedMessages.push({
            id,
            sender: data.sender,
            text: data.text,
            timestamp: data.timestamp,
            read: data.read || false
          })
          messageCount++
        }
      }
    })

    // Wait longer for Gun to load all messages (increased from 500ms to 1500ms)
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Unsubscribe after initial load
    unsubscribe?.off()

    // Sort by timestamp
    messages.value = loadedMessages.sort((a, b) => a.timestamp - b.timestamp)

    console.log('💬 Loaded', messages.value.length, 'messages from thread', threadId)

    scrollToBottom()
  } catch (err) {
    console.error('Failed to load messages:', err)
    error('Fehler beim Laden der Nachrichten')
  } finally {
    isLoading.value = false
  }
}

const subscribeToMessages = () => {
  const threadId = [props.currentUserId, props.partner.id].sort().join('_')
  const chatNode = gun.get('news_plugin').get('chats').get(threadId)

  // Subscribe to new messages
  const messageUnsubscribe = chatNode.get('messages').map().on((data: any, id: string) => {
    if (!data || !data.text) return

    // Check if message already exists
    const exists = messages.value.some(m => m.id === id)
    if (exists) return

    const message: Message = {
      id,
      sender: data.sender,
      text: data.text,
      timestamp: data.timestamp,
      read: data.read || false
    }

    messages.value.push(message)
    messages.value.sort((a, b) => a.timestamp - b.timestamp)

    scrollToBottom()

    console.log('📨 New message received:', message.text)
  })

  // Subscribe to typing indicator
  const typingUnsubscribe = chatNode.get('typing').get(props.partner.id).on((data: any) => {
    partnerIsTyping.value = data?.isTyping || false
  })

  // Store combined unsubscribe function
  gunUnsubscribe = () => {
    messageUnsubscribe?.off()
    typingUnsubscribe?.off()
  }

  console.log('📡 Subscribed to chat thread:', threadId)
}

const sendMessage = async () => {
  const text = newMessage.value.trim()
  if (!text) return

  try {
    const threadId = [props.currentUserId, props.partner.id].sort().join('_')
    const chatNode = gun.get('news_plugin').get('chats').get(threadId)

    const message: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sender: props.currentUserId,
      text,
      timestamp: Date.now(),
      read: false
    }

    // Save to Gun.js
    await chatNode.get('messages').get(message.id).put({
      sender: message.sender,
      text: message.text,
      timestamp: message.timestamp,
      read: false
    })

    // Update thread metadata
    await chatNode.put({
      lastMessage: text,
      lastMessageTime: message.timestamp,
      participants: [props.currentUserId, props.partner.id]
    })

    console.log('✉️ Message sent:', text)

    // Clear input
    newMessage.value = ''

    // Stop typing indicator
    stopTyping()

    // Scroll to bottom
    scrollToBottom()
  } catch (err) {
    console.error('Failed to send message:', err)
    error('Fehler beim Senden der Nachricht')
  }
}

const handleTyping = () => {
  const threadId = [props.currentUserId, props.partner.id].sort().join('_')
  const chatNode = gun.get('news_plugin').get('chats').get(threadId)

  // Send typing indicator
  chatNode.get('typing').get(props.currentUserId).put({
    isTyping: true,
    timestamp: Date.now()
  })

  // Clear existing timeout
  if (typingTimeout) {
    clearTimeout(typingTimeout)
  }

  // Stop typing after 2 seconds of inactivity
  typingTimeout = setTimeout(() => {
    stopTyping()
  }, 2000)
}

const stopTyping = () => {
  const threadId = [props.currentUserId, props.partner.id].sort().join('_')
  const chatNode = gun.get('news_plugin').get('chats').get(threadId)

  chatNode.get('typing').get(props.currentUserId).put({
    isTyping: false,
    timestamp: Date.now()
  })
}

const cleanup = () => {
  stopTyping()
  if (gunUnsubscribe) {
    gunUnsubscribe()
  }
  if (typingTimeout) {
    clearTimeout(typingTimeout)
  }
}

// Watchers
watch(() => props.modelValue, async (isOpen) => {
  if (isOpen) {
    await loadMessages()
    subscribeToMessages()

    // Focus input
    await nextTick()
    messageInput.value?.focus()
  } else {
    cleanup()
  }
})

onUnmounted(() => {
  cleanup()
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.9);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.chat-container {
  width: 100%;
  max-width: 600px;
  height: 90vh;
  max-height: 700px;
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Chat Header */
.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(30, 41, 59, 0.6);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  font-weight: 700;
  color: white;
  overflow: hidden;
  flex-shrink: 0;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.header-info {
  flex: 1;
}

.partner-name {
  font-size: 1.125rem;
  font-weight: 700;
  color: #f8fafc;
  margin: 0 0 0.25rem 0;
}

.online-status {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.8125rem;
  color: #22c55e;
  margin: 0;
}

.online-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #22c55e;
  box-shadow: 0 0 8px rgba(34, 197, 94, 0.5);
}

.offline-status {
  font-size: 0.8125rem;
  color: #64748b;
  margin: 0;
}

.close-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #cbd5e1;
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.close-btn:hover {
  background: rgba(30, 41, 59, 1);
  transform: scale(1.1);
}

/* Messages Container */
.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  background: rgba(15, 23, 42, 0.4);
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 1rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(99, 102, 241, 0.2);
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-state p,
.empty-state p {
  color: #94a3b8;
  font-size: 0.875rem;
  margin: 0;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state small {
  color: #64748b;
  font-size: 0.8125rem;
  margin-top: 0.5rem;
}

/* Messages List */
.messages-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.date-separator {
  text-align: center;
  font-size: 0.75rem;
  color: #64748b;
  margin: 0.5rem 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.message {
  display: flex;
  flex-direction: column;
  max-width: 70%;
}

.message.sent {
  align-self: flex-end;
}

.message.received {
  align-self: flex-start;
}

.message-bubble {
  padding: 0.75rem 1rem;
  border-radius: 1rem;
  word-wrap: break-word;
}

.message.sent .message-bubble {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  border-bottom-right-radius: 0.25rem;
}

.message.received .message-bubble {
  background: rgba(30, 41, 59, 0.6);
  color: #f8fafc;
  border-bottom-left-radius: 0.25rem;
}

.message-text {
  font-size: 0.9375rem;
  line-height: 1.5;
  margin: 0 0 0.5rem 0;
}

.message-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.5rem;
}

.message-time {
  font-size: 0.6875rem;
  opacity: 0.7;
}

.message-status {
  font-size: 0.75rem;
}

.read-icon {
  color: #22c55e;
}

/* Typing Indicator */
.typing-indicator {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 1rem;
}

.typing-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: 700;
  color: white;
  flex-shrink: 0;
}

.typing-bubbles {
  display: flex;
  gap: 0.25rem;
  padding: 0.75rem 1rem;
  background: rgba(30, 41, 59, 0.6);
  border-radius: 1rem;
  border-bottom-left-radius: 0.25rem;
}

.typing-bubbles span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #64748b;
  animation: typing 1.4s infinite;
}

.typing-bubbles span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-bubbles span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% {
    opacity: 0.3;
    transform: translateY(0);
  }
  30% {
    opacity: 1;
    transform: translateY(-4px);
  }
}

/* Message Input */
.message-input-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(30, 41, 59, 0.6);
}

.attach-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.attach-btn:hover {
  background: rgba(99, 102, 241, 0.2);
  border-color: rgba(99, 102, 241, 0.3);
  color: #a5b4fc;
}

.message-input {
  flex: 1;
  padding: 0.75rem 1rem;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  color: #f8fafc;
  font-size: 0.9375rem;
}

.message-input:focus {
  outline: none;
  border-color: #6366f1;
}

.send-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border: none;
  border-radius: 0.5rem;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.send-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(99, 102, 241, 0.3);
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* Modal Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .chat-container,
.modal-leave-active .chat-container {
  transition: transform 0.3s ease;
}

.modal-enter-from .chat-container,
.modal-leave-to .chat-container {
  transform: scale(0.9) translateY(20px);
}

/* Mobile Responsive */
@media (max-width: 640px) {
  .chat-container {
    max-width: 100%;
    height: 100vh;
    max-height: 100vh;
    border-radius: 0;
  }

  .message {
    max-width: 85%;
  }
}
</style>
