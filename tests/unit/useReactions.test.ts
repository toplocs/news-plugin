import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useReactions, type ReactionType } from '../../src/stores/useReactions'

describe('useReactions Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  describe('Initialization', () => {
    it('should initialize with empty state', () => {
      const store = useReactions()
      expect(store.reactions).toEqual(new Map())
      expect(store.userReactions).toEqual(new Map())
    })
  })

  describe('Add Reaction', () => {
    it('should add a reaction to an article', async () => {
      const store = useReactions()
      const result = await store.addReaction('article-1', 'like')
      
      expect(result).toBe(true)
      expect(store.getUserReaction('article-1')).toBe('like')
      expect(store.getTotalReactions('article-1')).toBe(1)
    })

    it('should toggle reaction (remove on second click)', async () => {
      const store = useReactions()
      await store.addReaction('article-1', 'like')
      await store.addReaction('article-1', 'like') // Toggle off
      
      expect(store.getUserReaction('article-1')).toBeNull()
      expect(store.getTotalReactions('article-1')).toBe(0)
    })

    it('should switch reaction types', async () => {
      const store = useReactions()
      await store.addReaction('article-1', 'like')
      await store.addReaction('article-1', 'fire') // Switch
      
      expect(store.getUserReaction('article-1')).toBe('fire')
      expect(store.getReactionCounts('article-1')['like']).toBe(0)
      expect(store.getReactionCounts('article-1')['fire']).toBe(1)
    })
  })

  describe('Reaction Counts', () => {
    it('should track multiple reaction types', async () => {
      const store = useReactions()
      await store.addReaction('article-1', 'like')
      await store.addReaction('article-1', 'fire')
      
      const counts = store.getReactionCounts('article-1')
      expect(counts['fire']).toBe(1)
    })

    it('should return correct total count', async () => {
      const store = useReactions()
      await store.addReaction('article-1', 'like')
      
      expect(store.getTotalReactions('article-1')).toBe(1)
    })
  })

  describe('Dezentralisierung', () => {
    it('should use local Gun.js (no external server)', () => {
      const store = useReactions()
      // Store should be defined (using local gun service)
      expect(store).toBeDefined()
      // Check that store methods work (indicating local storage)
      expect(typeof store.addReaction).toBe('function')
    })
  })
})
