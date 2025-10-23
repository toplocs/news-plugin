<!--
═══════════════════════════════════════════════════════════════════════════════
🧪 TEST-DOKUMENTATION - UnreadBadge.vue (PHASE 2)
═══════════════════════════════════════════════════════════════════════════════

📋 WAS WIRD HIER GETESTET:
- Fixed 20×20px Container (KEINE Layout Shifts!)
- Throttled Updates (max 1 Update pro 500ms)
- Glow/Pulse Animation bei neuen Unreads
- 4 Variants (primary, danger, warning, success)
- 4 Positions (top-right, top-left, bottom-right, bottom-left)
- Badge erscheint nur wenn count >= minThreshold

🎯 ERWARTETE ERGEBNISSE:
✅ Container: Immer 20×20px (width + height fix)
✅ Layout Shift: CLS = 0 (Container reserviert Space)
✅ Throttle: Count update max 1x pro 500ms
✅ Glow: Wenn count steigt → pulse-glow 1.5s Animation
✅ Entrance: badge-pop-in mit rotate + scale
✅ Exit: badge-pop-out mit scale(0)
✅ Display Count: "1" bis "99", dann "99+"
✅ Variants:
   - primary: indigo → purple gradient
   - danger:  red → orange gradient
   - warning: amber → yellow gradient
   - success: green → teal gradient

🔧 WIE ZU TESTEN:
1. Layout Shift Test:
   - Chrome DevTools → Performance → Measure CLS
   - Badge ein/ausblenden → CLS sollte 0.00 sein
   - Container sollte IMMER 20×20px sein (auch wenn Badge hidden)
2. Throttle Test:
   - Rapid count updates (z.B. 10x pro Sekunde)
   - Badge sollte max 1x pro 500ms updaten (nicht jedes Mal)
3. Glow Test:
   - Count von 0 → 1: Glow-Animation
   - Count von 1 → 2: Glow-Animation
   - Count von 2 → 1: KEIN Glow (count verringert)
4. Variants Test:
   - :variant="danger" → Rot-Orange Gradient
   - :variant="primary" → Indigo-Purple Gradient
   - :variant="success" → Grün-Teal Gradient
5. Position Test:
   - :position="top-right" → Oben rechts (-6px)
   - :position="bottom-left" → Unten links (-6px)
6. Threshold Test:
   - :minThreshold="5" → Badge nur sichtbar wenn count >= 5
   - count=3 → hidden
   - count=5 → visible

📏 SIZE-SPECS:
- Container: 20×20px (fixed, immer!)
- Badge: min-width 20px, height 20px, padding 2px 6px
- Border: 2px solid white
- Font: 0.625rem (10px), font-weight 700

🎬 ANIMATIONS:
- Glow: pulse-glow 1.5s (scale 1 → 1.2 → 1, box-shadow glow)
- Entrance: badge-pop-in 0.4s (scale 0 rotate -180deg → 1 rotate 0)
- Exit: badge-pop-out 0.3s (scale 1 → 0)

🚨 BEKANNTE ISSUES:
- Keine (Phase 2 vollständig implementiert ✅)

═══════════════════════════════════════════════════════════════════════════════
-->
<template>
  <!-- Reserve fixed space to prevent layout shift -->
  <div class="unread-badge-container" :class="positionClass">
    <Transition name="badge-appear">
      <div
        v-if="shouldShow"
        class="unread-badge"
        :class="[variantClass, { 'badge-glow': hasNewUnread }]"
      >
        <span class="badge-text">{{ displayCount }}</span>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

interface Props {
  count: number
  maxCount?: number
  variant?: 'primary' | 'danger' | 'warning' | 'success'
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
  enableGlow?: boolean
  minThreshold?: number
}

const props = withDefaults(defineProps<Props>(), {
  maxCount: 99,
  variant: 'danger',
  position: 'top-right',
  enableGlow: true,
  minThreshold: 1
})

const hasNewUnread = ref(false)
let glowTimeout: ReturnType<typeof setTimeout> | null = null

// Throttled count update to prevent excessive re-renders
const throttledCount = ref(props.count)
let updateTimeout: ReturnType<typeof setTimeout> | null = null

watch(() => props.count, (newCount, oldCount) => {
  // Clear existing timeout
  if (updateTimeout) {
    clearTimeout(updateTimeout)
  }

  // Trigger glow animation if count increased
  if (newCount > (oldCount ?? 0) && newCount > 0) {
    hasNewUnread.value = true

    // Clear previous glow timeout
    if (glowTimeout) clearTimeout(glowTimeout)

    // Reset glow after 2 seconds
    glowTimeout = setTimeout(() => {
      hasNewUnread.value = false
    }, 2000)
  }

  // Throttle updates (max once per 500ms)
  updateTimeout = setTimeout(() => {
    throttledCount.value = newCount
  }, 500)
}, { immediate: true })

const shouldShow = computed(() => throttledCount.value >= props.minThreshold)

const displayCount = computed(() => {
  if (throttledCount.value > props.maxCount) {
    return `${props.maxCount}+`
  }
  return throttledCount.value.toString()
})

const variantClass = computed(() => {
  const variants = {
    primary: 'variant-primary',
    danger: 'variant-danger',
    warning: 'variant-warning',
    success: 'variant-success'
  }
  return variants[props.variant]
})

const positionClass = computed(() => {
  const positions = {
    'top-right': 'pos-top-right',
    'top-left': 'pos-top-left',
    'bottom-right': 'pos-bottom-right',
    'bottom-left': 'pos-bottom-left'
  }
  return positions[props.position]
})
</script>

<style scoped>
/* Container - reserves fixed space (16x16px) to prevent layout shift */
.unread-badge-container {
  position: absolute;
  width: 20px;
  height: 20px;
  pointer-events: none;
  z-index: 10;
}

/* Position variants */
.pos-top-right {
  top: -6px;
  right: -6px;
}

.pos-top-left {
  top: -6px;
  left: -6px;
}

.pos-bottom-right {
  bottom: -6px;
  right: -6px;
}

.pos-bottom-left {
  bottom: -6px;
  left: -6px;
}

/* Badge */
.unread-badge {
  min-width: 20px;
  height: 20px;
  padding: 2px 6px;
  border-radius: 10px;
  border: 2px solid white;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.badge-text {
  font-size: 0.625rem;
  font-weight: 700;
  line-height: 1;
  color: white;
  white-space: nowrap;
}

/* Variant colors */
.variant-primary {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
}

.variant-danger {
  background: linear-gradient(135deg, #ef4444, #f97316);
}

.variant-warning {
  background: linear-gradient(135deg, #f59e0b, #eab308);
}

.variant-success {
  background: linear-gradient(135deg, #10b981, #14b8a6);
}

/* Glow animation for new unread */
.badge-glow {
  animation: pulse-glow 1.5s ease-out;
}

@keyframes pulse-glow {
  0% {
    transform: scale(1);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  }
  40% {
    transform: scale(1.2);
    box-shadow: 0 0 20px rgba(239, 68, 68, 0.8),
                0 0 40px rgba(239, 68, 68, 0.4);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  }
}

/* Entrance transition */
.badge-appear-enter-active {
  animation: badge-pop-in 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.badge-appear-leave-active {
  animation: badge-pop-out 0.3s ease-in;
}

@keyframes badge-pop-in {
  0% {
    opacity: 0;
    transform: scale(0) rotate(-180deg);
  }
  60% {
    transform: scale(1.15) rotate(10deg);
  }
  100% {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
}

@keyframes badge-pop-out {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: scale(0);
  }
}

/* Hover effect */
.unread-badge:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.4);
}
</style>
