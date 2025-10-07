<template>
  <div class="max-w-4xl mx-auto p-6 space-y-8">
    <!-- Header -->
    <div>
      <h2 class="text-3xl font-bold text-slate-100 mb-2">News Settings</h2>
      <p class="text-slate-400">Configure your news feed preferences and sources</p>
    </div>

    <!-- Success Message -->
    <div v-if="saveSuccess" class="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
      <p class="text-green-400 text-sm">✓ Settings saved successfully</p>
    </div>

    <!-- Error Message -->
    <div v-if="saveError" class="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
      <p class="text-red-400 text-sm">{{ saveError }}</p>
    </div>

    <!-- General Settings -->
    <section class="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 space-y-6">
      <h3 class="text-xl font-semibold text-slate-100 flex items-center gap-2">
        <span>⚙️</span>
        <span>General Settings</span>
      </h3>

      <!-- Location Radius -->
      <div>
        <label class="block text-sm font-medium text-slate-100 mb-3">
          Search Radius
        </label>
        <div class="space-y-2">
          <input
            v-model="localSettings.radius"
            type="range"
            min="1"
            max="100"
            class="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          >
          <div class="flex justify-between text-sm">
            <span class="text-slate-400">{{ localSettings.radius }} km</span>
            <span class="text-slate-500">Maximum news distance</span>
          </div>
        </div>
      </div>

      <!-- Show Images -->
      <div class="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg">
        <div>
          <label class="text-sm font-medium text-slate-100">Show Images</label>
          <p class="text-xs text-slate-400 mt-1">Display article preview images</p>
        </div>
        <label class="relative inline-flex items-center cursor-pointer">
          <input
            v-model="localSettings.showImages"
            type="checkbox"
            class="sr-only peer"
          >
          <div class="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
        </label>
      </div>

      <!-- Auto Refresh -->
      <div class="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg">
        <div>
          <label class="text-sm font-medium text-slate-100">Auto Refresh</label>
          <p class="text-xs text-slate-400 mt-1">Automatically fetch new articles</p>
        </div>
        <label class="relative inline-flex items-center cursor-pointer">
          <input
            v-model="localSettings.autoRefresh"
            type="checkbox"
            class="sr-only peer"
          >
          <div class="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
        </label>
      </div>

      <!-- Refresh Interval -->
      <div v-if="localSettings.autoRefresh">
        <label class="block text-sm font-medium text-slate-100 mb-2">
          Refresh Interval
        </label>
        <select
          v-model="localSettings.refreshInterval"
          class="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-indigo-500"
        >
          <option :value="60000">1 minute</option>
          <option :value="300000">5 minutes</option>
          <option :value="600000">10 minutes</option>
          <option :value="1800000">30 minutes</option>
          <option :value="3600000">1 hour</option>
        </select>
      </div>

      <!-- Notifications -->
      <div class="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg">
        <div>
          <label class="text-sm font-medium text-slate-100">Notifications</label>
          <p class="text-xs text-slate-400 mt-1">Get notified about breaking news</p>
        </div>
        <label class="relative inline-flex items-center cursor-pointer">
          <input
            v-model="localSettings.notificationsEnabled"
            type="checkbox"
            class="sr-only peer"
          >
          <div class="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
        </label>
      </div>
    </section>

    <!-- News Sources -->
    <section class="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 space-y-4">
      <h3 class="text-xl font-semibold text-slate-100 flex items-center gap-2">
        <span>📰</span>
        <span>News Sources</span>
      </h3>

      <div class="space-y-2">
        <label
          v-for="source in availableSources"
          :key="source.id"
          class="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg hover:bg-slate-900/70 transition-colors cursor-pointer"
        >
          <div class="flex items-center gap-3">
            <input
              type="checkbox"
              :checked="localSettings.sources.includes(source.id)"
              @change="toggleSource(source.id)"
              class="w-4 h-4 text-indigo-600 bg-slate-700 border-slate-600 rounded focus:ring-indigo-500"
            >
            <div>
              <span class="text-sm font-medium text-slate-100">{{ source.name }}</span>
              <p class="text-xs text-slate-400">{{ source.url }}</p>
            </div>
          </div>
          <span
            class="px-2 py-1 text-xs rounded-full"
            :class="source.enabled ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-400'"
          >
            {{ source.enabled ? 'Active' : 'Inactive' }}
          </span>
        </label>
      </div>
    </section>

    <!-- Interest Tags -->
    <section class="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 space-y-4">
      <h3 class="text-xl font-semibold text-slate-100 flex items-center gap-2">
        <span>🎯</span>
        <span>Interest Tags</span>
      </h3>

      <p class="text-sm text-slate-400">
        Select topics you're interested in to personalize your news feed
      </p>

      <div class="flex flex-wrap gap-2">
        <button
          v-for="tag in availableTags"
          :key="tag"
          @click="toggleInterest(tag)"
          class="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200"
          :class="localSettings.interests.includes(tag)
            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'"
        >
          {{ tag }}
        </button>
      </div>

      <!-- Custom Tag Input -->
      <div class="flex gap-2">
        <input
          v-model="newTag"
          @keyup.enter="addCustomTag"
          type="text"
          placeholder="Add custom tag..."
          class="flex-1 px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
        >
        <button
          @click="addCustomTag"
          class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors text-sm font-medium"
        >
          Add
        </button>
      </div>
    </section>

    <!-- Save Button -->
    <div class="flex justify-end gap-4">
      <button
        @click="resetSettings"
        class="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors font-medium"
      >
        Reset to Default
      </button>
      <button
        @click="saveSettings"
        :disabled="saving"
        class="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg transition-all duration-200 font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ saving ? 'Saving...' : 'Save Settings' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useNewsStore } from '../../stores/useNewsStore'
import { newsService } from '../../services/newsService'
import type { NewsSettings } from '../../types'

defineOptions({
  name: 'NewsSettingsContent'
})

const props = defineProps<{
  parentId?: string
  entity?: string
}>()

const store = useNewsStore()
const saving = ref(false)
const saveSuccess = ref(false)
const saveError = ref<string | null>(null)
const newTag = ref('')

const localSettings = ref<NewsSettings>({
  radius: 10,
  sources: ['local', 'community'],
  interests: [],
  autoRefresh: true,
  refreshInterval: 300000,
  showImages: true,
  notificationsEnabled: false
})

const availableSources = computed(() => newsService.getSources())

const availableTags = [
  'technology',
  'community',
  'events',
  'business',
  'sports',
  'arts',
  'education',
  'health',
  'politics',
  'environment'
]

const toggleSource = (sourceId: string) => {
  const index = localSettings.value.sources.indexOf(sourceId)
  if (index > -1) {
    localSettings.value.sources.splice(index, 1)
  } else {
    localSettings.value.sources.push(sourceId)
  }
}

const toggleInterest = (tag: string) => {
  const index = localSettings.value.interests.indexOf(tag)
  if (index > -1) {
    localSettings.value.interests.splice(index, 1)
  } else {
    localSettings.value.interests.push(tag)
  }
}

const addCustomTag = () => {
  const tag = newTag.value.trim().toLowerCase()
  if (tag && !localSettings.value.interests.includes(tag)) {
    localSettings.value.interests.push(tag)
    newTag.value = ''
  }
}

const saveSettings = async () => {
  saving.value = true
  saveError.value = null
  saveSuccess.value = false

  try {
    await store.updateSettings(props.parentId || 'default', localSettings.value)
    saveSuccess.value = true

    setTimeout(() => {
      saveSuccess.value = false
    }, 3000)
  } catch (err) {
    saveError.value = err instanceof Error ? err.message : 'Failed to save settings'
  } finally {
    saving.value = false
  }
}

const resetSettings = () => {
  localSettings.value = {
    radius: 10,
    sources: ['local', 'community'],
    interests: [],
    autoRefresh: true,
    refreshInterval: 300000,
    showImages: true,
    notificationsEnabled: false
  }
}

onMounted(() => {
  const settings = store.getSettings(props.parentId || 'default')
  localSettings.value = { ...settings }
})
</script>
