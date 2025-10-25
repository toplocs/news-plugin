/**
 * Plausible Analytics Integration
 * Privacy-focused, GDPR-compliant analytics
 */

/**
 * Plausible configuration
 */
export interface PlausibleConfig {
  domain: string
  apiHost?: string
  trackLocalhost?: boolean
  hashMode?: boolean
}

/**
 * Event properties
 */
export interface EventProperties {
  [key: string]: string | number | boolean
}

/**
 * Plausible Analytics class
 */
class PlausibleAnalytics {
  private config: PlausibleConfig
  private enabled: boolean = false

  constructor(config: PlausibleConfig) {
    this.config = {
      apiHost: 'https://plausible.io',
      trackLocalhost: false,
      hashMode: false,
      ...config
    }

    // Don't track localhost unless explicitly enabled
    if (window.location.hostname === 'localhost' && !this.config.trackLocalhost) {
      console.log('[Analytics] Localhost tracking disabled')
      this.enabled = false
      return
    }

    this.enabled = true
    this.init()
  }

  /**
   * Initialize Plausible script
   */
  private init() {
    const script = document.createElement('script')
    script.defer = true
    script.dataset.domain = this.config.domain

    if (this.config.apiHost !== 'https://plausible.io') {
      script.dataset.api = `${this.config.apiHost}/api/event`
    }

    script.src = `${this.config.apiHost}/js/script.js`

    // Add error handling
    script.onerror = () => {
      console.warn('[Analytics] Failed to load Plausible script')
      this.enabled = false
    }

    document.head.appendChild(script)
    console.log('[Analytics] Plausible initialized')
  }

  /**
   * Track page view
   */
  trackPageView(customUrl?: string) {
    if (!this.enabled) return

    const url = customUrl || window.location.pathname + window.location.search + window.location.hash

    this.sendEvent('pageview', { url })
  }

  /**
   * Track custom event
   */
  trackEvent(eventName: string, properties?: EventProperties) {
    if (!this.enabled) return

    console.log('[Analytics] Event:', eventName, properties)
    this.sendEvent(eventName, properties)
  }

  /**
   * Send event to Plausible
   */
  private sendEvent(eventName: string, properties?: EventProperties) {
    if (typeof window === 'undefined' || !(window as any).plausible) {
      // Queue event for when script loads
      setTimeout(() => this.sendEvent(eventName, properties), 100)
      return
    }

    try {
      ;(window as any).plausible(eventName, {
        props: properties
      })
    } catch (error) {
      console.warn('[Analytics] Failed to send event:', error)
    }
  }

  /**
   * Track Solid Pod events
   */
  trackSolidEvent(action: string, details?: Record<string, any>) {
    this.trackEvent('solid_pod', {
      action,
      ...details
    })
  }

  /**
   * Track user interaction
   */
  trackInteraction(element: string, action: string) {
    this.trackEvent('interaction', {
      element,
      action
    })
  }

  /**
   * Track error
   */
  trackError(error: string, context?: string) {
    this.trackEvent('error', {
      error,
      context: context || 'unknown'
    })
  }

  /**
   * Track performance metric
   */
  trackPerformance(metric: string, value: number) {
    this.trackEvent('performance', {
      metric,
      value: Math.round(value)
    })
  }

  /**
   * Enable/disable tracking
   */
  setEnabled(enabled: boolean) {
    this.enabled = enabled
    console.log(`[Analytics] Tracking ${enabled ? 'enabled' : 'disabled'}`)
  }

  /**
   * Check if tracking is enabled
   */
  isEnabled(): boolean {
    return this.enabled
  }
}

// Singleton instance
let analytics: PlausibleAnalytics | null = null

/**
 * Initialize analytics
 */
export function initAnalytics(config: PlausibleConfig): PlausibleAnalytics {
  if (!analytics) {
    analytics = new PlausibleAnalytics(config)
  }
  return analytics
}

/**
 * Get analytics instance
 */
export function getAnalytics(): PlausibleAnalytics | null {
  return analytics
}

/**
 * Track page view
 */
export function trackPageView(url?: string) {
  analytics?.trackPageView(url)
}

/**
 * Track custom event
 */
export function trackEvent(eventName: string, properties?: EventProperties) {
  analytics?.trackEvent(eventName, properties)
}

/**
 * Track Solid Pod event
 */
export function trackSolidEvent(action: string, details?: Record<string, any>) {
  analytics?.trackSolidEvent(action, details)
}

/**
 * Track interaction
 */
export function trackInteraction(element: string, action: string) {
  analytics?.trackInteraction(element, action)
}

/**
 * Track error
 */
export function trackError(error: string, context?: string) {
  analytics?.trackError(error, context)
}

/**
 * Track performance
 */
export function trackPerformance(metric: string, value: number) {
  analytics?.trackPerformance(metric, value)
}

/**
 * Composable for analytics in Vue components
 */
export function useAnalytics() {
  return {
    trackPageView,
    trackEvent,
    trackSolidEvent,
    trackInteraction,
    trackError,
    trackPerformance,
    isEnabled: () => analytics?.isEnabled() ?? false
  }
}

/**
 * Auto-track page views with Vue Router
 */
export function setupAutoTracking(router: any) {
  if (!analytics) {
    console.warn('[Analytics] Analytics not initialized')
    return
  }

  router.afterEach((to: any) => {
    // Track page view
    trackPageView(to.fullPath)
  })

  console.log('[Analytics] Auto-tracking enabled')
}

/**
 * Track Web Vitals
 */
export function trackWebVitals() {
  if (typeof window === 'undefined') return

  // Largest Contentful Paint
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'largest-contentful-paint') {
            trackPerformance('LCP', entry.startTime)
          }
        }
      })
      observer.observe({ entryTypes: ['largest-contentful-paint'] })
    } catch (error) {
      console.warn('[Analytics] Failed to track LCP:', error)
    }
  }

  // First Input Delay
  if ('PerformanceEventTiming' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'first-input') {
            trackPerformance('FID', (entry as any).processingStart - entry.startTime)
          }
        }
      })
      observer.observe({ entryTypes: ['first-input'] })
    } catch (error) {
      console.warn('[Analytics] Failed to track FID:', error)
    }
  }

  // Cumulative Layout Shift
  if ('PerformanceObserver' in window) {
    try {
      let clsValue = 0
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if ((entry as any).hadRecentInput) continue
          clsValue += (entry as any).value
        }
      })
      observer.observe({ entryTypes: ['layout-shift'] })

      // Report CLS when page visibility changes
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          trackPerformance('CLS', clsValue)
        }
      })
    } catch (error) {
      console.warn('[Analytics] Failed to track CLS:', error)
    }
  }
}
