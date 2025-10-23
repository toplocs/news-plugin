import { describe, test, expect, beforeEach, vi } from 'vitest'
import { useDiscovery } from '../../stores/useDiscovery'

// Mock newsService
vi.mock('../../services/newsService', () => ({
  newsService: {
    searchByInterests: vi.fn(async () => [
      {
        id: 'art-1',
        title: 'AI Breakthrough',
        summary: 'New AI model...',
        topics: ['tech', 'ai'],
        tags: ['breaking'],
        publishedAt: Date.now(),
        source: 'TechCrunch',
        coordinates: { lat: 52.52, lng: 13.40 } // Add location for hybrid test
      }
    ]),
    searchByLocation: vi.fn(async () => [
      {
        id: 'art-1',
        title: 'AI Breakthrough',
        summary: 'New AI model...',
        topics: ['tech', 'ai'],
        tags: ['breaking'],
        publishedAt: Date.now(),
        source: 'TechCrunch',
        coordinates: { lat: 52.52, lng: 13.40 }
      },
      {
        id: 'art-2',
        title: 'Local Event',
        summary: 'Happening nearby...',
        topics: ['local'],
        tags: [],
        publishedAt: Date.now(),
        source: 'LocalNews',
        coordinates: { lat: 52.52, lng: 13.40 }
      }
    ])
  }
}))

describe('useDiscovery', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  test('discovers articles by interests', async () => {
    const { discoverByInterests, matches } = useDiscovery()
    
    await discoverByInterests(['tech', 'ai'])

    expect(matches.value.length).toBeGreaterThan(0)
    expect(matches.value[0].type).toBe('article')
    expect(matches.value[0].score).toBeGreaterThan(0)
  })

  test('calculates relevance score correctly', async () => {
    const { discoverByInterests, matches } = useDiscovery()
    
    await discoverByInterests(['tech', 'ai'])

    const match = matches.value[0]
    
    // Should have high score due to:
    // - 2 matching topics (tech, ai)
    // - Breaking news tag
    // - Recent article
    expect(match.score).toBeGreaterThan(0.7)
  })

  test('discovers articles by location', async () => {
    const { discoverByLocation, matches } = useDiscovery()
    
    await discoverByLocation(52.52, 13.40, 10)

    expect(matches.value.length).toBeGreaterThan(0)
    expect(matches.value[0].reason).toContain('Nähe')
  })

  test('hybrid discovery combines scores', async () => {
    const { discoverHybrid, matches } = useDiscovery()
    
    await discoverHybrid(
      ['tech', 'ai'],
      { lat: 52.52, lng: 13.40, radius: 10 }
    )

    expect(matches.value.length).toBeGreaterThan(0)
    
    // Some matches should have boosted scores from location + interest
    const highScoreMatches = matches.value.filter(m => m.score > 0.8)
    expect(highScoreMatches.length).toBeGreaterThan(0)
  })

  test('sorts matches by score descending', async () => {
    const { discoverByInterests, matches } = useDiscovery()
    
    await discoverByInterests(['tech'])

    // Verify sorted order
    for (let i = 0; i < matches.value.length - 1; i++) {
      expect(matches.value[i].score).toBeGreaterThanOrEqual(matches.value[i + 1].score)
    }
  })

  test('filters high-score matches', async () => {
    const { discoverByInterests, highScoreMatches } = useDiscovery()
    
    await discoverByInterests(['tech', 'ai'])

    highScoreMatches.value.forEach(match => {
      expect(match.score).toBeGreaterThan(0.7)
    })
  })

  test('returns top matches', async () => {
    const { discoverByInterests, topMatches } = useDiscovery()
    
    await discoverByInterests(['tech'])

    expect(topMatches.value.length).toBeLessThanOrEqual(5)
  })

  test('updates settings correctly', () => {
    const { updateSettings, settings } = useDiscovery()
    
    updateSettings({
      interests: ['tech', 'sports'],
      location: { lat: 52.52, lng: 13.40, radius: 5 },
      autoRefresh: true,
      refreshInterval: 60000
    })

    expect(settings.value.interests).toEqual(['tech', 'sports'])
    expect(settings.value.location?.radius).toBe(5)
    expect(settings.value.refreshInterval).toBe(60000)
  })

  test('clears matches', async () => {
    const { discoverByInterests, clearMatches, matches } = useDiscovery()
    
    await discoverByInterests(['tech'])
    expect(matches.value.length).toBeGreaterThan(0)
    
    clearMatches()
    expect(matches.value.length).toBe(0)
  })
})
