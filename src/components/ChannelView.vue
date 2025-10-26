<template>
  <div class="channel-view">
    <h3 class="panel-title">
      <span class="icon">🏛️</span>
      <span>Meine Channels</span>
    </h3>
    <p class="panel-description">Communities basierend auf Interessen + Ort</p>

    <!-- Stats Overview -->
    <div class="stats-overview">
      <div class="stat-item">
        <div class="stat-value">{{ channels.myChannels.length }}</div>
        <div class="stat-label">Channels</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">{{ channels.totalMembers }}</div>
        <div class="stat-label">Mitglieder</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">{{ channels.totalEvents }}</div>
        <div class="stat-label">Events</div>
      </div>
    </div>

    <!-- Upcoming Events -->
    <div v-if="channels.upcomingEvents.length > 0" class="upcoming-events">
      <h4 class="section-title">📅 Anstehende Events</h4>
      <div class="events-list">
        <div v-for="event in channels.upcomingEvents.slice(0, 3)" :key="event.id" class="event-card-enhanced">
          <!-- Event Header -->
          <div class="event-header">
            <div class="event-title">{{ event.title }}</div>
            <div class="event-channel">{{ event.channel.name }}</div>
          </div>

          <!-- Countdown Timer -->
          <div class="event-countdown">
            <span class="countdown-icon">⏰</span>
            <span class="countdown-text">{{ formatCountdown(event.startTime) }}</span>
          </div>

          <!-- Event Location -->
          <div class="event-location">
            <span class="location-icon">📍</span>
            <span class="location-text">{{ event.location.name }}</span>
          </div>

          <!-- Attendance Info -->
          <div class="event-attendance">
            <div class="attendance-avatars">
              <div
                v-for="(attendee, idx) in event.attendees.slice(0, 4)"
                :key="attendee"
                class="attendee-avatar"
                :style="{ zIndex: 4 - idx }"
              >
                {{ getAvatarInitial(attendee) }}
              </div>
              <div v-if="event.attendees.length > 4" class="attendee-more">
                +{{ event.attendees.length - 4 }}
              </div>
            </div>
            <div class="attendance-count">
              <span class="count-number">{{ event.attendees.length }}</span>
              <span v-if="event.maxAttendees" class="count-max">/ {{ event.maxAttendees }}</span>
              <span class="count-label">Teilnehmer</span>
            </div>
          </div>

          <!-- Quick-Meet Button -->
          <button
            @click="quickRSVP(event)"
            class="btn-quick-meet"
            :class="{ joined: isJoined(event) }"
          >
            <span class="btn-icon">{{ isJoined(event) ? '✅' : '🤝' }}</span>
            <span class="btn-text">{{ isJoined(event) ? 'Dabei!' : 'Quick-Meet' }}</span>
          </button>

          <!-- Event Cost (if any) -->
          <div v-if="event.cost && event.cost > 0" class="event-cost">
            💰 €{{ event.cost.toFixed(2) }} (aus Channel Pool)
          </div>
        </div>
      </div>
    </div>

    <!-- My Channels -->
    <div class="my-channels">
      <h4 class="section-title">Deine Channels</h4>

      <!-- Empty State -->
      <div v-if="channels.myChannels.length === 0" class="empty-state-small">
        <div class="empty-icon">🏛️</div>
        <p class="empty-text">Noch keine Channels</p>
        <p class="empty-hint">Trete einem Channel bei oder erstelle einen neuen</p>
      </div>

      <!-- Channel Cards -->
      <div v-else class="channels-grid">
        <div v-for="channel in channels.myChannels" :key="channel.id" class="channel-card" @click="selectChannel(channel)">
          <!-- Channel Image -->
          <div v-if="channel.imageUrl" class="channel-image">
            <img :src="channel.imageUrl" :alt="channel.name" />

            <!-- Distance Badge (overlay) -->
            <div v-if="getChannelDistance(channel)" class="distance-badge">
              📍 {{ formatDistance(getChannelDistance(channel)!) }}
            </div>

            <!-- Upcoming Events Badge (overlay) -->
            <div v-if="getUpcomingChannelEvents(channel).length > 0" class="events-badge">
              📅 {{ getUpcomingChannelEvents(channel).length }} Event{{ getUpcomingChannelEvents(channel).length !== 1 ? 's' : '' }}
            </div>
          </div>

          <!-- Channel Content -->
          <div class="channel-content">
            <div class="channel-name">{{ channel.name }}</div>

            <div class="channel-location-distance">
              <span class="channel-location">📍 {{ channel.location.name }}</span>
              <span v-if="getChannelDistance(channel)" class="channel-distance-inline">
                {{ formatDistance(getChannelDistance(channel)!) }}
              </span>
            </div>

            <!-- Channel Stats -->
            <div class="channel-stats">
              <span class="stat">👥 {{ channel.memberCount }}</span>
              <span class="stat">💰 €{{ channel.revenuePool.toFixed(2) }}</span>
              <span v-if="channel.events.length > 0" class="stat highlighted">📅 {{ channel.events.length }}</span>
            </div>

            <!-- Channel Interests -->
            <div class="channel-interests">
              <span v-for="interest in channel.interests.slice(0, 3)" :key="interest" class="interest-tag">
                {{ interest }}
              </span>
            </div>

            <!-- Next Event Info (if exists) -->
            <div v-if="getNextChannelEvent(channel)" class="next-event-info">
              <div class="next-event-header">
                <span class="next-event-icon">⚡</span>
                <span class="next-event-title">Nächstes Event</span>
              </div>
              <div class="next-event-details">
                <div class="next-event-name">{{ getNextChannelEvent(channel)!.title }}</div>
                <div class="next-event-time">{{ formatCountdown(getNextChannelEvent(channel)!.startTime) }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Suggested Channels -->
    <div v-if="channels.suggestedChannels.length > 0" class="suggested-channels">
      <h4 class="section-title">✨ Vorschläge</h4>
      <div class="channels-list">
        <div v-for="channel in channels.suggestedChannels.slice(0, 5)" :key="channel.id" class="channel-item-enhanced">
          <div class="channel-info">
            <div class="channel-name-small">{{ channel.name }}</div>

            <div class="channel-meta">
              <span class="meta-location">📍 {{ channel.location.name }}</span>
              <span v-if="getChannelDistance(channel)" class="meta-distance">
                {{ formatDistance(getChannelDistance(channel)!) }}
              </span>
            </div>

            <div class="channel-quick-stats">
              <span class="quick-stat">👥 {{ channel.memberCount }}</span>
              <span v-if="getUpcomingChannelEvents(channel).length > 0" class="quick-stat events">
                📅 {{ getUpcomingChannelEvents(channel).length }}
              </span>
              <span v-for="interest in channel.interests.slice(0, 2)" :key="interest" class="interest-mini">
                {{ interest }}
              </span>
            </div>
          </div>

          <button @click.stop="quickJoinChannel(channel)" class="btn-quick-join">
            <span class="btn-join-icon">⚡</span>
            <span class="btn-join-text">Beitreten</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Nearby Members -->
    <div v-if="nearbyMembers.length > 0" class="nearby-members">
      <h4 class="section-title">👥 Mitglieder in der Nähe</h4>
      <p class="section-description">Aus deinen Channels · Sortiert nach Entfernung</p>

      <div class="members-list">
        <div v-for="member in nearbyMembers" :key="member.userId" class="member-item">
          <!-- Member Avatar -->
          <div class="member-avatar">
            <span class="avatar-emoji">{{ member.avatar }}</span>
          </div>

          <!-- Member Info -->
          <div class="member-info">
            <div class="member-name">{{ member.username }}</div>

            <div class="member-meta">
              <span class="member-channel">🏛️ {{ member.channel }}</span>
              <span class="member-distance">📍 {{ formatDistance(member.distance) }}</span>
            </div>

            <div v-if="member.commonInterests > 0" class="member-interests">
              <span class="interests-label">{{ member.commonInterests }} gemeinsame Interessen</span>
            </div>
          </div>

          <!-- Chat Button -->
          <button @click="startChatWithMember(member)" class="btn-member-chat">
            <span class="chat-icon">💬</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Create Channel Button -->
    <button @click="showCreateModal = true" class="btn-create-channel">
      <span>+</span>
      <span>Neuen Channel erstellen</span>
    </button>

    <!-- Create Channel Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showCreateModal" class="modal-overlay" @click="showCreateModal = false">
          <div class="modal-content" @click.stop>
            <div class="modal-header">
              <h3>Neuen Channel erstellen</h3>
              <button @click="showCreateModal = false" class="modal-close">×</button>
            </div>

            <div class="modal-body">
              <div class="form-group">
                <label>Name</label>
                <input v-model="newChannel.name" type="text" placeholder="z.B. Tech Berlin" />
              </div>

              <div class="form-group">
                <label>Beschreibung</label>
                <textarea v-model="newChannel.description" placeholder="Was macht dieser Channel?" rows="3"></textarea>
              </div>

              <div class="form-group">
                <label>Interessen (kommagetrennt)</label>
                <input v-model="newChannel.interestsString" type="text" placeholder="tech, startup, ai" />
              </div>

              <div class="form-group">
                <label>Ort</label>
                <input v-model="newChannel.locationName" type="text" placeholder="Berlin Mitte" />
              </div>

              <div class="form-group">
                <label>Radius (km)</label>
                <input v-model.number="newChannel.radius" type="range" min="1" max="50" />
                <span class="value">{{ newChannel.radius }} km</span>
              </div>
            </div>

            <div class="modal-footer">
              <button @click="showCreateModal = false" class="btn-secondary">Abbrechen</button>
              <button @click="createChannel" class="btn-primary">Channel erstellen</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Chat Modal -->
    <ChatModal
      v-if="chatPartner"
      v-model="showChatModal"
      :partner="chatPartner"
      :current-user-id="channels.userId"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useChannels } from '../stores/useChannels'
import { useLocation } from '../composables/useLocation'
import ChatModal from './ChatModal.vue'
import type { Channel } from '../stores/useChannels'

const emit = defineEmits<{
  'select-channel': [channel: Channel]
}>()

const channels = useChannels()
const { currentLocation, calculateDistance } = useLocation()
const showCreateModal = ref(false)

const newChannel = ref({
  name: '',
  description: '',
  interestsString: '',
  locationName: '',
  radius: 10
})

const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp)
  const now = new Date()
  const diffDays = Math.floor((timestamp - now.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Heute'
  if (diffDays === 1) return 'Morgen'
  if (diffDays < 7) return `In ${diffDays} Tagen`

  return date.toLocaleDateString('de-DE', { day: 'numeric', month: 'short' })
}

// ⏰ Format countdown timer
const formatCountdown = (timestamp: number): string => {
  const now = Date.now()
  const diff = timestamp - now

  if (diff < 0) return 'Läuft gerade'

  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (minutes < 1) return 'Startet gleich'
  if (minutes < 60) return `Startet in ${minutes} Minuten`
  if (hours < 24) return `Startet in ${hours} Stunden`
  if (days < 7) return `Startet in ${days} Tagen`

  return formatDate(timestamp)
}

// 👤 Get avatar initial from user ID
const getAvatarInitial = (userId: string): string => {
  return userId.charAt(0).toUpperCase()
}

// ✅ Check if user has joined event
const isJoined = (event: any): boolean => {
  return event.attendees.includes(channels.userId)
}

// 🤝 Quick RSVP to event
const quickRSVP = (event: any) => {
  if (isJoined(event)) {
    // Already joined - could add "leave" functionality here
    console.log('Already joined this event')
    return
  }

  channels.joinEvent(event.id)
  console.log('✅ Quick-RSVP:', event.title)
}

const selectChannel = (channel: Channel) => {
  emit('select-channel', channel)
}

const joinChannel = (channel: Channel) => {
  channels.joinChannel(channel.id)
}

// ⚡ Quick join with animation/feedback
const quickJoinChannel = (channel: Channel) => {
  channels.joinChannel(channel.id)
  console.log('✅ Quick-Join:', channel.name)
}

// 📍 Get distance to channel in km
const getChannelDistance = (channel: Channel): number | null => {
  if (!currentLocation.value || !channel.location) return null

  return calculateDistance(
    currentLocation.value.lat,
    currentLocation.value.lng,
    channel.location.lat,
    channel.location.lng
  )
}

// 📏 Format distance nicely
const formatDistance = (km: number): string => {
  if (km < 1) {
    return `${Math.round(km * 1000)}m`
  }
  return `${km.toFixed(1)}km`
}

// 📅 Get upcoming events for a channel
const getUpcomingChannelEvents = (channel: Channel) => {
  if (!channel.events) return []

  const now = Date.now()
  return channel.events.filter(event => event.startTime > now)
}

// ⚡ Get next channel event
const getNextChannelEvent = (channel: Channel) => {
  const upcomingEvents = getUpcomingChannelEvents(channel)
  if (upcomingEvents.length === 0) return null

  // Sort by start time and return first
  return upcomingEvents.sort((a, b) => a.startTime - b.startTime)[0]
}

const createChannel = () => {
  if (!newChannel.value.name || !newChannel.value.interestsString) {
    alert('Bitte Name und mindestens ein Interesse angeben')
    return
  }

  const interests = newChannel.value.interestsString.split(',').map(i => i.trim()).filter(Boolean)

  channels.createChannel({
    name: newChannel.value.name,
    description: newChannel.value.description,
    interests,
    location: {
      lat: 52.5200,  // TODO: Use actual location
      lng: 13.4050,
      name: newChannel.value.locationName || 'Berlin'
    },
    radius: newChannel.value.radius,
    isPublic: true
  })

  showCreateModal.value = false
  newChannel.value = {
    name: '',
    description: '',
    interestsString: '',
    locationName: '',
    radius: 10
  }
}

// 👥 Member Proximity Features

interface MemberWithDistance {
  userId: string
  username: string
  avatar?: string
  distance: number
  channel: string
  commonInterests: number
  location: {
    lat: number
    lng: number
  }
}

// Generate mock location for a member (near their channel location)
const generateMemberLocation = (channelLocation: { lat: number, lng: number }) => {
  // Random offset within ~2km
  const latOffset = (Math.random() - 0.5) * 0.02
  const lngOffset = (Math.random() - 0.5) * 0.02

  return {
    lat: channelLocation.lat + latOffset,
    lng: channelLocation.lng + lngOffset
  }
}

// Get all members from all channels with their distances
const nearbyMembers = computed<MemberWithDistance[]>(() => {
  if (!currentLocation.value) return []

  const membersWithDistance: MemberWithDistance[] = []

  // Collect all members from all channels
  channels.myChannels.forEach(channel => {
    // Mock: generate 3-5 members per channel
    const memberCount = Math.floor(Math.random() * 3) + 3

    for (let i = 0; i < memberCount; i++) {
      const memberLocation = generateMemberLocation(channel.location)
      const distance = calculateDistance(
        currentLocation.value!.lat,
        currentLocation.value!.lng,
        memberLocation.lat,
        memberLocation.lng
      )

      // Mock member data
      membersWithDistance.push({
        userId: `member-${channel.id}-${i}`,
        username: `User${Math.floor(Math.random() * 1000)}`,
        avatar: ['👤', '👨', '👩', '🧑', '👨‍💼', '👩‍💼'][Math.floor(Math.random() * 6)],
        distance,
        channel: channel.name,
        commonInterests: Math.floor(Math.random() * 3) + 1,
        location: memberLocation
      })
    }
  })

  // Sort by distance and return top 8
  return membersWithDistance
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 8)
})

// Chat Modal State
const showChatModal = ref(false)
const chatPartner = ref<any>(null)

// Start chat with member
const startChatWithMember = (member: MemberWithDistance) => {
  console.log('💬 Starting chat with:', member.username)

  chatPartner.value = {
    id: member.userId,
    name: member.username,
    avatar: member.avatar,
    online: Math.random() > 0.3 // Mock online status
  }

  showChatModal.value = true
}
</script>

<style scoped>
.channel-view {
  padding: 0;
}

.panel-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.125rem;
  font-weight: 700;
  color: #f8fafc;
  margin: 0 0 0.5rem 0;
}

.icon {
  font-size: 1.25rem;
}

.panel-description {
  font-size: 0.875rem;
  color: #94a3b8;
  margin: 0 0 1.5rem 0;
}

/* Stats Overview */
.stats-overview {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.stat-item {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1));
  border: 1px solid rgba(99, 102, 241, 0.2);
  border-radius: 0.5rem;
  padding: 0.75rem;
  text-align: center;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #a5b4fc;
  line-height: 1;
}

.stat-label {
  font-size: 0.75rem;
  color: #94a3b8;
  margin-top: 0.25rem;
}

/* Section Title */
.section-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #cbd5e1;
  margin: 0 0 0.75rem 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Upcoming Events */
.upcoming-events {
  margin-bottom: 1.5rem;
}

.events-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.event-card {
  background: rgba(30, 41, 59, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 0.5rem;
  padding: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.event-card:hover {
  border-color: rgba(99, 102, 241, 0.3);
  transform: translateY(-1px);
}

.event-header {
  margin-bottom: 0.5rem;
}

.event-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #f8fafc;
  margin-bottom: 0.25rem;
}

.event-channel {
  font-size: 0.75rem;
  color: #94a3b8;
}

.event-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.75rem;
  color: #64748b;
}

/* Enhanced Event Cards */
.event-card-enhanced {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(139, 92, 246, 0.08));
  border: 1px solid rgba(99, 102, 241, 0.2);
  border-radius: 0.75rem;
  padding: 1rem;
  transition: all 0.2s ease;
}

.event-card-enhanced:hover {
  border-color: rgba(99, 102, 241, 0.4);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.15);
}

/* Event Countdown */
.event-countdown {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0.75rem 0;
  padding: 0.5rem;
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.2);
  border-radius: 0.5rem;
}

.countdown-icon {
  font-size: 1rem;
}

.countdown-text {
  font-size: 0.875rem;
  font-weight: 600;
  color: #fbbf24;
}

/* Event Location */
.event-location {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0.5rem 0;
  font-size: 0.8125rem;
  color: #94a3b8;
}

.location-icon {
  font-size: 0.875rem;
}

/* Event Attendance */
.event-attendance {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin: 0.75rem 0;
  padding: 0.75rem;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 0.5rem;
}

.attendance-avatars {
  display: flex;
  position: relative;
}

.attendee-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border: 2px solid rgba(15, 23, 42, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  color: white;
  margin-left: -8px;
}

.attendee-avatar:first-child {
  margin-left: 0;
}

.attendee-more {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(99, 102, 241, 0.3);
  border: 2px solid rgba(15, 23, 42, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.6875rem;
  font-weight: 700;
  color: #a5b4fc;
  margin-left: -8px;
}

.attendance-count {
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
  font-size: 0.8125rem;
}

.count-number {
  font-size: 1.125rem;
  font-weight: 700;
  color: #a5b4fc;
}

.count-max {
  color: #64748b;
}

.count-label {
  color: #94a3b8;
  margin-left: 0.25rem;
}

/* Quick-Meet Button */
.btn-quick-meet {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border: none;
  border-radius: 0.5rem;
  font-size: 0.9375rem;
  font-weight: 600;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 0.75rem;
}

.btn-quick-meet:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}

.btn-quick-meet.joined {
  background: linear-gradient(135deg, #10b981, #059669);
}

.btn-quick-meet.joined:hover {
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

.btn-icon {
  font-size: 1.125rem;
}

.btn-text {
  font-weight: 700;
}

/* Event Cost */
.event-cost {
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: 0.5rem;
  font-size: 0.8125rem;
  color: #10b981;
  text-align: center;
}

/* My Channels */
.my-channels {
  margin-bottom: 1.5rem;
}

.empty-state-small {
  text-align: center;
  padding: 2rem 1rem;
}

.empty-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.empty-text {
  font-size: 0.875rem;
  color: #cbd5e1;
  margin: 0 0 0.25rem 0;
}

.empty-hint {
  font-size: 0.75rem;
  color: #64748b;
  margin: 0;
}

.channels-grid {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.channel-card {
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.6), rgba(15, 23, 42, 0.6));
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.75rem;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
}

.channel-card:hover {
  border-color: rgba(99, 102, 241, 0.4);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  transform: translateY(-2px);
}

.channel-image {
  position: relative;
  width: 100%;
  height: 100px;
  overflow: hidden;
}

.channel-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Distance Badge (overlay on image) */
.distance-badge {
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
  background: rgba(99, 102, 241, 0.9);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 999px;
  padding: 0.25rem 0.625rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

/* Events Badge (overlay on image) */
.events-badge {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: rgba(245, 158, 11, 0.9);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 999px;
  padding: 0.25rem 0.625rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}

.channel-content {
  padding: 1rem;
}

.channel-name {
  font-size: 1rem;
  font-weight: 700;
  color: #f8fafc;
  margin-bottom: 0.25rem;
}

.channel-location-distance {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.channel-location {
  font-size: 0.75rem;
  color: #94a3b8;
}

.channel-distance-inline {
  font-size: 0.75rem;
  font-weight: 600;
  color: #6366f1;
  background: rgba(99, 102, 241, 0.1);
  border: 1px solid rgba(99, 102, 241, 0.2);
  border-radius: 999px;
  padding: 0.125rem 0.5rem;
}

.channel-stats {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.75rem;
  font-size: 0.75rem;
  color: #cbd5e1;
}

.stat {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.stat.highlighted {
  background: rgba(245, 158, 11, 0.15);
  border: 1px solid rgba(245, 158, 11, 0.3);
  border-radius: 999px;
  padding: 0.125rem 0.5rem;
  color: #fbbf24;
  font-weight: 600;
}

/* Next Event Info */
.next-event-info {
  margin-top: 0.75rem;
  padding: 0.75rem;
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(251, 191, 36, 0.05));
  border: 1px solid rgba(245, 158, 11, 0.2);
  border-radius: 0.5rem;
}

.next-event-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.next-event-icon {
  font-size: 0.875rem;
}

.next-event-title {
  font-size: 0.6875rem;
  font-weight: 600;
  color: #f59e0b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.next-event-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.next-event-name {
  font-size: 0.8125rem;
  font-weight: 600;
  color: #fbbf24;
}

.next-event-time {
  font-size: 0.75rem;
  color: #94a3b8;
}

.channel-interests {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
}

.interest-tag {
  background: rgba(99, 102, 241, 0.2);
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 0.25rem;
  padding: 0.25rem 0.5rem;
  font-size: 0.6875rem;
  color: #a5b4fc;
}

/* Suggested Channels */
.suggested-channels {
  margin-bottom: 1.5rem;
}

.channels-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.channel-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(30, 41, 59, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 0.5rem;
  padding: 0.75rem;
  transition: all 0.2s ease;
}

.channel-item:hover {
  border-color: rgba(99, 102, 241, 0.3);
}

/* Enhanced Channel Item (with quick-join) */
.channel-item-enhanced {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(139, 92, 246, 0.06));
  border: 1px solid rgba(99, 102, 241, 0.15);
  border-radius: 0.75rem;
  padding: 1rem;
  transition: all 0.3s ease;
}

.channel-item-enhanced:hover {
  border-color: rgba(99, 102, 241, 0.4);
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.15);
}

/* Channel Quick Stats */
.channel-quick-stats {
  display: flex;
  gap: 0.75rem;
  margin-top: 0.5rem;
  flex-wrap: wrap;
}

.quick-stat {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  background: rgba(100, 116, 139, 0.1);
  border: 1px solid rgba(100, 116, 139, 0.2);
  border-radius: 0.375rem;
  padding: 0.25rem 0.5rem;
  font-size: 0.6875rem;
  color: #94a3b8;
  transition: all 0.2s ease;
}

.quick-stat.events {
  background: rgba(245, 158, 11, 0.1);
  border-color: rgba(245, 158, 11, 0.3);
  color: #fbbf24;
}

.quick-stat:hover {
  border-color: rgba(99, 102, 241, 0.4);
  background: rgba(99, 102, 241, 0.1);
}

/* Distance Labels */
.meta-distance {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  background: rgba(99, 102, 241, 0.15);
  border: 1px solid rgba(99, 102, 241, 0.25);
  border-radius: 999px;
  padding: 0.125rem 0.5rem;
  font-size: 0.6875rem;
  font-weight: 600;
  color: #a5b4fc;
}

/* Mini Interest Tags */
.interest-mini {
  display: inline-block;
  background: rgba(168, 85, 247, 0.15);
  border: 1px solid rgba(168, 85, 247, 0.25);
  border-radius: 0.25rem;
  padding: 0.125rem 0.375rem;
  font-size: 0.625rem;
  color: #c084fc;
  font-weight: 500;
}

/* Quick Join Button */
.btn-quick-join {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border: none;
  border-radius: 0.5rem;
  padding: 0.5rem 0.875rem;
  font-size: 0.8125rem;
  font-weight: 600;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}

.btn-quick-join:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.5);
  background: linear-gradient(135deg, #7c3aed, #a855f7);
}

.btn-quick-join:active {
  transform: translateY(0) scale(1);
}

.btn-join-icon {
  font-size: 1rem;
  line-height: 1;
}

.btn-join-text {
  white-space: nowrap;
}

.channel-info {
  flex: 1;
  min-width: 0;
}

.channel-name-small {
  font-size: 0.875rem;
  font-weight: 600;
  color: #f8fafc;
  margin-bottom: 0.25rem;
}

.channel-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.6875rem;
  color: #64748b;
}

.btn-join {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border: none;
  border-radius: 0.375rem;
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.btn-join:hover {
  transform: scale(1.05);
}

/* Create Channel Button */
.btn-create-channel {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #10b981, #059669);
  border: none;
  border-radius: 0.5rem;
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-create-channel:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

/* Nearby Members */
.nearby-members {
  margin-bottom: 1.5rem;
}

.section-description {
  font-size: 0.75rem;
  color: #64748b;
  margin: -0.5rem 0 1rem 0;
}

.members-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.member-item {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.06), rgba(139, 92, 246, 0.04));
  border: 1px solid rgba(99, 102, 241, 0.12);
  border-radius: 0.75rem;
  padding: 0.875rem;
  transition: all 0.3s ease;
}

.member-item:hover {
  border-color: rgba(99, 102, 241, 0.35);
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.08));
  transform: translateX(3px);
  box-shadow: 0 3px 10px rgba(99, 102, 241, 0.12);
}

.member-avatar {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.15));
  border: 2px solid rgba(99, 102, 241, 0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.avatar-emoji {
  display: block;
}

.member-info {
  flex: 1;
  min-width: 0;
}

.member-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #f8fafc;
  margin-bottom: 0.25rem;
}

.member-meta {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  font-size: 0.6875rem;
  color: #64748b;
  margin-bottom: 0.25rem;
}

.member-channel {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.member-distance {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  color: #a5b4fc;
  font-weight: 600;
}

.member-interests {
  margin-top: 0.25rem;
}

.interests-label {
  font-size: 0.625rem;
  color: #c084fc;
  background: rgba(168, 85, 247, 0.12);
  border: 1px solid rgba(168, 85, 247, 0.2);
  border-radius: 0.25rem;
  padding: 0.125rem 0.375rem;
  display: inline-block;
}

.btn-member-chat {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 6px rgba(99, 102, 241, 0.3);
}

.btn-member-chat:hover {
  transform: scale(1.1) rotate(-5deg);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.5);
  background: linear-gradient(135deg, #7c3aed, #a855f7);
}

.btn-member-chat:active {
  transform: scale(0.95);
}

.chat-icon {
  font-size: 1.125rem;
  line-height: 1;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1rem;
}

.modal-content {
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.95));
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow: auto;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-header h3 {
  font-size: 1.125rem;
  font-weight: 700;
  color: #f8fafc;
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #94a3b8;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.375rem;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #f8fafc;
}

.modal-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #cbd5e1;
  margin-bottom: 0.5rem;
}

.form-group input[type="text"],
.form-group textarea {
  width: 100%;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  padding: 0.75rem;
  font-size: 0.875rem;
  color: #f8fafc;
  font-family: inherit;
}

.form-group input[type="text"]:focus,
.form-group textarea:focus {
  outline: none;
  border-color: rgba(99, 102, 241, 0.5);
}

.form-group input[type="range"] {
  width: 100%;
  margin-right: 0.5rem;
}

.form-group .value {
  font-size: 0.875rem;
  color: #a5b4fc;
  font-weight: 600;
}

.modal-footer {
  display: flex;
  gap: 0.75rem;
  padding: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.btn-secondary,
.btn-primary {
  flex: 1;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: #cbd5e1;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.15);
}

.btn-primary {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

/* Modal Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: scale(0.95);
}
</style>
