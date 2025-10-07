<template>
  <nav class="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-lg border-t border-slate-700/50 shadow-2xl md:hidden">
    <div class="flex items-center justify-around py-3 px-4">
      <!-- Feed -->
      <button
        @click="$emit('update:view', 'feed')"
        :class="activeView === 'feed' ? 'text-indigo-400' : 'text-slate-400'"
        class="flex flex-col items-center gap-1 transition-colors"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
        <span class="text-xs font-medium">Feed</span>
      </button>

      <!-- Filters -->
      <button
        @click="$emit('update:view', 'filters')"
        :class="activeView === 'filters' ? 'text-indigo-400' : 'text-slate-400'"
        class="flex flex-col items-center gap-1 transition-colors"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        <span class="text-xs font-medium">Filters</span>
      </button>

      <!-- Discover -->
      <button
        @click="$emit('update:view', 'discover')"
        :class="activeView === 'discover' ? 'text-indigo-400' : 'text-slate-400'"
        class="flex flex-col items-center gap-1 transition-colors"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <span class="text-xs font-medium">Discover</span>
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">
defineProps<{
  activeView: 'feed' | 'filters' | 'discover'
}>()

defineEmits<{
  'update:view': [view: 'feed' | 'filters' | 'discover']
}>()
</script>
