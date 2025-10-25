import { ref } from 'vue'

interface SavedPost {
  id: string
  postId: string
  title: string
  author: string
  savedAt: number
  tags?: string[]
}

const savedPosts = ref<SavedPost[]>([])

const STORAGE_KEY = 'toplocs-saved-posts'

// Load from localStorage
const loadSavedPosts = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      savedPosts.value = JSON.parse(stored)
    }
  } catch (error) {
    console.error('Error loading saved posts:', error)
  }
}

// Save to localStorage
const saveToPersistence = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedPosts.value))
  } catch (error) {
    console.error('Error saving posts:', error)
  }
}

export function useSavedPosts() {
  // Load on first use
  if (savedPosts.value.length === 0) {
    loadSavedPosts()
  }

  const savePost = (postId: string, title: string, author: string, tags?: string[]) => {
    const existingIndex = savedPosts.value.findIndex(p => p.postId === postId)

    if (existingIndex === -1) {
      const newPost: SavedPost = {
        id: `saved_${Date.now()}_${Math.random()}`,
        postId,
        title,
        author,
        savedAt: Date.now(),
        tags
      }

      savedPosts.value.unshift(newPost)
      saveToPersistence()
      return true
    }

    return false
  }

  const unsavePost = (postId: string) => {
    const index = savedPosts.value.findIndex(p => p.postId === postId)

    if (index !== -1) {
      savedPosts.value.splice(index, 1)
      saveToPersistence()
      return true
    }

    return false
  }

  const isPostSaved = (postId: string): boolean => {
    return savedPosts.value.some(p => p.postId === postId)
  }

  const toggleSave = (postId: string, title: string, author: string, tags?: string[]) => {
    if (isPostSaved(postId)) {
      return unsavePost(postId)
    } else {
      return savePost(postId, title, author, tags)
    }
  }

  const clearAll = () => {
    savedPosts.value = []
    saveToPersistence()
  }

  const getSavedByTag = (tag: string) => {
    return savedPosts.value.filter(post =>
      post.tags?.includes(tag)
    )
  }

  return {
    savedPosts,
    savePost,
    unsavePost,
    isPostSaved,
    toggleSave,
    clearAll,
    getSavedByTag
  }
}
