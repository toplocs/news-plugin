<template>
  <div class="community-feed">
    <div class="feed-header">
      <h2>🌐 Community Feed</h2>
      <button @click="showCreatePost = true" class="create-btn" v-if="gunAuth.isLoggedIn">
        <span>✏️</span>
        <span>Neuer Post</span>
      </button>
    </div>

    <!-- Create Post Modal -->
    <div v-if="showCreatePost" class="modal-overlay" @click="showCreatePost = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>✏️ Neuer Post erstellen</h3>
          <button @click="showCreatePost = false" class="close-btn">✕</button>
        </div>
        <form @submit.prevent="handleCreatePost">
          <div class="form-group">
            <label>Titel</label>
            <input
              v-model="newPost.title"
              type="text"
              placeholder="Was möchtest du teilen?"
              required
              class="input"
            />
          </div>
          <div class="form-group">
            <label>Inhalt</label>
            <textarea
              v-model="newPost.content"
              placeholder="Erzähle mehr..."
              rows="4"
              required
              class="textarea"
            ></textarea>
          </div>
          <div class="form-group">
            <label>Tags (kommagetrennt)</label>
            <input
              v-model="newPost.tagsInput"
              type="text"
              placeholder="javascript, vue, webdev"
              class="input"
            />
          </div>
          <button type="submit" :disabled="posting" class="submit-btn">
            <span v-if="posting">Wird gepostet...</span>
            <span v-else>Posten</span>
          </button>
        </form>
      </div>
    </div>

    <!-- Posts Feed -->
    <div class="posts-container">
      <div v-if="!gunAuth.isLoggedIn" class="login-prompt">
        <p>🔐 Bitte logge dich ein, um den Community Feed zu sehen</p>
      </div>

      <div v-else-if="posts.length === 0" class="empty-state">
        <p>📭 Noch keine Posts. Sei der Erste!</p>
      </div>

      <div v-else class="posts-list">
        <div
          v-for="post in sortedPosts"
          :key="post.id"
          class="post-card"
        >
          <div class="post-header">
            <div class="author">
              <div class="avatar">{{ post.author[0].toUpperCase() }}</div>
              <div class="author-info">
                <span class="name">{{ post.author }}</span>
                <span class="time">{{ formatTime(post.created) }}</span>
              </div>
            </div>
          </div>

          <div class="post-content">
            <h3 class="post-title">{{ post.title }}</h3>
            <p class="post-text">{{ post.content }}</p>
            <div v-if="post.tags && post.tags.length" class="tags">
              <span v-for="tag in post.tags" :key="tag" class="tag">
                #{{ tag }}
              </span>
            </div>
          </div>

          <div class="post-footer">
            <button @click="handleLike(post.id)" class="action-btn">
              <span>❤️</span>
              <span>{{ post.likes || 0 }}</span>
            </button>
            <button class="action-btn">
              <span>💬</span>
              <span>{{ post.comments || 0 }}</span>
            </button>
            <button class="action-btn">
              <span>🔗</span>
              <span>Teilen</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  gunAuth,
  createPost,
  subscribeToPosts,
  likePost,
  type GunPost
} from '../services/gunService'

const showCreatePost = ref(false)
const posting = ref(false)
const posts = ref<GunPost[]>([])

const newPost = ref({
  title: '',
  content: '',
  tagsInput: ''
})

const sortedPosts = computed(() => {
  return [...posts.value].sort((a, b) => b.created - a.created)
})

async function handleCreatePost() {
  posting.value = true

  try {
    const tags = newPost.value.tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0)

    const postId = await createPost({
      title: newPost.value.title,
      content: newPost.value.content,
      tags
    })

    if (postId) {
      showCreatePost.value = false
      newPost.value = {
        title: '',
        content: '',
        tagsInput: ''
      }
    }
  } catch (error) {
    console.error('[CommunityFeed] Post creation failed:', error)
  } finally {
    posting.value = false
  }
}

async function handleLike(postId: string) {
  await likePost(postId)
}

function formatTime(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'Gerade eben'
  if (minutes < 60) return `vor ${minutes}m`
  if (hours < 24) return `vor ${hours}h`
  return `vor ${days}d`
}

onMounted(() => {
  if (gunAuth.isLoggedIn) {
    subscribeToPosts((post) => {
      // Check if post already exists
      if (!posts.value.find(p => p.id === post.id)) {
        posts.value.push(post)
      }
    }, 50)
  }
})
</script>

<style scoped>
.community-feed {
  width: 100%;
}

.feed-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.feed-header h2 {
  font-size: 1.5rem;
  color: white;
  margin: 0;
}

.create-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 8px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.create-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 2rem;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.modal-header h3 {
  color: white;
  margin: 0;
}

.close-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.2s;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: white;
  font-weight: 500;
}

.input,
.textarea {
  width: 100%;
  padding: 0.875rem 1rem;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  font-size: 1rem;
}

.input::placeholder,
.textarea::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.textarea {
  resize: vertical;
  font-family: inherit;
}

.submit-btn {
  width: 100%;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.submit-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.3);
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Posts */
.login-prompt,
.empty-state {
  padding: 3rem;
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.1rem;
}

.posts-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.post-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s;
}

.post-card:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-2px);
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.author {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.avatar {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
}

.author-info {
  display: flex;
  flex-direction: column;
}

.name {
  color: white;
  font-weight: 600;
}

.time {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.85rem;
}

.post-content {
  margin-bottom: 1rem;
}

.post-title {
  color: white;
  font-size: 1.2rem;
  margin: 0 0 0.75rem 0;
}

.post-text {
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
  margin: 0;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
}

.tag {
  padding: 0.25rem 0.75rem;
  background: rgba(102, 126, 234, 0.2);
  border: 1px solid rgba(102, 126, 234, 0.3);
  border-radius: 12px;
  color: #a5b4fc;
  font-size: 0.85rem;
}

.post-footer {
  display: flex;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
}
</style>
