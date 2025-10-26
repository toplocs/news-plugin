<template>
  <div class="community-feed">
    <!-- Header with Search -->
    <div class="feed-header">
      <h2>🌐 Community Feed</h2>
      <div class="header-actions">
        <SearchBar
          ref="searchBar"
          placeholder="Posts durchsuchen..."
          @search="handleSearch"
          @select="handleSearchSelect"
        />
        <button @click="showCreatePost = true" class="create-btn" v-if="gunAuth.isLoggedIn">
          <span>✏️</span>
          <span>Neuer Post</span>
        </button>
      </div>
    </div>

    <!-- Tag Filter -->
    <TagFilter
      v-if="availableTags.length > 0"
      :available-tags="availableTags"
      :tag-counts="tagCounts"
      @update:selected-tags="handleTagsUpdate"
    />

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
          <div class="form-group">
            <label>Bild (optional)</label>
            <ImageUpload
              @image-selected="handleImageSelected"
              :max-size-m-b="5"
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

      <!-- Loading Skeleton -->
      <LoadingSkeleton
        v-else-if="loading"
        type="post"
        :count="3"
      />

      <div v-else-if="posts.length === 0" class="empty-state">
        <p>📭 Noch keine Posts. Sei der Erste!</p>
      </div>

      <div v-else class="posts-list">
        <div
          v-for="post in sortedPosts"
          :key="post.id"
          :data-post-id="post.id"
          class="post-card"
        >
          <div class="post-header">
            <div class="author">
              <div class="avatar">{{ post.author[0].toUpperCase() }}</div>
              <OnlineStatus status="online" :show-label="false" />
              <div class="author-info">
                <span class="name">{{ post.author }}</span>
                <span class="time">{{ formatTime(post.created) }}</span>
              </div>
            </div>
            <button
              @click="handleSavePost(post)"
              class="save-btn"
              :class="{ saved: isPostSaved(post.id) }"
            >
              {{ isPostSaved(post.id) ? '💾' : '🔖' }}
            </button>
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
            <button
              @click="toggleComments(post.id)"
              class="action-btn"
              :class="{ active: expandedComments.has(post.id) }"
            >
              <span>💬</span>
              <span>{{ post.comments || 0 }}</span>
            </button>
            <button class="action-btn">
              <span>🔗</span>
              <span>Teilen</span>
            </button>
          </div>

          <!-- Post Comments -->
          <PostComments
            v-if="expandedComments.has(post.id)"
            :post-id="post.id"
            @comment-added="handleCommentAdded(post.id)"
          />
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
import SearchBar, { type SearchResult } from './SearchBar.vue'
import TagFilter from './TagFilter.vue'
import ImageUpload from './ImageUpload.vue'
import PostComments from './PostComments.vue'
import LoadingSkeleton from './LoadingSkeleton.vue'
import OnlineStatus from './OnlineStatus.vue'
import { useSavedPosts } from '../composables/useSavedPosts'
import { useKeyboardShortcuts } from '../composables/useKeyboardShortcuts'

const showCreatePost = ref(false)
const posting = ref(false)
const posts = ref<GunPost[]>([])
const loading = ref(true)
const searchBar = ref<InstanceType<typeof SearchBar> | null>(null)
const selectedTags = ref<string[]>([])
const uploadedImage = ref<string>('')
const expandedComments = ref<Set<string>>(new Set())

const newPost = ref({
  title: '',
  content: '',
  tagsInput: ''
})

// Saved Posts Composable
const { isPostSaved, toggleSave } = useSavedPosts()

// All available tags from posts
const availableTags = computed(() => {
  const tagSet = new Set<string>()
  posts.value.forEach(post => {
    post.tags?.forEach(tag => tagSet.add(tag))
  })
  return Array.from(tagSet)
})

// Tag counts
const tagCounts = computed(() => {
  const counts: Record<string, number> = {}
  posts.value.forEach(post => {
    post.tags?.forEach(tag => {
      counts[tag] = (counts[tag] || 0) + 1
    })
  })
  return counts
})

// Filtered and sorted posts
const filteredPosts = computed(() => {
  let filtered = posts.value

  // Filter by selected tags
  if (selectedTags.value.length > 0) {
    filtered = filtered.filter(post =>
      post.tags?.some(tag => selectedTags.value.includes(tag))
    )
  }

  return filtered
})

const sortedPosts = computed(() => {
  return [...filteredPosts.value].sort((a, b) => b.created - a.created)
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

// Search
function handleSearch(query: string) {
  const results: SearchResult[] = posts.value
    .filter(post =>
      post.title.toLowerCase().includes(query.toLowerCase()) ||
      post.content.toLowerCase().includes(query.toLowerCase())
    )
    .map(post => ({
      id: post.id,
      title: post.title,
      description: post.content.substring(0, 100),
      icon: '📄'
    }))

  searchBar.value?.setResults(results)
}

function handleSearchSelect(result: SearchResult) {
  // Scroll to post
  const postEl = document.querySelector(`[data-post-id="${result.id}"]`)
  postEl?.scrollIntoView({ behavior: 'smooth' })
}

// Tags Filter
function handleTagsUpdate(tags: string[]) {
  selectedTags.value = tags
}

// Image Upload
function handleImageSelected(file: File, preview: string) {
  uploadedImage.value = preview
}

// Save Post
function handleSavePost(post: GunPost) {
  toggleSave(post.id, post.title, post.author, post.tags)
}

// Comments
function toggleComments(postId: string) {
  if (expandedComments.value.has(postId)) {
    expandedComments.value.delete(postId)
  } else {
    expandedComments.value.add(postId)
  }
}

function handleCommentAdded(postId: string) {
  // Increment comment count
  const post = posts.value.find(p => p.id === postId)
  if (post) {
    post.comments = (post.comments || 0) + 1
  }
}

// Keyboard Shortcuts
useKeyboardShortcuts([
  {
    key: 'k',
    ctrl: true,
    description: 'Search öffnen',
    handler: () => {
      const searchInput = document.querySelector<HTMLInputElement>('.search-input')
      searchInput?.focus()
    }
  },
  {
    key: 'n',
    ctrl: true,
    description: 'Neuer Post',
    handler: () => {
      if (gunAuth.isLoggedIn) {
        showCreatePost.value = true
      }
    }
  }
])

onMounted(() => {
  if (gunAuth.isLoggedIn) {
    subscribeToPosts((post) => {
      // Check if post already exists
      if (!posts.value.find(p => p.id === post.id)) {
        posts.value.push(post)
      }
    }, 50)

    // Simulate loading delay
    setTimeout(() => {
      loading.value = false
    }, 1000)
  } else {
    loading.value = false
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
