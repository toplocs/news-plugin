<template>
  <div
    class="absolute -top-1 -right-1 min-w-[20px] h-5 flex items-center justify-center px-1.5 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full border-2 border-white shadow-lg animate-badge-pulse"
  >
    <span class="text-[10px] font-bold text-white leading-none">
      {{ displayCount }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  count: number
}>()

const displayCount = computed(() => {
  return props.count > 99 ? '99+' : props.count.toString()
})
</script>

<style scoped>
@keyframes badge-pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.9;
  }
}

.animate-badge-pulse {
  animation: badge-pulse 2s ease-in-out infinite;
}
</style>
