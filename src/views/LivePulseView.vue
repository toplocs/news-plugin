<template>
  <div class="live-pulse-view">
    <!-- Live Pulse Feed -->
    <LivePulseFeed
      @open-post="openPost"
      @open-event="openEvent"
      @open-profile="openProfile"
    />

    <!-- Post Detail Modal -->
    <Teleport to="body">
      <div
        v-if="selectedPost"
        class="modal-overlay"
        @click.self="selectedPost = null"
      >
        <div class="modal-content">
          <button class="modal-close" @click="selectedPost = null">×</button>

          <div class="post-detail">
            <!-- Header -->
            <div class="detail-header">
              <div class="flex items-center gap-3">
                <div class="user-avatar-large">{{ selectedPost.username[0] }}</div>
                <div>
                  <div class="user-name-large">{{ selectedPost.username }}</div>
                  <div class="post-meta-large">
                    {{ pulse.formatDistance(selectedPost.distance) }} entfernt ·
                    {{ pulse.formatTimeAgo(selectedPost.timestamp) }}
                  </div>
                </div>
              </div>
              <div v-if="selectedPost.type === 'breaking'" class="breaking-badge">
                ⚡ BREAKING
              </div>
            </div>

            <!-- Content -->
            <div class="detail-content">
              <p class="text-lg text-white">{{ selectedPost.content }}</p>
              <img v-if="selectedPost.imageUrl" :src="selectedPost.imageUrl" class="detail-image" />
            </div>

            <!-- Location -->
            <div class="detail-location">
              📍 {{ selectedPost.location.name || 'Unbekannter Ort' }}
            </div>

            <!-- Channel Info -->
            <div v-if="selectedPost.channelName" class="detail-channel">
              <span class="channel-label">Gepostet in</span>
              <span class="channel-name">{{ selectedPost.channelName }}</span>
              <button class="channel-join-btn">Beitreten</button>
            </div>

            <!-- Actions -->
            <div class="detail-actions">
              <button class="action-btn primary">
                💬 Antworten
              </button>
              <button class="action-btn">
                🚀 Teilen
              </button>
              <button class="action-btn">
                📍 Route anzeigen
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Event Detail Modal -->
    <Teleport to="body">
      <div
        v-if="selectedEvent"
        class="modal-overlay"
        @click.self="selectedEvent = null"
      >
        <div class="modal-content">
          <button class="modal-close" @click="selectedEvent = null">×</button>

          <div class="event-detail">
            <!-- Live Badge -->
            <div v-if="selectedEvent.isLive" class="live-event-badge">
              🔴 LIVE JETZT
            </div>

            <!-- Title -->
            <h2 class="event-title-large">{{ selectedEvent.title }}</h2>

            <!-- Description -->
            <p v-if="selectedEvent.description" class="event-description">
              {{ selectedEvent.description }}
            </p>

            <!-- Info Grid -->
            <div class="event-info-grid">
              <div class="info-item">
                <div class="info-label">📍 Ort</div>
                <div class="info-value">{{ selectedEvent.location.name }}</div>
                <div class="info-sub">{{ pulse.formatDistance(selectedEvent.distance) }} entfernt</div>
              </div>

              <div class="info-item">
                <div class="info-label">⏰ Zeit</div>
                <div class="info-value">
                  {{ formatEventTime(selectedEvent.startTime) }}
                </div>
                <div class="info-sub">
                  {{ formatEventDuration(selectedEvent.startTime, selectedEvent.endTime) }}
                </div>
              </div>

              <div class="info-item">
                <div class="info-label">👥 Teilnehmer</div>
                <div class="info-value">{{ selectedEvent.attendees }}</div>
                <div class="info-sub">bereits angemeldet</div>
              </div>
            </div>

            <!-- Actions -->
            <div class="event-actions">
              <button class="action-btn primary large">
                <span v-if="selectedEvent.isLive">🏃 Jetzt hingehen</span>
                <span v-else>✅ Zusagen</span>
              </button>
              <button class="action-btn large">
                📍 Route anzeigen
              </button>
            </div>

            <!-- Channel -->
            <div v-if="selectedEvent.channelId" class="event-channel">
              <p class="text-sm text-slate-400">Event organisiert von Channel-Community</p>
              <button class="channel-view-btn">Channel ansehen →</button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Profile Modal -->
    <Teleport to="body">
      <div
        v-if="selectedProfile"
        class="modal-overlay"
        @click.self="selectedProfile = null"
      >
        <div class="modal-content">
          <button class="modal-close" @click="selectedProfile = null">×</button>

          <div class="profile-detail">
            <!-- Avatar -->
            <div class="profile-avatar-large">{{ selectedProfile.avatar || selectedProfile.username[0] }}</div>

            <!-- Name -->
            <h2 class="profile-name">{{ selectedProfile.username }}</h2>

            <!-- Distance -->
            <div class="profile-distance">
              📍 {{ pulse.formatDistance(selectedProfile.distance) }} entfernt
            </div>

            <!-- Activity -->
            <div v-if="selectedProfile.currentActivity" class="profile-activity">
              <div class="activity-indicator" :class="selectedProfile.currentActivity"></div>
              <span>{{ activityLabel(selectedProfile.currentActivity) }}</span>
            </div>

            <!-- Interests -->
            <div v-if="selectedProfile.interests" class="profile-interests">
              <div class="interests-label">Interessen</div>
              <div class="interests-list">
                <span
                  v-for="interest in selectedProfile.interests"
                  :key="interest"
                  class="interest-tag"
                >
                  {{ interest }}
                </span>
              </div>
            </div>

            <!-- Actions -->
            <div class="profile-actions">
              <button class="action-btn primary large">
                💬 Nachricht senden
              </button>
              <button class="action-btn large">
                👋 Treffen vorschlagen
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import LivePulseFeed from '../components/LivePulseFeed.vue'
import { useLivePulse } from '../stores/useLivePulse'
import type { LivePost, ActiveNeighbor, LiveEvent } from '../stores/useLivePulse'

// Store
const pulse = useLivePulse()

// State
const selectedPost = ref<LivePost | null>(null)
const selectedEvent = ref<LiveEvent | null>(null)
const selectedProfile = ref<ActiveNeighbor | null>(null)

// Handlers
const openPost = (post: LivePost) => {
  selectedPost.value = post
}

const openEvent = (event: LiveEvent) => {
  selectedEvent.value = event
}

const openProfile = (neighbor: ActiveNeighbor) => {
  selectedProfile.value = neighbor
}

// Helpers
const activityLabel = (activity: string) => {
  const labels: Record<string, string> = {
    posting: 'Postet gerade',
    at_event: 'Bei einem Event',
    online: 'Online'
  }
  return labels[activity] || activity
}

const formatEventTime = (timestamp: number) => {
  const date = new Date(timestamp)
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()

  if (isToday) {
    return date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
  }
  return date.toLocaleDateString('de-DE', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatEventDuration = (start: number, end: number) => {
  const duration = Math.floor((end - start) / 60000) // minutes
  if (duration < 60) return `${duration} Min`
  const hours = Math.floor(duration / 60)
  const mins = duration % 60
  return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`
}
</script>

<style scoped>
.live-pulse-view {
  @apply h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900;
}

/* Modal Overlay */
.modal-overlay {
  @apply fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4;
}

.modal-content {
  @apply relative bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto;
}

.modal-close {
  @apply absolute top-4 right-4 w-10 h-10 rounded-full bg-slate-700 hover:bg-slate-600
         text-white text-2xl flex items-center justify-center transition-colors z-10;
}

/* Post Detail */
.post-detail {
  @apply p-6 space-y-6;
}

.detail-header {
  @apply flex items-start justify-between;
}

.user-avatar-large {
  @apply w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500
         flex items-center justify-center text-white text-2xl font-bold;
}

.user-name-large {
  @apply text-xl font-bold text-white;
}

.post-meta-large {
  @apply text-sm text-slate-400 mt-1;
}

.breaking-badge {
  @apply bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full;
}

.detail-content {
  @apply space-y-4;
}

.detail-image {
  @apply w-full rounded-xl;
}

.detail-location {
  @apply text-sm text-slate-400 bg-slate-700/50 rounded-lg px-4 py-2;
}

.detail-channel {
  @apply flex items-center justify-between bg-indigo-500/10 border border-indigo-500/30 rounded-lg p-3;
}

.channel-label {
  @apply text-sm text-slate-400;
}

.channel-name {
  @apply text-sm font-semibold text-indigo-300 flex-1 mx-3;
}

.channel-join-btn {
  @apply bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold px-4 py-1 rounded-lg transition-colors;
}

.detail-actions {
  @apply flex gap-3;
}

/* Event Detail */
.event-detail {
  @apply p-6 space-y-6;
}

.live-event-badge {
  @apply inline-block bg-red-500 text-white text-sm font-bold px-4 py-2 rounded-full mb-4 animate-pulse;
}

.event-title-large {
  @apply text-3xl font-bold text-white;
}

.event-description {
  @apply text-slate-300 text-lg;
}

.event-info-grid {
  @apply grid grid-cols-3 gap-4;
}

.info-item {
  @apply bg-slate-700/30 rounded-lg p-4 text-center;
}

.info-label {
  @apply text-xs text-slate-400 mb-1;
}

.info-value {
  @apply text-lg font-bold text-white;
}

.info-sub {
  @apply text-xs text-slate-400 mt-1;
}

.event-actions {
  @apply flex gap-3;
}

.event-channel {
  @apply bg-slate-700/30 rounded-lg p-4 text-center;
}

.channel-view-btn {
  @apply text-indigo-400 hover:text-indigo-300 font-semibold mt-2 transition-colors;
}

/* Profile Detail */
.profile-detail {
  @apply p-6 space-y-6 text-center;
}

.profile-avatar-large {
  @apply w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-green-500 to-emerald-500
         flex items-center justify-center text-4xl;
}

.profile-name {
  @apply text-2xl font-bold text-white;
}

.profile-distance {
  @apply text-slate-400;
}

.profile-activity {
  @apply flex items-center justify-center gap-2 text-slate-300;
}

.activity-indicator {
  @apply w-3 h-3 rounded-full;
}

.activity-indicator.posting {
  @apply bg-blue-500 animate-pulse;
}

.activity-indicator.at_event {
  @apply bg-purple-500 animate-pulse;
}

.activity-indicator.online {
  @apply bg-green-500;
}

.profile-interests {
  @apply bg-slate-700/30 rounded-lg p-4;
}

.interests-label {
  @apply text-sm text-slate-400 mb-3;
}

.interests-list {
  @apply flex flex-wrap gap-2 justify-center;
}

.interest-tag {
  @apply bg-indigo-500/20 text-indigo-300 text-sm px-3 py-1 rounded-full;
}

.profile-actions {
  @apply flex gap-3;
}

/* Shared Action Buttons */
.action-btn {
  @apply flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold px-4 py-3 rounded-lg transition-colors;
}

.action-btn.primary {
  @apply bg-indigo-500 hover:bg-indigo-600;
}

.action-btn.large {
  @apply py-4 text-lg;
}
</style>
