<template>
  <div class="comment-item" :class="{ 'is-reply': isReply }">
    <!-- User Avatar -->
    <div class="comment-avatar">
      <div v-if="comment.userAvatar" class="avatar-img">{{ comment.userAvatar }}</div>
      <div v-else class="avatar-fallback">{{ comment.userName[0].toUpperCase() }}</div>
    </div>

    <!-- Comment Content -->
    <div class="comment-body">
      <!-- Header -->
      <div class="comment-header">
        <span class="comment-author">{{ comment.userName }}</span>
        <span class="comment-time">{{ formatTime(comment.timestamp) }}</span>
        <span v-if="comment.isEdited" class="comment-edited">(edited)</span>
      </div>

      <!-- Content (editable) -->
      <div v-if="!isEditing" class="comment-content">{{ comment.content }}</div>
      <div v-else class="comment-edit">
        <textarea
          v-model="editContent"
          class="edit-input"
          rows="3"
          @keydown.enter.ctrl="saveEdit"
          @keydown.esc="cancelEdit"
        ></textarea>
        <div class="edit-actions">
          <button @click="saveEdit" class="btn-save">Save</button>
          <button @click="cancelEdit" class="btn-cancel">Cancel</button>
        </div>
      </div>

      <!-- Actions -->
      <div class="comment-actions">
        <!-- Upvote -->
        <button
          @click="handleVote('upvote')"
          class="action-btn"
          :class="{ active: userVote === 'upvote' }"
          title="Upvote"
        >
          <span class="icon">👍</span>
          <span v-if="comment.upvotes > 0" class="count">{{ comment.upvotes }}</span>
        </button>

        <!-- Downvote -->
        <button
          @click="handleVote('downvote')"
          class="action-btn"
          :class="{ active: userVote === 'downvote' }"
          title="Downvote"
        >
          <span class="icon">👎</span>
          <span v-if="comment.downvotes > 0" class="count">{{ comment.downvotes }}</span>
        </button>

        <!-- Reply -->
        <button @click="toggleReply" class="action-btn" title="Reply">
          <span class="icon">💬</span>
          <span class="label">Reply</span>
        </button>

        <!-- Edit (only for own comments) -->
        <button
          v-if="isOwnComment"
          @click="startEdit"
          class="action-btn"
          title="Edit"
        >
          <span class="icon">✏️</span>
        </button>

        <!-- Delete (only for own comments) -->
        <button
          v-if="isOwnComment"
          @click="handleDelete"
          class="action-btn danger"
          title="Delete"
        >
          <span class="icon">🗑️</span>
        </button>
      </div>

      <!-- Reply Input -->
      <div v-if="showReplyInput" class="reply-input-container">
        <textarea
          v-model="replyContent"
          class="reply-input"
          placeholder="Write a reply..."
          rows="2"
          @keydown.enter.ctrl="postReply"
          @keydown.esc="cancelReply"
        ></textarea>
        <div class="reply-actions">
          <button @click="postReply" class="btn-reply" :disabled="!replyContent.trim()">
            Post Reply
          </button>
          <button @click="cancelReply" class="btn-cancel-reply">Cancel</button>
        </div>
      </div>

      <!-- Replies (threaded) -->
      <div v-if="comment.replies && comment.replies.length > 0" class="comment-replies">
        <CommentItem
          v-for="reply in comment.replies"
          :key="reply.id"
          :comment="reply"
          :article-id="articleId"
          :is-reply="true"
          @reply="$emit('reply', $event)"
          @edit="$emit('edit', $event)"
          @delete="$emit('delete', $event)"
          @vote="$emit('vote', $event)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Comment } from '../stores/useComments'
import { useComments } from '../stores/useComments'

const props = defineProps<{
  comment: Comment
  articleId: string
  isReply?: boolean
}>()

const emit = defineEmits<{
  reply: [{ commentId: string; content: string }]
  edit: [{ commentId: string; content: string }]
  delete: [commentId: string]
  vote: [{ commentId: string; voteType: 'upvote' | 'downvote' }]
}>()

const commentsStore = useComments()

// State
const isEditing = ref(false)
const editContent = ref('')
const showReplyInput = ref(false)
const replyContent = ref('')

// Computed
const isOwnComment = computed(() => {
  if (typeof localStorage !== 'undefined') {
    const currentUserId = localStorage.getItem('userId')
    return currentUserId === props.comment.userId
  }
  return false
})

const userVote = computed(() => commentsStore.getUserVote(props.comment.id))

// Methods
const formatTime = (timestamp: number): string => {
  const now = Date.now()
  const diff = now - timestamp

  if (diff < 60000) return 'just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`

  return new Date(timestamp).toLocaleDateString()
}

const startEdit = () => {
  editContent.value = props.comment.content
  isEditing.value = true
}

const saveEdit = async () => {
  if (editContent.value.trim() && editContent.value !== props.comment.content) {
    const success = await commentsStore.editComment(
      props.articleId,
      props.comment.id,
      editContent.value.trim()
    )
    if (success) {
      isEditing.value = false
    }
  } else {
    cancelEdit()
  }
}

const cancelEdit = () => {
  isEditing.value = false
  editContent.value = ''
}

const toggleReply = () => {
  showReplyInput.value = !showReplyInput.value
  if (showReplyInput.value) {
    replyContent.value = ''
  }
}

const postReply = async () => {
  if (replyContent.value.trim()) {
    const reply = await commentsStore.postComment(
      props.articleId,
      replyContent.value.trim(),
      props.comment.id // parent ID
    )
    if (reply) {
      replyContent.value = ''
      showReplyInput.value = false
    }
  }
}

const cancelReply = () => {
  showReplyInput.value = false
  replyContent.value = ''
}

const handleVote = async (voteType: 'upvote' | 'downvote') => {
  await commentsStore.voteComment(props.articleId, props.comment.id, voteType)
}

const handleDelete = async () => {
  if (confirm('Are you sure you want to delete this comment?')) {
    await commentsStore.deleteComment(props.articleId, props.comment.id)
  }
}
</script>

<style scoped>
.comment-item {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.comment-item.is-reply {
  margin-left: 2.5rem;
  margin-top: 0.75rem;
}

.comment-avatar {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
}

.comment-item.is-reply .comment-avatar {
  width: 32px;
  height: 32px;
}

.avatar-img,
.avatar-fallback {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  font-weight: 700;
  font-size: 0.875rem;
}

.comment-body {
  flex: 1;
  min-width: 0;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.comment-author {
  font-weight: 600;
  color: #f8fafc;
  font-size: 0.875rem;
}

.comment-time {
  font-size: 0.75rem;
  color: #94a3b8;
}

.comment-edited {
  font-size: 0.75rem;
  color: #64748b;
  font-style: italic;
}

.comment-content {
  color: #e2e8f0;
  font-size: 0.875rem;
  line-height: 1.5;
  margin-bottom: 0.5rem;
  word-wrap: break-word;
}

.comment-edit {
  margin-bottom: 0.5rem;
}

.edit-input,
.reply-input {
  width: 100%;
  padding: 0.5rem;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.375rem;
  color: #f8fafc;
  font-size: 0.875rem;
  resize: vertical;
  font-family: inherit;
}

.edit-input:focus,
.reply-input:focus {
  outline: none;
  border-color: #6366f1;
}

.edit-actions,
.reply-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.btn-save,
.btn-reply {
  padding: 0.375rem 0.75rem;
  background: #6366f1;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-save:hover,
.btn-reply:hover {
  background: #4f46e5;
}

.btn-save:disabled,
.btn-reply:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-cancel,
.btn-cancel-reply {
  padding: 0.375rem 0.75rem;
  background: transparent;
  color: #94a3b8;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.375rem;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover,
.btn-cancel-reply:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #f8fafc;
}

.comment-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.375rem;
  color: #94a3b8;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.2);
  color: #f8fafc;
}

.action-btn.active {
  background: rgba(99, 102, 241, 0.2);
  border-color: #6366f1;
  color: #6366f1;
}

.action-btn.danger:hover {
  background: rgba(239, 68, 68, 0.1);
  border-color: #ef4444;
  color: #ef4444;
}

.action-btn .icon {
  font-size: 0.875rem;
}

.action-btn .count {
  font-weight: 600;
}

.action-btn .label {
  font-weight: 500;
}

.reply-input-container {
  margin-top: 0.75rem;
  padding: 0.75rem;
  background: rgba(15, 23, 42, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
}

.comment-replies {
  margin-top: 0.75rem;
}

/* Responsive */
@media (max-width: 640px) {
  .comment-item.is-reply {
    margin-left: 1.5rem;
  }

  .comment-actions {
    flex-wrap: wrap;
  }

  .action-btn .label {
    display: none;
  }
}
</style>
