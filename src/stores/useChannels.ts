import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

/**
 * Channel System Store
 * Manages interest + location-based communities
 * Enables meetups, events, and local organization
 */

export interface Channel {
  id: string
  name: string
  description: string
  interests: string[]  // Which interests this channel serves
  location: {
    lat: number
    lng: number
    name: string  // e.g. "Berlin Mitte"
  }
  radius: number  // Coverage area in km
  memberCount: number
  members: ChannelMember[]
  events: ChannelEvent[]
  createdAt: number
  createdBy: string
  imageUrl?: string
  isPublic: boolean
  revenuePool: number  // 20% of ad revenue goes here
}

export interface ChannelMember {
  userId: string
  username: string
  avatar?: string
  joinedAt: number
  role: 'admin' | 'moderator' | 'member'
  contribution: number  // How much revenue they've generated for channel
}

export interface ChannelEvent {
  id: string
  channelId: string
  title: string
  description: string
  startTime: number
  endTime: number
  location: {
    lat: number
    lng: number
    name: string
  }
  attendees: string[]  // User IDs
  maxAttendees?: number
  cost?: number  // In €, paid from channel revenue pool
  createdBy: string
  createdAt: number
}

export const useChannels = defineStore('channels', () => {
  // State
  const userId = ref<string>('')
  const userChannels = ref<Channel[]>([])
  const allChannels = ref<Channel[]>([])
  const isInitialized = ref(false)

  // Computed
  const myChannels = computed(() => {
    return userChannels.value
  })

  const suggestedChannels = computed(() => {
    // TODO: Filter based on user interests and location
    return allChannels.value.filter(c => !userChannels.value.find(uc => uc.id === c.id))
  })

  const totalMembers = computed(() => {
    return userChannels.value.reduce((sum, c) => sum + c.memberCount, 0)
  })

  const totalEvents = computed(() => {
    return userChannels.value.reduce((sum, c) => sum + c.events.length, 0)
  })

  const upcomingEvents = computed(() => {
    const now = Date.now()
    const events: (ChannelEvent & { channel: Channel })[] = []

    userChannels.value.forEach(channel => {
      channel.events.forEach(event => {
        if (event.startTime > now) {
          events.push({ ...event, channel })
        }
      })
    })

    return events.sort((a, b) => a.startTime - b.startTime).slice(0, 5)
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

    // Load channels from localStorage
    loadChannels()

    // Load demo channels if none exist
    if (allChannels.value.length === 0) {
      loadDemoChannels()
    }

    isInitialized.value = true
    console.log('🏛️ Channels store initialized for user:', userId.value)
  }

  const loadChannels = () => {
    try {
      const storedChannels = localStorage.getItem('allChannels')
      const storedUserChannels = localStorage.getItem('userChannels')

      if (storedChannels) {
        allChannels.value = JSON.parse(storedChannels)
      }

      if (storedUserChannels) {
        const channelIds = JSON.parse(storedUserChannels)
        userChannels.value = allChannels.value.filter(c => channelIds.includes(c.id))
      }

      console.log(`📊 Loaded ${allChannels.value.length} channels, user is in ${userChannels.value.length}`)
    } catch (err) {
      console.error('Failed to load channels:', err)
    }
  }

  const loadDemoChannels = () => {
    const demoChannels: Channel[] = [
      {
        id: 'ch-tech-berlin',
        name: 'Tech Berlin',
        description: 'Berlin Tech Community - Meetups, Hackathons, Networking',
        interests: ['tech', 'ai', 'startup', 'development'],
        location: {
          lat: 52.5200,
          lng: 13.4050,
          name: 'Berlin Mitte'
        },
        radius: 10,
        memberCount: 248,
        members: [{
          userId: userId.value,
          username: 'You',
          joinedAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
          role: 'member',
          contribution: 12.50
        }],
        events: [
          {
            id: 'ev-1',
            channelId: 'ch-tech-berlin',
            title: 'AI & Machine Learning Meetup',
            description: 'Monthly AI meetup with talks and networking',
            startTime: Date.now() + 3 * 24 * 60 * 60 * 1000,  // In 3 days
            endTime: Date.now() + 3 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000,
            location: {
              lat: 52.5200,
              lng: 13.4050,
              name: 'c-base, Berlin'
            },
            attendees: [],
            maxAttendees: 50,
            cost: 5.0,
            createdBy: 'user-123',
            createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000
          }
        ],
        createdAt: Date.now() - 90 * 24 * 60 * 60 * 1000,
        createdBy: 'user-123',
        imageUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=400&h=200&fit=crop',
        isPublic: true,
        revenuePool: 245.50
      },
      {
        id: 'ch-startup-kreuzberg',
        name: 'Startup Kreuzberg',
        description: 'Founders, Investors & Builders in Kreuzberg',
        interests: ['startup', 'business', 'networking', 'investment'],
        location: {
          lat: 52.4987,
          lng: 13.4246,
          name: 'Berlin Kreuzberg'
        },
        radius: 5,
        memberCount: 89,
        members: [],
        events: [],
        createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
        createdBy: 'user-456',
        imageUrl: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400&h=200&fit=crop',
        isPublic: true,
        revenuePool: 78.20
      },
      {
        id: 'ch-urban-gardening',
        name: 'Urban Gardening Berlin',
        description: 'Community gardens, sustainability, local food',
        interests: ['urban', 'sustainability', 'community', 'gardening'],
        location: {
          lat: 52.5200,
          lng: 13.4050,
          name: 'Berlin Mitte'
        },
        radius: 15,
        memberCount: 135,
        members: [{
          userId: userId.value,
          username: 'You',
          joinedAt: Date.now() - 60 * 24 * 60 * 60 * 1000,
          role: 'member',
          contribution: 8.30
        }],
        events: [
          {
            id: 'ev-2',
            channelId: 'ch-urban-gardening',
            title: 'Spring Planting Workshop',
            description: 'Learn urban gardening basics and plant seeds together',
            startTime: Date.now() + 7 * 24 * 60 * 60 * 1000,  // In 7 days
            endTime: Date.now() + 7 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000,
            location: {
              lat: 52.5400,
              lng: 13.4200,
              name: 'Prinzessinnengarten, Berlin'
            },
            attendees: [],
            maxAttendees: 30,
            createdBy: 'user-789',
            createdAt: Date.now() - 14 * 24 * 60 * 60 * 1000
          }
        ],
        createdAt: Date.now() - 180 * 24 * 60 * 60 * 1000,
        createdBy: 'user-789',
        imageUrl: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400&h=200&fit=crop',
        isPublic: true,
        revenuePool: 156.80
      }
    ]

    allChannels.value = demoChannels

    // Auto-join user to 2 demo channels for better UX
    userChannels.value = [
      demoChannels.find(c => c.id === 'ch-tech-berlin')!,
      demoChannels.find(c => c.id === 'ch-urban-gardening')!
    ]

    saveChannels()
    console.log('✅ Demo channels loaded, user auto-joined to 2 channels')
  }

  const saveChannels = () => {
    try {
      localStorage.setItem('allChannels', JSON.stringify(allChannels.value))
      localStorage.setItem('userChannels', JSON.stringify(userChannels.value.map(c => c.id)))
    } catch (err) {
      console.error('Failed to save channels:', err)
    }
  }

  const createChannel = (channel: Omit<Channel, 'id' | 'memberCount' | 'members' | 'events' | 'createdAt' | 'createdBy' | 'revenuePool'>) => {
    const newChannel: Channel = {
      ...channel,
      id: 'ch-' + Date.now(),
      memberCount: 1,
      members: [{
        userId: userId.value,
        username: 'You',
        joinedAt: Date.now(),
        role: 'admin',
        contribution: 0
      }],
      events: [],
      createdAt: Date.now(),
      createdBy: userId.value,
      revenuePool: 0
    }

    allChannels.value.push(newChannel)
    userChannels.value.push(newChannel)
    saveChannels()

    console.log('✅ Channel created:', newChannel.name)
    return newChannel
  }

  const joinChannel = (channelId: string) => {
    const channel = allChannels.value.find(c => c.id === channelId)
    if (!channel) {
      console.error('Channel not found:', channelId)
      return false
    }

    // Check if already joined
    if (userChannels.value.find(c => c.id === channelId)) {
      console.log('Already a member of this channel')
      return false
    }

    // Add user to channel
    channel.memberCount++
    channel.members.push({
      userId: userId.value,
      username: 'You',
      joinedAt: Date.now(),
      role: 'member',
      contribution: 0
    })

    userChannels.value.push(channel)
    saveChannels()

    console.log('✅ Joined channel:', channel.name)
    return true
  }

  const leaveChannel = (channelId: string) => {
    const channel = allChannels.value.find(c => c.id === channelId)
    if (!channel) return false

    // Remove user from channel
    channel.memberCount = Math.max(0, channel.memberCount - 1)
    channel.members = channel.members.filter(m => m.userId !== userId.value)

    userChannels.value = userChannels.value.filter(c => c.id !== channelId)
    saveChannels()

    console.log('👋 Left channel:', channel.name)
    return true
  }

  const createEvent = (channelId: string, event: Omit<ChannelEvent, 'id' | 'channelId' | 'attendees' | 'createdBy' | 'createdAt'>) => {
    const channel = allChannels.value.find(c => c.id === channelId)
    if (!channel) {
      console.error('Channel not found:', channelId)
      return null
    }

    const newEvent: ChannelEvent = {
      ...event,
      id: 'ev-' + Date.now(),
      channelId,
      attendees: [userId.value],  // Creator is first attendee
      createdBy: userId.value,
      createdAt: Date.now()
    }

    channel.events.push(newEvent)
    saveChannels()

    console.log('📅 Event created:', newEvent.title)
    return newEvent
  }

  const joinEvent = (eventId: string) => {
    for (const channel of allChannels.value) {
      const event = channel.events.find(e => e.id === eventId)
      if (event) {
        if (!event.attendees.includes(userId.value)) {
          event.attendees.push(userId.value)
          saveChannels()
          console.log('✅ Joined event:', event.title)
          return true
        }
      }
    }
    return false
  }

  const addRevenueToChannel = (channelId: string, amount: number) => {
    const channel = allChannels.value.find(c => c.id === channelId)
    if (channel) {
      channel.revenuePool += amount

      // Update user's contribution
      const member = channel.members.find(m => m.userId === userId.value)
      if (member) {
        member.contribution += amount
      }

      saveChannels()
    }
  }

  // Auto-initialize
  initialize()

  return {
    // State
    userId,
    userChannels,
    allChannels,
    isInitialized,

    // Computed
    myChannels,
    suggestedChannels,
    totalMembers,
    totalEvents,
    upcomingEvents,

    // Actions
    initialize,
    createChannel,
    joinChannel,
    leaveChannel,
    createEvent,
    joinEvent,
    addRevenueToChannel
  }
})
