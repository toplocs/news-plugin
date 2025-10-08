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
        <div v-for="event in channels.upcomingEvents.slice(0, 3)" :key="event.id" class="event-card">
          <div class="event-header">
            <div class="event-title">{{ event.title }}</div>
            <div class="event-channel">{{ event.channel.name }}</div>
          </div>
          <div class="event-meta">
            <span class="event-date">{{ formatDate(event.startTime) }}</span>
            <span class="event-attendees">{{ event.attendees.length }} Teilnehmer</span>
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
          </div>

          <!-- Channel Content -->
          <div class="channel-content">
            <div class="channel-name">{{ channel.name }}</div>
            <div class="channel-location">📍 {{ channel.location.name }}</div>

            <!-- Channel Stats -->
            <div class="channel-stats">
              <span class="stat">👥 {{ channel.memberCount }}</span>
              <span class="stat">💰 €{{ channel.revenuePool.toFixed(2) }}</span>
              <span v-if="channel.events.length > 0" class="stat">📅 {{ channel.events.length }}</span>
            </div>

            <!-- Channel Interests -->
            <div class="channel-interests">
              <span v-for="interest in channel.interests.slice(0, 3)" :key="interest" class="interest-tag">
                {{ interest }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Suggested Channels -->
    <div v-if="channels.suggestedChannels.length > 0" class="suggested-channels">
      <h4 class="section-title">✨ Vorschläge</h4>
      <div class="channels-list">
        <div v-for="channel in channels.suggestedChannels.slice(0, 3)" :key="channel.id" class="channel-item">
          <div class="channel-info">
            <div class="channel-name-small">{{ channel.name }}</div>
            <div class="channel-meta">
              <span>📍 {{ channel.location.name }}</span>
              <span>👥 {{ channel.memberCount }}</span>
            </div>
          </div>
          <button @click="joinChannel(channel)" class="btn-join">Beitreten</button>
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
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useChannels } from '../stores/useChannels'
import type { Channel } from '../stores/useChannels'

const emit = defineEmits<{
  'select-channel': [channel: Channel]
}>()

const channels = useChannels()
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

const selectChannel = (channel: Channel) => {
  emit('select-channel', channel)
}

const joinChannel = (channel: Channel) => {
  channels.joinChannel(channel.id)
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
  width: 100%;
  height: 100px;
  overflow: hidden;
}

.channel-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
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

.channel-location {
  font-size: 0.75rem;
  color: #94a3b8;
  margin-bottom: 0.75rem;
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
