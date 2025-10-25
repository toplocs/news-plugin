/**
 * Solid Error Handling & Retry Utilities
 * Provides robust error handling with retry logic for Solid Pod operations
 */

export enum SolidErrorType {
  NETWORK = 'NETWORK',
  AUTHENTICATION = 'AUTHENTICATION',
  PERMISSION = 'PERMISSION',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  VALIDATION = 'VALIDATION',
  UNKNOWN = 'UNKNOWN'
}

export class SolidError extends Error {
  constructor(
    message: string,
    public type: SolidErrorType,
    public statusCode?: number,
    public retryable: boolean = false,
    public originalError?: any
  ) {
    super(message)
    this.name = 'SolidError'
  }
}

export interface RetryConfig {
  maxRetries: number
  initialDelay: number // milliseconds
  maxDelay: number // milliseconds
  backoffMultiplier: number
  retryableErrors: SolidErrorType[]
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
  retryableErrors: [SolidErrorType.NETWORK, SolidErrorType.UNKNOWN]
}

/**
 * Classify error based on status code or error message
 */
export function classifyError(error: any): SolidError {
  // Network errors
  if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
    return new SolidError(
      'Network connection failed',
      SolidErrorType.NETWORK,
      undefined,
      true,
      error
    )
  }

  // HTTP errors
  const statusCode = error.status || error.statusCode

  if (statusCode === 401 || statusCode === 403) {
    return new SolidError(
      statusCode === 401 ? 'Authentication required' : 'Permission denied',
      statusCode === 401 ? SolidErrorType.AUTHENTICATION : SolidErrorType.PERMISSION,
      statusCode,
      statusCode === 401, // 401 might be retryable after re-auth
      error
    )
  }

  if (statusCode === 404) {
    return new SolidError(
      'Resource not found',
      SolidErrorType.NOT_FOUND,
      statusCode,
      false,
      error
    )
  }

  if (statusCode === 409) {
    return new SolidError(
      'Conflict - resource was modified',
      SolidErrorType.CONFLICT,
      statusCode,
      true,
      error
    )
  }

  if (statusCode >= 400 && statusCode < 500) {
    return new SolidError(
      'Validation error',
      SolidErrorType.VALIDATION,
      statusCode,
      false,
      error
    )
  }

  if (statusCode >= 500) {
    return new SolidError(
      'Server error',
      SolidErrorType.UNKNOWN,
      statusCode,
      true,
      error
    )
  }

  // Unknown error
  return new SolidError(
    error.message || 'Unknown error occurred',
    SolidErrorType.UNKNOWN,
    undefined,
    true,
    error
  )
}

/**
 * Calculate delay for retry with exponential backoff
 */
function calculateBackoff(attempt: number, config: RetryConfig): number {
  const delay = Math.min(
    config.initialDelay * Math.pow(config.backoffMultiplier, attempt),
    config.maxDelay
  )
  // Add jitter (±25%)
  const jitter = delay * 0.25
  return delay + (Math.random() * jitter * 2 - jitter)
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Execute operation with retry logic
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const retryConfig = { ...DEFAULT_RETRY_CONFIG, ...config }
  let lastError: SolidError

  for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = classifyError(error)

      // Don't retry if error is not retryable
      if (!lastError.retryable || !retryConfig.retryableErrors.includes(lastError.type)) {
        throw lastError
      }

      // Don't retry if max retries reached
      if (attempt === retryConfig.maxRetries) {
        console.error(`❌ Max retries (${retryConfig.maxRetries}) reached`)
        throw lastError
      }

      // Calculate backoff and retry
      const delay = calculateBackoff(attempt, retryConfig)
      console.warn(
        `⚠️ Attempt ${attempt + 1} failed (${lastError.type}), retrying in ${Math.round(delay)}ms...`
      )
      await sleep(delay)
    }
  }

  throw lastError!
}

/**
 * Execute operation with timeout
 */
export async function withTimeout<T>(
  operation: () => Promise<T>,
  timeoutMs: number = 30000,
  errorMessage: string = 'Operation timed out'
): Promise<T> {
  return Promise.race([
    operation(),
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new SolidError(errorMessage, SolidErrorType.NETWORK, undefined, true)), timeoutMs)
    )
  ])
}

/**
 * Execute operation with both retry and timeout
 */
export async function withRetryAndTimeout<T>(
  operation: () => Promise<T>,
  retryConfig: Partial<RetryConfig> = {},
  timeoutMs: number = 30000
): Promise<T> {
  return withRetry(
    () => withTimeout(operation, timeoutMs),
    retryConfig
  )
}

/**
 * Circuit breaker for preventing repeated failures
 */
export class CircuitBreaker {
  private failures: number = 0
  private lastFailureTime: number = 0
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED'

  constructor(
    private failureThreshold: number = 5,
    private resetTimeout: number = 60000 // 1 minute
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    // Check if circuit should be reset
    if (this.state === 'OPEN') {
      const timeSinceLastFailure = Date.now() - this.lastFailureTime
      if (timeSinceLastFailure >= this.resetTimeout) {
        console.log('🔄 Circuit breaker: Attempting to close circuit')
        this.state = 'HALF_OPEN'
        this.failures = 0
      } else {
        throw new SolidError(
          'Circuit breaker is open - too many failures',
          SolidErrorType.UNKNOWN,
          undefined,
          true
        )
      }
    }

    try {
      const result = await operation()

      // Success - close circuit
      if (this.state === 'HALF_OPEN') {
        console.log('✅ Circuit breaker: Circuit closed')
        this.state = 'CLOSED'
        this.failures = 0
      }

      return result
    } catch (error) {
      this.failures++
      this.lastFailureTime = Date.now()

      // Open circuit if threshold reached
      if (this.failures >= this.failureThreshold) {
        console.error(`⚠️ Circuit breaker: Circuit opened after ${this.failures} failures`)
        this.state = 'OPEN'
      }

      throw error
    }
  }

  reset(): void {
    this.state = 'CLOSED'
    this.failures = 0
    this.lastFailureTime = 0
  }

  getState() {
    return {
      state: this.state,
      failures: this.failures,
      lastFailureTime: this.lastFailureTime
    }
  }
}

/**
 * Global circuit breaker for Solid operations
 */
export const solidCircuitBreaker = new CircuitBreaker(5, 60000)

/**
 * Execute Solid operation with full error handling
 * Includes: classification, retry with backoff, timeout, circuit breaker
 */
export async function executeSolidOperation<T>(
  operation: () => Promise<T>,
  options: {
    retryConfig?: Partial<RetryConfig>
    timeoutMs?: number
    useCircuitBreaker?: boolean
    operationName?: string
  } = {}
): Promise<T> {
  const {
    retryConfig = {},
    timeoutMs = 30000,
    useCircuitBreaker = false,
    operationName = 'Solid operation'
  } = options

  try {
    const wrappedOperation = async () => {
      try {
        return await withRetryAndTimeout(operation, retryConfig, timeoutMs)
      } catch (error) {
        const solidError = classifyError(error)
        console.error(`❌ ${operationName} failed:`, {
          type: solidError.type,
          message: solidError.message,
          retryable: solidError.retryable,
          statusCode: solidError.statusCode
        })
        throw solidError
      }
    }

    if (useCircuitBreaker) {
      return await solidCircuitBreaker.execute(wrappedOperation)
    } else {
      return await wrappedOperation()
    }
  } catch (error) {
    // Final error handling - already classified
    throw error
  }
}

/**
 * Batch operations with error collection
 */
export async function executeBatch<T>(
  operations: Array<() => Promise<T>>,
  options: {
    continueOnError?: boolean
    retryConfig?: Partial<RetryConfig>
  } = {}
): Promise<{ results: T[], errors: SolidError[] }> {
  const { continueOnError = true, retryConfig = {} } = options
  const results: T[] = []
  const errors: SolidError[] = []

  for (const operation of operations) {
    try {
      const result = await withRetry(operation, retryConfig)
      results.push(result)
    } catch (error) {
      const solidError = classifyError(error)
      errors.push(solidError)

      if (!continueOnError) {
        throw solidError
      }
    }
  }

  return { results, errors }
}
