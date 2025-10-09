<template>
  <div class="no-manipulation-illustration" :style="{ width: size, height: size }">
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Puppet Strings (being cut) -->
      <g class="puppet-strings" opacity="0.6">
        <line x1="100" y1="30" x2="80" y2="100" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="4,4" class="string string-1" />
        <line x1="100" y1="30" x2="100" y2="100" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="4,4" class="string string-2" />
        <line x1="100" y1="30" x2="120" y2="100" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="4,4" class="string string-3" />
      </g>

      <!-- Puppet Controller (hand) - Faded Out -->
      <g class="puppet-controller" opacity="0.3">
        <rect x="85" y="15" width="30" height="15" rx="3" fill="#475569" />
        <circle cx="90" cy="25" r="2" fill="#cbd5e1" />
        <circle cx="100" cy="25" r="2" fill="#cbd5e1" />
        <circle cx="110" cy="25" r="2" fill="#cbd5e1" />
      </g>

      <!-- Person (Free) -->
      <g class="person-free">
        <circle cx="100" cy="110" r="25" fill="url(#personGradient)" class="person-head" />
        <text x="100" y="118" text-anchor="middle" font-size="24">😊</text>
        <ellipse cx="100" cy="155" rx="15" ry="20" fill="url(#bodyGradient)" class="person-body" />

        <!-- Arms (raised in victory) -->
        <path d="M 85 145 Q 70 140, 65 130" stroke="url(#armGradient)" stroke-width="4" stroke-linecap="round" class="arm arm-left" />
        <path d="M 115 145 Q 130 140, 135 130" stroke="url(#armGradient)" stroke-width="4" stroke-linecap="round" class="arm arm-right" />

        <!-- Hands (victory) -->
        <text x="65" y="130" font-size="12">✌️</text>
        <text x="135" y="130" font-size="12">✌️</text>
      </g>

      <!-- Big Red X (crossing out manipulation) -->
      <g class="red-cross">
        <line x1="40" y1="40" x2="160" y2="160" stroke="#ef4444" stroke-width="6" stroke-linecap="round" class="cross-line cross-1" />
        <line x1="160" y1="40" x2="40" y2="160" stroke="#ef4444" stroke-width="6" stroke-linecap="round" class="cross-line cross-2" />
      </g>

      <!-- Freedom Sparkles -->
      <g class="sparkles">
        <text x="130" y="100" font-size="16" class="sparkle sparkle-1">✨</text>
        <text x="70" y="95" font-size="14" class="sparkle sparkle-2">✨</text>
        <text x="110" y="85" font-size="12" class="sparkle sparkle-3">✨</text>
        <text x="85" y="105" font-size="14" class="sparkle sparkle-4">✨</text>
        <text x="120" y="115" font-size="12" class="sparkle sparkle-5">✨</text>
      </g>

      <!-- Shield (Protection) -->
      <g class="shield">
        <path d="M 100 170 L 85 180 L 85 195 Q 92.5 200, 100 198 Q 107.5 200, 115 195 L 115 180 Z"
              fill="url(#shieldGradient)"
              stroke="#10b981"
              stroke-width="2" />
        <path d="M 95 185 L 98 190 L 105 180"
              stroke="white"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              fill="none" />
      </g>

      <!-- Gradients -->
      <defs>
        <linearGradient id="personGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#fbbf24;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#f59e0b;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#6366f1;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#4f46e5;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="armGradient">
          <stop offset="0%" style="stop-color:#6366f1;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="shieldGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#10b981;stop-opacity:0.8" />
          <stop offset="100%" style="stop-color:#059669;stop-opacity:1" />
        </linearGradient>
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
.no-manipulation-illustration {
  display: inline-block;
}

/* Puppet Strings - Breaking Animation */
.string {
  animation: stringBreak 3s ease-in-out infinite;
}

.string-1 { animation-delay: 0s; }
.string-2 { animation-delay: 0.3s; }
.string-3 { animation-delay: 0.6s; }

@keyframes stringBreak {
  0%, 40% {
    stroke-dashoffset: 0;
    opacity: 0.6;
  }
  50%, 100% {
    stroke-dashoffset: 100;
    opacity: 0;
  }
}

/* Puppet Controller - Fading Out */
.puppet-controller {
  animation: controllerFade 3s ease-in-out infinite;
}

@keyframes controllerFade {
  0% {
    opacity: 0.5;
    transform: translateY(0);
  }
  50%, 100% {
    opacity: 0;
    transform: translateY(-10px);
  }
}

/* Person Free - Celebrating */
.person-free {
  animation: celebrate 2s ease-in-out infinite;
  transform-origin: 100px 155px;
}

@keyframes celebrate {
  0%, 100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-5px) scale(1.02);
  }
}

.person-head {
  animation: headBob 1.5s ease-in-out infinite;
}

@keyframes headBob {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-3px);
  }
}

/* Arms - Victory Pose */
.arm {
  animation: armWave 2s ease-in-out infinite;
}

.arm-left {
  animation-delay: 0s;
  transform-origin: 85px 145px;
}

.arm-right {
  animation-delay: 0.5s;
  transform-origin: 115px 145px;
}

@keyframes armWave {
  0%, 100% {
    transform: rotate(0deg);
  }
  50% {
    transform: rotate(10deg);
  }
}

/* Red Cross - Striking Through */
.cross-line {
  stroke-dasharray: 200;
  stroke-dashoffset: 200;
  animation: crossDraw 2s ease-out forwards;
}

.cross-1 {
  animation-delay: 0.5s;
}

.cross-2 {
  animation-delay: 1s;
}

@keyframes crossDraw {
  to {
    stroke-dashoffset: 0;
  }
}

/* Sparkles - Twinkling */
.sparkle {
  animation: sparkle 2s ease-in-out infinite;
  opacity: 0;
}

.sparkle-1 { animation-delay: 0s; }
.sparkle-2 { animation-delay: 0.4s; }
.sparkle-3 { animation-delay: 0.8s; }
.sparkle-4 { animation-delay: 1.2s; }
.sparkle-5 { animation-delay: 1.6s; }

@keyframes sparkle {
  0%, 100% {
    opacity: 0;
    transform: scale(0) rotate(0deg);
  }
  50% {
    opacity: 1;
    transform: scale(1.2) rotate(180deg);
  }
}

/* Shield - Protective Glow */
.shield {
  animation: shieldGlow 2s ease-in-out infinite;
  transform-origin: 100px 188px;
}

@keyframes shieldGlow {
  0%, 100% {
    filter: drop-shadow(0 0 0 rgba(16, 185, 129, 0));
    transform: scale(1);
  }
  50% {
    filter: drop-shadow(0 0 8px rgba(16, 185, 129, 0.6));
    transform: scale(1.05);
  }
}
</style>
