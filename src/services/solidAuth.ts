/**
 * Solid Authentication Service
 *
 * Handles WebID-based authentication with Solid Pods using OIDC.
 * User can choose their own Solid Provider (solidcommunity.net, self-hosted, etc.)
 *
 * @see https://docs.inrupt.com/developer-tools/javascript/client-libraries/authentication/
 */

import {
  login,
  logout,
  handleIncomingRedirect,
  getDefaultSession,
  Session
} from '@inrupt/solid-client-authn-browser'

export interface SolidProvider {
  name: string
  issuer: string
  description: string
}

export const SOLID_PROVIDERS: SolidProvider[] = [
  {
    name: 'solidcommunity.net',
    issuer: 'https://solidcommunity.net',
    description: 'Kostenloser Community Provider (für Testing)'
  },
  {
    name: 'inrupt.net',
    issuer: 'https://inrupt.net',
    description: 'Inrupt PodSpaces (Commercial)'
  },
  {
    name: 'Custom',
    issuer: '',
    description: 'Eigener Self-hosted Server'
  }
]

export class SolidAuthService {
  private session: Session

  constructor() {
    this.session = getDefaultSession()
  }

  /**
   * Initialize authentication
   * Call this on app startup to handle redirect after login
   */
  async init(): Promise<void> {
    try {
      await handleIncomingRedirect({
        restorePreviousSession: true
      })
    } catch (error) {
      console.error('Error initializing Solid auth:', error)
    }
  }

  /**
   * Login to Solid Provider
   * Redirects user to provider's login page
   */
  async login(providerUrl: string, redirectUrl?: string): Promise<void> {
    try {
      await login({
        oidcIssuer: providerUrl,
        redirectUrl: redirectUrl || window.location.href,
        clientName: 'TopLocs News Plugin'
      })
    } catch (error) {
      console.error('Error logging in to Solid:', error)
      throw error
    }
  }

  /**
   * Logout from current session
   */
  async logout(): Promise<void> {
    try {
      await logout()
    } catch (error) {
      console.error('Error logging out:', error)
      throw error
    }
  }

  /**
   * Check if user is logged in
   */
  isLoggedIn(): boolean {
    return this.session.info.isLoggedIn
  }

  /**
   * Get current user's WebID
   * Example: https://alice.solidcommunity.net/profile/card#me
   */
  getWebId(): string | undefined {
    return this.session.info.webId
  }

  /**
   * Get authenticated fetch function
   * Use this for all Pod requests to include authentication
   */
  getFetch(): typeof fetch {
    return this.session.fetch
  }

  /**
   * Get session info
   */
  getSessionInfo() {
    return this.session.info
  }

  /**
   * Listen to session changes
   */
  onSessionChange(callback: (session: Session) => void): void {
    this.session.onLogin(() => callback(this.session))
    this.session.onLogout(() => callback(this.session))
  }
}

// Export singleton instance
export const solidAuth = new SolidAuthService()
