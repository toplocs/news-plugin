/**
 * Solid Migration Service
 * Migrates data from localStorage to Solid Pod
 */

import { solidProfile } from './solidProfile'
import { solidBookmarks } from './solidBookmarks'
import { solidSettings } from './solidSettings'
import { solidAuth } from './solidAuth'

export interface MigrationResult {
  success: boolean
  profile?: boolean
  bookmarks?: boolean
  settings?: boolean
  errors: string[]
}

class SolidMigrationService {
  /**
   * Migrate all data from localStorage to Solid Pod
   */
  async migrateAll(): Promise<MigrationResult> {
    const result: MigrationResult = {
      success: false,
      errors: []
    }

    if (!solidAuth.isLoggedIn()) {
      result.errors.push('Not logged in to Solid Pod')
      return result
    }

    // Migrate Profile
    try {
      result.profile = await this.migrateProfile()
    } catch (error) {
      result.errors.push(`Profile migration failed: ${error}`)
    }

    // Migrate Bookmarks
    try {
      result.bookmarks = await this.migrateBookmarks()
    } catch (error) {
      result.errors.push(`Bookmarks migration failed: ${error}`)
    }

    // Migrate Settings
    try {
      result.settings = await this.migrateSettings()
    } catch (error) {
      result.errors.push(`Settings migration failed: ${error}`)
    }

    result.success = result.errors.length === 0
    return result
  }

  /**
   * Migrate profile from localStorage
   */
  private async migrateProfile(): Promise<boolean> {
    const localProfile = localStorage.getItem('user_profile')
    if (!localProfile) return false

    try {
      const profile = JSON.parse(localProfile)
      await solidProfile.saveProfile({
        name: profile.name || '',
        avatar: profile.avatar,
        bio: profile.bio,
        interests: profile.interests || []
      })
      return true
    } catch (error) {
      console.error('Profile migration error:', error)
      return false
    }
  }

  /**
   * Migrate bookmarks from localStorage
   */
  private async migrateBookmarks(): Promise<boolean> {
    const localBookmarks = localStorage.getItem('bookmarks')
    if (!localBookmarks) return false

    try {
      const bookmarks = JSON.parse(localBookmarks)
      for (const bookmark of bookmarks) {
        await solidBookmarks.addBookmark({
          title: bookmark.title || bookmark.url,
          url: bookmark.url
        })
      }
      return true
    } catch (error) {
      console.error('Bookmarks migration error:', error)
      return false
    }
  }

  /**
   * Migrate settings from localStorage
   */
  private async migrateSettings(): Promise<boolean> {
    const localSettings = localStorage.getItem('settings')
    if (!localSettings) return false

    try {
      const settings = JSON.parse(localSettings)
      await solidSettings.saveSettings(settings)
      return true
    } catch (error) {
      console.error('Settings migration error:', error)
      return false
    }
  }

  /**
   * Check what data exists in localStorage
   */
  hasLocalData(): { profile: boolean; bookmarks: boolean; settings: boolean } {
    return {
      profile: !!localStorage.getItem('user_profile'),
      bookmarks: !!localStorage.getItem('bookmarks'),
      settings: !!localStorage.getItem('settings')
    }
  }

  /**
   * Clear localStorage after successful migration
   */
  clearLocalData(keepBackup = true): void {
    if (keepBackup) {
      const backup = {
        profile: localStorage.getItem('user_profile'),
        bookmarks: localStorage.getItem('bookmarks'),
        settings: localStorage.getItem('settings'),
        timestamp: new Date().toISOString()
      }
      localStorage.setItem('solid_migration_backup', JSON.stringify(backup))
    }

    localStorage.removeItem('user_profile')
    localStorage.removeItem('bookmarks')
    localStorage.removeItem('settings')
  }

  /**
   * Restore from backup
   */
  restoreFromBackup(): boolean {
    const backup = localStorage.getItem('solid_migration_backup')
    if (!backup) return false

    try {
      const data = JSON.parse(backup)
      if (data.profile) localStorage.setItem('user_profile', data.profile)
      if (data.bookmarks) localStorage.setItem('bookmarks', data.bookmarks)
      if (data.settings) localStorage.setItem('settings', data.settings)
      return true
    } catch (error) {
      console.error('Restore error:', error)
      return false
    }
  }
}

export const solidMigration = new SolidMigrationService()
