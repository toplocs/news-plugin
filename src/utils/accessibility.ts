/**
 * Accessibility Utilities
 * ARIA labels, keyboard navigation, screen reader support
 */

/**
 * Trap focus within a modal/dialog
 */
export function trapFocus(element: HTMLElement) {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )
  const firstFocusable = focusableElements[0] as HTMLElement
  const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return

    if (e.shiftKey) {
      if (document.activeElement === firstFocusable) {
        lastFocusable.focus()
        e.preventDefault()
      }
    } else {
      if (document.activeElement === lastFocusable) {
        firstFocusable.focus()
        e.preventDefault()
      }
    }
  }

  element.addEventListener('keydown', handleKeyDown)

  return () => element.removeEventListener('keydown', handleKeyDown)
}

/**
 * Announce message to screen readers
 */
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
  const announcement = document.createElement('div')
  announcement.setAttribute('role', 'status')
  announcement.setAttribute('aria-live', priority)
  announcement.setAttribute('aria-atomic', 'true')
  announcement.className = 'sr-only'
  announcement.textContent = message

  document.body.appendChild(announcement)

  setTimeout(() => {
    document.body.removeChild(announcement)
  }, 1000)
}

/**
 * Generate unique ID for ARIA labels
 */
let idCounter = 0
export function generateId(prefix: string = 'a11y'): string {
  return `${prefix}-${++idCounter}`
}

/**
 * Handle Escape key to close modals
 */
export function handleEscapeKey(callback: () => void) {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      callback()
    }
  }

  document.addEventListener('keydown', handleKeyDown)

  return () => document.removeEventListener('keydown', handleKeyDown)
}

/**
 * Focus management: save and restore focus
 */
export class FocusManager {
  private previousFocus: HTMLElement | null = null

  save() {
    this.previousFocus = document.activeElement as HTMLElement
  }

  restore() {
    if (this.previousFocus) {
      this.previousFocus.focus()
      this.previousFocus = null
    }
  }
}

/**
 * Keyboard navigation for lists
 */
export function setupKeyboardNav(
  container: HTMLElement,
  itemSelector: string,
  options: {
    onSelect?: (element: HTMLElement) => void
    loop?: boolean
  } = {}
) {
  const { onSelect, loop = true } = options

  const handleKeyDown = (e: KeyboardEvent) => {
    const items = Array.from(container.querySelectorAll(itemSelector)) as HTMLElement[]
    const currentIndex = items.findIndex(item => item === document.activeElement)

    let nextIndex = currentIndex

    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        e.preventDefault()
        nextIndex = currentIndex + 1
        if (nextIndex >= items.length) {
          nextIndex = loop ? 0 : items.length - 1
        }
        break

      case 'ArrowUp':
      case 'ArrowLeft':
        e.preventDefault()
        nextIndex = currentIndex - 1
        if (nextIndex < 0) {
          nextIndex = loop ? items.length - 1 : 0
        }
        break

      case 'Home':
        e.preventDefault()
        nextIndex = 0
        break

      case 'End':
        e.preventDefault()
        nextIndex = items.length - 1
        break

      case 'Enter':
      case ' ':
        if (currentIndex >= 0 && onSelect) {
          e.preventDefault()
          onSelect(items[currentIndex])
        }
        break

      default:
        return
    }

    if (nextIndex !== currentIndex && items[nextIndex]) {
      items[nextIndex].focus()
    }
  }

  container.addEventListener('keydown', handleKeyDown)

  return () => container.removeEventListener('keydown', handleKeyDown)
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Skip to content link
 */
export function addSkipToContent() {
  const skip = document.createElement('a')
  skip.href = '#main-content'
  skip.textContent = 'Skip to main content'
  skip.className = 'skip-to-content'
  skip.addEventListener('click', (e) => {
    e.preventDefault()
    const main = document.getElementById('main-content')
    if (main) {
      main.tabIndex = -1
      main.focus()
    }
  })

  document.body.insertBefore(skip, document.body.firstChild)
}
