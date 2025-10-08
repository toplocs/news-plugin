import type { NewsArticle } from '../types'

/**
 * Ad Matching Service
 * Matches ads to users based on their interests
 * Calculates revenue distribution
 */

export interface Ad {
  id: string
  title: string
  description: string
  imageUrl: string
  targetUrl: string
  interests: string[]          // Which interests this ad targets
  cpm: number                  // Cost per 1000 impressions (in €)
  cpc: number                  // Cost per click (in €)
  active: boolean
}

export interface AdPlacement {
  adId: string
  ad: Ad
  articleId: string
  userId: string
  userInterests: string[]
  matchScore: number           // 0-1, how well ad matches user
  timestamp: number
  type: 'impression' | 'click'
  revenue: number              // Total revenue from this placement
  distribution: {
    platform: number           // 40%
    user: number              // 30%
    channel: number           // 20%
    author: number            // 10%
  }
}

// Mock Ads Database (in production: from Ad Server)
const MOCK_ADS: Ad[] = [
  {
    id: 'ad-tech-1',
    title: 'AI Bootcamp Berlin',
    description: 'Learn AI & Machine Learning in 12 Weeks',
    imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=200&fit=crop',
    targetUrl: 'https://example.com/ai-bootcamp',
    interests: ['tech', 'ai', 'learning', 'berlin'],
    cpm: 5.0,   // 5€ per 1000 impressions
    cpc: 0.50,  // 0.50€ per click
    active: true
  },
  {
    id: 'ad-startup-1',
    title: 'Startup Funding Event',
    description: 'Meet Investors & VCs in Berlin',
    imageUrl: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=600&h=200&fit=crop',
    targetUrl: 'https://example.com/funding-event',
    interests: ['startup', 'business', 'networking', 'berlin'],
    cpm: 6.0,
    cpc: 0.75,
    active: true
  },
  {
    id: 'ad-urban-1',
    title: 'Urban Gardening Workshop',
    description: 'Sustainable City Farming - This Weekend',
    imageUrl: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=600&h=200&fit=crop',
    targetUrl: 'https://example.com/urban-gardening',
    interests: ['urban', 'sustainability', 'community', 'gardening'],
    cpm: 3.0,
    cpc: 0.30,
    active: true
  },
  {
    id: 'ad-community-1',
    title: 'Nachbarschafts-App',
    description: 'Vernetze dich mit deiner Nachbarschaft',
    imageUrl: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=600&h=200&fit=crop',
    targetUrl: 'https://example.com/community-app',
    interests: ['community', 'local', 'networking'],
    cpm: 4.0,
    cpc: 0.40,
    active: true
  },
  {
    id: 'ad-tech-2',
    title: 'Cloud Hosting - 50% Off',
    description: 'Deploy your app in minutes',
    imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&h=200&fit=crop',
    targetUrl: 'https://example.com/cloud-hosting',
    interests: ['tech', 'development', 'startup'],
    cpm: 7.0,
    cpc: 1.0,
    active: true
  }
]

export class AdMatchingService {
  private placements: AdPlacement[] = []
  private readonly REVENUE_SPLIT = {
    platform: 0.40,
    user: 0.30,
    channel: 0.20,
    author: 0.10
  }

  /**
   * Find best matching ad for user based on interests
   */
  findBestAd(userInterests: string[], articleId?: string): Ad | null {
    if (userInterests.length === 0) {
      // Fallback: return random ad
      return this.getRandomAd()
    }

    const activeAds = MOCK_ADS.filter(ad => ad.active)

    // Calculate match score for each ad
    const scoredAds = activeAds.map(ad => ({
      ad,
      score: this.calculateMatchScore(userInterests, ad.interests)
    }))

    // Sort by score descending
    scoredAds.sort((a, b) => b.score - a.score)

    // Return best matching ad (or random if no good match)
    const bestMatch = scoredAds[0]
    return bestMatch && bestMatch.score > 0 ? bestMatch.ad : this.getRandomAd()
  }

  /**
   * Calculate how well ad interests match user interests
   * Returns score 0-1
   */
  private calculateMatchScore(userInterests: string[], adInterests: string[]): number {
    if (userInterests.length === 0 || adInterests.length === 0) {
      return 0
    }

    // Count matching interests
    const matches = userInterests.filter(interest =>
      adInterests.some(adInt =>
        adInt.toLowerCase().includes(interest.toLowerCase()) ||
        interest.toLowerCase().includes(adInt.toLowerCase())
      )
    ).length

    // Score = matches / max(userInterests, adInterests)
    const maxLength = Math.max(userInterests.length, adInterests.length)
    return matches / maxLength
  }

  /**
   * Get random ad as fallback
   */
  private getRandomAd(): Ad | null {
    const activeAds = MOCK_ADS.filter(ad => ad.active)
    if (activeAds.length === 0) return null
    return activeAds[Math.floor(Math.random() * activeAds.length)]
  }

  /**
   * Track ad impression
   */
  trackImpression(
    ad: Ad,
    userId: string,
    userInterests: string[],
    articleId?: string,
    channelId?: string
  ): AdPlacement {
    const matchScore = this.calculateMatchScore(userInterests, ad.interests)

    // Calculate revenue (CPM = cost per 1000 impressions)
    const baseRevenue = ad.cpm / 1000  // Revenue per single impression
    const totalRevenue = baseRevenue * (0.5 + matchScore * 0.5)  // Better match = higher revenue

    const placement: AdPlacement = {
      adId: ad.id,
      ad,
      articleId: articleId || 'feed',
      userId,
      userInterests,
      matchScore,
      timestamp: Date.now(),
      type: 'impression',
      revenue: totalRevenue,
      distribution: {
        platform: totalRevenue * this.REVENUE_SPLIT.platform,
        user: totalRevenue * this.REVENUE_SPLIT.user,
        channel: totalRevenue * this.REVENUE_SPLIT.channel,
        author: totalRevenue * this.REVENUE_SPLIT.author
      }
    }

    this.placements.push(placement)
    this.savePlacements()

    console.log(`📊 Ad Impression: ${ad.title} | Match: ${(matchScore * 100).toFixed(0)}% | User Revenue: €${placement.distribution.user.toFixed(4)}`)

    return placement
  }

  /**
   * Track ad click
   */
  trackClick(
    ad: Ad,
    userId: string,
    userInterests: string[],
    articleId?: string,
    channelId?: string
  ): AdPlacement {
    const matchScore = this.calculateMatchScore(userInterests, ad.interests)

    // Calculate revenue from click
    const totalRevenue = ad.cpc * (0.5 + matchScore * 0.5)  // Better match = higher revenue

    const placement: AdPlacement = {
      adId: ad.id,
      ad,
      articleId: articleId || 'feed',
      userId,
      userInterests,
      matchScore,
      timestamp: Date.now(),
      type: 'click',
      revenue: totalRevenue,
      distribution: {
        platform: totalRevenue * this.REVENUE_SPLIT.platform,
        user: totalRevenue * this.REVENUE_SPLIT.user,
        channel: totalRevenue * this.REVENUE_SPLIT.channel,
        author: totalRevenue * this.REVENUE_SPLIT.author
      }
    }

    this.placements.push(placement)
    this.savePlacements()

    console.log(`💰 Ad Click: ${ad.title} | Match: ${(matchScore * 100).toFixed(0)}% | User Revenue: €${placement.distribution.user.toFixed(2)}`)

    return placement
  }

  /**
   * Get all placements for a user
   */
  getUserPlacements(userId: string): AdPlacement[] {
    return this.placements.filter(p => p.userId === userId)
  }

  /**
   * Get total revenue for a user
   */
  getUserRevenue(userId: string): {
    total: number
    thisWeek: number
    thisMonth: number
    byInterest: Record<string, number>
  } {
    const userPlacements = this.getUserPlacements(userId)

    const now = Date.now()
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000
    const monthAgo = now - 30 * 24 * 60 * 60 * 1000

    const total = userPlacements.reduce((sum, p) => sum + p.distribution.user, 0)
    const thisWeek = userPlacements
      .filter(p => p.timestamp > weekAgo)
      .reduce((sum, p) => sum + p.distribution.user, 0)
    const thisMonth = userPlacements
      .filter(p => p.timestamp > monthAgo)
      .reduce((sum, p) => sum + p.distribution.user, 0)

    // Revenue by interest
    const byInterest: Record<string, number> = {}
    userPlacements.forEach(p => {
      p.userInterests.forEach(interest => {
        if (!byInterest[interest]) {
          byInterest[interest] = 0
        }
        byInterest[interest] += p.distribution.user
      })
    })

    return { total, thisWeek, thisMonth, byInterest }
  }

  /**
   * Save placements to localStorage
   */
  private savePlacements() {
    try {
      // Keep only last 1000 placements
      if (this.placements.length > 1000) {
        this.placements = this.placements.slice(-1000)
      }

      localStorage.setItem('adPlacements', JSON.stringify(this.placements))
    } catch (err) {
      console.error('Failed to save ad placements:', err)
    }
  }

  /**
   * Load placements from localStorage
   */
  loadPlacements() {
    try {
      const stored = localStorage.getItem('adPlacements')
      if (stored) {
        this.placements = JSON.parse(stored)
        console.log(`📦 Loaded ${this.placements.length} ad placements`)
      }
    } catch (err) {
      console.error('Failed to load ad placements:', err)
    }
  }

  /**
   * Get all available ads
   */
  getAllAds(): Ad[] {
    return MOCK_ADS.filter(ad => ad.active)
  }
}

// Singleton instance
export const adMatchingService = new AdMatchingService()

// Auto-load on import
adMatchingService.loadPlacements()
