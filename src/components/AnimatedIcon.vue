<template>
  <div class="animated-icon" :class="[`animation-${animation}`, `size-${size}`]">
    <div class="icon-wrapper">
      <slot>
        <!-- Default slot for custom content -->
        <span class="default-icon">{{ icon }}</span>
      </slot>
    </div>

    <!-- Optional particle effects -->
    <div v-if="particles" class="particles">
      <span v-for="i in particleCount" :key="i" class="particle" :style="getParticleStyle(i)"></span>
    </div>

    <!-- Optional glow effect -->
    <div v-if="glow" class="glow-effect"></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  icon?: string
  animation?: 'bounce' | 'pulse' | 'spin' | 'float' | 'swing' | 'shake' | 'tada' | 'heartbeat' | 'wave' | 'wiggle'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  particles?: boolean
  particleCount?: number
  glow?: boolean
}>(), {
  icon: '✨',
  animation: 'bounce',
  size: 'md',
  particles: false,
  particleCount: 6,
  glow: false
})

const getParticleStyle = (index: number) => {
  const angle = (360 / props.particleCount) * index
  const distance = 40
  const x = Math.cos((angle * Math.PI) / 180) * distance
  const y = Math.sin((angle * Math.PI) / 180) * distance

  return {
    '--particle-x': `${x}px`,
    '--particle-y': `${y}px`,
    '--particle-delay': `${index * 0.1}s`
  }
}
</script>

<style scoped>
.animated-icon {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.icon-wrapper {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
}

.default-icon {
  display: block;
  line-height: 1;
}

/* Size Variants */
.size-sm .default-icon {
  font-size: 2rem;
}

.size-md .default-icon {
  font-size: 3rem;
}

.size-lg .default-icon {
  font-size: 4rem;
}

.size-xl .default-icon {
  font-size: 6rem;
}

/* Animation: Bounce */
.animation-bounce .icon-wrapper {
  animation: bounce 2s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-15px);
  }
}

/* Animation: Pulse */
.animation-pulse .icon-wrapper {
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
}

/* Animation: Spin */
.animation-spin .icon-wrapper {
  animation: spin 3s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Animation: Float */
.animation-float .icon-wrapper {
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) translateX(0);
  }
  25% {
    transform: translateY(-10px) translateX(5px);
  }
  50% {
    transform: translateY(-5px) translateX(-5px);
  }
  75% {
    transform: translateY(-12px) translateX(3px);
  }
}

/* Animation: Swing */
.animation-swing .icon-wrapper {
  transform-origin: top center;
  animation: swing 2s ease-in-out infinite;
}

@keyframes swing {
  0%, 100% {
    transform: rotate(0deg);
  }
  20% {
    transform: rotate(15deg);
  }
  40% {
    transform: rotate(-10deg);
  }
  60% {
    transform: rotate(5deg);
  }
  80% {
    transform: rotate(-5deg);
  }
}

/* Animation: Shake */
.animation-shake .icon-wrapper {
  animation: shake 3s ease-in-out infinite;
}

@keyframes shake {
  0%, 100% {
    transform: translateX(0);
  }
  10%, 30%, 50%, 70%, 90% {
    transform: translateX(-5px);
  }
  20%, 40%, 60%, 80% {
    transform: translateX(5px);
  }
}

/* Animation: Tada */
.animation-tada .icon-wrapper {
  animation: tada 2s ease-in-out infinite;
}

@keyframes tada {
  0%, 100% {
    transform: scale(1) rotate(0deg);
  }
  10%, 20% {
    transform: scale(0.9) rotate(-3deg);
  }
  30%, 50%, 70%, 90% {
    transform: scale(1.1) rotate(3deg);
  }
  40%, 60%, 80% {
    transform: scale(1.1) rotate(-3deg);
  }
}

/* Animation: Heartbeat */
.animation-heartbeat .icon-wrapper {
  animation: heartbeat 1.5s ease-in-out infinite;
}

@keyframes heartbeat {
  0%, 100% {
    transform: scale(1);
  }
  14% {
    transform: scale(1.3);
  }
  28% {
    transform: scale(1);
  }
  42% {
    transform: scale(1.3);
  }
  56% {
    transform: scale(1);
  }
}

/* Animation: Wave */
.animation-wave .icon-wrapper {
  animation: wave 2s ease-in-out infinite;
}

@keyframes wave {
  0%, 100% {
    transform: rotate(0deg);
  }
  10%, 30% {
    transform: rotate(14deg);
  }
  20%, 40% {
    transform: rotate(-8deg);
  }
  50%, 70% {
    transform: rotate(14deg);
  }
  60%, 80% {
    transform: rotate(-4deg);
  }
}

/* Animation: Wiggle */
.animation-wiggle .icon-wrapper {
  animation: wiggle 2.5s ease-in-out infinite;
}

@keyframes wiggle {
  0%, 100% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(5deg);
  }
  50% {
    transform: rotate(-5deg);
  }
  75% {
    transform: rotate(3deg);
  }
}

/* Particle Effects */
.particles {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  pointer-events: none;
  z-index: 1;
}

.particle {
  position: absolute;
  width: 6px;
  height: 6px;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.8), rgba(139, 92, 246, 0.4));
  border-radius: 50%;
  animation: particleFloat 2s ease-in-out infinite;
  animation-delay: var(--particle-delay, 0s);
}

@keyframes particleFloat {
  0%, 100% {
    transform: translate(0, 0);
    opacity: 0;
  }
  20% {
    opacity: 1;
  }
  80% {
    opacity: 0.6;
  }
  100% {
    transform: translate(var(--particle-x, 0), var(--particle-y, 0));
    opacity: 0;
  }
}

/* Glow Effect */
.glow-effect {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  height: 100%;
  transform: translate(-50%, -50%);
  background: radial-gradient(circle, rgba(99, 102, 241, 0.3), transparent 70%);
  border-radius: 50%;
  animation: glow 2s ease-in-out infinite;
  pointer-events: none;
  z-index: 0;
}

@keyframes glow {
  0%, 100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.5;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.2);
    opacity: 0.8;
  }
}

/* Hover Effects (optional enhancement) */
.animated-icon:hover .icon-wrapper {
  animation-duration: 0.8s;
}

.animated-icon:hover .particle {
  animation-duration: 1.5s;
}
</style>
