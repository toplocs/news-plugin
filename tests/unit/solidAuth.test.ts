/**
 * Unit Tests: solidAuth.ts
 * Authentication service for Solid Pods
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { solidAuth } from '@/services/solidAuth'

// Mock @inrupt/solid-client-authn-browser
vi.mock('@inrupt/solid-client-authn-browser', () => ({
  login: vi.fn(),
  logout: vi.fn(),
  handleIncomingRedirect: vi.fn(),
  getDefaultSession: vi.fn(() => ({
    info: {
      isLoggedIn: false,
      webId: undefined
    },
    fetch: globalThis.fetch
  }))
}))

describe('solidAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('login()', () => {
    it('should initiate login with valid provider URL', async () => {
      const { login } = await import('@inrupt/solid-client-authn-browser')

      await solidAuth.login('https://solidcommunity.net')

      expect(login).toHaveBeenCalledWith({
        oidcIssuer: 'https://solidcommunity.net',
        redirectUrl: expect.any(String),
        clientName: 'TopLocs News Plugin'
      })
    })

    it('should reject invalid provider URL', async () => {
      await expect(solidAuth.login('invalid-url')).rejects.toThrow()
    })

    it('should reject HTTP URLs (require HTTPS)', async () => {
      await expect(solidAuth.login('http://insecure.com')).rejects.toThrow(/HTTPS/)
    })
  })

  describe('logout()', () => {
    it('should call logout function', async () => {
      const { logout } = await import('@inrupt/solid-client-authn-browser')

      await solidAuth.logout()

      expect(logout).toHaveBeenCalled()
    })
  })

  describe('isLoggedIn()', () => {
    it('should return false when not logged in', () => {
      expect(solidAuth.isLoggedIn()).toBe(false)
    })

    it('should return true when logged in', async () => {
      const { getDefaultSession } = await import('@inrupt/solid-client-authn-browser')
      vi.mocked(getDefaultSession).mockReturnValue({
        info: {
          isLoggedIn: true,
          webId: 'https://alice.solidcommunity.net/profile/card#me'
        },
        fetch: globalThis.fetch
      } as any)

      expect(solidAuth.isLoggedIn()).toBe(true)
    })
  })

  describe('getWebId()', () => {
    it('should return undefined when not logged in', () => {
      expect(solidAuth.getWebId()).toBeUndefined()
    })

    it('should return WebID when logged in', async () => {
      const { getDefaultSession } = await import('@inrupt/solid-client-authn-browser')
      const mockWebId = 'https://alice.solidcommunity.net/profile/card#me'

      vi.mocked(getDefaultSession).mockReturnValue({
        info: {
          isLoggedIn: true,
          webId: mockWebId
        },
        fetch: globalThis.fetch
      } as any)

      expect(solidAuth.getWebId()).toBe(mockWebId)
    })
  })

  describe('getFetch()', () => {
    it('should return authenticated fetch function', () => {
      const fetchFn = solidAuth.getFetch()
      expect(typeof fetchFn).toBe('function')
    })
  })

  describe('init()', () => {
    it('should handle incoming redirect', async () => {
      const { handleIncomingRedirect } = await import('@inrupt/solid-client-authn-browser')

      await solidAuth.init()

      expect(handleIncomingRedirect).toHaveBeenCalled()
    })
  })

  describe('Provider validation', () => {
    it('should accept solidcommunity.net', async () => {
      const { login } = await import('@inrupt/solid-client-authn-browser')

      await solidAuth.login('https://solidcommunity.net')

      expect(login).toHaveBeenCalled()
    })

    it('should accept localhost for development', async () => {
      const { login } = await import('@inrupt/solid-client-authn-browser')

      await solidAuth.login('http://localhost:3000')

      expect(login).toHaveBeenCalled()
    })

    it('should reject malicious URLs', async () => {
      await expect(
        solidAuth.login('javascript:alert(1)')
      ).rejects.toThrow()
    })
  })
})
