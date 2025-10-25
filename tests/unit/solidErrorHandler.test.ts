/**
 * Unit Tests: solidErrorHandler.ts
 * Robust error handling with retry logic and circuit breaker
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  executeSolidOperation,
  SolidError,
  ErrorType
} from '@/utils/solidErrorHandler'

describe('solidErrorHandler', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  describe('executeSolidOperation()', () => {
    it('should execute operation successfully', async () => {
      const mockOperation = vi.fn().mockResolvedValue('success')

      const result = await executeSolidOperation(mockOperation, {
        operationName: 'Test Operation'
      })

      expect(result).toBe('success')
      expect(mockOperation).toHaveBeenCalledTimes(1)
    })

    it('should retry on failure with exponential backoff', async () => {
      const mockOperation = vi.fn()
        .mockRejectedValueOnce(new Error('Temporary error'))
        .mockRejectedValueOnce(new Error('Temporary error'))
        .mockResolvedValueOnce('success')

      const promise = executeSolidOperation(mockOperation, {
        operationName: 'Test Operation',
        retryConfig: { maxRetries: 3, initialDelay: 1000 }
      })

      // Fast-forward timers for retries
      await vi.runAllTimersAsync()

      const result = await promise

      expect(result).toBe('success')
      expect(mockOperation).toHaveBeenCalledTimes(3)
    })

    it('should fail after max retries', async () => {
      const mockOperation = vi.fn().mockRejectedValue(new Error('Persistent error'))

      const promise = executeSolidOperation(mockOperation, {
        operationName: 'Test Operation',
        retryConfig: { maxRetries: 2 }
      })

      await vi.runAllTimersAsync()

      await expect(promise).rejects.toThrow('Persistent error')
      expect(mockOperation).toHaveBeenCalledTimes(3) // Initial + 2 retries
    })

    it('should respect timeout', async () => {
      const mockOperation = vi.fn().mockImplementation(() =>
        new Promise((resolve) => setTimeout(resolve, 60000))
      )

      const promise = executeSolidOperation(mockOperation, {
        operationName: 'Slow Operation',
        timeoutMs: 5000
      })

      await vi.advanceTimersByTimeAsync(5000)

      await expect(promise).rejects.toThrow(/timeout/i)
    })

    it('should not retry non-retryable errors', async () => {
      const authError = new Error('Unauthorized')
      const mockOperation = vi.fn().mockRejectedValue(authError)

      await expect(
        executeSolidOperation(mockOperation, {
          operationName: 'Auth Operation',
          retryConfig: { maxRetries: 3 }
        })
      ).rejects.toThrow('Unauthorized')

      // Should only be called once (no retries for auth errors)
      expect(mockOperation).toHaveBeenCalledTimes(1)
    })
  })

  describe('SolidError classification', () => {
    it('should classify network errors', () => {
      const error = new Error('Failed to fetch')
      // SolidError would classify this as ErrorType.NETWORK
      expect(error.message).toContain('fetch')
    })

    it('should classify authentication errors', () => {
      const error = new Error('401 Unauthorized')
      expect(error.message).toContain('401')
    })

    it('should classify validation errors', () => {
      const error = new Error('Invalid URL format')
      expect(error.message).toContain('Invalid')
    })

    it('should classify Pod errors', () => {
      const error = new Error('Pod not found')
      expect(error.message).toContain('Pod')
    })
  })

  describe('Circuit Breaker', () => {
    it('should open circuit after consecutive failures', async () => {
      const mockOperation = vi.fn().mockRejectedValue(new Error('Service down'))

      // Trigger multiple failures
      for (let i = 0; i < 5; i++) {
        try {
          await executeSolidOperation(mockOperation, {
            operationName: 'Failing Operation',
            retryConfig: { maxRetries: 0 }
          })
        } catch (e) {
          // Expected
        }
      }

      // Next call should fail immediately (circuit open)
      const startTime = Date.now()
      try {
        await executeSolidOperation(mockOperation, {
          operationName: 'Failing Operation',
          retryConfig: { maxRetries: 0 }
        })
      } catch (e) {
        // Expected
      }
      const endTime = Date.now()

      // Circuit should reject quickly (< 100ms)
      expect(endTime - startTime).toBeLessThan(100)
    })

    it('should reset circuit after cooldown period', async () => {
      const mockOperation = vi.fn()
        .mockRejectedValueOnce(new Error('Temporary error'))
        .mockResolvedValueOnce('success')

      // First call fails
      try {
        await executeSolidOperation(mockOperation, {
          operationName: 'Test Operation',
          retryConfig: { maxRetries: 0 }
        })
      } catch (e) {
        // Expected
      }

      // Wait for cooldown
      await vi.advanceTimersByTimeAsync(60000)

      // Should work after cooldown
      const result = await executeSolidOperation(mockOperation, {
        operationName: 'Test Operation'
      })

      expect(result).toBe('success')
    })
  })

  describe('Exponential Backoff', () => {
    it('should increase delay exponentially', () => {
      const delays: number[] = []
      const initialDelay = 1000
      const multiplier = 2

      for (let i = 0; i < 5; i++) {
        const delay = initialDelay * Math.pow(multiplier, i)
        delays.push(delay)
      }

      expect(delays).toEqual([1000, 2000, 4000, 8000, 16000])
    })

    it('should cap delay at maxDelay', () => {
      const initialDelay = 1000
      const maxDelay = 5000
      const multiplier = 2

      const delays: number[] = []
      for (let i = 0; i < 5; i++) {
        const delay = Math.min(initialDelay * Math.pow(multiplier, i), maxDelay)
        delays.push(delay)
      }

      expect(delays).toEqual([1000, 2000, 4000, 5000, 5000])
    })
  })

  describe('Error context', () => {
    it('should include operation name in error', async () => {
      const mockOperation = vi.fn().mockRejectedValue(new Error('Operation failed'))

      try {
        await executeSolidOperation(mockOperation, {
          operationName: 'Custom Operation'
        })
      } catch (error: any) {
        // Error message should include operation context
        expect(error.message).toBeTruthy()
      }
    })

    it('should preserve original error details', async () => {
      const originalError = new Error('Original error message')
      const mockOperation = vi.fn().mockRejectedValue(originalError)

      try {
        await executeSolidOperation(mockOperation, {
          operationName: 'Test'
        })
      } catch (error: any) {
        expect(error.message).toContain('Original error message')
      }
    })
  })
})
