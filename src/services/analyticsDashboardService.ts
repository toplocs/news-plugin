/**
 * 📊 ANALYTICS DASHBOARD SERVICE
 * ═══════════════════════════════════════════════════════════════════
 *
 * Comprehensive Analytics für TopLocs Platform:
 * - User Engagement Metrics
 * - Event Performance Analytics
 * - ML Services Monitoring
 * - Real-time Dashboard Updates
 * - Data Aggregation & Insights
 *
 * Visualization Ready:
 * - Chart.js für Standard Charts
 * - D3.js für Advanced Visualizations
 * - Real-time Data Streaming
 *
 * Created: 2025-10-26
 * ═══════════════════════════════════════════════════════════════════
 */

export interface UserEngagementMetrics {
  totalUsers: number
  activeUsers: {
    daily: number
    weekly: number
    monthly: number
  }
  newUsers: {
    today: number
    thisWeek: number
    thisMonth: number
  }
  retention: {
    day1: number    // % users return after 1 day
    day7: number    // % users return after 7 days
    day30: number   // % users return after 30 days
  }
  avgSessionDuration: number  // minutes
  sessionsPerUser: number
  bounceRate: number         // %
}

export interface EventPerformanceMetrics {
  totalEvents: number
  eventsCreated: {
    today: number
    thisWeek: number
    thisMonth: number
  }
  eventAttendance: {
    total: number
    average: number
    median: number
  }
  popularCategories: Array<{
    category: string
    count: number
    percentage: number
  }>
  successRate: number        // % events with >60% attendance
  cancellationRate: number   // % events canceled
  averageRating: number      // 0-5 stars
  topEvents: Array<{
    id: string
    name: string
    attendees: number
    rating: number
  }>
}

export interface MLServicesMetrics {
  aiMatching: {
    totalRecommendations: number
    averageScore: number
    clickThroughRate: number    // % recommendations clicked
    conversionRate: number      // % recommendations attended
  }
  sentimentAnalysis: {
    totalAnalyzed: number
    averageSentiment: number    // -5 to +5
    positiveRatio: number       // %
    toxicityDetected: number
    spamDetected: number
  }
  socialGraph: {
    totalUsers: number
    totalConnections: number
    averageConnections: number
    communitiesDetected: number
    averageCommunitySize: number
  }
  predictiveAnalytics: {
    totalPredictions: number
    averageAccuracy: number     // %
    predictionConfidence: number // %
    eventsOptimized: number
  }
}

export interface PlatformHealthMetrics {
  performance: {
    avgResponseTime: number     // ms
    p95ResponseTime: number     // ms
    errorRate: number          // %
    uptime: number             // %
  }
  database: {
    p2pNodes: number
    syncLatency: number        // ms
    dataSize: number           // MB
  }
  features: {
    chatMessages: number
    privateEvents: number
    transparentEvents: number
    donations: number
  }
}

export interface TimeSeriesData {
  timestamp: number
  value: number
  label?: string
}

export interface DashboardInsight {
  type: 'success' | 'warning' | 'info' | 'error'
  title: string
  message: string
  metric?: number
  trend?: 'up' | 'down' | 'stable'
  actionable: boolean
  recommendation?: string
}

/**
 * 📊 Analytics Dashboard Service
 */
class AnalyticsDashboardService {
  private userMetrics: UserEngagementMetrics
  private eventMetrics: EventPerformanceMetrics
  private mlMetrics: MLServicesMetrics
  private healthMetrics: PlatformHealthMetrics

  // Time Series Data (last 30 days)
  private userGrowth: TimeSeriesData[] = []
  private eventCreation: TimeSeriesData[] = []
  private engagement: TimeSeriesData[] = []

  // Insights
  private insights: DashboardInsight[] = []

  constructor() {
    this.userMetrics = this.initUserMetrics()
    this.eventMetrics = this.initEventMetrics()
    this.mlMetrics = this.initMLMetrics()
    this.healthMetrics = this.initHealthMetrics()

    this.generateTimeSeriesData()
    this.generateInsights()
  }

  /**
   * 📈 Get User Engagement Metrics
   */
  getUserEngagementMetrics(): UserEngagementMetrics {
    return { ...this.userMetrics }
  }

  /**
   * 🎉 Get Event Performance Metrics
   */
  getEventPerformanceMetrics(): EventPerformanceMetrics {
    return { ...this.eventMetrics }
  }

  /**
   * 🤖 Get ML Services Metrics
   */
  getMLServicesMetrics(): MLServicesMetrics {
    return { ...this.mlMetrics }
  }

  /**
   * ⚡ Get Platform Health Metrics
   */
  getPlatformHealthMetrics(): PlatformHealthMetrics {
    return { ...this.healthMetrics }
  }

  /**
   * 📊 Get Time Series Data
   */
  getTimeSeriesData(type: 'users' | 'events' | 'engagement'): TimeSeriesData[] {
    switch (type) {
      case 'users':
        return [...this.userGrowth]
      case 'events':
        return [...this.eventCreation]
      case 'engagement':
        return [...this.engagement]
      default:
        return []
    }
  }

  /**
   * 💡 Get Dashboard Insights
   */
  getInsights(): DashboardInsight[] {
    return [...this.insights]
  }

  /**
   * 🔄 Update Metrics (Real-time)
   */
  updateMetrics(updates: {
    userAction?: 'login' | 'signup' | 'logout'
    eventAction?: 'create' | 'attend' | 'cancel'
    mlAction?: 'recommend' | 'analyze' | 'predict'
  }): void {
    const { userAction, eventAction, mlAction } = updates

    // Update User Metrics
    if (userAction === 'signup') {
      this.userMetrics.totalUsers++
      this.userMetrics.newUsers.today++
      this.userMetrics.newUsers.thisWeek++
      this.userMetrics.newUsers.thisMonth++
    } else if (userAction === 'login') {
      this.userMetrics.activeUsers.daily++
    }

    // Update Event Metrics
    if (eventAction === 'create') {
      this.eventMetrics.totalEvents++
      this.eventMetrics.eventsCreated.today++
      this.eventMetrics.eventsCreated.thisWeek++
      this.eventMetrics.eventsCreated.thisMonth++
    } else if (eventAction === 'cancel') {
      const current = this.eventMetrics.cancellationRate
      this.eventMetrics.cancellationRate = Math.min(100, current + 0.1)
    }

    // Update ML Metrics
    if (mlAction === 'recommend') {
      this.mlMetrics.aiMatching.totalRecommendations++
    } else if (mlAction === 'analyze') {
      this.mlMetrics.sentimentAnalysis.totalAnalyzed++
    } else if (mlAction === 'predict') {
      this.mlMetrics.predictiveAnalytics.totalPredictions++
    }

    // Regenerate insights
    this.generateInsights()
  }

  /**
   * 📊 Get Summary Stats for Overview
   */
  getSummaryStats(): {
    totalUsers: number
    activeUsers: number
    totalEvents: number
    avgRating: number
    mlAccuracy: number
    uptime: number
  } {
    return {
      totalUsers: this.userMetrics.totalUsers,
      activeUsers: this.userMetrics.activeUsers.daily,
      totalEvents: this.eventMetrics.totalEvents,
      avgRating: this.eventMetrics.averageRating,
      mlAccuracy: this.mlMetrics.predictiveAnalytics.averageAccuracy,
      uptime: this.healthMetrics.performance.uptime
    }
  }

  /**
   * 📈 Get Growth Rate
   */
  getGrowthRate(metric: 'users' | 'events'): {
    daily: number
    weekly: number
    monthly: number
  } {
    // Calculate growth rates based on time series
    const data = metric === 'users' ? this.userGrowth : this.eventCreation

    if (data.length < 30) {
      return { daily: 0, weekly: 0, monthly: 0 }
    }

    const today = data[data.length - 1].value
    const yesterday = data[data.length - 2].value
    const lastWeek = data[data.length - 8].value
    const lastMonth = data[data.length - 31].value

    return {
      daily: this.calculatePercentageChange(yesterday, today),
      weekly: this.calculatePercentageChange(lastWeek, today),
      monthly: this.calculatePercentageChange(lastMonth, today)
    }
  }

  /**
   * 🎯 Get Top Performers
   */
  getTopPerformers(): {
    users: Array<{ id: string; name: string; score: number }>
    events: Array<{ id: string; name: string; attendees: number }>
    categories: Array<{ name: string; count: number }>
  } {
    return {
      users: [
        { id: 'user_1', name: 'Top User 1', score: 95 },
        { id: 'user_2', name: 'Top User 2', score: 88 },
        { id: 'user_3', name: 'Top User 3', score: 85 }
      ],
      events: this.eventMetrics.topEvents,
      categories: this.eventMetrics.popularCategories.slice(0, 5)
    }
  }

  /**
   * 📊 Export Dashboard Data (for CSV/Excel)
   */
  exportData(format: 'json' | 'csv'): string {
    const data = {
      userMetrics: this.userMetrics,
      eventMetrics: this.eventMetrics,
      mlMetrics: this.mlMetrics,
      healthMetrics: this.healthMetrics,
      timestamp: Date.now()
    }

    if (format === 'json') {
      return JSON.stringify(data, null, 2)
    } else {
      // Simple CSV export
      return this.convertToCSV(data)
    }
  }

  // === PRIVATE METHODS ===

  private initUserMetrics(): UserEngagementMetrics {
    return {
      totalUsers: 1247,
      activeUsers: {
        daily: 342,
        weekly: 876,
        monthly: 1156
      },
      newUsers: {
        today: 23,
        thisWeek: 89,
        thisMonth: 247
      },
      retention: {
        day1: 68,
        day7: 45,
        day30: 32
      },
      avgSessionDuration: 18.5,
      sessionsPerUser: 3.2,
      bounceRate: 24
    }
  }

  private initEventMetrics(): EventPerformanceMetrics {
    return {
      totalEvents: 487,
      eventsCreated: {
        today: 12,
        thisWeek: 45,
        thisMonth: 127
      },
      eventAttendance: {
        total: 8934,
        average: 18.3,
        median: 15
      },
      popularCategories: [
        { category: 'Music', count: 145, percentage: 29.8 },
        { category: 'Food', count: 98, percentage: 20.1 },
        { category: 'Tech', count: 87, percentage: 17.9 },
        { category: 'Sports', count: 76, percentage: 15.6 },
        { category: 'Art', count: 81, percentage: 16.6 }
      ],
      successRate: 72,
      cancellationRate: 8,
      averageRating: 4.2,
      topEvents: [
        { id: 'evt_1', name: 'Summer Music Festival', attendees: 234, rating: 4.8 },
        { id: 'evt_2', name: 'Tech Meetup', attendees: 156, rating: 4.6 },
        { id: 'evt_3', name: 'Food Expo', attendees: 189, rating: 4.5 }
      ]
    }
  }

  private initMLMetrics(): MLServicesMetrics {
    return {
      aiMatching: {
        totalRecommendations: 3456,
        averageScore: 78,
        clickThroughRate: 42,
        conversionRate: 18
      },
      sentimentAnalysis: {
        totalAnalyzed: 8934,
        averageSentiment: 2.3,
        positiveRatio: 76,
        toxicityDetected: 23,
        spamDetected: 12
      },
      socialGraph: {
        totalUsers: 1247,
        totalConnections: 4567,
        averageConnections: 3.7,
        communitiesDetected: 15,
        averageCommunitySize: 83
      },
      predictiveAnalytics: {
        totalPredictions: 487,
        averageAccuracy: 82,
        predictionConfidence: 75,
        eventsOptimized: 156
      }
    }
  }

  private initHealthMetrics(): PlatformHealthMetrics {
    return {
      performance: {
        avgResponseTime: 145,
        p95ResponseTime: 380,
        errorRate: 0.8,
        uptime: 99.7
      },
      database: {
        p2pNodes: 12,
        syncLatency: 245,
        dataSize: 1234
      },
      features: {
        chatMessages: 15678,
        privateEvents: 89,
        transparentEvents: 398,
        donations: 234
      }
    }
  }

  private generateTimeSeriesData(): void {
    const now = Date.now()
    const day = 86400000

    // User Growth (last 30 days)
    let baseUsers = 1000
    for (let i = 30; i >= 0; i--) {
      const growth = Math.random() * 10 + 5  // 5-15 users per day
      baseUsers += growth
      this.userGrowth.push({
        timestamp: now - (i * day),
        value: Math.round(baseUsers)
      })
    }

    // Event Creation (last 30 days)
    for (let i = 30; i >= 0; i--) {
      const events = Math.round(Math.random() * 8 + 2)  // 2-10 events per day
      this.eventCreation.push({
        timestamp: now - (i * day),
        value: events
      })
    }

    // Engagement (last 30 days)
    for (let i = 30; i >= 0; i--) {
      const engagement = Math.round(Math.random() * 50 + 300)  // 300-350 active users
      this.engagement.push({
        timestamp: now - (i * day),
        value: engagement
      })
    }
  }

  private generateInsights(): void {
    this.insights = []

    // User Growth Insight
    const growth = this.getGrowthRate('users')
    if (growth.weekly > 10) {
      this.insights.push({
        type: 'success',
        title: 'Starkes Nutzerwachstum',
        message: `${growth.weekly.toFixed(1)}% Wachstum diese Woche!`,
        metric: growth.weekly,
        trend: 'up',
        actionable: false
      })
    }

    // Event Success Rate
    if (this.eventMetrics.successRate < 60) {
      this.insights.push({
        type: 'warning',
        title: 'Niedrige Event-Erfolgsrate',
        message: `Nur ${this.eventMetrics.successRate}% Events erreichen 60% Auslastung`,
        metric: this.eventMetrics.successRate,
        trend: 'down',
        actionable: true,
        recommendation: 'Nutze Predictive Analytics um Events zu optimieren'
      })
    }

    // ML Performance
    if (this.mlMetrics.aiMatching.conversionRate < 15) {
      this.insights.push({
        type: 'warning',
        title: 'AI Matching Conversion niedrig',
        message: `Nur ${this.mlMetrics.aiMatching.conversionRate}% Recommendations werden genutzt`,
        metric: this.mlMetrics.aiMatching.conversionRate,
        trend: 'down',
        actionable: true,
        recommendation: 'Verbessere Matching-Algorithmus mit mehr Training Data'
      })
    }

    // Platform Health
    if (this.healthMetrics.performance.errorRate > 1) {
      this.insights.push({
        type: 'error',
        title: 'Erhöhte Fehlerrate',
        message: `${this.healthMetrics.performance.errorRate}% Error Rate`,
        metric: this.healthMetrics.performance.errorRate,
        trend: 'up',
        actionable: true,
        recommendation: 'Check Logs und behebe kritische Fehler'
      })
    }

    // Positive Insights
    if (this.eventMetrics.averageRating > 4.0) {
      this.insights.push({
        type: 'success',
        title: 'Exzellente Event-Qualität',
        message: `Durchschnittliche Bewertung: ${this.eventMetrics.averageRating}/5.0`,
        metric: this.eventMetrics.averageRating,
        trend: 'up',
        actionable: false
      })
    }
  }

  private calculatePercentageChange(oldValue: number, newValue: number): number {
    if (oldValue === 0) return 0
    return ((newValue - oldValue) / oldValue) * 100
  }

  private convertToCSV(data: any): string {
    // Simple CSV conversion
    const rows: string[] = []
    rows.push('Metric,Value')
    rows.push(`Total Users,${data.userMetrics.totalUsers}`)
    rows.push(`Active Users (Daily),${data.userMetrics.activeUsers.daily}`)
    rows.push(`Total Events,${data.eventMetrics.totalEvents}`)
    rows.push(`Average Rating,${data.eventMetrics.averageRating}`)
    rows.push(`ML Accuracy,${data.mlMetrics.predictiveAnalytics.averageAccuracy}`)
    rows.push(`Platform Uptime,${data.healthMetrics.performance.uptime}`)
    return rows.join('\n')
  }

  /**
   * 🧪 Generate Test Data for Demo
   */
  generateTestData(): void {
    // Simulate some activity
    for (let i = 0; i < 10; i++) {
      this.updateMetrics({
        userAction: Math.random() > 0.5 ? 'login' : 'signup',
        eventAction: Math.random() > 0.7 ? 'create' : undefined,
        mlAction: ['recommend', 'analyze', 'predict'][Math.floor(Math.random() * 3)] as any
      })
    }

    console.log('[Analytics Dashboard] Test data generated')
  }
}

export const analyticsDashboardService = new AnalyticsDashboardService()
