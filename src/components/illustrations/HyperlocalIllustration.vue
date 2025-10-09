<template>
  <div class="hyperlocal-illustration" :style="{ width: size, height: size }">
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Map Background -->
      <rect width="200" height="200" fill="url(#mapGradient)" rx="20" />

      <!-- Grid Lines -->
      <g class="grid" opacity="0.2">
        <line x1="0" y1="50" x2="200" y2="50" stroke="#cbd5e1" stroke-width="1" />
        <line x1="0" y1="100" x2="200" y2="100" stroke="#cbd5e1" stroke-width="1" />
        <line x1="0" y1="150" x2="200" y2="150" stroke="#cbd5e1" stroke-width="1" />
        <line x1="50" y1="0" x2="50" y2="200" stroke="#cbd5e1" stroke-width="1" />
        <line x1="100" y1="0" x2="100" y2="200" stroke="#cbd5e1" stroke-width="1" />
        <line x1="150" y1="0" x2="150" y2="200" stroke="#cbd5e1" stroke-width="1" />
      </g>

      <!-- Roads/Paths -->
      <g class="roads" opacity="0.3">
        <path d="M 20 80 Q 60 90, 100 80 T 180 90" stroke="#94a3b8" stroke-width="3" fill="none" />
        <path d="M 70 20 L 70 180" stroke="#94a3b8" stroke-width="2" fill="none" />
        <path d="M 30 140 Q 80 130, 120 140 T 170 135" stroke="#94a3b8" stroke-width="2" fill="none" />
      </g>

      <!-- Radius Circle -->
      <circle cx="100" cy="100" r="60" fill="none" stroke="url(#radiusGradient)" stroke-width="2" stroke-dasharray="5,5" class="radius-circle" />
      <circle cx="100" cy="100" r="60" fill="url(#radiusFillGradient)" opacity="0.1" class="radius-fill" />

      <!-- User Location (center) -->
      <g class="user-marker">
        <circle cx="100" cy="100" r="12" fill="#6366f1" />
        <circle cx="100" cy="100" r="8" fill="white" />
        <text x="100" y="105" text-anchor="middle" font-size="10" fill="#6366f1" font-weight="bold">📍</text>
      </g>

      <!-- Event Markers -->
      <g class="event-marker marker-1">
        <circle cx="130" cy="70" r="8" fill="#f59e0b" class="marker-pulse" />
        <text x="130" y="73" text-anchor="middle" font-size="8">🎉</text>
        <circle cx="130" cy="70" r="12" fill="none" stroke="#f59e0b" stroke-width="1.5" opacity="0" class="marker-ring" />
      </g>

      <g class="event-marker marker-2">
        <circle cx="70" cy="120" r="8" fill="#10b981" class="marker-pulse" />
        <text x="70" y="123" text-anchor="middle" font-size="8">📰</text>
        <circle cx="70" cy="120" r="12" fill="none" stroke="#10b981" stroke-width="1.5" opacity="0" class="marker-ring" />
      </g>

      <g class="event-marker marker-3">
        <circle cx="145" cy="130" r="8" fill="#8b5cf6" class="marker-pulse" />
        <text x="145" y="133" text-anchor="middle" font-size="8">👥</text>
        <circle cx="145" cy="130" r="12" fill="none" stroke="#8b5cf6" stroke-width="1.5" opacity="0" class="marker-ring" />
      </g>

      <!-- Distance Lines -->
      <g class="distance-lines" opacity="0.4">
        <line x1="100" y1="100" x2="130" y2="70" stroke="#6366f1" stroke-width="1" stroke-dasharray="2,2" class="distance-line line-1" />
        <line x1="100" y1="100" x2="70" y2="120" stroke="#6366f1" stroke-width="1" stroke-dasharray="2,2" class="distance-line line-2" />
        <line x1="100" y1="100" x2="145" y2="130" stroke="#6366f1" stroke-width="1" stroke-dasharray="2,2" class="distance-line line-3" />
      </g>

      <!-- Gradients -->
      <defs>
        <linearGradient id="mapGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#1e293b;stop-opacity:0.6" />
          <stop offset="100%" style="stop-color:#0f172a;stop-opacity:0.8" />
        </linearGradient>
        <linearGradient id="radiusGradient">
          <stop offset="0%" style="stop-color:#6366f1;stop-opacity:0.8" />
          <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:0.4" />
        </linearGradient>
        <radialGradient id="radiusFillGradient">
          <stop offset="0%" style="stop-color:#6366f1;stop-opacity:0.3" />
          <stop offset="100%" style="stop-color:#6366f1;stop-opacity:0" />
        </radialGradient>
      </defs>
    </svg>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  size?: string
}>(), {
  size: '200px'
})
</script>

<style scoped>
.hyperlocal-illustration {
  display: inline-block;
}

/* Radius Circle Animation */
.radius-circle {
  animation: radiusRotate 10s linear infinite;
  transform-origin: center;
}

@keyframes radiusRotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.radius-fill {
  animation: radiusPulse 3s ease-in-out infinite;
}

@keyframes radiusPulse {
  0%, 100% {
    opacity: 0.1;
    transform: scale(1);
  }
  50% {
    opacity: 0.2;
    transform: scale(1.05);
  }
}

/* User Marker Animation */
.user-marker {
  animation: userBounce 2s ease-in-out infinite;
  transform-origin: 100px 100px;
}

@keyframes userBounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-3px);
  }
}

/* Event Marker Animations */
.event-marker {
  animation: markerFloat 3s ease-in-out infinite;
}

.marker-1 {
  animation-delay: 0s;
  transform-origin: 130px 70px;
}

.marker-2 {
  animation-delay: 1s;
  transform-origin: 70px 120px;
}

.marker-3 {
  animation-delay: 2s;
  transform-origin: 145px 130px;
}

@keyframes markerFloat {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

.marker-pulse {
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

/* Marker Ring Animation */
.marker-ring {
  animation: ringExpand 2s ease-out infinite;
}

@keyframes ringExpand {
  0% {
    opacity: 0.8;
    transform: scale(0.5);
  }
  100% {
    opacity: 0;
    transform: scale(2.5);
  }
}

.marker-1 .marker-ring {
  animation-delay: 0s;
}

.marker-2 .marker-ring {
  animation-delay: 0.7s;
}

.marker-3 .marker-ring {
  animation-delay: 1.4s;
}

/* Distance Lines Animation */
.distance-line {
  stroke-dasharray: 100;
  stroke-dashoffset: 100;
  animation: lineDraw 3s ease-in-out infinite;
}

.line-1 {
  animation-delay: 0.5s;
}

.line-2 {
  animation-delay: 1.5s;
}

.line-3 {
  animation-delay: 2.5s;
}

@keyframes lineDraw {
  0%, 100% {
    stroke-dashoffset: 100;
    opacity: 0;
  }
  40%, 60% {
    stroke-dashoffset: 0;
    opacity: 0.6;
  }
}
</style>
