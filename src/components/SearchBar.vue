<template>
  <div class="search-bar">
    <div class="search-input-wrapper">
      <span class="search-icon">🔍</span>
      <input
        v-model="searchQuery"
        type="text"
        :placeholder="placeholder"
        class="search-input"
        @input="handleSearch"
        @keydown.enter="handleEnter"
        @keydown.esc="clearSearch"
      />
      <button
        v-if="searchQuery"
        @click="clearSearch"
        class="clear-btn"
      >
        ✕
      </button>
    </div>

    <div v-if="showResults && results.length > 0" class="search-results">
      <div
        v-for="result in results"
        :key="result.id"
        @click="selectResult(result)"
        class="search-result-item"
      >
        <span class="result-icon">{{ result.icon || '📄' }}</span>
        <div class="result-content">
          <div class="result-title" v-html="highlightMatch(result.title)"></div>
          <div v-if="result.description" class="result-description">
            {{ result.description }}
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="showResults && searchQuery && results.length === 0" class="no-results">
      <p>🔍 Keine Ergebnisse gefunden</p>
      <p class="hint">Versuche andere Suchbegriffe</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

export interface SearchResult {
  id: string
  title: string
  description?: string
  icon?: string
  data?: any
}

interface Props {
  placeholder?: string
  debounceMs?: number
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Suchen...',
  debounceMs: 300
})

const emit = defineEmits<{
  (e: 'search', query: string): void
  (e: 'select', result: SearchResult): void
  (e: 'clear'): void
}>()

const searchQuery = ref('')
const results = ref<SearchResult[]>([])
const showResults = ref(false)
let debounceTimer: NodeJS.Timeout | null = null

const handleSearch = () => {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }

  debounceTimer = setTimeout(() => {
    if (searchQuery.value.trim()) {
      emit('search', searchQuery.value)
      showResults.value = true
    } else {
      showResults.value = false
      results.value = []
    }
  }, props.debounceMs)
}

const handleEnter = () => {
  if (results.value.length > 0) {
    selectResult(results.value[0])
  }
}

const selectResult = (result: SearchResult) => {
  emit('select', result)
  searchQuery.value = result.title
  showResults.value = false
}

const clearSearch = () => {
  searchQuery.value = ''
  results.value = []
  showResults.value = false
  emit('clear')
}

const highlightMatch = (text: string): string => {
  if (!searchQuery.value) return text

  const regex = new RegExp(`(${searchQuery.value})`, 'gi')
  return text.replace(regex, '<mark>$1</mark>')
}

const setResults = (newResults: SearchResult[]) => {
  results.value = newResults
}

defineExpose({
  setResults,
  clearSearch
})
</script>

<style scoped>
.search-bar {
  position: relative;
  width: 100%;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 0 1rem;
  transition: all 0.2s;
}

.search-input-wrapper:focus-within {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.search-icon {
  font-size: 1.25rem;
  margin-right: 0.75rem;
}

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  color: #e2e8f0;
  padding: 0.875rem 0;
  font-size: 0.9375rem;
}

.search-input:focus {
  outline: none;
}

.search-input::placeholder {
  color: #64748b;
}

.clear-btn {
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0 0.25rem;
  transition: color 0.2s;
}

.clear-btn:hover {
  color: #e2e8f0;
}

.search-results {
  position: absolute;
  top: calc(100% + 0.5rem);
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  max-height: 400px;
  overflow-y: auto;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  z-index: 1000;
}

.search-result-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  cursor: pointer;
  transition: background 0.2s;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.search-result-item:last-child {
  border-bottom: none;
}

.search-result-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.result-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.result-content {
  flex: 1;
  min-width: 0;
}

.result-title {
  color: #e2e8f0;
  font-weight: 600;
  font-size: 0.9375rem;
  margin-bottom: 0.25rem;
}

.result-title :deep(mark) {
  background: rgba(102, 126, 234, 0.4);
  color: #a5b4fc;
  padding: 0 0.25rem;
  border-radius: 2px;
}

.result-description {
  color: #94a3b8;
  font-size: 0.8125rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.no-results {
  position: absolute;
  top: calc(100% + 0.5rem);
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  z-index: 1000;
}

.no-results p {
  color: #94a3b8;
  margin: 0.5rem 0;
}

.no-results .hint {
  font-size: 0.875rem;
  color: #64748b;
}
</style>
