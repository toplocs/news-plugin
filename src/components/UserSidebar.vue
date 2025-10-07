<template>
  <div class="user-sidebar">
    <!-- Active Users -->
    <div class="section">
      <h3 class="section-title">
        <span class="icon">👥</span>
        <span>Community ({{  activeUsers.length }})</span>
      </h3>
      <div class="users-list">
        <div
          v-for="user in activeUsers"
          :key="user.id"
          class="user-item"
          @click="openUserProfile(user)"
        >
          <div class="user-avatar">
            <img v-if="user.avatar" :src="user.avatar" :alt="user.name" />
            <span v-else>{{ user.name[0] }}</span>
          </div>
          <div class="user-info">
            <div class="user-name">{{ user.name }}</div>
            <div class="user-status">{{ user.status }}</div>
          </div>
          <div v-if="user.unread > 0" class="unread-badge">{{ user.unread }}</div>
          <div v-else class="status-indicator" :class="user.online ? 'online' : 'offline'"></div>
        </div>
      </div>
    </div>

    <!-- Suggested Connections -->
    <div class="section">
      <h3 class="section-title">
        <span class="icon">✨</span>
        <span>Empfehlungen</span>
      </h3>
      <div class="suggestions-list">
        <div
          v-for="user in suggestedUsers"
          :key="user.id"
          class="suggestion-item"
        >
          <div class="user-avatar small">
            <img v-if="user.avatar" :src="user.avatar" :alt="user.name" />
            <span v-else>{{ user.name[0] }}</span>
          </div>
          <div class="suggestion-info">
            <div class="user-name">{{ user.name }}</div>
            <div class="match-reason">{{ user.matchReason }}</div>
          </div>
          <button @click="connect(user)" class="connect-btn">
            +
          </button>
        </div>
      </div>
    </div>

    <!-- Nearby Activity -->
    <div class="section">
      <h3 class="section-title">
        <span class="icon">📍</span>
        <span>In der Nähe</span>
      </h3>
      <div class="activity-list">
        <div
          v-for="activity in nearbyActivity"
          :key="activity.id"
          class="activity-item"
        >
          <div class="activity-icon">{{ activity.icon }}</div>
          <div class="activity-content">
            <div class="activity-title">{{ activity.title }}</div>
            <div class="activity-meta">
              <span>{{ activity.distance }}</span>
              <span>·</span>
              <span>{{ activity.time }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useToast } from '../composables/useToast'

interface User {
  id: string
  name: string
  avatar?: string
  status: string
  online: boolean
  unread: number
  matchReason?: string
}

interface Activity {
  id: string
  icon: string
  title: string
  distance: string
  time: string
}

const { success, info } = useToast()

// Mock data - In production, this would come from Gun.js
const activeUsers = ref<User[]>([
  {
    id: '1',
    name: 'Anna Schmidt',
    status: 'Teilt gerade einen Artikel',
    online: true,
    unread: 2
  },
  {
    id: '2',
    name: 'Max Müller',
    avatar: 'https://i.pravatar.cc/150?u=max',
    status: 'Online',
    online: true,
    unread: 0
  },
  {
    id: '3',
    name: 'Lisa Weber',
    status: 'Vor 5 Minuten aktiv',
    online: false,
    unread: 1
  },
  {
    id: '4',
    name: 'Tom Fischer',
    avatar: 'https://i.pravatar.cc/150?u=tom',
    status: 'Online',
    online: true,
    unread: 0
  }
])

const suggestedUsers = ref<User[]>([
  {
    id: '5',
    name: 'Sarah Klein',
    matchReason: 'Gleiche Interessen',
    online: true,
    unread: 0,
    status: ''
  },
  {
    id: '6',
    name: 'Paul Richter',
    avatar: 'https://i.pravatar.cc/150?u=paul',
    matchReason: 'In deiner Nähe',
    online: false,
    unread: 0,
    status: ''
  }
])

const nearbyActivity = ref<Activity[]>([
  {
    id: '1',
    icon: '🎉',
    title: 'Community Treffen in Mitte',
    distance: '1.2 km',
    time: 'in 2h'
  },
  {
    id: '2',
    icon: '📰',
    title: 'Breaking News: Neues Tech Event',
    distance: '0.8 km',
    time: 'vor 15m'
  },
  {
    id: '3',
    icon: '☕',
    title: 'Coffee & Code Meetup',
    distance: '2.5 km',
    time: 'morgen'
  }
])

const openUserProfile = (user: User) => {
  info(`Profil von ${user.name} öffnen`)
  // TODO: Open user profile modal or navigate
}

const connect = (user: User) => {
  success(`Verbindung zu ${user.name} gesendet`)
  // TODO: Send connection request via Gun.js
}
</script>

<style scoped>
.user-sidebar {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.section {
  background: rgba(30, 41, 59, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.75rem;
  padding: 1.25rem;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9375rem;
  font-weight: 700;
  color: #f8fafc;
  margin: 0 0 1rem 0;
}

.icon {
  font-size: 1.125rem;
}

/* Users List */
.users-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.user-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: rgba(15, 23, 42, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.user-item:hover {
  background: rgba(15, 23, 42, 0.6);
  border-color: rgba(99, 102, 241, 0.3);
  transform: translateX(2px);
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 0.875rem;
  flex-shrink: 0;
  overflow: hidden;
}

.user-avatar.small {
  width: 32px;
  height: 32px;
  font-size: 0.75rem;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #f8fafc;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-status {
  font-size: 0.75rem;
  color: #94a3b8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.status-indicator.online {
  background: #22c55e;
  box-shadow: 0 0 8px rgba(34, 197, 94, 0.5);
}

.status-indicator.offline {
  background: #64748b;
}

.unread-badge {
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  background: #6366f1;
  border-radius: 10px;
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Suggestions */
.suggestions-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.suggestion-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: rgba(15, 23, 42, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 0.5rem;
}

.suggestion-info {
  flex: 1;
  min-width: 0;
}

.match-reason {
  font-size: 0.75rem;
  color: #6366f1;
}

.connect-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(99, 102, 241, 0.2);
  border: 1px solid #6366f1;
  color: #6366f1;
  font-size: 1.125rem;
  font-weight: 300;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.connect-btn:hover {
  background: #6366f1;
  color: white;
  transform: scale(1.1);
}

/* Activity */
.activity-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem;
  background: rgba(15, 23, 42, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 0.5rem;
  transition: all 0.2s;
  cursor: pointer;
}

.activity-item:hover {
  background: rgba(15, 23, 42, 0.6);
  border-color: rgba(99, 102, 241, 0.2);
}

.activity-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.activity-content {
  flex: 1;
  min-width: 0;
}

.activity-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #f8fafc;
  margin-bottom: 0.25rem;
}

.activity-meta {
  font-size: 0.75rem;
  color: #64748b;
  display: flex;
  gap: 0.5rem;
}
</style>
