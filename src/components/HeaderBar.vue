<template>
  <header class="sticky top-0 z-50 bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 shadow-2xl border-b border-white/10">
    <div class="container mx-auto px-4 py-4">
      <div class="flex items-center justify-between gap-4">
        <!-- Left: Title & Badge -->
        <div class="flex items-center gap-3">
          <div class="text-3xl">📰</div>
          <div>
            <h1 class="text-xl md:text-2xl font-bold text-white">
              {{ title }}
            </h1>
            <p class="text-xs text-indigo-100">Stay informed, stay connected</p>
          </div>
        </div>

        <!-- Center: Search (Desktop) -->
        <div class="hidden md:flex flex-1 max-w-xl mx-4">
          <div class="relative w-full">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search news articles..."
              @input="handleSearch"
              class="w-full px-4 py-2.5 pl-12 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-indigo-200 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
            />
            <svg
              class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        <!-- Right: Actions -->
        <div class="flex items-center gap-2">
          <!-- Notifications Panel -->
          <NotificationPanel @notification-click="handleNotificationClick" />

          <!-- Refresh -->
          <button
            @click="$emit('refresh')"
            :disabled="isRefreshing"
            class="p-2.5 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50 group"
          >
            <svg
              class="w-6 h-6 text-white transition-transform"
              :class="{ 'animate-spin': isRefreshing, 'group-hover:rotate-180': !isRefreshing }"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>

          <!-- Settings -->
          <button
            @click="$emit('settings')"
            class="p-2.5 hover:bg-white/10 rounded-lg transition-colors group"
          >
            <svg
              class="w-6 h-6 text-white group-hover:rotate-90 transition-transform duration-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- Mobile Search -->
      <div v-if="showMobileSearch" class="md:hidden mt-3">
        <div class="relative">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search..."
            @input="handleSearch"
            class="w-full px-4 py-2 pl-10 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-indigo-200 focus:outline-none focus:ring-2 focus:ring-white/30"
          />
          <svg
            class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-200"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import NotificationPanel from './NotificationPanel.vue'

defineProps<{
  title: string
  unreadCount?: number
}>()

const emit = defineEmits<{
  search: [query: string]
  refresh: []
  settings: []
  'notification-click': [notification: any]
}>()

const searchQuery = ref('')
const isRefreshing = ref(false)
const showMobileSearch = ref(true)

let debounceTimer: ReturnType<typeof setTimeout> | null = null

const handleSearch = () => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    emit('search', searchQuery.value)
  }, 300)
}

const handleNotificationClick = (notification: any) => {
  emit('notification-click', notification)
  console.log('Notification clicked:', notification)
}
</script>
