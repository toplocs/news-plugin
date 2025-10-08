import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { adMatchingService, type Ad, type AdPlacement } from '../services/adMatchingService'

export const useRevenue = defineStore('revenue', () => {
  // State
  const userId = ref<string>('')
  const placements = ref<AdPlacement[]>([])
  const isInitialized = ref(false)

  // Computed
  const totalRevenue = computed(() => {
    return placements.value.reduce((sum, p) => sum + p.distribution.user, 0)
  })

  const weeklyRevenue = computed(() => {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
    return placements.value
      .filter(p => p.timestamp > weekAgo)
      .reduce((sum, p) => sum + p.distribution.user, 0)
  })

  const monthlyRevenue = computed(() => {
    const monthAgo = Date.now() - 30 * 24 * 60 * 60 * 1000
    return placements.value
      .filter(p => p.timestamp > monthAgo)
      .reduce((sum, p) => sum + p.distribution.user, 0)
  })

  const revenueByInterest = computed(() => {
    const byInterest: Record<string, number> = {}

    placements.value.forEach(p => {
      p.userInterests.forEach(interest => {
        if (!byInterest[interest]) {
          byInterest[interest] = 0
        }
        byInterest[interest] += p.distribution.user
      })
    })

    // Sort by revenue descending
    return Object.entries(byInterest)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)  // Top 10
      .map(([interest, revenue]) => ({
        interest,
        revenue,
        percentage: totalRevenue.value > 0 ? (revenue / totalRevenue.value) * 100 : 0
      }))
  })

  const impressionCount = computed(() => {
    return placements.value.filter(p => p.type === 'impression').length
  })

  const clickCount = computed(() => {
    return placements.value.filter(p => p.type === 'click').length
  })

  const clickThroughRate = computed(() => {
    return impressionCount.value > 0
      ? (clickCount.value / impressionCount.value) * 100
      : 0
  })

  const canWithdraw = computed(() => {
    return totalRevenue.value >= 10.0  // Minimum 10€ for withdrawal
  })

  const topPerformingAds = computed(() => {
    const adRevenue: Record<string, { ad: Ad; revenue: number; clicks: number }> = {}

    placements.value.forEach(p => {
      if (!adRevenue[p.adId]) {
        adRevenue[p.adId] = {
          ad: p.ad,
          revenue: 0,
          clicks: 0
        }
      }
      adRevenue[p.adId].revenue += p.distribution.user
      if (p.type === 'click') {
        adRevenue[p.adId].clicks++
      }
    })

    return Object.values(adRevenue)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
  })

  // Actions
  const initialize = () => {
    if (isInitialized.value) return

    // Get or create user ID
    const storedUserId = localStorage.getItem('userId')
    if (storedUserId) {
      userId.value = storedUserId
    } else {
      userId.value = 'user-' + Math.random().toString(36).substr(2, 9)
      localStorage.setItem('userId', userId.value)
    }

    // Load placements from adMatchingService
    loadPlacements()

    isInitialized.value = true
    console.log('💰 Revenue store initialized for user:', userId.value)
  }

  const loadPlacements = () => {
    placements.value = adMatchingService.getUserPlacements(userId.value)
    console.log(`📊 Loaded ${placements.value.length} ad placements`)
  }

  const trackImpression = (
    ad: Ad,
    userInterests: string[],
    articleId?: string,
    channelId?: string
  ) => {
    const placement = adMatchingService.trackImpression(
      ad,
      userId.value,
      userInterests,
      articleId,
      channelId
    )

    placements.value.push(placement)
    return placement
  }

  const trackClick = (
    ad: Ad,
    userInterests: string[],
    articleId?: string,
    channelId?: string
  ) => {
    const placement = adMatchingService.trackClick(
      ad,
      userId.value,
      userInterests,
      articleId,
      channelId
    )

    placements.value.push(placement)
    return placement
  }

  const withdraw = async (amount: number, method: 'paypal' | 'sepa') => {
    if (amount > totalRevenue.value) {
      throw new Error('Insufficient balance')
    }

    if (amount < 10.0) {
      throw new Error('Minimum withdrawal amount is 10€')
    }

    // TODO: Implement actual withdrawal logic
    console.log(`💸 Withdrawal requested: €${amount.toFixed(2)} via ${method}`)

    // For now, just log it
    // In production: API call to payment processor

    return {
      success: true,
      transactionId: 'tx-' + Date.now(),
      amount,
      method
    }
  }

  const exportData = () => {
    const data = {
      userId: userId.value,
      totalRevenue: totalRevenue.value,
      weeklyRevenue: weeklyRevenue.value,
      monthlyRevenue: monthlyRevenue.value,
      impressions: impressionCount.value,
      clicks: clickCount.value,
      ctr: clickThroughRate.value,
      topInterests: revenueByInterest.value,
      placements: placements.value,
      exportedAt: new Date().toISOString()
    }

    // Create downloadable CSV
    const csv = convertToCSV(data)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `revenue-${userId.value}-${Date.now()}.csv`
    a.click()
    window.URL.revokeObjectURL(url)

    console.log('📥 Revenue data exported')
  }

  const convertToCSV = (data: any): string => {
    const headers = ['Date', 'Type', 'Ad', 'Interests', 'Match Score', 'Revenue']
    const rows = data.placements.map((p: AdPlacement) => [
      new Date(p.timestamp).toISOString(),
      p.type,
      p.ad.title,
      p.userInterests.join('; '),
      (p.matchScore * 100).toFixed(0) + '%',
      '€' + p.distribution.user.toFixed(4)
    ])

    return [
      headers.join(','),
      ...rows.map((row: any[]) => row.join(','))
    ].join('\n')
  }

  const clearData = () => {
    if (confirm('Are you sure you want to delete all revenue data? This cannot be undone.')) {
      placements.value = []
      localStorage.removeItem('adPlacements')
      console.log('🗑️ Revenue data cleared')
    }
  }

  // Auto-initialize
  initialize()

  return {
    // State
    userId,
    placements,
    isInitialized,

    // Computed
    totalRevenue,
    weeklyRevenue,
    monthlyRevenue,
    revenueByInterest,
    impressionCount,
    clickCount,
    clickThroughRate,
    canWithdraw,
    topPerformingAds,

    // Actions
    initialize,
    loadPlacements,
    trackImpression,
    trackClick,
    withdraw,
    exportData,
    clearData
  }
})
