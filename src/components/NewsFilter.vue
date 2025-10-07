<template>
  <div class="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 space-y-4">
    <div class="flex items-center justify-between">
      <h3 class="text-sm font-semibold text-slate-100">Filters</h3>
      <button
        v-if="hasActiveFilters"
        @click="clearFilters"
        class="text-xs text-indigo-400 hover:text-indigo-300"
      >
        Clear all
      </button>
    </div>

    <!-- Search -->
    <div>
      <label class="block text-xs font-medium text-slate-300 mb-1">
        Search
      </label>
      <input
        v-model="localFilter.search"
        type="text"
        placeholder="Search articles..."
        class="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
        @input="debouncedUpdate"
      />
    </div>

    <!-- Sources -->
    <div>
      <label class="block text-xs font-medium text-slate-300 mb-2">
        Sources
      </label>
      <div class="space-y-1">
        <label
          v-for="source in availableSources"
          :key="source.id"
          class="flex items-center gap-2 text-sm text-slate-300 hover:text-slate-100 cursor-pointer"
        >
          <input
            type="checkbox"
            :checked="localFilter.sources?.includes(source.id)"
            @change="toggleSource(source.id)"
            class="rounded border-slate-600 text-indigo-600 focus:ring-indigo-500"
          />
          <span>{{ source.name }}</span>
        </label>
      </div>
    </div>

    <!-- Date Range -->
    <div>
      <label class="block text-xs font-medium text-slate-300 mb-2">
        Date Range
      </label>
      <div class="grid grid-cols-2 gap-2">
        <input
          v-model="dateFrom"
          type="date"
          class="px-2 py-1 bg-slate-900/50 border border-slate-700 rounded text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
          @change="updateDateFilter"
        />
        <input
          v-model="dateTo"
          type="date"
          class="px-2 py-1 bg-slate-900/50 border border-slate-700 rounded text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
          @change="updateDateFilter"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { NewsFilter } from '../types'

const props = defineProps<{
  filter: NewsFilter
  availableSources?: { id: string; name: string }[]
}>()

const emit = defineEmits<{
  'update:filter': [filter: NewsFilter]
}>()

const localFilter = ref<NewsFilter>({ ...props.filter })
const dateFrom = ref('')
const dateTo = ref('')

// Debounce timer
let debounceTimer: ReturnType<typeof setTimeout> | null = null

const hasActiveFilters = computed(() => {
  return !!(
    localFilter.value.search ||
    localFilter.value.sources?.length ||
    localFilter.value.dateFrom ||
    localFilter.value.dateTo
  )
})

const debouncedUpdate = () => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    emit('update:filter', localFilter.value)
  }, 300)
}

const toggleSource = (sourceId: string) => {
  if (!localFilter.value.sources) {
    localFilter.value.sources = []
  }

  const index = localFilter.value.sources.indexOf(sourceId)
  if (index > -1) {
    localFilter.value.sources.splice(index, 1)
  } else {
    localFilter.value.sources.push(sourceId)
  }

  emit('update:filter', localFilter.value)
}

const updateDateFilter = () => {
  if (dateFrom.value) {
    localFilter.value.dateFrom = new Date(dateFrom.value).getTime()
  } else {
    delete localFilter.value.dateFrom
  }

  if (dateTo.value) {
    localFilter.value.dateTo = new Date(dateTo.value).getTime()
  } else {
    delete localFilter.value.dateTo
  }

  emit('update:filter', localFilter.value)
}

const clearFilters = () => {
  localFilter.value = {}
  dateFrom.value = ''
  dateTo.value = ''
  emit('update:filter', localFilter.value)
}

// Watch for external filter changes
watch(
  () => props.filter,
  (newFilter) => {
    localFilter.value = { ...newFilter }
  },
  { deep: true }
)
</script>
