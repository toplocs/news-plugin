<template>
  <div class="comment-section">
    <!-- Header -->
    <div class="section-header">
      <h3 class="section-title">
        <span class="icon">💬</span>
        <span>Comments ({{ commentCount }})</span>
      </h3>
    </div>

    <!-- New Comment Input -->
    <div class="new-comment">
      <div class="user-avatar">
        <div v-if="currentUser.avatar" class="avatar-img">{{ currentUser.avatar }}</div>
        <div v-else class="avatar-fallback">{{ currentUser.name[0].toUpperCase() }}</div>
      </div>

      <div class="comment-input-container">
        <textarea
          v-model="newCommentContent"
          class="comment-input"
          placeholder="Write a comment..."
          rows="3"
          @keydown.enter.ctrl="postComment"
        ></textarea>

        <!-- Emoji Picker Button (simplified) -->
        <div class="input-actions">
          <button
            v-if="showEmojiPicker"
            @click="toggleEmojiPicker"
            class="emoji-btn"
            title="Add emoji"
          >
            😊
          </button>

          <button
            @click="postComment"
            class="post-btn"
            :disabled="!newCommentContent.trim() || isPosting"
          >
            {{ isPosting ? 'Posting...' : 'Post Comment' }}
          </button>
        </div>

        <!-- Simple Emoji Picker -->
        <div v-if="showEmojiPickerPanel" class="emoji-picker">
          <button
            v-for="emoji in quickEmojis"
            :key="emoji"
            @click="insertEmoji(emoji)"
            class="emoji-item"
          >
            {{ emoji }}
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <div class="loading-spinner"></div>
      <span>Loading comments...</span>
    </div>

    <!-- Comments List -->
    <div v-else-if="comments.length > 0" class="comments-list">
      <CommentItem
        v-for="comment in comments"
        :key="comment.id"
        :comment="comment"
        :article-id="articleId"
      />
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <div class="empty-icon">💬</div>
      <p class="empty-title">No comments yet</p>
      <p class="empty-description">Be the first to share your thoughts!</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useComments } from '../stores/useComments'
import CommentItem from './CommentItem.vue'

const props = defineProps<{
  articleId: string
  showEmojiPicker?: boolean
}>()

const commentsStore = useComments()

// State
const newCommentContent = ref('')
const isPosting = ref(false)
const showEmojiPickerPanel = ref(false)

// Quick emojis for picker
const quickEmojis = ['😊', '👍', '👎', '❤️', '🎉', '🤔', '😂', '😍', '🔥', '💯', '👏', '🙌']

// Computed
const comments = computed(() => commentsStore.getComments(props.articleId))
const commentCount = computed(() => commentsStore.getCommentCount(props.articleId))
const isLoading = computed(() => commentsStore.isLoading(props.articleId))

const currentUser = computed(() => {
  if (typeof localStorage !== 'undefined') {
    return {
      id: localStorage.getItem('userId') || `user_${Date.now()}`,
      name: localStorage.getItem('userName') || 'Anonymous',
      avatar: localStorage.getItem('userAvatar') || undefined
    }
  }
  return {
    id: `user_${Date.now()}`,
    name: 'Anonymous',
    avatar: undefined
  }
})

// Methods
const postComment = async () => {
  if (!newCommentContent.value.trim() || isPosting.value) {
    return
  }

  isPosting.value = true

  try {
    const comment = await commentsStore.postComment(
      props.articleId,
      newCommentContent.value.trim()
    )

    if (comment) {
      newCommentContent.value = ''
      showEmojiPickerPanel.value = false
    }
  } finally {
    isPosting.value = false
  }
}

const toggleEmojiPicker = () => {
  showEmojiPickerPanel.value = !showEmojiPickerPanel.value
}

const insertEmoji = (emoji: string) => {
  newCommentContent.value += emoji
  showEmojiPickerPanel.value = false
}

// Load comments on mount
onMounted(() => {
  commentsStore.loadComments(props.articleId)
})
</script>

<style scoped>
.comment-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.125rem;
  font-weight: 700;
  color: #f8fafc;
  margin: 0;
}

.section-title .icon {
  font-size: 1.25rem;
}

/* New Comment Input */
.new-comment {
  display: flex;
  gap: 0.75rem;
  padding: 1rem;
  background: rgba(15, 23, 42, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.75rem;
}

.user-avatar {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
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

.comment-input-container {
  flex: 1;
  position: relative;
}

.comment-input {
  width: 100%;
  padding: 0.75rem;
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  color: #f8fafc;
  font-size: 0.875rem;
  resize: vertical;
  font-family: inherit;
  margin-bottom: 0.75rem;
}

.comment-input:focus {
  outline: none;
  border-color: #6366f1;
}

.comment-input::placeholder {
  color: #64748b;
}

.input-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.emoji-btn {
  padding: 0.5rem 0.75rem;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  font-size: 1.25rem;
  cursor: pointer;
  transition: all 0.2s;
}

.emoji-btn:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.2);
}

.post-btn {
  padding: 0.5rem 1rem;
  background: #6366f1;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.post-btn:hover:not(:disabled) {
  background: #4f46e5;
}

.post-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Emoji Picker */
.emoji-picker {
  position: absolute;
  bottom: 100%;
  left: 0;
  margin-bottom: 0.5rem;
  padding: 0.75rem;
  background: rgba(15, 23, 42, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 0.5rem;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
  z-index: 10;
}

.emoji-item {
  width: 32px;
  height: 32px;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.375rem;
  font-size: 1.25rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.emoji-item:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: scale(1.1);
}

/* Loading State */
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 2rem;
  color: #94a3b8;
  font-size: 0.875rem;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Comments List */
.comments-list {
  display: flex;
  flex-direction: column;
  gap: 0;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #f8fafc;
  margin: 0 0 0.5rem 0;
}

.empty-description {
  font-size: 0.875rem;
  color: #94a3b8;
  margin: 0;
}

/* Responsive */
@media (max-width: 640px) {
  .new-comment {
    flex-direction: column;
  }

  .emoji-picker {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style>
