<template>
  <div class="transparency-illustration" :style="{ width: size, height: size }">
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Eye Shape -->
      <g class="eye">
        <ellipse cx="100" cy="100" rx="60" ry="40" fill="url(#eyeGradient)" />
        <circle cx="100" cy="100" r="25" fill="url(#irisGradient)" class="iris" />
        <circle cx="100" cy="100" r="12" fill="#1e293b" class="pupil" />
        <circle cx="106" cy="94" r="5" fill="white" opacity="0.8" />
      </g>

      <!-- Rays emanating from eye -->
      <g class="rays">
        <line x1="100" y1="60" x2="100" y2="30" stroke="url(#rayGradient)" stroke-width="2" stroke-linecap="round" class="ray ray-1" />
        <line x1="130" y1="70" x2="150" y2="50" stroke="url(#rayGradient)" stroke-width="2" stroke-linecap="round" class="ray ray-2" />
        <line x1="145" y1="100" x2="175" y2="100" stroke="url(#rayGradient)" stroke-width="2" stroke-linecap="round" class="ray ray-3" />
        <line x1="130" y1="130" x2="150" y2="150" stroke="url(#rayGradient)" stroke-width="2" stroke-linecap="round" class="ray ray-4" />
        <line x1="100" y1="140" x2="100" y2="170" stroke="url(#rayGradient)" stroke-width="2" stroke-linecap="round" class="ray ray-5" />
        <line x1="70" y1="130" x2="50" y2="150" stroke="url(#rayGradient)" stroke-width="2" stroke-linecap="round" class="ray ray-6" />
        <line x1="55" y1="100" x2="25" y2="100" stroke="url(#rayGradient)" stroke-width="2" stroke-linecap="round" class="ray ray-7" />
        <line x1="70" y1="70" x2="50" y2="50" stroke="url(#rayGradient)" stroke-width="2" stroke-linecap="round" class="ray ray-8" />
      </g>

      <!-- Checkmark overlay -->
      <g class="checkmark">
        <circle cx="140" cy="60" r="20" fill="#10b981" opacity="0.9" />
        <path d="M132 60 L138 66 L148 54" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
      </g>

      <!-- Gradients -->
      <defs>
        <linearGradient id="eyeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#6366f1;stop-opacity:0.3" />
          <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:0.5" />
        </linearGradient>
        <radialGradient id="irisGradient">
          <stop offset="0%" style="stop-color:#a5b4fc;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
        </radialGradient>
        <linearGradient id="rayGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:#6366f1;stop-opacity:0.8" />
          <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:0.4" />
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
.transparency-illustration {
  display: inline-block;
}

.eye {
  animation: blink 4s ease-in-out infinite;
}

@keyframes blink {
  0%, 45%, 55%, 100% {
    transform: scaleY(1);
  }
  50% {
    transform: scaleY(0.1);
  }
}

.iris {
  animation: irisMove 3s ease-in-out infinite;
  transform-origin: center;
}

@keyframes irisMove {
  0%, 100% {
    transform: translate(0, 0);
  }
  25% {
    transform: translate(3px, -2px);
  }
  50% {
    transform: translate(-2px, 2px);
  }
  75% {
    transform: translate(2px, -1px);
  }
}

.pupil {
  animation: pupilPulse 2s ease-in-out infinite;
}

@keyframes pupilPulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.rays .ray {
  animation: rayGlow 2s ease-in-out infinite;
  opacity: 0;
}

.ray-1 { animation-delay: 0s; }
.ray-2 { animation-delay: 0.15s; }
.ray-3 { animation-delay: 0.3s; }
.ray-4 { animation-delay: 0.45s; }
.ray-5 { animation-delay: 0.6s; }
.ray-6 { animation-delay: 0.75s; }
.ray-7 { animation-delay: 0.9s; }
.ray-8 { animation-delay: 1.05s; }

@keyframes rayGlow {
  0%, 100% {
    opacity: 0;
    stroke-dashoffset: 30;
  }
  50% {
    opacity: 1;
    stroke-dashoffset: 0;
  }
}

.checkmark {
  animation: checkmarkPop 3s ease-in-out infinite;
}

@keyframes checkmarkPop {
  0%, 70%, 100% {
    transform: scale(0);
    opacity: 0;
  }
  75%, 95% {
    transform: scale(1);
    opacity: 1;
  }
  85% {
    transform: scale(1.1);
  }
}
</style>
