/**
 * Solid Profile Service - FULL IMPLEMENTATION
 * Manages user profile in Solid Pod (name, avatar, bio, interests)
 */

import {
  getSolidDataset,
  getThing,
  getStringNoLocale,
  setThing,
  saveSolidDatasetAt,
  createThing,
  setStringNoLocale,
  getUrlAll,
  addUrl,
  removeUrl,
  createSolidDataset
} from '@inrupt/solid-client'
import { FOAF, VCARD } from '@inrupt/vocab-common-rdf'
import { solidAuth } from './solidAuth'
import { executeSolidOperation } from '../utils/solidErrorHandler'

export interface SolidProfile {
  webId: string
  name: string
  avatar?: string
  bio?: string
  interests: string[]
}

class SolidProfileService {
  /**
   * Get user profile from Pod
   */
  async getProfile(webId?: string): Promise<SolidProfile | null> {
    const profileWebId = webId || solidAuth.getWebId()
    if (!profileWebId) {
      console.error('No WebID provided')
      return null
    }

    try {
      return await executeSolidOperation(
        async () => {
          const dataset = await getSolidDataset(profileWebId, {
            fetch: solidAuth.getFetch()
          })

          const profile = getThing(dataset, profileWebId)
          if (!profile) return null

          const name = getStringNoLocale(profile, FOAF.name) || ''
          const avatar = getStringNoLocale(profile, VCARD.hasPhoto)
          const bio = getStringNoLocale(profile, VCARD.note)
          const interestUrls = getUrlAll(profile, FOAF.topic_interest)

          return {
            webId: profileWebId,
            name,
            avatar,
            bio,
            interests: interestUrls.map(url => url.split('/').pop() || url)
          }
        },
        {
          operationName: 'Get Profile',
          retryConfig: { maxRetries: 3 },
          timeoutMs: 15000
        }
      )
    } catch (error) {
      console.error('Error loading profile:', error)
      return null
    }
  }

  /**
   * Save profile to Pod
   */
  async saveProfile(profile: Partial<SolidProfile>): Promise<boolean> {
    const webId = solidAuth.getWebId()
    if (!webId) {
      console.error('Not logged in')
      return false
    }

    try {
      await executeSolidOperation(
        async () => {
          let dataset = await getSolidDataset(webId, {
            fetch: solidAuth.getFetch()
          }).catch(() => createSolidDataset())

          let profileThing = getThing(dataset, webId) || createThing({ url: webId })

          // Update fields
          if (profile.name) {
            profileThing = setStringNoLocale(profileThing, FOAF.name, profile.name)
          }
          if (profile.avatar !== undefined) {
            if (profile.avatar) {
              profileThing = setStringNoLocale(profileThing, VCARD.hasPhoto, profile.avatar)
            }
          }
          if (profile.bio !== undefined) {
            if (profile.bio) {
              profileThing = setStringNoLocale(profileThing, VCARD.note, profile.bio)
            }
          }

          // Update interests
          if (profile.interests) {
            // Remove old interests
            const oldInterests = getUrlAll(profileThing, FOAF.topic_interest)
            oldInterests.forEach(url => {
              profileThing = removeUrl(profileThing, FOAF.topic_interest, url)
            })

            // Add new interests
            profile.interests.forEach(interest => {
              const interestUrl = `https://schema.org/${interest}`
              profileThing = addUrl(profileThing, FOAF.topic_interest, interestUrl)
            })
          }

          dataset = setThing(dataset, profileThing)
          await saveSolidDatasetAt(webId, dataset, {
            fetch: solidAuth.getFetch()
          })
        },
        {
          operationName: 'Save Profile',
          retryConfig: { maxRetries: 3 },
          timeoutMs: 15000
        }
      )

      return true
    } catch (error) {
      console.error('Error saving profile:', error)
      return false
    }
  }

  /**
   * Update profile field
   */
  async updateField(field: keyof SolidProfile, value: any): Promise<boolean> {
    return this.saveProfile({ [field]: value })
  }

  /**
   * Add interest
   */
  async addInterest(interest: string): Promise<boolean> {
    const profile = await this.getProfile()
    if (!profile) return false

    const interests = [...profile.interests, interest]
    return this.saveProfile({ interests })
  }

  /**
   * Remove interest
   */
  async removeInterest(interest: string): Promise<boolean> {
    const profile = await this.getProfile()
    if (!profile) return false

    const interests = profile.interests.filter(i => i !== interest)
    return this.saveProfile({ interests })
  }
}

export const solidProfile = new SolidProfileService()
