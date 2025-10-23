<template>
  <div class="live-pulse-feed">
    <!-- Header with Live Indicator -->
    <div class="pulse-header">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="live-dot" :class="{ 'animate-pulse': pulse.isRealTimeEnabled }"></div>
          <h2 class="text-lg font-bold text-white">Live Pulse</h2>
        </div>
        <div class="radius-selector">
          <button
            v-for="r in [200, 500, 1000]"
            :key="r"
            @click="pulse.setRadius(r)"
            :class="{ active: pulse.radius === r }"
            class="radius-btn"
          >
            {{ r }}m
          </button>
        </div>
      </div>

      <!-- Active Stats -->
      <div class="active-stats">
        <div class="stat">
          <span class="stat-value">{{ pulse.activeCount.neighbors }}</span>
          <span class="stat-label">online</span>
        </div>
        <div class="stat">
          <span class="stat-value">{{ pulse.activeCount.posts }}</span>
          <span class="stat-label">posts</span>
        </div>
        <div class="stat">
          <span class="stat-value">{{ pulse.activeCount.events }}</span>
          <span class="stat-label">live</span>
        </div>
      </div>
    </div>

    <!-- Breaking News Section -->
    <div v-if="pulse.breakingNews.length > 0" class="breaking-section">
      <h3 class="section-title">⚡ BREAKING</h3>
      <div
        v-for="post in pulse.breakingNews"
        :key="post.id"
        class="breaking-card"
        @click="$emit('open-post', post)"
      >
        <img v-if="post.imageUrl" :src="post.imageUrl" class="breaking-image" loading="lazy" decoding="async" />
        <div class="breaking-content">
          <p class="breaking-text">{{ post.content }}</p>
          <div class="breaking-meta">
            <span class="meta-distance">{{ pulse.formatDistance(post.distance) }}</span>
            <span class="meta-time">{{ pulse.formatTimeAgo(post.timestamp) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Now Section -->
    <div class="right-now-section">
      <h3 class="section-title">🔥 RIGHT NOW</h3>
      <div class="right-now-list">
        <template v-if="pulse.rightNowHappening.length === 0">
          <div class="empty-state">
            <p>Nichts los in deiner Nähe...</p>
            <p class="text-sm text-slate-400">Poste etwas oder erweitere deinen Radius!</p>
          </div>
        </template>

        <template v-for="item in pulse.rightNowHappening" :key="item.id">
          <!-- Live Event Card -->
          <div
            v-if="'isLive' in item && item.isLive"
            class="event-card live"
            @click="$emit('open-event', item)"
          >
            <div class="event-header">
              <span class="live-badge">🔴 LIVE</span>
              <span class="event-distance">{{ pulse.formatDistance(item.distance) }}</span>
            </div>
            <h4 class="event-title">{{ item.title }}</h4>
            <div class="event-meta">
              <span>📍 {{ item.location.name }}</span>
              <span>👥 {{ item.attendees }} dabei</span>
            </div>
          </div>

          <!-- Post Card -->
          <div
            v-else
            class="post-card"
            @click="$emit('open-post', item)"
          >
            <div class="post-header">
              <div class="flex items-center gap-2">
                <div class="user-avatar">{{ item.avatar || item.username[0] }}</div>
                <div>
                  <div class="user-name">{{ item.username }}</div>
                  <div class="post-meta">
                    {{ pulse.formatDistance(item.distance) }} · {{ pulse.formatTimeAgo(item.timestamp) }}
                  </div>
                </div>
              </div>
              <div v-if="item.channelName" class="channel-badge">
                {{ item.channelName }}
              </div>
            </div>

            <div class="post-content">
              <p>{{ item.content }}</p>
              <img v-if="item.imageUrl" :src="item.imageUrl" class="post-image" loading="lazy" decoding="async" />
            </div>

            <div v-if="item.reactions || item.comments" class="post-actions">
              <span v-if="item.reactions">❤️ {{ item.reactions }}</span>
              <span v-if="item.comments">💬 {{ item.comments }}</span>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- Active Neighbors Section -->
    <div v-if="pulse.neighborsNearby.length > 0" class="neighbors-section">
      <h3 class="section-title">👋 AKTIVE NACHBARN</h3>
      <div class="neighbors-list">
        <div
          v-for="neighbor in pulse.neighborsNearby.slice(0, 5)"
          :key="neighbor.id"
          class="neighbor-card"
          @click="$emit('open-profile', neighbor)"
        >
          <div class="neighbor-avatar">{{ neighbor.avatar || neighbor.username[0] }}</div>
          <div class="neighbor-info">
            <div class="neighbor-name">{{ neighbor.username }}</div>
            <div class="neighbor-meta">
              <span>{{ pulse.formatDistance(neighbor.distance) }}</span>
              <span v-if="neighbor.currentActivity" class="activity-status">
                {{ activityLabel(neighbor.currentActivity) }}
              </span>
            </div>
          </div>
          <div class="neighbor-status" :class="neighbor.currentActivity"></div>
        </div>
      </div>
    </div>

    <!-- All Posts Feed -->
    <div class="all-posts-section">
      <h3 class="section-title">📰 IN DEINER NÄHE</h3>
      <div class="posts-list">
        <div
          v-for="post in pulse.postsNearby.slice(0, 10)"
          :key="post.id"
          class="feed-post"
          @click="$emit('open-post', post)"
        >
          <div class="post-header">
            <div class="flex items-center gap-2">
              <div class="user-avatar">{{ post.username[0] }}</div>
              <div>
                <div class="user-name">{{ post.username }}</div>
                <div class="post-meta">
                  {{ pulse.formatDistance(post.distance) }} · {{ pulse.formatTimeAgo(post.timestamp) }}
                </div>
              </div>
            </div>
          </div>

          <div class="post-content">
            <p>{{ post.content }}</p>
            <img v-if="post.imageUrl" :src="post.imageUrl" class="post-image" loading="lazy" decoding="async" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useLivePulse } from '../stores/useLivePulse'
import type { LivePost, ActiveNeighbor, LiveEvent } from '../stores/useLivePulse'

// Emits
defineEmits<{
  'open-post': [post: LivePost]
  'open-event': [event: LiveEvent]
  'open-profile': [neighbor: ActiveNeighbor]
}>()

// Store
const pulse = useLivePulse()

// Helpers
const activityLabel = (activity: string) => {
  const labels: Record<string, string> = {
    posting: '📝 postet',
    at_event: '🎉 bei Event',
    online: '🟢 online'
  }
  return labels[activity] || activity
}

// Lifecycle
onMounted(() => {
  // Request user location
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        pulse.setUserLocation(position.coords.latitude, position.coords.longitude)
        pulse.loadDemoData()
        pulse.startRealTime()
      },
      (error) => {
        console.warn('Location access denied, using default location')
        pulse.setUserLocation(52.4987, 13.4246)  // Berlin Kreuzberg
        pulse.loadDemoData()
        pulse.startRealTime()
      }
    )
  } else {
    pulse.setUserLocation(52.4987, 13.4246)
    pulse.loadDemoData()
    pulse.startRealTime()
  }
})

onUnmounted(() => {
  pulse.stopRealTime()
})
</script>

<style scoped>
.live-pulse-feed {
  @apply h-full overflow-y-auto pb-20;
}

/* Header */
.pulse-header {
  @apply sticky top-0 z-10 bg-gradient-to-r from-indigo-600 to-violet-600 p-4 rounded-b-xl;
}

.live-dot {
  @apply w-3 h-3 rounded-full bg-red-500;
}

.radius-selector {
  @apply flex gap-1 bg-black/20 rounded-lg p-1;
}

.radius-btn {
  @apply px-3 py-1 text-sm text-white/70 rounded-md transition-all;
}

.radius-btn.active {
  @apply bg-white/20 text-white font-semibold;
}

.active-stats {
  @apply flex gap-6 mt-3 pt-3 border-t border-white/20;
}

.stat {
  @apply flex items-baseline gap-1;
}

.stat-value {
  @apply text-2xl font-bold text-white;
}

.stat-label {
  @apply text-xs text-white/70;
}

/* Sections */
.section-title {
  @apply text-sm font-bold text-slate-400 px-4 py-2 uppercase tracking-wide;
}

/* Breaking News */
.breaking-section {
  @apply mt-4;
}

.breaking-card {
  @apply flex gap-3 bg-red-500/10 border border-red-500/30 rounded-lg p-3 mx-4 mb-2 cursor-pointer
         hover:bg-red-500/20 transition-colors;
}

.breaking-image {
  @apply w-20 h-20 rounded-lg object-cover flex-shrink-0;
}

.breaking-content {
  @apply flex-1;
}

.breaking-text {
  @apply text-white font-medium mb-1;
}

.breaking-meta {
  @apply flex gap-2 text-xs text-slate-400;
}

.meta-distance,
.meta-time {
  @apply bg-black/20 px-2 py-0.5 rounded;
}

/* Right Now Section */
.right-now-section {
  @apply mt-4;
}

.right-now-list {
  @apply space-y-2 px-4;
}

.empty-state {
  @apply text-center py-8 text-slate-400;
}

/* Event Card */
.event-card {
  @apply bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30
         rounded-lg p-4 cursor-pointer hover:from-purple-500/30 hover:to-pink-500/30 transition-all;
}

.event-card.live {
  @apply border-red-500/50;
}

.event-header {
  @apply flex items-center justify-between mb-2;
}

.live-badge {
  @apply bg-red-500 text-white text-xs font-bold px-2 py-1 rounded;
}

.event-distance {
  @apply text-sm text-slate-400;
}

.event-title {
  @apply text-lg font-bold text-white mb-2;
}

.event-meta {
  @apply flex gap-4 text-sm text-slate-400;
}

/* Post Card */
.post-card,
.feed-post {
  @apply bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 cursor-pointer
         hover:bg-slate-800/70 transition-colors;
}

.post-header {
  @apply flex items-start justify-between mb-3;
}

.user-avatar {
  @apply w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500
         flex items-center justify-center text-white font-bold;
}

.user-name {
  @apply text-sm font-semibold text-white;
}

.post-meta {
  @apply text-xs text-slate-400;
}

.channel-badge {
  @apply text-xs bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded;
}

.post-content p {
  @apply text-white mb-2;
}

.post-image {
  @apply w-full h-48 rounded-lg object-cover mt-2;
}

.post-actions {
  @apply flex gap-4 mt-3 pt-3 border-t border-slate-700/50 text-sm text-slate-400;
}

/* Neighbors */
.neighbors-section {
  @apply mt-6;
}

.neighbors-list {
  @apply space-y-2 px-4;
}

.neighbor-card {
  @apply flex items-center gap-3 bg-slate-800/30 rounded-lg p-3 cursor-pointer
         hover:bg-slate-800/50 transition-colors;
}

.neighbor-avatar {
  @apply w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-500
         flex items-center justify-center text-2xl;
}

.neighbor-info {
  @apply flex-1;
}

.neighbor-name {
  @apply text-sm font-semibold text-white;
}

.neighbor-meta {
  @apply flex gap-2 text-xs text-slate-400;
}

.activity-status {
  @apply bg-black/30 px-2 py-0.5 rounded;
}

.neighbor-status {
  @apply w-3 h-3 rounded-full;
}

.neighbor-status.posting {
  @apply bg-blue-500 animate-pulse;
}

.neighbor-status.at_event {
  @apply bg-purple-500 animate-pulse;
}

.neighbor-status.online {
  @apply bg-green-500;
}

/* All Posts */
.all-posts-section {
  @apply mt-6 mb-4;
}

.posts-list {
  @apply space-y-2 px-4;
}
</style>
