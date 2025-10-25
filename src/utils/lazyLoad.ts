/**
 * Lazy Loading Utilities for Code Splitting and Performance Optimization
 * Provides utilities for lazy loading components, services, and resources
 */

import { ref, readonly } from 'vue'
import type { Component, AsyncComponentLoader } from 'vue'

/**
 * Retry configuration for lazy loading
 */
interface RetryConfig {
  maxRetries?: number
  delay?: number
  exponentialBackoff?: boolean
}

/**
 * Lazy load a component with retry logic
 */
export function lazyLoadComponent(
  loader: AsyncComponentLoader,
  options: RetryConfig = {}
): AsyncComponentLoader {
  const {
    maxRetries = 3,
    delay = 1000,
    exponentialBackoff = true
  } = options

  return async () => {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await loader()
      } catch (error) {
        console.warn(`[LazyLoad] Component load failed (attempt ${i + 1}/${maxRetries}):`, error)

        if (i === maxRetries - 1) {
          throw error
        }

        // Wait before retry with optional exponential backoff
        const waitTime = exponentialBackoff ? delay * Math.pow(2, i) : delay
        await new Promise(resolve => setTimeout(resolve, waitTime))
      }
    }
    throw new Error('Component loading failed after all retries')
  }
}

/**
 * Lazy load Solid components with optimized chunking
 */
export const LazySolidComponents = {
  // Pod Management
  SolidPodStatus: lazyLoadComponent(() => import('@/components/SolidPodStatus.vue')),
  SolidLoginButton: lazyLoadComponent(() => import('@/components/SolidLoginButton.vue')),

  // Settings & Profile
  SolidProfileEditor: lazyLoadComponent(() => import('@/components/SolidProfileEditor.vue')),

  // Data Management
  SolidMigrationWizard: lazyLoadComponent(() => import('@/components/SolidMigrationWizard.vue')),
}

/**
 * Lazy load services (for code splitting)
 */
export const LazySolidServices = {
  auth: () => import('@/services/solidAuth'),
  profile: () => import('@/services/solidProfile'),
  bookmarks: () => import('@/services/solidBookmarks'),
  settings: () => import('@/services/solidSettings'),
  migration: () => import('@/services/solidMigration'),
  autoSync: () => import('@/services/solidAutoSync'),
  analytics: () => import('@/services/solidAnalytics'),
  errorHandler: () => import('@/services/solidErrorHandler'),
}

/**
 * Preload a component in the background
 */
export function preloadComponent(loader: AsyncComponentLoader): void {
  if (typeof window === 'undefined') return

  // Use requestIdleCallback for non-critical preloading
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(() => {
      loader().catch(error => {
        console.warn('[LazyLoad] Preload failed:', error)
      })
    })
  } else {
    // Fallback for browsers without requestIdleCallback
    setTimeout(() => {
      loader().catch(error => {
        console.warn('[LazyLoad] Preload failed:', error)
      })
    }, 1)
  }
}

/**
 * Preload critical Solid components
 */
export function preloadCriticalSolidComponents(): void {
  preloadComponent(LazySolidComponents.SolidPodStatus)
  preloadComponent(LazySolidComponents.SolidLoginButton)
}

/**
 * Lazy load component when element becomes visible
 * Uses Intersection Observer for optimal performance
 */
export function lazyLoadOnVisible(
  element: HTMLElement,
  loader: AsyncComponentLoader,
  options: IntersectionObserverInit = {}
): () => void {
  const defaultOptions: IntersectionObserverInit = {
    rootMargin: '50px',
    threshold: 0.01,
    ...options
  }

  let loaded = false
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !loaded) {
        loaded = true
        loader().catch(error => {
          console.error('[LazyLoad] Visible component load failed:', error)
        })
        observer.disconnect()
      }
    })
  }, defaultOptions)

  observer.observe(element)

  // Return cleanup function
  return () => observer.disconnect()
}

/**
 * Lazy load image with blur-up effect
 */
export function lazyLoadImage(
  img: HTMLImageElement,
  src: string,
  options: {
    placeholder?: string
    onLoad?: () => void
    onError?: (error: Error) => void
  } = {}
): () => void {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const image = entry.target as HTMLImageElement

        // Set placeholder if provided
        if (options.placeholder) {
          image.src = options.placeholder
          image.classList.add('blur')
        }

        // Load actual image
        const actualImage = new Image()
        actualImage.onload = () => {
          image.src = src
          image.classList.remove('blur')
          options.onLoad?.()
        }
        actualImage.onerror = () => {
          const error = new Error(`Failed to load image: ${src}`)
          console.error('[LazyLoad] Image load failed:', error)
          options.onError?.(error)
        }
        actualImage.src = src

        observer.disconnect()
      }
    })
  }, {
    rootMargin: '50px',
    threshold: 0.01
  })

  observer.observe(img)

  // Return cleanup function
  return () => observer.disconnect()
}

/**
 * Prefetch a route for faster navigation
 */
export function prefetchRoute(path: string): void {
  if (typeof window === 'undefined') return

  const link = document.createElement('link')
  link.rel = 'prefetch'
  link.href = path
  document.head.appendChild(link)
}

/**
 * Preconnect to external domains for faster resource loading
 */
export function preconnect(url: string): void {
  if (typeof window === 'undefined') return

  const link = document.createElement('link')
  link.rel = 'preconnect'
  link.href = url
  document.head.appendChild(link)
}

/**
 * Chunk size analyzer for debugging
 */
export function analyzeChunkSize(componentName: string, loader: AsyncComponentLoader): AsyncComponentLoader {
  return async () => {
    const start = performance.now()
    const component = await loader()
    const end = performance.now()
    console.log(`[LazyLoad] ${componentName} loaded in ${(end - start).toFixed(2)}ms`)
    return component
  }
}

/**
 * Create a lazy loading composable with state
 */
export function useLazyComponent(loader: AsyncComponentLoader) {
  const isLoading = ref(false)
  const isLoaded = ref(false)
  const error = ref<Error | null>(null)
  const component = ref<Component | null>(null)

  const load = async () => {
    if (isLoaded.value || isLoading.value) return component.value

    isLoading.value = true
    error.value = null

    try {
      component.value = await loader()
      isLoaded.value = true
      return component.value
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err))
      console.error('[LazyLoad] Component load failed:', error.value)
      throw error.value
    } finally {
      isLoading.value = false
    }
  }

  return {
    isLoading: readonly(isLoading),
    isLoaded: readonly(isLoaded),
    error: readonly(error),
    component: readonly(component),
    load
  }
}

/**
 * Route-based code splitting helper
 */
export function createLazyRoute(path: string, component: AsyncComponentLoader) {
  return {
    path,
    component: lazyLoadComponent(component),
    meta: { lazy: true }
  }
}
