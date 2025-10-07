<template>
  <div class="p-6 space-y-6">
    <div>
      <h2 class="text-2xl font-bold text-slate-100 mb-2">News Settings</h2>
      <p class="text-slate-400">Configure your news feed preferences</p>
    </div>

    <div class="space-y-4">
      <!-- Location Radius -->
      <div class="bg-slate-800/50 rounded-lg p-4">
        <label class="block text-sm font-medium text-slate-100 mb-2">
          Search Radius (km)
        </label>
        <input
          v-model="settings.radius"
          type="range"
          min="1"
          max="100"
          class="w-full"
        >
        <span class="text-sm text-slate-400">{{ settings.radius }} km</span>
      </div>

      <!-- News Sources -->
      <div class="bg-slate-800/50 rounded-lg p-4">
        <label class="block text-sm font-medium text-slate-100 mb-2">
          News Sources
        </label>
        <div class="space-y-2">
          <label v-for="source in availableSources" :key="source.id" class="flex items-center space-x-2">
            <input
              type="checkbox"
              :checked="settings.sources.includes(source.id)"
              @change="toggleSource(source.id)"
              class="rounded"
            >
            <span class="text-sm text-slate-100">{{ source.name }}</span>
          </label>
        </div>
      </div>

      <!-- Interest Tags -->
      <div class="bg-slate-800/50 rounded-lg p-4">
        <label class="block text-sm font-medium text-slate-100 mb-2">
          Interest Tags
        </label>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="tag in settings.interests"
            :key="tag"
            class="px-3 py-1 bg-indigo-600 text-white text-xs rounded-full"
          >
            {{ tag }}
          </span>
        </div>
      </div>

      <button
        class="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium"
        @click="saveSettings"
      >
        Save Settings
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineOptions({
  name: 'NewsSettingsContent'
})

const props = defineProps({
  parentId: String,
  entity: String
})

const settings = ref({
  radius: 10,
  sources: ['local', 'community'],
  interests: ['technology', 'community', 'events']
})

const availableSources = [
  { id: 'local', name: 'Local News' },
  { id: 'community', name: 'Community Posts' },
  { id: 'regional', name: 'Regional News' },
  { id: 'national', name: 'National News' }
]

const toggleSource = (sourceId: string) => {
  const index = settings.value.sources.indexOf(sourceId)
  if (index > -1) {
    settings.value.sources.splice(index, 1)
  } else {
    settings.value.sources.push(sourceId)
  }
}

const saveSettings = () => {
  console.log('Saving settings:', settings.value, 'for', props.parentId)
  // TODO: Save to Gun.js
}

console.log('NewsSettingsContent instance:', props.parentId, props.entity)
</script>
