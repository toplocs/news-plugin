import { onMounted, onUnmounted } from 'vue'

export interface KeyboardShortcut {
  key: string
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  meta?: boolean
  handler: (event: KeyboardEvent) => void
  description?: string
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  const handleKeyDown = (event: KeyboardEvent) => {
    for (const shortcut of shortcuts) {
      const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase()
      const ctrlMatches = shortcut.ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey
      const shiftMatches = shortcut.shift ? event.shiftKey : !event.shiftKey
      const altMatches = shortcut.alt ? event.altKey : !event.altKey

      if (keyMatches && ctrlMatches && shiftMatches && altMatches) {
        event.preventDefault()
        shortcut.handler(event)
        break
      }
    }
  }

  onMounted(() => {
    document.addEventListener('keydown', handleKeyDown)
  })

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeyDown)
  })

  const getShortcutLabel = (shortcut: KeyboardShortcut): string => {
    const parts: string[] = []

    if (shortcut.ctrl) parts.push('Ctrl')
    if (shortcut.shift) parts.push('Shift')
    if (shortcut.alt) parts.push('Alt')
    if (shortcut.meta) parts.push('Cmd')

    parts.push(shortcut.key.toUpperCase())

    return parts.join(' + ')
  }

  return {
    getShortcutLabel
  }
}

// Predefined shortcuts
export const DEFAULT_SHORTCUTS: KeyboardShortcut[] = [
  {
    key: 'k',
    ctrl: true,
    description: 'Suche öffnen',
    handler: () => {
      const searchInput = document.querySelector<HTMLInputElement>('.search-input')
      searchInput?.focus()
    }
  },
  {
    key: 'n',
    ctrl: true,
    description: 'Neuer Post',
    handler: () => {
      const newPostBtn = document.querySelector<HTMLButtonElement>('[data-action="new-post"]')
      newPostBtn?.click()
    }
  },
  {
    key: '/',
    description: 'Fokus auf Suche',
    handler: (e) => {
      e.preventDefault()
      const searchInput = document.querySelector<HTMLInputElement>('.search-input')
      searchInput?.focus()
    }
  },
  {
    key: 'Escape',
    description: 'Modal schließen',
    handler: () => {
      const closeBtn = document.querySelector<HTMLButtonElement>('.modal-close')
      closeBtn?.click()
    }
  }
]
