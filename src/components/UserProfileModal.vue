<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="modal-overlay" @click="$emit('update:modelValue', false)">
        <div class="modal-container" @click.stop>
          <!-- Close Button -->
          <button @click="$emit('update:modelValue', false)" class="modal-close">×</button>

          <!-- Profile Header -->
          <div class="profile-header">
            <div class="cover-gradient"></div>
            <div class="avatar-container">
              <div class="avatar-large">
                <img v-if="user.avatar" :src="user.avatar" :alt="user.name" />
                <span v-else class="avatar-placeholder">{{ user.name[0] }}</span>
              </div>
              <div v-if="user.online" class="online-badge">●</div>
            </div>
          </div>

          <!-- Profile Info -->
          <div class="profile-body">
            <h2 class="profile-name">{{ user.name }}</h2>
            <p v-if="user.status" class="profile-status">{{ user.status }}</p>

            <!-- Stats -->
            <div class="profile-stats">
              <div class="stat">
                <div class="stat-value">{{ user.following || 0 }}</div>
                <div class="stat-label">Following</div>
              </div>
              <div class="stat">
                <div class="stat-value">{{ user.followers || 0 }}</div>
                <div class="stat-label">Followers</div>
              </div>
              <div class="stat">
                <div class="stat-value">{{ user.interests?.length || 0 }}</div>
                <div class="stat-label">Interessen</div>
              </div>
            </div>

            <!-- Bio -->
            <div v-if="user.bio" class="profile-section">
              <h3 class="section-title">Über mich</h3>
              <p class="bio-text">{{ user.bio }}</p>
            </div>

            <!-- Interests -->
            <div v-if="user.interests && user.interests.length > 0" class="profile-section">
              <h3 class="section-title">Interessen</h3>
              <div class="interests-grid">
                <span v-for="interest in user.interests" :key="interest" class="interest-tag">
                  {{ interest }}
                </span>
              </div>
            </div>

            <!-- Location -->
            <div v-if="user.location" class="profile-section">
              <h3 class="section-title">Standort</h3>
              <div class="location-info">
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                <span>{{ user.location }}</span>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="profile-actions">
              <button @click="handleMessage" class="action-btn primary">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
                </svg>
                Nachricht senden
              </button>
              <button @click="handleConnect" class="action-btn secondary">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                </svg>
                Verbinden
              </button>
            </div>

            <!-- Recent Activity -->
            <div class="profile-section">
              <h3 class="section-title">Kürzliche Aktivität</h3>
              <div class="activity-list">
                <div class="activity-item">
                  <div class="activity-icon">📰</div>
                  <div class="activity-text">
                    Hat einen Artikel über <strong>Tech Trends</strong> geteilt
                  </div>
                  <div class="activity-time">vor 2h</div>
                </div>
                <div class="activity-item">
                  <div class="activity-icon">💬</div>
                  <div class="activity-text">
                    Hat auf einen Beitrag kommentiert
                  </div>
                  <div class="activity-time">vor 5h</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { useToast } from '../composables/useToast'

interface User {
  id: string
  name: string
  avatar?: string
  status?: string
  bio?: string
  online?: boolean
  interests?: string[]
  location?: string
  following?: number
  followers?: number
}

const props = defineProps<{
  modelValue: boolean
  user: User
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'open-chat': [user: User]
}>()

const { success, info } = useToast()

const handleMessage = () => {
  emit('open-chat', props.user)
}

const handleConnect = () => {
  success(`Verbindungsanfrage an ${props.user.name} gesendet`)
  // TODO: Send connection request via Gun.js
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.9);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
}

.modal-container {
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  overflow-y: auto;
  position: relative;
}

.modal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #cbd5e1;
  font-size: 1.5rem;
  cursor: pointer;
  z-index: 10;
  transition: all 0.2s;
}

.modal-close:hover {
  background: rgba(30, 41, 59, 1);
  transform: scale(1.1);
}

.profile-header {
  height: 150px;
  position: relative;
  overflow: hidden;
}

.cover-gradient {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899);
  opacity: 0.8;
}

.avatar-container {
  position: absolute;
  bottom: -50px;
  left: 50%;
  transform: translateX(-50%);
}

.avatar-large {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border: 4px solid #1e293b;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
}

.avatar-large img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  font-size: 3rem;
  font-weight: 700;
  color: white;
}

.online-badge {
  position: absolute;
  bottom: 8px;
  right: 8px;
  width: 20px;
  height: 20px;
  background: #22c55e;
  border: 3px solid #1e293b;
  border-radius: 50%;
  color: transparent;
}

.profile-body {
  padding: 4rem 2rem 2rem;
  text-align: center;
}

.profile-name {
  font-size: 1.75rem;
  font-weight: 700;
  color: #f8fafc;
  margin: 0 0 0.5rem 0;
}

.profile-status {
  font-size: 0.9375rem;
  color: #94a3b8;
  margin: 0 0 1.5rem 0;
}

.profile-stats {
  display: flex;
  justify-content: center;
  gap: 2rem;
  padding: 1.5rem;
  background: rgba(15, 23, 42, 0.5);
  border-radius: 0.75rem;
  margin-bottom: 2rem;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #6366f1;
}

.stat-label {
  font-size: 0.75rem;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.profile-section {
  text-align: left;
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 0.9375rem;
  font-weight: 700;
  color: #f8fafc;
  margin: 0 0 0.75rem 0;
}

.bio-text {
  font-size: 0.9375rem;
  color: #cbd5e1;
  line-height: 1.6;
  margin: 0;
}

.interests-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.interest-tag {
  padding: 0.375rem 0.75rem;
  background: rgba(99, 102, 241, 0.2);
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 999px;
  color: #a5b4fc;
  font-size: 0.8125rem;
  font-weight: 500;
}

.location-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9375rem;
  color: #94a3b8;
}

.location-info svg {
  color: #6366f1;
}

.profile-actions {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 2rem;
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  border-radius: 0.5rem;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn.primary {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border: none;
  color: white;
}

.action-btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(99, 102, 241, 0.3);
}

.action-btn.secondary {
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #cbd5e1;
}

.action-btn.secondary:hover {
  background: rgba(30, 41, 59, 0.8);
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: rgba(15, 23, 42, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 0.5rem;
}

.activity-icon {
  font-size: 1.25rem;
}

.activity-text {
  flex: 1;
  font-size: 0.875rem;
  color: #cbd5e1;
}

.activity-text strong {
  color: #6366f1;
  font-weight: 600;
}

.activity-time {
  font-size: 0.75rem;
  color: #64748b;
}

/* Modal Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: transform 0.3s ease;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.9);
}

@media (max-width: 640px) {
  .modal-overlay {
    padding: 0;
  }

  .modal-container {
    max-width: 100%;
    max-height: 100vh;
    border-radius: 0;
  }

  .profile-actions {
    flex-direction: column;
  }

  .profile-stats {
    gap: 1rem;
  }
}
</style>
