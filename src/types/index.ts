/**
 * News Plugin TypeScript Definitions
 */

export interface NewsArticle {
  id: string
  title: string
  summary: string
  content?: string
  url: string
  source: string
  imageUrl?: string
  author?: string
  publishedAt: number
  topics: string[]
  locations: string[]
  coordinates?: { lat: number; lng: number }
  suggestedTopics?: SuggestedTopic[]
  suggestedLocations?: SuggestedLocation[]
  relevance?: number
  tags?: string[]
  // 📚 ERWEITERTE CONTENT-TYPEN
  contentType?: 'news' | 'tutorial' | 'case-study' | 'research' | 'library' | 'video' | 'guide'
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  readingTime?: number // Minuten
  relatedContent?: string[] // IDs von related articles
  resources?: ResourceLink[] // Externe Ressourcen (Bibliotheken, Tools, etc.)
}

export interface ResourceLink {
  type: 'library' | 'tool' | 'documentation' | 'github' | 'video' | 'course'
  name: string
  url: string
  description: string
  language?: string // Für Code-Bibliotheken
  stars?: number // GitHub stars
}

export interface SuggestedTopic {
  slug: string
  count: number
  confidence: number
  status: 'pending' | 'approved' | 'rejected'
  topicId?: string
}

export interface SuggestedLocation {
  slug: string
  count: number
  verified: boolean
  lat?: number
  lng?: number
  locationId?: string
}

export interface NewsSource {
  id: string
  name: string
  url: string
  type: 'rss' | 'api' | 'scraper'
  enabled: boolean
  updateInterval?: number
}

export interface NewsSettings {
  radius: number
  sources: string[]
  interests: string[]
  autoRefresh: boolean
  refreshInterval: number
  showImages: boolean
  notificationsEnabled: boolean
}

export interface NewsFilter {
  search?: string
  sources?: string[]
  dateFrom?: number
  dateTo?: number
  topics?: string[]
  locations?: string[]
}

export interface GunNewsData {
  articles: Record<string, NewsArticle>
  byTopic: Record<string, NewsArticleRef[]>
  byLocation: Record<string, NewsArticleRef[]>
  settings: Record<string, NewsSettings>
}

export interface NewsArticleRef {
  articleId: string
  relevance: number
  publishedAt: number
}
