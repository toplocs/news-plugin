import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import gun from '../services/gun'  // ✅ DEZENTRAL: Nutzt lokalen Gun.js (peers: [])

// Quick reaction types with emojis
export const REACTION_TYPES = {
  like: '❤️',
  thumbsup: '👍',
  fire: '🔥',
  celebrate: '🎉',
  thinking: '🤔',
  wow: '😮'
} as const

export type ReactionType = keyof typeof REACTION_TYPES

export interface ArticleReaction {
  articleId: string
  userId: string
  type: ReactionType
  timestamp: number
}

export interface ReactionCount {
  [key: string]: number  // reaction type => count
}

/**
 * Reactions Store - Manages article reactions with Gun.js LOCAL storage
 *
 * Features:
 * - Quick reactions (like, fire, celebrate, etc.)
 * - Real-time reaction counts
 * - LOCAL storage via Gun.js (no external servers!)
 * - User reaction tracking (one reaction per article per user)
 *
 * 🔒 DATENSCHUTZ: Alle Reactions bleiben auf deinem Computer!
 * - Keine externen Server (gun-manhattan wurde entfernt)
 * - Nutzt services/gun.ts (peers: [], localStorage: true)
 * - 100% Privat und Dezentral
 */
export const useReactions = defineStore('reactions', () => {
  // ✅ Gun.js instance from local service (NO external servers!)

  // State
  const reactions = ref<Map<string, ReactionCount>>(new Map()) // articleId => ReactionCount
  const userReactions = ref<Map<string, ReactionType>>(new Map()) // articleId => user's reaction type
  const loading = ref<Map<string, boolean>>(new Map())

  // Current user
  const getCurrentUserId = () => {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('userId') || `user_${Date.now()}`
    }
    return `user_${Date.now()}`
  }

  /**
   * Get reaction counts for an article
   */
  const getReactionCounts = (articleId: string): ReactionCount => {
    return reactions.value.get(articleId) || {}
  }

  /**
   * Get total reaction count for an article
   */
  const getTotalReactions = (articleId: string): number => {
    const counts = getReactionCounts(articleId)
    return Object.values(counts).reduce((sum, count) => sum + count, 0)
  }

  /**
   * Get user's reaction for an article
   */
  const getUserReaction = (articleId: string): ReactionType | null => {
    return userReactions.value.get(articleId) || null
  }

  /**
   * Check if article is loading reactions
   */
  const isLoading = (articleId: string): boolean => {
    return loading.value.get(articleId) || false
  }

  /**
   * Load reactions for an article from Gun.js
   */
  const loadReactions = async (articleId: string): Promise<void> => {
    loading.value.set(articleId, true)

    try {
      const reactionCounts: ReactionCount = {}
      const userId = getCurrentUserId()

      // Query Gun.js for reactions
      await new Promise<void>((resolve) => {
        gun.get('news_plugin')
          .get('reactions')
          .get(articleId)
          .map()
          .once((data, key) => {
            if (data && typeof data === 'object' && key) {
              const reaction = data as ArticleReaction

              // Count reactions by type
              if (!reactionCounts[reaction.type]) {
                reactionCounts[reaction.type] = 0
              }
              reactionCounts[reaction.type]++

              // Track user's own reaction
              if (reaction.userId === userId) {
                userReactions.value.set(articleId, reaction.type)
              }
            }
          })

        // Wait for Gun.js to fetch data
        setTimeout(() => resolve(), 800)
      })

      reactions.value.set(articleId, reactionCounts)
      console.log(`✅ Loaded reactions for article ${articleId}:`, reactionCounts)

    } catch (error) {
      console.error(`❌ Failed to load reactions for ${articleId}:`, error)
    } finally {
      loading.value.set(articleId, false)
    }
  }

  /**
   * Add or change a reaction
   */
  const addReaction = async (
    articleId: string,
    type: ReactionType
  ): Promise<boolean> => {
    try {
      const userId = getCurrentUserId()
      const existingReaction = userReactions.value.get(articleId)

      // If user already has this reaction, remove it (toggle)
      if (existingReaction === type) {
        return removeReaction(articleId)
      }

      // Remove old reaction if exists
      if (existingReaction) {
        await removeReaction(articleId, false) // Don't update UI yet
      }

      // Create reaction ID
      const reactionId = `${userId}_${articleId}`

      const reaction: ArticleReaction = {
        articleId,
        userId,
        type,
        timestamp: Date.now()
      }

      // Store in Gun.js
      await new Promise<void>((resolve, reject) => {
        gun.get('news_plugin')
          .get('reactions')
          .get(articleId)
          .get(reactionId)
          .put(reaction, (ack: any) => {
            if (ack.err) {
              reject(new Error(ack.err))
            } else {
              resolve()
            }
          })
      })

      // Update local state
      const counts = reactions.value.get(articleId) || {}

      // Decrement old reaction count
      if (existingReaction && counts[existingReaction] > 0) {
        counts[existingReaction]--
      }

      // Increment new reaction count
      if (!counts[type]) {
        counts[type] = 0
      }
      counts[type]++

      reactions.value.set(articleId, { ...counts })
      userReactions.value.set(articleId, type)

      console.log(`✅ Added ${type} reaction to article ${articleId}`)
      return true

    } catch (error) {
      console.error('❌ Failed to add reaction:', error)
      return false
    }
  }

  /**
   * Remove user's reaction
   */
  const removeReaction = async (
    articleId: string,
    updateUI: boolean = true
  ): Promise<boolean> => {
    try {
      const userId = getCurrentUserId()
      const reactionId = `${userId}_${articleId}`
      const existingReaction = userReactions.value.get(articleId)

      if (!existingReaction) {
        return false
      }

      // Remove from Gun.js
      await new Promise<void>((resolve) => {
        gun.get('news_plugin')
          .get('reactions')
          .get(articleId)
          .get(reactionId)
          .put(null, () => resolve())
      })

      if (updateUI) {
        // Update local state
        const counts = reactions.value.get(articleId) || {}
        if (counts[existingReaction] > 0) {
          counts[existingReaction]--
        }

        reactions.value.set(articleId, { ...counts })
        userReactions.value.delete(articleId)

        console.log(`✅ Removed ${existingReaction} reaction from article ${articleId}`)
      }

      return true

    } catch (error) {
      console.error('❌ Failed to remove reaction:', error)
      return false
    }
  }

  /**
   * Subscribe to real-time reactions for an article
   */
  const subscribeToReactions = (articleId: string) => {
    const userId = getCurrentUserId()

    gun.get('news_plugin')
      .get('reactions')
      .get(articleId)
      .map()
      .on((data: any) => {
        if (!data) return

        const reaction = data as ArticleReaction

        // Update counts
        const counts = reactions.value.get(articleId) || {}
        if (!counts[reaction.type]) {
          counts[reaction.type] = 0
        }

        reactions.value.set(articleId, { ...counts })

        // Update user reaction
        if (reaction.userId === userId) {
          userReactions.value.set(articleId, reaction.type)
        }
      })
  }

  return {
    // State
    reactions: computed(() => reactions.value),
    userReactions: computed(() => userReactions.value),

    // Getters
    getReactionCounts,
    getTotalReactions,
    getUserReaction,
    isLoading,

    // Actions
    loadReactions,
    addReaction,
    removeReaction,
    subscribeToReactions,

    // Constants
    REACTION_TYPES: computed(() => REACTION_TYPES)
  }
})
