<template>
  <div class="community-illustration" :style="{ width: size, height: size }">
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Connection Lines -->
      <g class="connections">
        <line x1="100" y1="50" x2="70" y2="100" stroke="url(#connectionGradient)" stroke-width="2" class="connection line-1" />
        <line x1="100" y1="50" x2="130" y2="100" stroke="url(#connectionGradient)" stroke-width="2" class="connection line-2" />
        <line x1="100" y1="50" x2="100" y2="130" stroke="url(#connectionGradient)" stroke-width="2" class="connection line-3" />
        <line x1="70" y1="100" x2="40" y2="150" stroke="url(#connectionGradient)" stroke-width="2" class="connection line-4" />
        <line x1="70" y1="100" x2="100" y2="130" stroke="url(#connectionGradient)" stroke-width="2" class="connection line-5" />
        <line x1="130" y1="100" x2="100" y2="130" stroke="url(#connectionGradient)" stroke-width="2" class="connection line-6" />
        <line x1="130" y1="100" x2="160" y2="150" stroke="url(#connectionGradient)" stroke-width="2" class="connection line-7" />
      </g>

      <!-- Person Nodes -->
      <!-- Center Top Person -->
      <g class="person person-center">
        <circle cx="100" cy="50" r="20" fill="url(#personGradient1)" class="person-circle" />
        <text x="100" y="57" text-anchor="middle" font-size="20">👤</text>
        <circle cx="100" cy="50" r="25" fill="none" stroke="#6366f1" stroke-width="2" opacity="0" class="person-ring" />
      </g>

      <!-- Left Person -->
      <g class="person person-left">
        <circle cx="70" cy="100" r="18" fill="url(#personGradient2)" class="person-circle" />
        <text x="70" y="106" text-anchor="middle" font-size="18">👤</text>
        <circle cx="70" cy="100" r="23" fill="none" stroke="#8b5cf6" stroke-width="2" opacity="0" class="person-ring" />
      </g>

      <!-- Right Person -->
      <g class="person person-right">
        <circle cx="130" cy="100" r="18" fill="url(#personGradient3)" class="person-circle" />
        <text x="130" y="106" text-anchor="middle" font-size="18">👤</text>
        <circle cx="130" cy="100" r="23" fill="none" stroke="#a855f7" stroke-width="2" opacity="0" class="person-ring" />
      </g>

      <!-- Bottom Center Person -->
      <g class="person person-bottom">
        <circle cx="100" cy="130" r="16" fill="url(#personGradient4)" class="person-circle" />
        <text x="100" y="135" text-anchor="middle" font-size="16">👤</text>
        <circle cx="100" cy="130" r="21" fill="none" stroke="#10b981" stroke-width="2" opacity="0" class="person-ring" />
      </g>

      <!-- Bottom Left Person -->
      <g class="person person-bottom-left">
        <circle cx="40" cy="150" r="14" fill="url(#personGradient5)" class="person-circle" />
        <text x="40" y="154" text-anchor="middle" font-size="14">👤</text>
        <circle cx="40" cy="150" r="19" fill="none" stroke="#f59e0b" stroke-width="2" opacity="0" class="person-ring" />
      </g>

      <!-- Bottom Right Person -->
      <g class="person person-bottom-right">
        <circle cx="160" cy="150" r="14" fill="url(#personGradient6)" class="person-circle" />
        <text x="160" y="154" text-anchor="middle" font-size="14">👤</text>
        <circle cx="160" cy="150" r="19" fill="none" stroke="#ec4899" stroke-width="2" opacity="0" class="person-ring" />
      </g>

      <!-- Energy Particles -->
      <g class="particles">
        <circle cx="85" cy="75" r="2" fill="#6366f1" class="particle particle-1" />
        <circle cx="115" cy="75" r="2" fill="#8b5cf6" class="particle particle-2" />
        <circle cx="55" cy="125" r="2" fill="#a855f7" class="particle particle-3" />
        <circle cx="100" cy="90" r="2" fill="#10b981" class="particle particle-4" />
        <circle cx="145" cy="125" r="2" fill="#f59e0b" class="particle particle-5" />
      </g>

      <!-- Gradients -->
      <defs>
        <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#6366f1;stop-opacity:0.6" />
          <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:0.3" />
        </linearGradient>
        <radialGradient id="personGradient1">
          <stop offset="0%" style="stop-color:#6366f1;stop-opacity:0.8" />
          <stop offset="100%" style="stop-color:#4f46e5;stop-opacity:1" />
        </radialGradient>
        <radialGradient id="personGradient2">
          <stop offset="0%" style="stop-color:#8b5cf6;stop-opacity:0.8" />
          <stop offset="100%" style="stop-color:#7c3aed;stop-opacity:1" />
        </radialGradient>
        <radialGradient id="personGradient3">
          <stop offset="0%" style="stop-color:#a855f7;stop-opacity:0.8" />
          <stop offset="100%" style="stop-color:#9333ea;stop-opacity:1" />
        </radialGradient>
        <radialGradient id="personGradient4">
          <stop offset="0%" style="stop-color:#10b981;stop-opacity:0.8" />
          <stop offset="100%" style="stop-color:#059669;stop-opacity:1" />
        </radialGradient>
        <radialGradient id="personGradient5">
          <stop offset="0%" style="stop-color:#f59e0b;stop-opacity:0.8" />
          <stop offset="100%" style="stop-color:#d97706;stop-opacity:1" />
        </radialGradient>
        <radialGradient id="personGradient6">
          <stop offset="0%" style="stop-color:#ec4899;stop-opacity:0.8" />
          <stop offset="100%" style="stop-color:#db2777;stop-opacity:1" />
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
.community-illustration {
  display: inline-block;
}

/* Connection Line Animations */
.connection {
  stroke-dasharray: 100;
  stroke-dashoffset: 100;
  animation: connectionDraw 4s ease-in-out infinite;
}

.line-1 { animation-delay: 0s; }
.line-2 { animation-delay: 0.2s; }
.line-3 { animation-delay: 0.4s; }
.line-4 { animation-delay: 0.6s; }
.line-5 { animation-delay: 0.8s; }
.line-6 { animation-delay: 1s; }
.line-7 { animation-delay: 1.2s; }

@keyframes connectionDraw {
  0%, 100% {
    stroke-dashoffset: 100;
    opacity: 0.3;
  }
  50% {
    stroke-dashoffset: 0;
    opacity: 0.8;
  }
}

/* Person Node Animations */
.person {
  animation: personPulse 3s ease-in-out infinite;
}

.person-center { animation-delay: 0s; transform-origin: 100px 50px; }
.person-left { animation-delay: 0.3s; transform-origin: 70px 100px; }
.person-right { animation-delay: 0.6s; transform-origin: 130px 100px; }
.person-bottom { animation-delay: 0.9s; transform-origin: 100px 130px; }
.person-bottom-left { animation-delay: 1.2s; transform-origin: 40px 150px; }
.person-bottom-right { animation-delay: 1.5s; transform-origin: 160px 150px; }

@keyframes personPulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.person-circle {
  animation: circleGlow 2s ease-in-out infinite;
}

@keyframes circleGlow {
  0%, 100% {
    filter: brightness(1);
  }
  50% {
    filter: brightness(1.2);
  }
}

/* Person Ring Animation */
.person-ring {
  animation: ringPulse 3s ease-out infinite;
}

.person-center .person-ring { animation-delay: 0s; }
.person-left .person-ring { animation-delay: 0.4s; }
.person-right .person-ring { animation-delay: 0.8s; }
.person-bottom .person-ring { animation-delay: 1.2s; }
.person-bottom-left .person-ring { animation-delay: 1.6s; }
.person-bottom-right .person-ring { animation-delay: 2s; }

@keyframes ringPulse {
  0% {
    opacity: 0.6;
    transform: scale(0.8);
  }
  50% {
    opacity: 0;
    transform: scale(1.5);
  }
  100% {
    opacity: 0;
    transform: scale(0.8);
  }
}

/* Energy Particle Animations */
.particle {
  animation: particleFloat 3s ease-in-out infinite;
}

.particle-1 {
  animation-delay: 0s;
  animation-duration: 3s;
}

.particle-2 {
  animation-delay: 0.6s;
  animation-duration: 2.5s;
}

.particle-3 {
  animation-delay: 1.2s;
  animation-duration: 3.5s;
}

.particle-4 {
  animation-delay: 1.8s;
  animation-duration: 2.8s;
}

.particle-5 {
  animation-delay: 2.4s;
  animation-duration: 3.2s;
}

@keyframes particleFloat {
  0%, 100% {
    opacity: 0;
    transform: translateY(0) scale(0);
  }
  25% {
    opacity: 1;
    transform: translateY(-10px) scale(1);
  }
  50% {
    opacity: 0.8;
    transform: translateY(-20px) scale(1.2);
  }
  75% {
    opacity: 0.4;
    transform: translateY(-30px) scale(0.8);
  }
}
</style>
