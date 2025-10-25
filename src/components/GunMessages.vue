<template>
  <div class="gun-messages">
    <div class="messages-header">
      <h3>💬 Direct Messages</h3>
      <button v-if="!showCompose" @click="showCompose = true" class="compose-btn">
        ✏️ Neue Nachricht
      </button>
    </div>

    <!-- Compose New Message -->
    <div v-if="showCompose" class="compose-panel">
      <div class="compose-header">
        <h4>Neue Nachricht</h4>
        <button @click="showCompose = false" class="close-btn">✕</button>
      </div>
      <form @submit.prevent="sendNewMessage" class="compose-form">
        <input
          v-model="newMessage.toPub"
          type="text"
          placeholder="Empfänger Public Key"
          required
          class="input-field"
        />
        <textarea
          v-model="newMessage.content"
          placeholder="Nachricht schreiben..."
          rows="4"
          required
          class="input-field"
        ></textarea>
        <div class="compose-actions">
          <button type="submit" :disabled="sending" class="send-btn">
            {{ sending ? 'Sende...' : '📤 Senden' }}
          </button>
          <button type="button" @click="showCompose = false" class="cancel-btn">
            Abbrechen
          </button>
        </div>
      </form>
    </div>

    <!-- Messages List -->
    <div class="messages-list">
      <div v-if="sortedMessages.length === 0" class="empty-state">
        <p>📭 Keine Nachrichten</p>
        <p class="hint">Starte eine Konversation mit einem anderen User!</p>
      </div>

      <div
        v-for="message in sortedMessages"
        :key="message.id"
        class="message-card"
        :class="{ 'message-sent': message.isSent }"
      >
        <div class="message-header">
          <span class="message-author">
            {{ message.isSent ? '📤 An:' : '📥 Von:' }}
            {{ truncatePub(message.isSent ? message.toPub : message.fromPub) }}
          </span>
          <span class="message-time">{{ formatTime(message.timestamp) }}</span>
        </div>
        <div class="message-content">{{ message.content }}</div>
        <div class="message-actions">
          <button
            v-if="!message.isSent"
            @click="replyTo(message)"
            class="action-btn"
          >
            ↩️ Antworten
          </button>
          <button @click="deleteMessage(message.id)" class="action-btn danger">
            🗑️ Löschen
          </button>
        </div>
      </div>
    </div>

    <!-- Unread Badge -->
    <div v-if="unreadCount > 0" class="unread-badge">
      {{ unreadCount }} neue {{ unreadCount === 1 ? 'Nachricht' : 'Nachrichten' }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { sendMessage, subscribeToMessages, type GunMessage, gunUser } from '../services/gunService'

interface Message extends GunMessage {
  isSent: boolean
}

const messages = ref<Message[]>([])
const showCompose = ref(false)
const sending = ref(false)
const unreadCount = ref(0)

const newMessage = ref({
  toPub: '',
  content: ''
})

// Subscribe to incoming messages
let unsubscribe: (() => void) | null = null

onMounted(() => {
  unsubscribe = subscribeToMessages((message) => {
    const userPub = gunUser.is?.pub

    // Determine if message is sent or received
    const isSent = message.fromPub === userPub

    messages.value.push({
      ...message,
      isSent
    })

    // Increment unread for received messages
    if (!isSent) {
      unreadCount.value++
    }
  })
})

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe()
  }
})

const sortedMessages = computed(() => {
  return [...messages.value].sort((a, b) => b.timestamp - a.timestamp)
})

const sendNewMessage = async () => {
  if (!newMessage.value.toPub || !newMessage.value.content) return

  sending.value = true

  try {
    const success = await sendMessage(newMessage.value.toPub, newMessage.value.content)

    if (success) {
      // Add to local messages as sent
      messages.value.push({
        id: `msg_${Date.now()}`,
        fromPub: gunUser.is?.pub || '',
        toPub: newMessage.value.toPub,
        content: newMessage.value.content,
        timestamp: Date.now(),
        encrypted: true,
        isSent: true
      })

      // Reset form
      newMessage.value = {
        toPub: '',
        content: ''
      }
      showCompose.value = false
    } else {
      alert('❌ Nachricht konnte nicht gesendet werden')
    }
  } catch (error) {
    console.error('Error sending message:', error)
    alert('❌ Fehler beim Senden')
  } finally {
    sending.value = false
  }
}

const replyTo = (message: Message) => {
  newMessage.value.toPub = message.fromPub
  showCompose.value = true
}

const deleteMessage = (messageId: string) => {
  const index = messages.value.findIndex(m => m.id === messageId)
  if (index !== -1) {
    messages.value.splice(index, 1)
  }
}

const truncatePub = (pub: string): string => {
  if (!pub) return 'Unknown'
  return pub.length > 16 ? `${pub.slice(0, 8)}...${pub.slice(-8)}` : pub
}

const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp)
  const now = Date.now()
  const diff = now - timestamp

  if (diff < 60000) return 'Gerade eben'
  if (diff < 3600000) return `Vor ${Math.floor(diff / 60000)} Min.`
  if (diff < 86400000) return `Vor ${Math.floor(diff / 3600000)} Std.`

  return date.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Mark messages as read
const markAsRead = () => {
  unreadCount.value = 0
}

defineExpose({
  markAsRead,
  unreadCount
})
</script>

<style scoped>
.gun-messages {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
  position: relative;
}

.messages-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.messages-header h3 {
  color: #e2e8f0;
  font-size: 1.25rem;
  margin: 0;
}

.compose-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: transform 0.2s, box-shadow 0.2s;
}

.compose-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.compose-panel {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.compose-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.compose-header h4 {
  color: #e2e8f0;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #e2e8f0;
}

.compose-form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.input-field {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  padding: 0.75rem;
  color: #e2e8f0;
  font-family: inherit;
  resize: vertical;
}

.input-field:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.input-field::placeholder {
  color: #64748b;
}

.compose-actions {
  display: flex;
  gap: 0.5rem;
}

.send-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  flex: 1;
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.cancel-btn {
  background: rgba(255, 255, 255, 0.1);
  color: #94a3b8;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 0.75rem 1rem;
  border-radius: 6px;
  cursor: pointer;
}

.cancel-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  color: #e2e8f0;
}

.messages-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 500px;
  overflow-y: auto;
}

.messages-list::-webkit-scrollbar {
  width: 6px;
}

.messages-list::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.messages-list::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #64748b;
}

.empty-state p {
  margin: 0.5rem 0;
}

.empty-state .hint {
  font-size: 0.875rem;
}

.message-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 1rem;
  transition: transform 0.2s, box-shadow 0.2s;
}

.message-card:hover {
  transform: translateX(4px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.message-card.message-sent {
  border-left: 3px solid #667eea;
  background: rgba(102, 126, 234, 0.1);
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.message-author {
  color: #94a3b8;
  font-size: 0.875rem;
  font-weight: 600;
}

.message-time {
  color: #64748b;
  font-size: 0.75rem;
}

.message-content {
  color: #e2e8f0;
  margin-bottom: 0.75rem;
  line-height: 1.5;
  white-space: pre-wrap;
}

.message-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #94a3b8;
  padding: 0.375rem 0.75rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.75rem;
  transition: all 0.2s;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  color: #e2e8f0;
}

.action-btn.danger:hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.5);
  color: #ef4444;
}

.unread-badge {
  position: absolute;
  top: -10px;
  right: -10px;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  padding: 0.375rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .gun-messages {
    padding: 1rem;
  }

  .compose-btn {
    font-size: 0.75rem;
    padding: 0.375rem 0.75rem;
  }

  .messages-header h3 {
    font-size: 1rem;
  }
}
</style>
