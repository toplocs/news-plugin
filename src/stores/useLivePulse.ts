import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

/**
 * Live Pulse Store
 * Real-time hyperlocal feed - shows what's happening RIGHT NOW around you
 *
 * Philosophy: Not addictive algorithms, but REAL social relevance
 * - FOMO from LOCAL events (not global content)
 * - Serendipity (random nearby encounters)
 * - IRL connections (online → offline)
 */

export type PulseType = 'post' | 'event' | 'breaking' | 'activity'

export interface LivePost {
  id: string
  type: PulseType
  userId: string
  username: string
  avatar?: string
  content: string
  imageUrl?: string
  location: {
    lat: number
    lng: number
    name?: string
  }
  distance: number  // meters from user
  timestamp: number
  channelId?: string
  channelName?: string
  reactions?: number
  comments?: number
}

export interface ActiveNeighbor {
  id: string
  username: string
  avatar?: string
  location: {
    lat: number
    lng: number
  }
  distance: number
  lastActive: number
  currentActivity?: string  // "posting", "at_event", "online"
  interests?: string[]
}

export interface LiveEvent {
  id: string
  title: string
  description?: string
  location: {
    lat: number
    lng: number
    name: string
  }
  distance: number
  startTime: number
  endTime: number
  attendees: number
  isLive: boolean  // happening RIGHT NOW
  channelId?: string
}

export const useLivePulse = defineStore('livePulse', () => {
  // State
  const userLocation = ref<{ lat: number; lng: number } | null>(null)
  const radius = ref(500)  // Default 500m
  const livePosts = ref<LivePost[]>([])
  const activeNeighbors = ref<ActiveNeighbor[]>([])
  const liveEvents = ref<LiveEvent[]>([])
  const isRealTimeEnabled = ref(false)
  const lastUpdate = ref<number>(Date.now())

  // Computed
  const postsNearby = computed(() => {
    if (!userLocation.value) return []
    return livePosts.value
      .filter(p => p.distance <= radius.value)
      .sort((a, b) => a.timestamp > b.timestamp ? -1 : 1)  // Newest first
  })

  const neighborsNearby = computed(() => {
    if (!userLocation.value) return []
    return activeNeighbors.value
      .filter(n => n.distance <= radius.value)
      .sort((a, b) => a.distance - b.distance)  // Closest first
  })

  const eventsNearby = computed(() => {
    if (!userLocation.value) return []
    return liveEvents.value
      .filter(e => e.distance <= radius.value)
      .sort((a, b) => {
        // Live events first, then by distance
        if (a.isLive && !b.isLive) return -1
        if (!a.isLive && b.isLive) return 1
        return a.distance - b.distance
      })
  })

  const breakingNews = computed(() => {
    const now = Date.now()
    return postsNearby.value
      .filter(p => p.type === 'breaking' && now - p.timestamp < 3600000)  // Last hour
      .slice(0, 3)
  })

  const rightNowHappening = computed(() => {
    const now = Date.now()
    return [
      ...postsNearby.value
        .filter(p => now - p.timestamp < 600000)  // Last 10 min
        .slice(0, 3),
      ...eventsNearby.value
        .filter(e => e.isLive)
        .slice(0, 2)
    ]
  })

  const activeCount = computed(() => ({
    posts: postsNearby.value.length,
    neighbors: neighborsNearby.value.length,
    events: eventsNearby.value.filter(e => e.isLive).length
  }))

  // Helpers
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371e3 // Earth radius in meters
    const φ1 = lat1 * Math.PI / 180
    const φ2 = lat2 * Math.PI / 180
    const Δφ = (lat2 - lat1) * Math.PI / 180
    const Δλ = (lng2 - lng1) * Math.PI / 180

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return Math.round(R * c)
  }

  const formatDistance = (meters: number): string => {
    if (meters < 100) return `${Math.round(meters / 10) * 10}m`
    if (meters < 1000) return `${Math.round(meters / 50) * 50}m`
    return `${(meters / 1000).toFixed(1)}km`
  }

  const formatTimeAgo = (timestamp: number): string => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000)
    if (seconds < 60) return 'gerade eben'
    if (seconds < 120) return 'vor 1 Min'
    if (seconds < 3600) return `vor ${Math.floor(seconds / 60)} Min`
    if (seconds < 7200) return 'vor 1 Std'
    return `vor ${Math.floor(seconds / 3600)} Std`
  }

  // Actions
  const setUserLocation = (lat: number, lng: number) => {
    userLocation.value = { lat, lng }
    console.log('📍 User location set:', lat, lng)
    updateDistances()
  }

  const setRadius = (meters: number) => {
    radius.value = meters
    console.log('📏 Radius set to:', meters, 'm')
  }

  const updateDistances = () => {
    if (!userLocation.value) return

    const { lat, lng } = userLocation.value

    // Update post distances
    livePosts.value.forEach(post => {
      post.distance = calculateDistance(lat, lng, post.location.lat, post.location.lng)
    })

    // Update neighbor distances
    activeNeighbors.value.forEach(neighbor => {
      neighbor.distance = calculateDistance(lat, lng, neighbor.location.lat, neighbor.location.lng)
    })

    // Update event distances
    liveEvents.value.forEach(event => {
      event.distance = calculateDistance(lat, lng, event.location.lat, event.location.lng)
    })

    lastUpdate.value = Date.now()
  }

  const addPost = (post: Omit<LivePost, 'id' | 'timestamp' | 'distance'>) => {
    if (!userLocation.value) return

    const newPost: LivePost = {
      ...post,
      id: 'post-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      distance: calculateDistance(
        userLocation.value.lat,
        userLocation.value.lng,
        post.location.lat,
        post.location.lng
      )
    }

    livePosts.value.unshift(newPost)

    // Keep only last 50 posts
    if (livePosts.value.length > 50) {
      livePosts.value = livePosts.value.slice(0, 50)
    }

    console.log('📝 New post added:', newPost.content.substring(0, 30))
    return newPost
  }

  const addNeighbor = (neighbor: Omit<ActiveNeighbor, 'id' | 'distance' | 'lastActive'>) => {
    if (!userLocation.value) return

    const existing = activeNeighbors.value.find(n => n.username === neighbor.username)
    if (existing) {
      existing.lastActive = Date.now()
      existing.currentActivity = neighbor.currentActivity
      return existing
    }

    const newNeighbor: ActiveNeighbor = {
      ...neighbor,
      id: 'neighbor-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
      lastActive: Date.now(),
      distance: calculateDistance(
        userLocation.value.lat,
        userLocation.value.lng,
        neighbor.location.lat,
        neighbor.location.lng
      )
    }

    activeNeighbors.value.push(newNeighbor)
    console.log('👋 New neighbor active:', newNeighbor.username)
    return newNeighbor
  }

  const addEvent = (event: Omit<LiveEvent, 'id' | 'distance' | 'isLive'>) => {
    if (!userLocation.value) return

    const now = Date.now()
    const isLive = event.startTime <= now && event.endTime >= now

    const newEvent: LiveEvent = {
      ...event,
      id: 'event-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
      isLive,
      distance: calculateDistance(
        userLocation.value.lat,
        userLocation.value.lng,
        event.location.lat,
        event.location.lng
      )
    }

    liveEvents.value.push(newEvent)
    console.log('🎉 New event added:', newEvent.title)
    return newEvent
  }

  const startRealTime = () => {
    isRealTimeEnabled.value = true
    console.log('▶️ Real-time updates enabled')

    // Update distances every 30 seconds
    const intervalId = setInterval(() => {
      if (!isRealTimeEnabled.value) {
        clearInterval(intervalId)
        return
      }
      updateDistances()

      // Remove inactive neighbors (> 5 min)
      const fiveMinAgo = Date.now() - 300000
      activeNeighbors.value = activeNeighbors.value.filter(n => n.lastActive > fiveMinAgo)

      // Update live events status
      const now = Date.now()
      liveEvents.value.forEach(event => {
        event.isLive = event.startTime <= now && event.endTime >= now
      })

      // Remove past events
      liveEvents.value = liveEvents.value.filter(e => e.endTime > now)
    }, 30000)
  }

  const stopRealTime = () => {
    isRealTimeEnabled.value = false
    console.log('⏸️ Real-time updates disabled')
  }

  const clearOldPosts = () => {
    const oneHourAgo = Date.now() - 3600000
    livePosts.value = livePosts.value.filter(p => p.timestamp > oneHourAgo)
    console.log('🗑️ Old posts cleared')
  }

  const loadDemoData = () => {
    if (!userLocation.value) {
      // Default to Berlin Kreuzberg
      setUserLocation(52.4987, 13.4246)
    }

    const { lat, lng } = userLocation.value!

    // Add demo posts
    const demoPosts: Omit<LivePost, 'id' | 'timestamp' | 'distance'>[] = [
      {
        type: 'breaking',
        userId: 'user-1',
        username: 'Anna M.',
        content: '🎨 Krasse neue Street Art am Mauerpark entdeckt!',
        imageUrl: 'https://images.unsplash.com/photo-1499781350541-7783f6c6a0c8?w=400',
        location: { lat: lat + 0.002, lng: lng + 0.001, name: 'Mauerpark' }
      },
      {
        type: 'event',
        userId: 'user-2',
        username: 'Max K.',
        content: 'Spontaner Rave am Görlitzer Park - kommt vorbei! 🎵',
        location: { lat: lat + 0.001, lng: lng - 0.001, name: 'Görli' },
        channelId: 'ch-1',
        channelName: 'Berlin Nightlife'
      },
      {
        type: 'post',
        userId: 'user-3',
        username: 'Lisa S.',
        content: 'Neues Indie Café eröffnet - Free Coffee bis 18h ☕',
        location: { lat: lat - 0.001, lng: lng + 0.002, name: 'Kreuzberg' }
      },
      {
        type: 'activity',
        userId: 'user-4',
        username: 'Tom B.',
        content: 'Breakdancer Show am Kotti - der Typ ist krass! 🔥',
        location: { lat: lat + 0.0015, lng: lng - 0.0015, name: 'Kottbusser Tor' }
      }
    ]

    demoPosts.forEach((post, i) => {
      setTimeout(() => addPost(post), i * 100)
    })

    // Add demo neighbors
    const demoNeighbors: Omit<ActiveNeighbor, 'id' | 'distance' | 'lastActive'>[] = [
      {
        username: 'Sarah L.',
        avatar: '👩',
        location: { lat: lat + 0.0005, lng: lng + 0.0005 },
        currentActivity: 'posting',
        interests: ['music', 'art']
      },
      {
        username: 'Jan M.',
        avatar: '👨',
        location: { lat: lat - 0.0008, lng: lng + 0.0003 },
        currentActivity: 'at_event',
        interests: ['nightlife', 'tech']
      },
      {
        username: 'Nina K.',
        avatar: '👩',
        location: { lat: lat + 0.0003, lng: lng - 0.0006 },
        currentActivity: 'online',
        interests: ['food', 'community']
      }
    ]

    demoNeighbors.forEach(neighbor => addNeighbor(neighbor))

    // Add demo events
    const now = Date.now()
    const demoEvents: Omit<LiveEvent, 'id' | 'distance' | 'isLive'>[] = [
      {
        title: 'Spontaner Rave',
        description: 'DJ Set am Görli',
        location: { lat: lat + 0.001, lng: lng - 0.001, name: 'Görlitzer Park' },
        startTime: now - 600000,  // Started 10 min ago
        endTime: now + 7200000,   // Ends in 2 hours
        attendees: 23,
        channelId: 'ch-1'
      },
      {
        title: 'Urban Gardening Workshop',
        description: 'Lernt zusammen pflanzen',
        location: { lat: lat - 0.0015, lng: lng + 0.0020, name: 'Prinzessinnengarten' },
        startTime: now + 3600000,  // In 1 hour
        endTime: now + 10800000,
        attendees: 12
      }
    ]

    demoEvents.forEach(event => addEvent(event))

    console.log('✅ Demo data loaded')
  }

  return {
    // State
    userLocation,
    radius,
    livePosts,
    activeNeighbors,
    liveEvents,
    isRealTimeEnabled,
    lastUpdate,

    // Computed
    postsNearby,
    neighborsNearby,
    eventsNearby,
    breakingNews,
    rightNowHappening,
    activeCount,

    // Helpers
    formatDistance,
    formatTimeAgo,

    // Actions
    setUserLocation,
    setRadius,
    updateDistances,
    addPost,
    addNeighbor,
    addEvent,
    startRealTime,
    stopRealTime,
    clearOldPosts,
    loadDemoData
  }
})
