<template>
  <div class="discovery-banner">
    <!-- Main Discovery Message -->
    <div class="discovery-message">
      <div class="discovery-icon">🗺️</div>
      <div class="discovery-content">
        <h3 class="discovery-title">Entdecke deinen Kiez</h3>
        <p class="discovery-subtitle">
          {{ articlesInRadius }} Artikel in <strong>{{ radius }}km</strong> Umkreis von dir
        </p>
      </div>
    </div>

    <!-- Radius Control (Prominent) -->
    <div class="radius-control">
      <label for="radius-slider" class="radius-label">
        <span class="label-text">Suchradius</span>
        <span class="radius-value">{{ radius }} km</span>
      </label>
      <input
        id="radius-slider"
        v-model.number="localRadius"
        type="range"
        min="1"
        max="50"
        step="1"
        class="radius-slider"
        @input="handleRadiusChange"
      />
      <div class="radius-marks">
        <span>1km</span>
        <span>10km</span>
        <span>25km</span>
        <span>50km</span>
      </div>
    </div>

    <!-- Stats Row -->
    <div class="discovery-stats">
      <div class="stat-item">
        <span class="stat-icon">📍</span>
        <span class="stat-value">{{ closestDistance }}km</span>
        <span class="stat-label">Nächster</span>
      </div>
      <div class="stat-item">
        <span class="stat-icon">🎯</span>
        <span class="stat-value">{{ articlesInRadius }}</span>
        <span class="stat-label">Im Umkreis</span>
      </div>
      <div class="stat-item">
        <span class="stat-icon">📰</span>
        <span class="stat-value">{{ totalArticles }}</span>
        <span class="stat-label">Gesamt</span>
      </div>
    </div>

    <!-- Empty State (wenn keine Artikel) -->
    <div v-if="articlesInRadius === 0 && totalArticles > 0" class="empty-state">
      <div class="empty-icon">🔍</div>
      <h4 class="empty-title">Keine Artikel in deinem Umkreis</h4>
      <p class="empty-text">
        Erweitere deinen Suchradius um mehr zu sehen
      </p>
      <button @click="expandRadius" class="expand-btn">
        <span>📍</span>
        <span>Radius auf {{ suggestedRadius }}km erweitern</span>
      </button>
    </div>

    <!-- Transparency Note -->
    <div class="transparency-note">
      <span class="transparency-icon">✨</span>
      <span class="transparency-text">
        Alle Artikel sind nach <strong>Distanz sortiert</strong> (nächste zuerst)
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

const props = defineProps<{
  radius: number
  articlesInRadius: number
  totalArticles: number
  closestDistance: number
}>()

const emit = defineEmits<{
  'update-radius': [radius: number]
}>()

const localRadius = ref(props.radius)

// Calculate suggested radius (next sensible step)
const suggestedRadius = computed(() => {
  const current = props.radius
  if (current < 5) return 5
  if (current < 10) return 10
  if (current < 25) return 25
  return 50
})

watch(() => props.radius, (newVal) => {
  localRadius.value = newVal
})

const handleRadiusChange = () => {
  emit('update-radius', localRadius.value)
}

const expandRadius = () => {
  localRadius.value = suggestedRadius.value
  handleRadiusChange()
}
</script>

<style scoped>
.discovery-banner {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1));
  border: 1px solid rgba(99, 102, 241, 0.2);
  border-radius: 1rem;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

/* Discovery Message */
.discovery-message {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.discovery-icon {
  font-size: 2.5rem;
  line-height: 1;
}

.discovery-content {
  flex: 1;
}

.discovery-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #f8fafc;
  margin: 0 0 0.25rem 0;
}

.discovery-subtitle {
  font-size: 0.875rem;
  color: #cbd5e1;
  margin: 0;
}

.discovery-subtitle strong {
  color: #a5b4fc;
  font-weight: 600;
}

/* Radius Control */
.radius-control {
  margin-bottom: 1.5rem;
}

.radius-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.label-text {
  font-size: 0.875rem;
  font-weight: 600;
  color: #cbd5e1;
}

.radius-value {
  font-size: 1rem;
  font-weight: 700;
  color: #a5b4fc;
}

.radius-slider {
  width: 100%;
  height: 8px;
  background: rgba(99, 102, 241, 0.2);
  border-radius: 4px;
  outline: none;
  -webkit-appearance: none;
  appearance: none;
  cursor: pointer;
}

.radius-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.4);
}

.radius-slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border-radius: 50%;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.4);
}

.radius-marks {
  display: flex;
  justify-content: space-between;
  margin-top: 0.5rem;
  padding: 0 2px;
}

.radius-marks span {
  font-size: 0.75rem;
  color: #64748b;
}

/* Discovery Stats */
.discovery-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 0.5rem;
  padding: 0.75rem;
  text-align: center;
}

.stat-icon {
  font-size: 1.25rem;
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1.125rem;
  font-weight: 700;
  color: #a5b4fc;
  line-height: 1;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.6875rem;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Empty State */
.empty-state {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 0.75rem;
  padding: 1.5rem;
  text-align: center;
  margin-bottom: 1rem;
}

.empty-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.empty-title {
  font-size: 1rem;
  font-weight: 700;
  color: #f8fafc;
  margin: 0 0 0.5rem 0;
}

.empty-text {
  font-size: 0.875rem;
  color: #cbd5e1;
  margin: 0 0 1rem 0;
}

.expand-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border: none;
  border-radius: 0.5rem;
  padding: 0.75rem 1.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.expand-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}

/* Transparency Note */
.transparency-note {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: 0.5rem;
  font-size: 0.8125rem;
  color: #10b981;
}

.transparency-icon {
  font-size: 1rem;
}

.transparency-text {
  flex: 1;
}

.transparency-text strong {
  font-weight: 700;
}

/* Mobile Responsive */
@media (max-width: 640px) {
  .discovery-banner {
    padding: 1rem;
  }

  .discovery-message {
    flex-direction: column;
    text-align: center;
  }

  .discovery-icon {
    font-size: 2rem;
  }

  .discovery-title {
    font-size: 1.125rem;
  }

  .discovery-stats {
    grid-template-columns: 1fr;
  }

  .radius-marks {
    font-size: 0.6875rem;
  }
}
</style>
