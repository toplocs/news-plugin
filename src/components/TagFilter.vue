<template>
  <div class="tag-filter">
    <div class="filter-header">
      <h4>🏷️ Tags filtern</h4>
      <button v-if="selectedTags.length > 0" @click="clearAll" class="clear-all-btn">
        Alle löschen
      </button>
    </div>

    <div class="search-tags">
      <input
        v-model="tagSearch"
        type="text"
        placeholder="Tag suchen..."
        class="tag-search-input"
      />
    </div>

    <div class="tags-container">
      <button
        v-for="tag in filteredTags"
        :key="tag"
        @click="toggleTag(tag)"
        class="tag-btn"
        :class="{ active: selectedTags.includes(tag) }"
      >
        {{ tag }}
        <span v-if="tagCounts[tag]" class="tag-count">{{ tagCounts[tag] }}</span>
      </button>
    </div>

    <div class="selected-tags" v-if="selectedTags.length > 0">
      <p class="selected-label">Aktive Filter:</p>
      <div class="selected-tags-list">
        <span
          v-for="tag in selectedTags"
          :key="tag"
          class="selected-tag"
        >
          {{ tag }}
          <button @click="removeTag(tag)" class="remove-tag-btn">✕</button>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  availableTags: string[]
  tagCounts?: Record<string, number>
}

const props = withDefaults(defineProps<Props>(), {
  tagCounts: () => ({})
})

const emit = defineEmits<{
  (e: 'update:selectedTags', tags: string[]): void
}>()

const selectedTags = ref<string[]>([])
const tagSearch = ref('')

const filteredTags = computed(() => {
  if (!tagSearch.value) return props.availableTags

  return props.availableTags.filter(tag =>
    tag.toLowerCase().includes(tagSearch.value.toLowerCase())
  )
})

const toggleTag = (tag: string) => {
  const index = selectedTags.value.indexOf(tag)
  if (index > -1) {
    selectedTags.value.splice(index, 1)
  } else {
    selectedTags.value.push(tag)
  }
  emit('update:selectedTags', selectedTags.value)
}

const removeTag = (tag: string) => {
  const index = selectedTags.value.indexOf(tag)
  if (index > -1) {
    selectedTags.value.splice(index, 1)
    emit('update:selectedTags', selectedTags.value)
  }
}

const clearAll = () => {
  selectedTags.value = []
  emit('update:selectedTags', [])
}
</script>

<style scoped>
.tag-filter {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.filter-header h4 {
  color: #e2e8f0;
  margin: 0;
}

.clear-all-btn {
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #fca5a5;
  padding: 0.375rem 0.75rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8125rem;
  transition: all 0.2s;
}

.clear-all-btn:hover {
  background: rgba(239, 68, 68, 0.3);
}

.search-tags {
  margin-bottom: 1rem;
}

.tag-search-input {
  width: 100%;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  padding: 0.625rem 0.875rem;
  color: #e2e8f0;
  font-size: 0.875rem;
}

.tag-search-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.tag-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #94a3b8;
  padding: 0.5rem 0.875rem;
  border-radius: 16px;
  cursor: pointer;
  font-size: 0.8125rem;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.tag-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  color: #e2e8f0;
  transform: translateY(-2px);
}

.tag-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: transparent;
  color: white;
}

.tag-count {
  background: rgba(255, 255, 255, 0.2);
  padding: 0.125rem 0.375rem;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 600;
}

.tag-btn.active .tag-count {
  background: rgba(255, 255, 255, 0.3);
}

.selected-tags {
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.selected-label {
  color: #94a3b8;
  font-size: 0.8125rem;
  margin: 0 0 0.75rem 0;
}

.selected-tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.selected-tag {
  background: rgba(102, 126, 234, 0.2);
  border: 1px solid rgba(102, 126, 234, 0.4);
  color: #a5b4fc;
  padding: 0.375rem 0.625rem;
  border-radius: 12px;
  font-size: 0.8125rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.remove-tag-btn {
  background: none;
  border: none;
  color: #a5b4fc;
  cursor: pointer;
  padding: 0;
  font-size: 1rem;
  line-height: 1;
  transition: color 0.2s;
}

.remove-tag-btn:hover {
  color: white;
}
</style>
