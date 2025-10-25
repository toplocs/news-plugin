<template>
  <div class="post-comments">
    <div class="comments-header">
      <h4>💬 {{ comments.length }} {{ comments.length === 1 ? 'Kommentar' : 'Kommentare' }}</h4>
      <button v-if="!showForm" @click="showForm = true" class="add-comment-btn">
        ✍️ Kommentieren
      </button>
    </div>

    <!-- Comment Form -->
    <div v-if="showForm" class="comment-form">
      <textarea
        v-model="newComment"
        placeholder="Schreibe einen Kommentar..."
        rows="3"
        maxlength="500"
        class="comment-input"
        @keydown.ctrl.enter="submitComment"
      ></textarea>
      <div class="form-footer">
        <span class="char-count">{{ newComment.length }}/500</span>
        <div class="form-actions">
          <button @click="showForm = false" class="cancel-btn">
            Abbrechen
          </button>
          <button
            @click="submitComment"
            :disabled="!newComment.trim() || submitting"
            class="submit-btn"
          >
            {{ submitting ? '💾 Poste...' : '📤 Posten' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Comments List -->
    <div class="comments-list">
      <div v-if="comments.length === 0" class="empty-state">
        <p>💭 Noch keine Kommentare</p>
        <p class="hint">Sei der Erste, der kommentiert!</p>
      </div>

      <div
        v-for="comment in sortedComments"
        :key="comment.id"
        class="comment-card"
      >
        <div class="comment-header">
          <div class="author-info">
            <div class="avatar">{{ getInitials(comment.author) }}</div>
            <div class="meta">
              <span class="author-name">{{ comment.author }}</span>
              <span class="timestamp">{{ formatTime(comment.timestamp) }}</span>
            </div>
          </div>
          <div class="comment-actions">
            <button
              @click="likeComment(comment.id)"
              class="action-btn"
              :class="{ liked: comment.liked }"
            >
              ❤️ {{ comment.likes || 0 }}
            </button>
            <button @click="replyTo(comment)" class="action-btn">
              ↩️ Antworten
            </button>
            <button
              v-if="comment.authorPub === currentUserPub"
              @click="deleteComment(comment.id)"
              class="action-btn delete"
            >
              🗑️
            </button>
          </div>
        </div>

        <div class="comment-content">
          {{ comment.content }}
        </div>

        <!-- Nested Replies -->
        <div v-if="comment.replies && comment.replies.length > 0" class="replies">
          <div
            v-for="reply in comment.replies"
            :key="reply.id"
            class="reply-card"
          >
            <div class="reply-header">
              <div class="avatar-small">{{ getInitials(reply.author) }}</div>
              <div class="meta">
                <span class="author-name">{{ reply.author }}</span>
                <span class="timestamp">{{ formatTime(reply.timestamp) }}</span>
              </div>
            </div>
            <div class="reply-content">{{ reply.content }}</div>
          </div>
        </div>

        <!-- Reply Form -->
        <div v-if="replyingTo === comment.id" class="reply-form">
          <input
            v-model="replyContent"
            type="text"
            placeholder="Antworten..."
            maxlength="300"
            class="reply-input"
            @keydown.enter="submitReply(comment.id)"
          />
          <button @click="submitReply(comment.id)" class="reply-submit-btn">
            📤
          </button>
          <button @click="replyingTo = null" class="cancel-reply-btn">
            ✕
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { gunUser } from '../services/gunService'

interface Comment {
  id: string
  postId: string
  author: string
  authorPub: string
  content: string
  timestamp: number
  likes: number
  liked?: boolean
  replies?: Comment[]
}

interface Props {
  postId: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'comment-added', comment: Comment): void
}>()

const comments = ref<Comment[]>([])
const newComment = ref('')
const showForm = ref(false)
const submitting = ref(false)
const replyingTo = ref<string | null>(null)
const replyContent = ref('')

const currentUserPub = computed(() => gunUser.is?.pub || '')

const sortedComments = computed(() => {
  return [...comments.value].sort((a, b) => b.timestamp - a.timestamp)
})

const submitComment = async () => {
  if (!newComment.value.trim() || submitting.value) return

  submitting.value = true

  try {
    const comment: Comment = {
      id: `comment_${Date.now()}_${Math.random()}`,
      postId: props.postId,
      author: gunUser.is?.alias || 'Anonymous',
      authorPub: currentUserPub.value,
      content: newComment.value.trim(),
      timestamp: Date.now(),
      likes: 0,
      replies: []
    }

    comments.value.unshift(comment)

    // Save to Gun.js
    // gun.get('comments').get(props.postId).set(comment)

    emit('comment-added', comment)

    newComment.value = ''
    showForm.value = false
  } catch (error) {
    console.error('Error submitting comment:', error)
    alert('❌ Fehler beim Posten des Kommentars')
  } finally {
    submitting.value = false
  }
}

const replyTo = (comment: Comment) => {
  replyingTo.value = comment.id
  replyContent.value = ''
}

const submitReply = async (commentId: string) => {
  if (!replyContent.value.trim()) return

  const parentComment = comments.value.find(c => c.id === commentId)
  if (!parentComment) return

  const reply: Comment = {
    id: `reply_${Date.now()}_${Math.random()}`,
    postId: props.postId,
    author: gunUser.is?.alias || 'Anonymous',
    authorPub: currentUserPub.value,
    content: replyContent.value.trim(),
    timestamp: Date.now(),
    likes: 0
  }

  if (!parentComment.replies) {
    parentComment.replies = []
  }
  parentComment.replies.push(reply)

  replyContent.value = ''
  replyingTo.value = null
}

const likeComment = (commentId: string) => {
  const comment = comments.value.find(c => c.id === commentId)
  if (comment) {
    comment.liked = !comment.liked
    comment.likes = (comment.likes || 0) + (comment.liked ? 1 : -1)
  }
}

const deleteComment = (commentId: string) => {
  if (confirm('Kommentar wirklich löschen?')) {
    const index = comments.value.findIndex(c => c.id === commentId)
    if (index !== -1) {
      comments.value.splice(index, 1)
    }
  }
}

const getInitials = (name: string): string => {
  if (!name) return '?'
  const parts = name.split(' ')
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

const formatTime = (timestamp: number): string => {
  const now = Date.now()
  const diff = now - timestamp

  if (diff < 60000) return 'Gerade eben'
  if (diff < 3600000) return `Vor ${Math.floor(diff / 60000)} Min.`
  if (diff < 86400000) return `Vor ${Math.floor(diff / 3600000)} Std.`
  if (diff < 604800000) return `Vor ${Math.floor(diff / 86400000)} Tagen`

  return new Date(timestamp).toLocaleDateString('de-DE')
}

// Mock some initial comments for demo
comments.value = [
  {
    id: 'demo1',
    postId: props.postId,
    author: 'Max Mustermann',
    authorPub: 'demo123',
    content: 'Großartiger Post! Sehr interessant.',
    timestamp: Date.now() - 3600000,
    likes: 5,
    replies: [
      {
        id: 'reply1',
        postId: props.postId,
        author: 'Anna Schmidt',
        authorPub: 'demo456',
        content: 'Stimme zu!',
        timestamp: Date.now() - 1800000,
        likes: 2
      }
    ]
  }
]
</script>

<style scoped>
.post-comments {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 1.5rem;
}

.comments-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.comments-header h4 {
  color: #e2e8f0;
  margin: 0;
}

.add-comment-btn {
  background: rgba(102, 126, 234, 0.2);
  border: 1px solid rgba(102, 126, 234, 0.3);
  color: #a5b4fc;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 600;
  transition: all 0.2s;
}

.add-comment-btn:hover {
  background: rgba(102, 126, 234, 0.3);
  transform: translateY(-2px);
}

.comment-form {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.comment-input {
  width: 100%;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  padding: 0.75rem;
  color: #e2e8f0;
  font-family: inherit;
  font-size: 0.875rem;
  resize: vertical;
  margin-bottom: 0.75rem;
}

.comment-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.char-count {
  color: #64748b;
  font-size: 0.75rem;
}

.form-actions {
  display: flex;
  gap: 0.5rem;
}

.cancel-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #94a3b8;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
}

.submit-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
  padding: 0.5rem 1.25rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.875rem;
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: #64748b;
}

.empty-state .hint {
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

.comment-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 1rem;
  transition: transform 0.2s;
}

.comment-card:hover {
  transform: translateX(4px);
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 0.875rem;
  flex-shrink: 0;
}

.meta {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.author-name {
  color: #e2e8f0;
  font-weight: 600;
  font-size: 0.875rem;
}

.timestamp {
  color: #64748b;
  font-size: 0.75rem;
}

.comment-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
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

.action-btn.liked {
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.3);
}

.action-btn.delete:hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.5);
  color: #ef4444;
}

.comment-content {
  color: #e2e8f0;
  line-height: 1.6;
  font-size: 0.875rem;
}

.replies {
  margin-top: 1rem;
  padding-left: 1.5rem;
  border-left: 2px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.reply-card {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 6px;
  padding: 0.75rem;
}

.reply-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.avatar-small {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, #a5b4fc 0%, #c7d2fe 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1e293b;
  font-weight: 700;
  font-size: 0.75rem;
}

.reply-content {
  color: #cbd5e1;
  font-size: 0.8125rem;
  line-height: 1.5;
}

.reply-form {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.reply-input {
  flex: 1;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  padding: 0.5rem 0.75rem;
  color: #e2e8f0;
  font-size: 0.875rem;
}

.reply-input:focus {
  outline: none;
  border-color: #667eea;
}

.reply-submit-btn {
  background: rgba(102, 126, 234, 0.2);
  border: 1px solid rgba(102, 126, 234, 0.3);
  color: white;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
}

.cancel-reply-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #94a3b8;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  cursor: pointer;
}

/* Responsive */
@media (max-width: 768px) {
  .post-comments {
    padding: 1rem;
  }

  .comments-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .add-comment-btn {
    width: 100%;
  }

  .comment-actions {
    flex-wrap: wrap;
  }

  .replies {
    padding-left: 1rem;
  }
}
</style>
