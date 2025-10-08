import { ref, onMounted, onUnmounted } from 'vue'

/**
 * Performance Monitoring Composable
 * Tracks FPS, latency, and CLS
 */
export function usePerformance() {
  const fps = ref(60)
  const latency = ref(0)
  const cls = ref(0)

  let frameCount = 0
  let lastTime = performance.now()
  let rafId: number | null = null

  // FPS Monitoring
  const measureFPS = () => {
    const currentTime = performance.now()
    frameCount++

    if (currentTime >= lastTime + 1000) {
      fps.value = Math.round((frameCount * 1000) / (currentTime - lastTime))
      frameCount = 0
      lastTime = currentTime
    }

    rafId = requestAnimationFrame(measureFPS)
  }

  // Performance Metrics
  const getMetrics = () => {
    if ('performance' in window && performance.getEntriesByType) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming

      if (navigation) {
        // Time to Interactive
        const tti = navigation.domInteractive - navigation.fetchStart
        latency.value = Math.round(tti)
      }

      // Cumulative Layout Shift
      const layoutShifts = performance.getEntriesByType('layout-shift') as any[]
      cls.value = layoutShifts.reduce((sum, entry) => sum + (entry.value || 0), 0)
    }

    return {
      fps: fps.value,
      latency: latency.value,
      cls: cls.value
    }
  }

  // Mark performance checkpoints
  const mark = (name: string) => {
    if ('performance' in window && performance.mark) {
      performance.mark(name)
    }
  }

  const measure = (name: string, startMark: string, endMark: string) => {
    if ('performance' in window && performance.measure) {
      try {
        performance.measure(name, startMark, endMark)
        const entry = performance.getEntriesByName(name)[0]
        return entry ? Math.round(entry.duration) : 0
      } catch (e) {
        console.warn('Performance measurement failed:', e)
        return 0
      }
    }
    return 0
  }

  onMounted(() => {
    rafId = requestAnimationFrame(measureFPS)
    getMetrics()
  })

  onUnmounted(() => {
    if (rafId !== null) {
      cancelAnimationFrame(rafId)
    }
  })

  return {
    fps,
    latency,
    cls,
    getMetrics,
    mark,
    measure
  }
}
