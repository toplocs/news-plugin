<template>
  <div class="chat-panel">
    <!-- Thread List -->
    <div v-if="!chat.currentChat.value" class="thread-list">
      <div class="chat-header">
        <h3>Nachrichten</h3>
        <span v-if="chat.totalUnreadCount.value > 0" class="unread-badge">
          {{ chat.totalUnreadCount.value }}
        </span>
      </div>

      <div class="threads">
        <div
          v-for="thread in chat.threads.value"
          :key="thread.userId"
          @click="chat.openChat(thread.userId)"
          class="thread-item"
          :class="{ unread: thread.unreadCount > 0 }"
        >
          <div class="thread-avatar">
            {{ thread.userAvatar || '👤' }}
            <span v-if="thread.online" class="online-indicator"></span>
          </div>
          <div class="thread-content">
            <div class="thread-header">
              <span class="thread-name">{{ thread.userName }}</span>
              <span class="thread-time">{{ formatTime(thread.lastMessageTime) }}</span>
            </div>
            <div class="thread-message">
              {{ thread.lastMessage }}
            </div>
          </div>
          <div v-if="thread.unreadCount > 0" class="thread-unread">
            {{ thread.unreadCount }}
          </div>
        </div>

        <div v-if="chat.threads.value.length === 0" class="empty-threads">
          <p>💬 Noch keine Nachrichten</p>
          <small>Starte eine Konversation mit Community-Mitgliedern</small>
        </div>
      </div>
    </div>

    <!-- Chat View -->
    <div v-else class="chat-view">
      <div class="chat-view-header">
        <button @click="chat.closeChat()" class="back-btn" aria-label="Zurück">
          ←
        </button>
        <div class="chat-user-info">
          <span class="chat-user-avatar">
            {{ getCurrentThread?.userAvatar || '👤' }}
          </span>
          <div>
            <div class="chat-user-name">{{ getCurrentThread?.userName }}</div>
            <div class="chat-user-status">
              <span v-if="getCurrentThread?.online" class="online-dot"></span>
              {{ getCurrentThread?.online ? 'Online' : 'Offline' }}
            </div>
          </div>
        </div>
      </div>

      <div class="messages-container" ref="messagesContainer">
        <div
          v-for="msg in currentMessages"
          :key="msg.id"
          class="message"
          :class="{ own: msg.from === chat.currentUserId.value }"
        >
          <div class="message-bubble">
            <div class="message-text">{{ msg.message }}</div>
            <div class="message-time">{{ formatTime(msg.timestamp) }}</div>
          </div>
        </div>

        <div v-if="currentMessages.length === 0" class="empty-messages">
          <p>👋 Keine Nachrichten bisher</p>
          <small>Schreibe die erste Nachricht!</small>
        </div>
      </div>

      <div class="message-input">
        <input
          v-model="newMessage"
          @keyup.enter="sendMessage"
          type="text"
          placeholder="Nachricht schreiben..."
          class="input-field"
        />
        <button
          @click="sendMessage"
          :disabled="!newMessage.trim()"
          class="send-btn"
          aria-label="Senden"
        >
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useChat } from '../stores/useChat'

const chat = useChat()
const newMessage = ref('')
const messagesContainer = ref<HTMLElement | null>(null)

const getCurrentThread = computed(() => {
  if (!chat.currentChat.value) return null
  return chat.threads.value.find(t => t.userId === chat.currentChat.value)
})

const currentMessages = computed(() => {
  if (!chat.currentChat.value) return []
  return chat.getMessagesForUser(chat.currentChat.value).value
})

const sendMessage = () => {
  if (!newMessage.value.trim() || !chat.currentChat.value) return

  chat.sendMessage(chat.currentChat.value, newMessage.value.trim())
  newMessage.value = ''

  // Scroll to bottom
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

const formatTime = (timestamp: number) => {
  const now = Date.now()
  const diff = now - timestamp
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'Gerade eben'
  if (minutes < 60) return `vor ${minutes}m`
  if (hours < 24) return `vor ${hours}h`
  if (days < 7) return `vor ${days}d`

  return new Date(timestamp).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })
}

// Scroll to bottom when chat opens or new message arrives
watch(() => currentMessages.value.length, () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
})
</script>

<style scoped>
.chat-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.chat-header h3 {
  font-size: 1.125rem;
  font-weight: 700;
  color: #f8fafc;
  margin: 0;
}

.unread-badge {
  background: #ef4444;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
}

/* Thread List */
.thread-list {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.threads {
  flex: 1;
  overflow-y: auto;
}

.thread-item {
  display: flex;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  cursor: pointer;
  transition: all 0.2s;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.thread-item:hover {
  background: rgba(99, 102, 241, 0.1);
}

.thread-item.unread {
  background: rgba(99, 102, 241, 0.05);
}

.thread-avatar {
  position: relative;
  font-size: 2.5rem;
  flex-shrink: 0;
}

.online-indicator {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 12px;
  height: 12px;
  background: #10b981;
  border: 2px solid #0f172a;
  border-radius: 50%;
}

.thread-content {
  flex: 1;
  min-width: 0;
}

.thread-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 0.25rem;
}

.thread-name {
  font-weight: 600;
  color: #f8fafc;
  font-size: 0.9375rem;
}

.thread-time {
  font-size: 0.75rem;
  color: #64748b;
}

.thread-message {
  font-size: 0.875rem;
  color: #94a3b8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.thread-unread {
  background: #6366f1;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  flex-shrink: 0;
}

/* Chat View */
.chat-view {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.chat-view-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.back-btn {
  background: none;
  border: none;
  color: #6366f1;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.25rem;
}

.chat-user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.chat-user-avatar {
  font-size: 2.5rem;
}

.chat-user-name {
  font-weight: 600;
  color: #f8fafc;
  font-size: 0.9375rem;
}

.chat-user-status {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.75rem;
  color: #64748b;
}

.online-dot {
  width: 8px;
  height: 8px;
  background: #10b981;
  border-radius: 50%;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.message {
  display: flex;
  justify-content: flex-start;
}

.message.own {
  justify-content: flex-end;
}

.message-bubble {
  max-width: 70%;
  background: rgba(30, 41, 59, 0.6);
  padding: 0.75rem 1rem;
  border-radius: 1rem;
}

.message.own .message-bubble {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
}

.message-text {
  color: #f8fafc;
  font-size: 0.9375rem;
  line-height: 1.5;
  word-wrap: break-word;
}

.message-time {
  font-size: 0.6875rem;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 0.25rem;
}

.message-input {
  display: flex;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(15, 23, 42, 0.5);
}

.input-field {
  flex: 1;
  padding: 0.75rem 1rem;
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  color: #f8fafc;
  font-size: 0.9375rem;
}

.input-field:focus {
  outline: none;
  border-color: #6366f1;
  background: rgba(30, 41, 59, 0.8);
}

.send-btn {
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border: none;
  border-radius: 0.5rem;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.send-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(99, 102, 241, 0.4);
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.empty-threads,
.empty-messages {
  text-align: center;
  padding: 3rem 2rem;
  color: #64748b;
}

.empty-threads p,
.empty-messages p {
  font-size: 1.125rem;
  margin: 0 0 0.5rem 0;
}

.empty-threads small,
.empty-messages small {
  font-size: 0.875rem;
}
</style>
