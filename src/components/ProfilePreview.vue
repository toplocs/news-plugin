<template>
  <div class="profile-preview">
    <!-- Cover/Header -->
    <div class="profile-header">
      <div class="cover-gradient"></div>
    </div>

    <!-- Avatar -->
    <div class="avatar-container">
      <div class="avatar">
        <img v-if="profile.avatar" :src="profile.avatar" :alt="profile.name" />
        <div v-else class="avatar-placeholder">
          {{ profile.name ? profile.name[0] : '?' }}
        </div>
      </div>
    </div>

    <!-- Info -->
    <div class="profile-info">
      <h3 class="profile-name">{{ profile.name }}</h3>
      <p v-if="profile.username" class="profile-username">@{{ profile.username }}</p>
      <p v-if="profile.bio" class="profile-bio">{{ profile.bio }}</p>

      <!-- Stats -->
      <div class="profile-stats">
        <div class="stat-item">
          <span class="stat-value">{{ profile.following?.length || 0 }}</span>
          <span class="stat-label">Following</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ profile.followers?.length || 0 }}</span>
          <span class="stat-label">Followers</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ profile.interests.length }}</span>
          <span class="stat-label">Interessen</span>
        </div>
      </div>

      <!-- Interests -->
      <div v-if="profile.interests.length > 0" class="profile-interests">
        <span
          v-for="interest in profile.interests.slice(0, 5)"
          :key="interest"
          class="interest-badge"
        >
          {{ interest }}
        </span>
        <span v-if="profile.interests.length > 5" class="more-badge">
          +{{ profile.interests.length - 5 }}
        </span>
      </div>

      <!-- Location -->
      <div v-if="profile.location?.name" class="profile-location">
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
        </svg>
        <span>{{ profile.location.name }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { UserProfile } from '../types/user'

defineProps<{
  profile: UserProfile
}>()
</script>

<style scoped>
.profile-preview {
  background: rgba(30, 41, 59, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  overflow: hidden;
}

.profile-header {
  height: 120px;
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
  display: flex;
  justify-content: center;
  margin-top: -60px;
  padding: 0 1.5rem;
}

.avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border: 4px solid #1e293b;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  font-size: 3rem;
  font-weight: 700;
  color: white;
}

.profile-info {
  padding: 1.5rem;
  text-align: center;
}

.profile-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: #f8fafc;
  margin: 0 0 0.5rem 0;
}

.profile-username {
  font-size: 0.9375rem;
  color: #6366f1;
  margin: 0 0 1rem 0;
}

.profile-bio {
  font-size: 0.9375rem;
  color: #cbd5e1;
  line-height: 1.6;
  margin: 0 0 1.5rem 0;
}

.profile-stats {
  display: flex;
  justify-content: center;
  gap: 2rem;
  padding: 1.25rem;
  background: rgba(15, 23, 42, 0.4);
  border-radius: 0.75rem;
  margin-bottom: 1.5rem;
}

.stat-item {
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

.profile-interests {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.interest-badge {
  padding: 0.375rem 0.75rem;
  background: rgba(99, 102, 241, 0.2);
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 999px;
  color: #a5b4fc;
  font-size: 0.8125rem;
  font-weight: 500;
}

.more-badge {
  padding: 0.375rem 0.75rem;
  background: rgba(100, 116, 139, 0.2);
  border: 1px solid rgba(100, 116, 139, 0.3);
  border-radius: 999px;
  color: #94a3b8;
  font-size: 0.8125rem;
  font-weight: 500;
}

.profile-location {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #94a3b8;
}

.profile-location svg {
  color: #6366f1;
}
</style>
