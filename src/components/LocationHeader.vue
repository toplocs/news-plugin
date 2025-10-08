<template>
  <div class="location-header">
    <!-- Hero Section mit Location -->
    <div class="hero-section">
      <div class="location-main">
        <!-- Map Icon -->
        <div class="map-icon">
          <svg class="w-12 h-12 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>

        <!-- Location Info -->
        <div class="location-info">
          <h1 class="location-name">{{ locationName }}</h1>
          <div class="location-meta">
            <span class="radius-badge">{{ radius }}km Radius</span>
            <span class="separator">·</span>
            <span class="news-count">
              <span class="count-number">{{ newsCount }}</span> Nachrichten heute
            </span>
          </div>
        </div>
      </div>

      <!-- Radius Slider -->
      <div class="radius-control">
        <label class="control-label">Umkreis anpassen:</label>
        <div class="slider-container">
          <input
            type="range"
            v-model.number="localRadius"
            min="1"
            max="100"
            @input="$emit('update:radius', localRadius)"
            class="radius-slider"
          />
          <div class="slider-track-fill" :style="{ width: `${(localRadius / 100) * 100}%` }"></div>
        </div>
        <div class="slider-labels">
          <span>1km</span>
          <span>{{ localRadius }}km</span>
          <span>100km</span>
        </div>
      </div>
    </div>

    <!-- Quick Stats -->
    <div class="quick-stats">
      <div class="stat-item">
        <div class="stat-icon breaking">🔥</div>
        <div class="stat-content">
          <div class="stat-value">{{ breakingCount }}</div>
          <div class="stat-label">Breaking</div>
        </div>
      </div>

      <div class="stat-item">
        <div class="stat-icon local">📍</div>
        <div class="stat-content">
          <div class="stat-value">{{ localCount }}</div>
          <div class="stat-label">Lokal</div>
        </div>
      </div>

      <div class="stat-item">
        <div class="stat-icon community">👥</div>
        <div class="stat-content">
          <div class="stat-value">{{ communityCount }}</div>
          <div class="stat-label">Community</div>
        </div>
      </div>

      <div class="stat-item">
        <div class="stat-icon sources">📰</div>
        <div class="stat-content">
          <div class="stat-value">{{ sourcesCount }}</div>
          <div class="stat-label">Quellen</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  locationName?: string
  radius?: number
  newsCount?: number
  breakingCount?: number
  localCount?: number
  communityCount?: number
  sourcesCount?: number
}>()

const emit = defineEmits<{
  'update:radius': [value: number]
}>()

const localRadius = ref(props.radius || 10)
</script>

<style scoped>
.location-header {
  background: linear-gradient(135deg,
    rgba(16, 185, 129, 0.1) 0%,
    rgba(59, 130, 246, 0.1) 50%,
    rgba(139, 92, 246, 0.1) 100%
  );
  border-radius: 1.5rem;
  padding: 2rem;
  margin-bottom: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(12px);
}

.hero-section {
  margin-bottom: 2rem;
}

.location-main {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.map-icon {
  animation: pin-drop 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes pin-drop {
  0% {
    transform: translateY(-100px) scale(0);
    opacity: 0;
  }
  60% {
    transform: translateY(10px) scale(1.1);
  }
  100% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

.location-info {
  flex: 1;
}

.location-name {
  font-size: 2rem;
  font-weight: 800;
  color: #f8fafc;
  margin-bottom: 0.5rem;
  letter-spacing: -0.02em;
}

.location-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #cbd5e1;
  font-size: 0.95rem;
}

.radius-badge {
  background: linear-gradient(135deg, #10b981, #3b82f6);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-weight: 600;
  font-size: 0.875rem;
}

.separator {
  color: #64748b;
}

.news-count {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.count-number {
  font-weight: 700;
  color: #6366f1;
  font-size: 1.125rem;
}

.radius-control {
  background: rgba(30, 41, 59, 0.5);
  padding: 1.5rem;
  border-radius: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.control-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #cbd5e1;
  margin-bottom: 1rem;
}

.slider-container {
  position: relative;
  height: 8px;
  margin-bottom: 0.5rem;
}

.radius-slider {
  width: 100%;
  height: 8px;
  background: rgba(100, 116, 139, 0.3);
  border-radius: 999px;
  outline: none;
  cursor: pointer;
  -webkit-appearance: none;
  position: relative;
  z-index: 2;
}

.radius-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.2);
  transition: all 0.2s ease;
}

.radius-slider::-webkit-slider-thumb:hover {
  box-shadow: 0 0 0 8px rgba(99, 102, 241, 0.3);
  transform: scale(1.1);
}

.slider-track-fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 8px;
  background: linear-gradient(90deg, #6366f1, #8b5cf6);
  border-radius: 999px;
  pointer-events: none;
  transition: width 0.2s ease;
}

.slider-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: #94a3b8;
}

.quick-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
  margin-top: 2rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: rgba(30, 41, 59, 0.5);
  border-radius: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.2s ease;
}

.stat-item:hover {
  background: rgba(30, 41, 59, 0.7);
  border-color: rgba(99, 102, 241, 0.3);
  transform: translateY(-2px);
}

.stat-icon {
  font-size: 1.5rem;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
}

.stat-icon.breaking {
  background: linear-gradient(135deg, #f59e0b, #ef4444);
}

.stat-icon.local {
  background: linear-gradient(135deg, #10b981, #3b82f6);
}

.stat-icon.community {
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
}

.stat-icon.sources {
  background: linear-gradient(135deg, #6366f1, #ec4899);
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #f8fafc;
  line-height: 1;
}

.stat-label {
  font-size: 0.75rem;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-top: 0.25rem;
}

@media (max-width: 768px) {
  .location-header {
    padding: 1.5rem;
  }

  .location-main {
    flex-direction: column;
    text-align: center;
  }

  .location-name {
    font-size: 1.5rem;
  }

  .quick-stats {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
