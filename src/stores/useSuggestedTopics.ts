import { ref, computed, watch } from 'vue'
import gun from '../services/gun'
import type { NewsArticle } from '../types'

/**
 * Suggested Topic - A topic that has appeared frequently in news articles
 * and may be promoted to a TopLocs Topic entity
 */
export interface SuggestedTopic {
  name: string                    // Display name: "Quantum Annealing"
  slug: string                    // URL-safe identifier: "quantum-annealing"
  count: number                   // Number of articles mentioning this topic
  avgConfidence: number           // Average NLP confidence score (0-1)
  firstSeen: number              // Timestamp of first appearance
  lastSeen: number               // Timestamp of last appearance
  articleIds: string[]           // IDs of articles mentioning this topic
  uniqueSources: string[]        // Unique news sources
  status: 'pending' | 'approved' | 'rejected' | 'promoted'  // Curation status
}

/**
 * Thresholds for auto-promoting topics
 */
export const TOPIC_THRESHOLDS = {
  count: 10,                      // Min. 10 articles
  avgConfidence: 0.8,             // NLP Score >= 0.8
  timeSpan: 7 * 86400000,         // Min. 7 days (in milliseconds)
  uniqueSources: 3                // Min. 3 different sources
}

const STORAGE_KEY = 'news_plugin_suggested_topics'
const GUN_PATH = 'news_plugin/suggested_topics'

const suggestedTopics = ref<Map<string, SuggestedTopic>>(new Map())
const isLoading = ref(false)
const lastUpdate = ref<number>(0)

// Gun.js subscription
let gunUnsubscribe: (() => void) | null = null

/**
 * Suggested Topics Store - Tracks topics from news articles for auto-promotion
 */
export function useSuggestedTopics() {
  /**
   * Increment topic count when mentioned in an article
   * @param topicSlug - URL-safe topic identifier
   * @param articleId - ID of the article
   * @param confidence - NLP confidence score (0-1)
   * @param source - News source name
   * @param topicName - Display name of the topic
   */
  const incrementTopicCount = async (
    topicSlug: string,
    articleId: string,
    confidence: number,
    source: string,
    topicName: string
  ): Promise<SuggestedTopic> => {
    const existing = suggestedTopics.value.get(topicSlug)

    if (existing) {
      // Update existing topic
      const newCount = existing.count + 1
      const newAvgConfidence =
        (existing.avgConfidence * existing.count + confidence) / newCount

      // Add article ID if not already present
      if (!existing.articleIds.includes(articleId)) {
        existing.articleIds.push(articleId)
      }

      // Add source if not already present
      if (!existing.uniqueSources.includes(source)) {
        existing.uniqueSources.push(source)
      }

      const updated: SuggestedTopic = {
        ...existing,
        count: newCount,
        avgConfidence: newAvgConfidence,
        lastSeen: Date.now(),
        articleIds: existing.articleIds,
        uniqueSources: existing.uniqueSources
      }

      suggestedTopics.value.set(topicSlug, updated)
      await saveSuggestedTopic(topicSlug, updated)

      return updated
    } else {
      // Create new suggested topic
      const newTopic: SuggestedTopic = {
        name: topicName,
        slug: topicSlug,
        count: 1,
        avgConfidence: confidence,
        firstSeen: Date.now(),
        lastSeen: Date.now(),
        articleIds: [articleId],
        uniqueSources: [source],
        status: 'pending'
      }

      suggestedTopics.value.set(topicSlug, newTopic)
      await saveSuggestedTopic(topicSlug, newTopic)

      return newTopic
    }
  }

  /**
   * Get a suggested topic by slug
   * @param slug - Topic slug
   * @returns SuggestedTopic or undefined
   */
  const getSuggestedTopic = (slug: string): SuggestedTopic | undefined => {
    return suggestedTopics.value.get(slug)
  }

  /**
   * Get all suggested topics
   * @returns Array of suggested topics
   */
  const getAllSuggestedTopics = (): SuggestedTopic[] => {
    return Array.from(suggestedTopics.value.values())
  }

  /**
   * Update topic status (approve/reject/promote)
   * @param slug - Topic slug
   * @param status - New status
   */
  const updateTopicStatus = async (
    slug: string,
    status: SuggestedTopic['status']
  ): Promise<boolean> => {
    const topic = suggestedTopics.value.get(slug)

    if (!topic) {
      console.error(`Topic ${slug} not found`)
      return false
    }

    const updated: SuggestedTopic = {
      ...topic,
      status
    }

    suggestedTopics.value.set(slug, updated)
    await saveSuggestedTopic(slug, updated)

    console.log(`✅ Topic ${slug} status updated to ${status}`)
    return true
  }

  /**
   * Check if a topic meets auto-promotion thresholds
   * @param slug - Topic slug
   * @returns Boolean indicating if topic should be auto-promoted
   */
  const meetsAutoPromoteThresholds = (slug: string): boolean => {
    const topic = suggestedTopics.value.get(slug)

    if (!topic) return false

    // Check count threshold
    if (topic.count < TOPIC_THRESHOLDS.count) return false

    // Check confidence threshold
    if (topic.avgConfidence < TOPIC_THRESHOLDS.avgConfidence) return false

    // Check time span (topic should have been seen over at least 7 days)
    const timeSpan = topic.lastSeen - topic.firstSeen
    if (timeSpan < TOPIC_THRESHOLDS.timeSpan) return false

    // Check unique sources
    if (topic.uniqueSources.length < TOPIC_THRESHOLDS.uniqueSources) return false

    return true
  }

  /**
   * Get all topics that meet auto-promotion thresholds
   * @returns Array of topics ready for promotion
   */
  const getTopicsReadyForPromotion = (): SuggestedTopic[] => {
    return getAllSuggestedTopics().filter(topic =>
      topic.status === 'pending' && meetsAutoPromoteThresholds(topic.slug)
    )
  }

  /**
   * Get pending topics (awaiting curation)
   * @returns Array of pending topics, sorted by count
   */
  const getPendingTopics = (): SuggestedTopic[] => {
    return getAllSuggestedTopics()
      .filter(topic => topic.status === 'pending')
      .sort((a, b) => b.count - a.count)
  }

  /**
   * Get approved topics
   * @returns Array of approved topics
   */
  const getApprovedTopics = (): SuggestedTopic[] => {
    return getAllSuggestedTopics()
      .filter(topic => topic.status === 'approved')
      .sort((a, b) => b.count - a.count)
  }

  /**
   * Save suggested topic to Gun.js
   * @param slug - Topic slug
   * @param topic - Topic data
   */
  const saveSuggestedTopic = async (slug: string, topic: SuggestedTopic) => {
    try {
      const topicNode = gun.get(GUN_PATH).get(slug)
      await topicNode.put({
        name: topic.name,
        slug: topic.slug,
        count: topic.count,
        avgConfidence: topic.avgConfidence,
        firstSeen: topic.firstSeen,
        lastSeen: topic.lastSeen,
        articleIds: JSON.stringify(topic.articleIds),
        uniqueSources: JSON.stringify(topic.uniqueSources),
        status: topic.status
      })
    } catch (err) {
      console.error('Failed to save suggested topic to Gun.js:', err)
    }
  }

  /**
   * Load suggested topics from localStorage
   */
  const loadSuggestedTopics = () => {
    try {
      if (typeof localStorage === 'undefined') return

      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        suggestedTopics.value = new Map(
          Object.entries(parsed).map(([slug, topic]) => [slug, topic as SuggestedTopic])
        )
      }
    } catch (err) {
      console.error('Failed to load suggested topics:', err)
    }
  }

  /**
   * Save suggested topics to localStorage
   */
  const saveSuggestedTopicsToStorage = () => {
    try {
      if (typeof localStorage === 'undefined') return

      const obj = Object.fromEntries(suggestedTopics.value)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(obj))
    } catch (err) {
      console.error('Failed to save suggested topics:', err)
    }
  }

  /**
   * Subscribe to Gun.js for real-time updates
   */
  const subscribeToGun = () => {
    try {
      const topicsNode = gun.get(GUN_PATH)

      topicsNode.map().on((data: any, slug: string) => {
        if (!data) return

        // Parse arrays from JSON strings
        const articleIds = data.articleIds
          ? JSON.parse(data.articleIds)
          : []
        const uniqueSources = data.uniqueSources
          ? JSON.parse(data.uniqueSources)
          : []

        const topic: SuggestedTopic = {
          name: data.name,
          slug: data.slug,
          count: data.count || 0,
          avgConfidence: data.avgConfidence || 0,
          firstSeen: data.firstSeen || Date.now(),
          lastSeen: data.lastSeen || Date.now(),
          articleIds,
          uniqueSources,
          status: data.status || 'pending'
        }

        suggestedTopics.value.set(slug, topic)
      })

      console.log('📡 Subscribed to Gun.js suggested topics updates')
    } catch (err) {
      console.error('Failed to subscribe to Gun.js suggested topics:', err)
    }
  }

  /**
   * Unsubscribe from Gun.js
   */
  const unsubscribeFromGun = () => {
    if (gunUnsubscribe) {
      gunUnsubscribe()
      gunUnsubscribe = null
    }
  }

  /**
   * Clear all suggested topics
   */
  const clearSuggestedTopics = () => {
    suggestedTopics.value.clear()
    saveSuggestedTopicsToStorage()
  }

  /**
   * Initialize suggested topics system
   */
  const initialize = () => {
    loadSuggestedTopics()
    subscribeToGun()
    console.log('✅ Suggested Topics system initialized')
  }

  /**
   * Cleanup suggested topics system
   */
  const cleanup = () => {
    unsubscribeFromGun()
  }

  // Watch for changes and save automatically
  watch(
    suggestedTopics,
    () => {
      saveSuggestedTopicsToStorage()
      lastUpdate.value = Date.now()
    },
    { deep: true }
  )

  // Computed values
  const totalTopics = computed(() => suggestedTopics.value.size)
  const pendingCount = computed(() => getPendingTopics().length)
  const readyForPromotionCount = computed(() => getTopicsReadyForPromotion().length)

  return {
    // State
    suggestedTopics: computed(() => Array.from(suggestedTopics.value.values())),
    isLoading,
    lastUpdate,
    totalTopics,
    pendingCount,
    readyForPromotionCount,

    // Actions - Topic Management
    incrementTopicCount,
    getSuggestedTopic,
    getAllSuggestedTopics,
    updateTopicStatus,
    clearSuggestedTopics,

    // Actions - Auto-Promote
    meetsAutoPromoteThresholds,
    getTopicsReadyForPromotion,
    getPendingTopics,
    getApprovedTopics,

    // Actions - Gun.js
    subscribeToGun,
    unsubscribeFromGun,

    // Lifecycle
    initialize,
    cleanup
  }
}
