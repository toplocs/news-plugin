<template>
  <div class="theme-toggle">
    <button
      @click="toggleTheme"
      class="toggle-btn"
      :title="`Aktuell: ${getThemeLabel()}`"
    >
      <span class="icon">{{ getThemeIcon() }}</span>
      <span class="label">{{ getThemeLabel() }}</span>
    </button>

    <div v-if="showMenu" class="theme-menu">
      <button
        v-for="option in themeOptions"
        :key="option.value"
        @click="selectTheme(option.value)"
        class="menu-item"
        :class="{ active: theme === option.value }"
      >
        <span class="menu-icon">{{ option.icon }}</span>
        <span>{{ option.label }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useTheme, type Theme } from '../composables/useTheme'

const { theme, setTheme, toggleTheme } = useTheme()
const showMenu = ref(false)

const themeOptions = [
  { value: 'light' as Theme, label: 'Hell', icon: '☀️' },
  { value: 'dark' as Theme, label: 'Dunkel', icon: '🌙' },
  { value: 'auto' as Theme, label: 'Auto', icon: '⚙️' }
]

const selectTheme = (newTheme: Theme) => {
  setTheme(newTheme)
  showMenu.value = false
}

const getThemeIcon = (): string => {
  const option = themeOptions.find(o => o.value === theme.value)
  return option?.icon || '🌙'
}

const getThemeLabel = (): string => {
  const option = themeOptions.find(o => o.value === theme.value)
  return option?.label || 'Dunkel'
}
</script>

<style scoped>
.theme-toggle {
  position: relative;
}

.toggle-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #e2e8f0;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.toggle-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

.icon {
  font-size: 1.25rem;
}

.theme-menu {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 0.5rem;
  min-width: 150px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  z-index: 1000;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  background: none;
  border: none;
  color: #e2e8f0;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: background 0.2s;
}

.menu-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.menu-item.active {
  background: rgba(102, 126, 234, 0.2);
  color: #667eea;
}

.menu-icon {
  font-size: 1.25rem;
}
</style>
