<template>
  <div class="p-4 space-y-4">
    <h3 class="text-lg font-semibold text-slate-100">📰 News Feed</h3>
    <p class="text-sm text-slate-400">
      Local news for this {{ isLocation ? 'location' : 'topic' }}
    </p>

    <div class="space-y-2">
      <div
        v-for="item in newsItems"
        :key="item.id"
        class="p-3 bg-slate-800/50 rounded-lg hover:bg-slate-800/70 transition-colors cursor-pointer"
      >
        <h4 class="text-sm font-medium text-slate-100">{{ item.title }}</h4>
        <p class="text-xs text-slate-400 mt-1">{{ item.summary }}</p>
        <span class="text-xs text-slate-500 mt-1 block">{{ item.source }}</span>
      </div>
    </div>

    <button
      class="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors text-sm font-medium"
    >
      View All News
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

defineOptions({
  name: 'NewsInfoSidebar'
})

const props = defineProps({
  parentId: String,
  entity: String
})

const isLocation = computed(() => props.entity === 'Location')

// Placeholder news items
const newsItems = ref([
  {
    id: '1',
    title: 'Local Community Event Next Week',
    summary: 'Join us for the annual community gathering...',
    source: 'Community News'
  },
  {
    id: '2',
    title: 'New Park Opening Downtown',
    summary: 'City announces new green space initiative...',
    source: 'City Herald'
  }
])

console.log('NewsInfoSidebar instance:', props.parentId, props.entity)
</script>
