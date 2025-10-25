<template>
  <div class="loading-spinner" :class="sizeClass">
    <div class="spinner"></div>
    <p v-if="message" class="message">{{ message }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  size?: 'small' | 'medium' | 'large'
  message?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 'medium'
})

const sizeClass = computed(() => `size-${props.size}`)
</script>

<style scoped>
.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 2rem;
}

.spinner {
  border-radius: 50%;
  border-style: solid;
  border-color: rgba(255, 255, 255, 0.2);
  border-top-color: #667eea;
  animation: spin 1s linear infinite;
}

.size-small .spinner {
  width: 20px;
  height: 20px;
  border-width: 2px;
}

.size-medium .spinner {
  width: 40px;
  height: 40px;
  border-width: 4px;
}

.size-large .spinner {
  width: 60px;
  height: 60px;
  border-width: 5px;
}

.message {
  color: #94a3b8;
  font-size: 0.875rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
