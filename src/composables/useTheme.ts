import { ref, watch } from 'vue'

export type Theme = 'light' | 'dark' | 'auto'

const STORAGE_KEY = 'toplocs-theme'

const theme = ref<Theme>((localStorage.getItem(STORAGE_KEY) as Theme) || 'dark')

// Apply theme to document
const applyTheme = (newTheme: Theme) => {
  const root = document.documentElement

  if (newTheme === 'auto') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    root.classList.toggle('dark', prefersDark)
    root.classList.toggle('light', !prefersDark)
  } else {
    root.classList.remove('light', 'dark')
    root.classList.add(newTheme)
  }
}

// Watch for theme changes
watch(theme, (newTheme) => {
  localStorage.setItem(STORAGE_KEY, newTheme)
  applyTheme(newTheme)
}, { immediate: true })

// Listen for system theme changes
if (window.matchMedia) {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (theme.value === 'auto') {
      applyTheme('auto')
    }
  })
}

export function useTheme() {
  const setTheme = (newTheme: Theme) => {
    theme.value = newTheme
  }

  const toggleTheme = () => {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
  }

  return {
    theme,
    setTheme,
    toggleTheme
  }
}
