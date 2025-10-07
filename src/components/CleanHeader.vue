<template>
  <header class="clean-header">
    <div class="container">
      <!-- Logo & Title -->
      <div class="brand">
        <span class="logo">📰</span>
        <div class="brand-text">
          <h1>TopLocs News</h1>
          <span class="location">{{ location }}</span>
        </div>
      </div>

      <!-- Search Bar (minimal) -->
      <div class="search-bar">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Suche..."
          @input="handleSearch"
        />
      </div>

      <!-- Actions -->
      <div class="actions">
        <button class="action-btn" @click="$emit('refresh')" title="Aktualisieren">
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
          </svg>
        </button>
        <button class="action-btn" @click="$emit('settings')" title="Einstellungen">
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  location?: string
}>()

const emit = defineEmits<{
  search: [query: string]
  refresh: []
  settings: []
}>()

const searchQuery = ref('')

let debounce: ReturnType<typeof setTimeout>
const handleSearch = () => {
  clearTimeout(debounce)
  debounce = setTimeout(() => {
    emit('search', searchQuery.value)
  }, 300)
}
</script>

<style scoped>
.clean-header {
  background: rgba(15, 23, 42, 0.95);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 50;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1.5rem;
  display: flex;
  align-items: center;
  gap: 2rem;
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 200px;
}

.logo {
  font-size: 1.75rem;
}

.brand-text h1 {
  font-size: 1.125rem;
  font-weight: 700;
  color: #f8fafc;
  line-height: 1.2;
  margin: 0;
}

.location {
  font-size: 0.8125rem;
  color: #94a3b8;
}

.search-bar {
  flex: 1;
  max-width: 500px;
}

.search-bar input {
  width: 100%;
  padding: 0.625rem 1rem;
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  color: #f8fafc;
  font-size: 0.9375rem;
  transition: all 0.2s;
}

.search-bar input::placeholder {
  color: #64748b;
}

.search-bar input:focus {
  outline: none;
  background: rgba(30, 41, 59, 0.8);
  border-color: #6366f1;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  color: #cbd5e1;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  background: rgba(99, 102, 241, 0.2);
  border-color: #6366f1;
  color: #6366f1;
}

@media (max-width: 768px) {
  .container {
    gap: 1rem;
  }

  .brand {
    min-width: auto;
  }

  .brand-text h1 {
    font-size: 1rem;
  }

  .location {
    display: none;
  }
}
</style>
