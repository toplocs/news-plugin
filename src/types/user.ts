export interface UserProfile {
  id: string
  name: string
  username?: string
  avatar?: string
  bio?: string
  interests: string[]
  location?: {
    lat: number
    lng: number
    name?: string
  }
  // Private fields (SEA encrypted)
  email?: string
  phone?: string
  // Social
  following: string[]
  followers: string[]
  // Metadata
  createdAt: number
  updatedAt: number
}

export interface UserSettings {
  privacy: 'public' | 'friends' | 'private'
  notifications: {
    email: boolean
    push: boolean
    messages: boolean
    mentions: boolean
  }
  visibility: {
    showEmail: boolean
    showPhone: boolean
    showLocation: boolean
  }
}
