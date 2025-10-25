/**
 * Solid Settings Service - FULL IMPLEMENTATION
 * Manages user settings in Solid Pod
 */

import {
  getSolidDataset,
  saveSolidDatasetAt,
  createThing,
  setThing,
  getThing,
  getStringNoLocale,
  setStringNoLocale,
  getBooleanAll,
  setBoolean,
  createSolidDataset
} from '@inrupt/solid-client'
import { solidAuth } from './solidAuth'

const SETTINGS_NS = 'https://toplocs.org/vocab/settings#'

export interface UserSettings {
  language: string
  theme: 'light' | 'dark' | 'auto'
  notifications: boolean
  emailDigest: boolean
  rssFeeds: string[]
}

const DEFAULT_SETTINGS: UserSettings = {
  language: 'de',
  theme: 'dark',
  notifications: true,
  emailDigest: false,
  rssFeeds: []
}

class SolidSettingsService {
  private getSettingsUrl(webId: string): string {
    const podRoot = webId.split('/profile')[0]
    return `${podRoot}/toplocs/settings`
  }

  /**
   * Get settings from Pod
   */
  async getSettings(): Promise<UserSettings> {
    const webId = solidAuth.getWebId()
    if (!webId) return DEFAULT_SETTINGS

    try {
      const settingsUrl = this.getSettingsUrl(webId)
      const dataset = await getSolidDataset(settingsUrl, {
        fetch: solidAuth.getFetch()
      }).catch(() => null)

      if (!dataset) return DEFAULT_SETTINGS

      const settingsThing = getThing(dataset, `${settingsUrl}#settings`)
      if (!settingsThing) return DEFAULT_SETTINGS

      return {
        language: getStringNoLocale(settingsThing, `${SETTINGS_NS}language`) || DEFAULT_SETTINGS.language,
        theme: (getStringNoLocale(settingsThing, `${SETTINGS_NS}theme`) as any) || DEFAULT_SETTINGS.theme,
        notifications: getBooleanAll(settingsThing, `${SETTINGS_NS}notifications`)[0] ?? DEFAULT_SETTINGS.notifications,
        emailDigest: getBooleanAll(settingsThing, `${SETTINGS_NS}emailDigest`)[0] ?? DEFAULT_SETTINGS.emailDigest,
        rssFeeds: getStringNoLocale(settingsThing, `${SETTINGS_NS}rssFeeds`)?.split(',').filter(Boolean) || []
      }
    } catch (error) {
      console.error('Error loading settings:', error)
      return DEFAULT_SETTINGS
    }
  }

  /**
   * Save settings to Pod
   */
  async saveSettings(settings: Partial<UserSettings>): Promise<boolean> {
    const webId = solidAuth.getWebId()
    if (!webId) return false

    try {
      const settingsUrl = this.getSettingsUrl(webId)
      let dataset = await getSolidDataset(settingsUrl, {
        fetch: solidAuth.getFetch()
      }).catch(() => createSolidDataset())

      let settingsThing = getThing(dataset, `${settingsUrl}#settings`) ||
                          createThing({ url: `${settingsUrl}#settings` })

      // Update fields
      if (settings.language) {
        settingsThing = setStringNoLocale(settingsThing, `${SETTINGS_NS}language`, settings.language)
      }
      if (settings.theme) {
        settingsThing = setStringNoLocale(settingsThing, `${SETTINGS_NS}theme`, settings.theme)
      }
      if (settings.notifications !== undefined) {
        settingsThing = setBoolean(settingsThing, `${SETTINGS_NS}notifications`, settings.notifications)
      }
      if (settings.emailDigest !== undefined) {
        settingsThing = setBoolean(settingsThing, `${SETTINGS_NS}emailDigest`, settings.emailDigest)
      }
      if (settings.rssFeeds) {
        settingsThing = setStringNoLocale(settingsThing, `${SETTINGS_NS}rssFeeds`, settings.rssFeeds.join(','))
      }

      dataset = setThing(dataset, settingsThing)
      await saveSolidDatasetAt(settingsUrl, dataset, {
        fetch: solidAuth.getFetch()
      })

      return true
    } catch (error) {
      console.error('Error saving settings:', error)
      return false
    }
  }

  /**
   * Update single setting
   */
  async updateSetting<K extends keyof UserSettings>(key: K, value: UserSettings[K]): Promise<boolean> {
    return this.saveSettings({ [key]: value })
  }

  /**
   * Sync with localStorage settings
   */
  async syncWithLocalStorage(): Promise<void> {
    const localSettings = JSON.parse(localStorage.getItem('settings') || '{}')
    const podSettings = await this.getSettings()

    // Merge and save to Pod
    const merged = { ...podSettings, ...localSettings }
    await this.saveSettings(merged)

    // Update localStorage
    localStorage.setItem('settings', JSON.stringify(merged))
  }
}

export const solidSettings = new SolidSettingsService()
