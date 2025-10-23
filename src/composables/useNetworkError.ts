import { ref } from 'vue'

export interface RetryOptions {
  maxRetries?: number
  retryDelay?: number
  backoff?: boolean
  onRetry?: (attempt: number, error: Error) => void
}

export interface NetworkError {
  message: string
  status?: number
  isNetworkError: boolean
  canRetry: boolean
}

/**
 * Network Error Handler with Retry Logic
 *
 * Features:
 * - Automatic retry with exponential backoff
 * - Network error detection
 * - Retry attempt tracking
 * - Custom retry logic
 */
export function useNetworkError() {
  const isRetrying = ref(false)
  const retryAttempt = ref(0)
  const lastError = ref<NetworkError | null>(null)

  /**
   * Check if error is a network error
   */
  const isNetworkError = (error: any): boolean => {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return true
    }
    if (error.message?.includes('Network') || error.message?.includes('network')) {
      return true
    }
    if (error.code === 'ECONNABORTED' || error.code === 'ENOTFOUND') {
      return true
    }
    return !navigator.onLine
  }

  /**
   * Parse error into NetworkError
   */
  const parseError = (error: any): NetworkError => {
    const isNetwork = isNetworkError(error)

    return {
      message: error.message || 'Unknown error',
      status: error.response?.status || error.status,
      isNetworkError: isNetwork,
      canRetry: isNetwork || (error.response?.status >= 500)
    }
  }

  /**
   * Calculate retry delay with exponential backoff
   */
  const getRetryDelay = (attempt: number, baseDelay: number, useBackoff: boolean): number => {
    if (!useBackoff) return baseDelay
    return baseDelay * Math.pow(2, attempt - 1)
  }

  /**
   * Execute function with retry logic
   */
  const withRetry = async <T>(
    fn: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<T> => {
    const {
      maxRetries = 3,
      retryDelay = 1000,
      backoff = true,
      onRetry
    } = options

    let lastErr: Error | null = null

    for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
      try {
        retryAttempt.value = attempt - 1

        if (attempt > 1) {
          isRetrying.value = true
        }

        const result = await fn()

        // Success - reset state
        isRetrying.value = false
        retryAttempt.value = 0
        lastError.value = null

        return result

      } catch (error: any) {
        lastErr = error
        const networkError = parseError(error)
        lastError.value = networkError

        // Don't retry if:
        // 1. It's the last attempt
        // 2. Error is not retryable
        // 3. User is offline
        if (
          attempt > maxRetries ||
          !networkError.canRetry ||
          !navigator.onLine
        ) {
          isRetrying.value = false
          throw error
        }

        // Call onRetry callback
        if (onRetry) {
          onRetry(attempt, error)
        }

        // Wait before retry with exponential backoff
        const delay = getRetryDelay(attempt, retryDelay, backoff)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }

    isRetrying.value = false
    throw lastErr
  }

  /**
   * Fetch with retry logic
   */
  const fetchWithRetry = async (
    url: string,
    options: RequestInit = {},
    retryOptions: RetryOptions = {}
  ): Promise<Response> => {
    return withRetry(async () => {
      const response = await fetch(url, options)

      // Throw error for non-2xx responses
      if (!response.ok) {
        const error: any = new Error(`HTTP ${response.status}: ${response.statusText}`)
        error.response = response
        error.status = response.status
        throw error
      }

      return response
    }, retryOptions)
  }

  /**
   * Reset error state
   */
  const reset = () => {
    isRetrying.value = false
    retryAttempt.value = 0
    lastError.value = null
  }

  return {
    // State
    isRetrying,
    retryAttempt,
    lastError,

    // Methods
    withRetry,
    fetchWithRetry,
    isNetworkError,
    parseError,
    reset
  }
}
