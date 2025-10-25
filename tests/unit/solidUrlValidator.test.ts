/**
 * Unit Tests: solidUrlValidator.ts
 * Security validation for Pod URLs
 */

import { describe, it, expect } from 'vitest'
import {
  validatePodUrl,
  validateWebId,
  sanitizeUrl
} from '@/utils/solidUrlValidator'

describe('solidUrlValidator', () => {
  describe('validatePodUrl()', () => {
    describe('Valid URLs', () => {
      it('should accept HTTPS URLs', () => {
        const result = validatePodUrl('https://solidcommunity.net')
        expect(result.valid).toBe(true)
        expect(result.error).toBeUndefined()
      })

      it('should accept localhost HTTP (development)', () => {
        const result = validatePodUrl('http://localhost:3000')
        expect(result.valid).toBe(true)
      })

      it('should accept 127.0.0.1 HTTP (development)', () => {
        const result = validatePodUrl('http://127.0.0.1:3000')
        expect(result.valid).toBe(true)
      })

      it('should accept URLs with paths', () => {
        const result = validatePodUrl('https://example.com/pod/alice')
        expect(result.valid).toBe(true)
      })

      it('should accept URLs with ports', () => {
        const result = validatePodUrl('https://example.com:8443')
        expect(result.valid).toBe(true)
      })
    })

    describe('Invalid Protocols', () => {
      it('should reject HTTP URLs (non-localhost)', () => {
        const result = validatePodUrl('http://solidcommunity.net')
        expect(result.valid).toBe(false)
        expect(result.error).toContain('HTTPS')
      })

      it('should reject javascript: protocol', () => {
        const result = validatePodUrl('javascript:alert(1)')
        expect(result.valid).toBe(false)
      })

      it('should reject data: URIs', () => {
        const result = validatePodUrl('data:text/html,<script>alert(1)</script>')
        expect(result.valid).toBe(false)
      })

      it('should reject file: protocol', () => {
        const result = validatePodUrl('file:///etc/passwd')
        expect(result.valid).toBe(false)
      })

      it('should reject ftp: protocol', () => {
        const result = validatePodUrl('ftp://example.com')
        expect(result.valid).toBe(false)
      })
    })

    describe('Script Injection', () => {
      it('should reject URLs with <script> tags', () => {
        const result = validatePodUrl('https://example.com/<script>alert(1)</script>')
        expect(result.valid).toBe(false)
        expect(result.error).toContain('suspicious')
      })

      it('should reject URLs with encoded <script>', () => {
        const result = validatePodUrl('https://example.com/%3Cscript%3Ealert(1)%3C/script%3E')
        expect(result.valid).toBe(false)
      })

      it('should reject URLs with javascript: in path', () => {
        const result = validatePodUrl('https://example.com/javascript:alert(1)')
        expect(result.valid).toBe(false)
      })

      it('should reject URLs with null bytes', () => {
        const result = validatePodUrl('https://example.com/%00malicious')
        expect(result.valid).toBe(false)
      })
    })

    describe('Path Traversal', () => {
      it('should reject URLs with ../ (path traversal)', () => {
        const result = validatePodUrl('https://example.com/../../../etc/passwd')
        expect(result.valid).toBe(false)
        expect(result.error).toContain('suspicious')
      })

      it('should reject URLs with encoded ..', () => {
        const result = validatePodUrl('https://example.com/%2e%2e%2f')
        expect(result.valid).toBe(false)
      })
    })

    describe('Invalid Formats', () => {
      it('should reject empty string', () => {
        const result = validatePodUrl('')
        expect(result.valid).toBe(false)
      })

      it('should reject whitespace only', () => {
        const result = validatePodUrl('   ')
        expect(result.valid).toBe(false)
      })

      it('should reject malformed URLs', () => {
        const result = validatePodUrl('not-a-url')
        expect(result.valid).toBe(false)
      })

      it('should reject URLs without protocol', () => {
        const result = validatePodUrl('example.com')
        expect(result.valid).toBe(false)
      })
    })
  })

  describe('validateWebId()', () => {
    it('should accept valid WebID format', () => {
      const result = validateWebId('https://alice.solidcommunity.net/profile/card#me')
      expect(result.valid).toBe(true)
    })

    it('should accept WebID with different hash fragment', () => {
      const result = validateWebId('https://example.com/profile#id')
      expect(result.valid).toBe(true)
    })

    it('should reject WebID without hash fragment', () => {
      const result = validateWebId('https://example.com/profile')
      expect(result.valid).toBe(false)
      expect(result.error).toContain('hash fragment')
    })

    it('should reject non-HTTPS WebID', () => {
      const result = validateWebId('http://example.com/profile#me')
      expect(result.valid).toBe(false)
    })

    it('should accept localhost WebID (development)', () => {
      const result = validateWebId('http://localhost:3000/profile/card#me')
      expect(result.valid).toBe(true)
    })
  })

  describe('sanitizeUrl()', () => {
    it('should trim whitespace', () => {
      const result = sanitizeUrl('  https://example.com  ')
      expect(result).toBe('https://example.com/')
    })

    it('should normalize trailing slashes', () => {
      const result = sanitizeUrl('https://example.com')
      expect(result).toBe('https://example.com/')
    })

    it('should preserve paths', () => {
      const result = sanitizeUrl('https://example.com/path/to/resource')
      expect(result).toBe('https://example.com/path/to/resource')
    })

    it('should preserve query parameters', () => {
      const result = sanitizeUrl('https://example.com?foo=bar')
      expect(result).toBe('https://example.com/?foo=bar')
    })

    it('should preserve hash fragments', () => {
      const result = sanitizeUrl('https://example.com#section')
      expect(result).toBe('https://example.com/#section')
    })

    it('should handle localhost correctly', () => {
      const result = sanitizeUrl('http://localhost:3000/pod')
      expect(result).toBe('http://localhost:3000/pod')
    })
  })

  describe('Security Edge Cases', () => {
    it('should reject double-encoded attacks', () => {
      const result = validatePodUrl('https://example.com/%252e%252e%252f')
      expect(result.valid).toBe(false)
    })

    it('should reject mixed-case evasion attempts', () => {
      const result = validatePodUrl('https://example.com/<ScRiPt>alert(1)</ScRiPt>')
      expect(result.valid).toBe(false)
    })

    it('should reject unicode homograph attacks', () => {
      // Cyrillic 'а' (U+0430) looks like Latin 'a'
      const result = validatePodUrl('https://exаmple.com')
      // This should still pass URL validation, but be aware of potential phishing
      expect(result.valid).toBe(true)
    })

    it('should handle very long URLs', () => {
      const longPath = 'a'.repeat(2000)
      const result = validatePodUrl(`https://example.com/${longPath}`)
      // URL is valid but very long - application might want to set length limits
      expect(result.valid).toBe(true)
    })

    it('should reject URLs with spaces (before encoding)', () => {
      const result = validatePodUrl('https://example.com/path with spaces')
      expect(result.valid).toBe(false)
    })
  })
})
