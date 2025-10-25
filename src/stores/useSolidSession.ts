/**
 * Solid Session Store
 *
 * Vue composable for managing Solid authentication state
 * Provides reactive state for login status, webId, etc.
 */

import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { solidAuth, type SolidProvider, SOLID_PROVIDERS } from '../services/solidAuth'
import { solidAutoSync } from '../services/solidAutoSync'

export const useSolidSession = defineStore('solidSession', () => {
  // State
  const isLoggedIn = ref(false)
  const webId = ref<string | undefined>(undefined)
  const isInitialized = ref(false)

  // Getters
  const podUrl = computed(() => {
    if (!webId.value) return undefined
    // Extract Pod root from WebID
    // Example: https://alice.solidcommunity.net/profile/card#me → https://alice.solidcommunity.net/
    const url = new URL(webId.value)
    return `${url.protocol}//${url.host}/`
  })

  const username = computed(() => {
    if (!webId.value) return undefined
    // Extract username from WebID
    // Example: https://alice.solidcommunity.net/profile/card#me → alice
    const url = new URL(webId.value)
    return url.hostname.split('.')[0]
  })

  const providers = computed(() => SOLID_PROVIDERS)

  // Actions
  async function init() {
    try {
      await solidAuth.init()
      updateState()
      isInitialized.value = true

      // Initialize auto-sync service
      await solidAutoSync.init({
        enabled: false, // Will be enabled when user logs in
        interval: 30000, // 30 seconds
        direction: 'bidirectional',
        autoResolveConflicts: true
      })

      // Listen for session changes
      solidAuth.onSessionChange(() => {
        updateState()
      })

      // Watch login state and manage auto-sync
      watch(isLoggedIn, (loggedIn) => {
        if (loggedIn) {
          console.log('✅ User logged in - starting auto-sync')
          solidAutoSync.start()
        } else {
          console.log('⏸️ User logged out - stopping auto-sync')
          solidAutoSync.stop()
        }
      }, { immediate: true })
    } catch (error) {
      console.error('Error initializing Solid session:', error)
      isInitialized.value = true
    }
  }

  async function login(provider: SolidProvider | string, customRedirectUrl?: string) {
    try {
      const providerUrl = typeof provider === 'string' ? provider : provider.issuer
      await solidAuth.login(providerUrl, customRedirectUrl)
    } catch (error) {
      console.error('Error logging in:', error)
      throw error
    }
  }

  async function logout() {
    try {
      await solidAuth.logout()
      updateState()
    } catch (error) {
      console.error('Error logging out:', error)
      throw error
    }
  }

  function updateState() {
    isLoggedIn.value = solidAuth.isLoggedIn()
    webId.value = solidAuth.getWebId()
  }

  function getAuthFetch() {
    return solidAuth.getFetch()
  }

  return {
    // State
    isLoggedIn,
    webId,
    podUrl,
    username,
    isInitialized,
    providers,

    // Actions
    init,
    login,
    logout,
    getAuthFetch
  }
})
