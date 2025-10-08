import gun from './gun'
import 'gun/sea'
import type { UserProfile, UserSettings } from '../types/user'

/**
 * User Service - Gun.js integration for user profiles
 * Uses SEA for encryption of private fields
 */

// @ts-ignore - Gun SEA is dynamically loaded
const SEA = (gun as any).SEA

const userNode = gun.get('news_plugin_users')

// Demo encryption key - in production, this would be derived from user auth
// For now, we persist the key in localStorage to enable decryption
const getUserEncryptionKey = async (userId: string) => {
  // In production: derive from WebAuthn/passkey
  // For demo: persist key in localStorage per user
  const storageKey = `news_plugin_key_${userId}`
  const stored = localStorage.getItem(storageKey)

  if (stored) {
    try {
      return JSON.parse(stored)
    } catch (e) {
      console.warn('Failed to parse stored key, generating new one')
    }
  }

  // Generate new key pair and store it
  const pair = await SEA.pair()
  localStorage.setItem(storageKey, JSON.stringify(pair))
  return pair
}

export class UserService {
  /**
   * Get user profile by ID
   */
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    return new Promise(async (resolve) => {
      userNode
        .get(userId)
        .once(async (data: any) => {
          if (data) {
            const pair = await getUserEncryptionKey(userId)

            // Decrypt private fields if they exist and are encrypted
            let decryptedEmail = data.email
            let decryptedPhone = data.phone

            if (data.email && typeof data.email === 'string' && data.email.startsWith('SEA{')) {
              try {
                decryptedEmail = await SEA.decrypt(data.email, pair)
              } catch (e) {
                console.warn('Failed to decrypt email:', e)
              }
            }

            if (data.phone && typeof data.phone === 'string' && data.phone.startsWith('SEA{')) {
              try {
                decryptedPhone = await SEA.decrypt(data.phone, pair)
              } catch (e) {
                console.warn('Failed to decrypt phone:', e)
              }
            }

            resolve({
              ...data,
              email: decryptedEmail,
              phone: decryptedPhone
            } as UserProfile)
          } else {
            resolve(null)
          }
        })
    })
  }

  /**
   * Create or update user profile
   */
  async saveUserProfile(profile: UserProfile): Promise<void> {
    return new Promise(async (resolve, reject) => {
      const now = Date.now()
      const pair = await getUserEncryptionKey(profile.id)

      // Encrypt private fields if present
      let encryptedEmail = profile.email
      let encryptedPhone = profile.phone

      if (profile.email) {
        encryptedEmail = await SEA.encrypt(profile.email, pair)
      }
      if (profile.phone) {
        encryptedPhone = await SEA.encrypt(profile.phone, pair)
      }

      const profileData = {
        ...profile,
        email: encryptedEmail,
        phone: encryptedPhone,
        updatedAt: now,
        createdAt: profile.createdAt || now,
        // Store the public key for verification
        pub: pair.pub
      }

      userNode
        .get(profile.id)
        .put(profileData, (ack: any) => {
          if (ack.err) {
            reject(new Error(ack.err))
          } else {
            resolve()
          }
        })
    })
  }

  /**
   * Subscribe to user profile updates
   */
  subscribeToUser(userId: string, callback: (profile: UserProfile) => void) {
    userNode
      .get(userId)
      .on((data: any) => {
        if (data) {
          callback(data as UserProfile)
        }
      })
  }

  /**
   * Upload avatar (Base64)
   */
  async uploadAvatar(userId: string, base64Image: string): Promise<string> {
    // In production, this would upload to a CDN or IPFS
    // For now, store directly in Gun (not recommended for large files)
    return new Promise((resolve, reject) => {
      userNode
        .get(userId)
        .get('avatar')
        .put(base64Image, (ack: any) => {
          if (ack.err) {
            reject(new Error(ack.err))
          } else {
            resolve(base64Image)
          }
        })
    })
  }

  /**
   * Follow a user
   */
  async followUser(userId: string, targetUserId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // Add to following list
      userNode
        .get(userId)
        .get('following')
        .get(targetUserId)
        .put(true, (ack: any) => {
          if (ack.err) {
            reject(new Error(ack.err))
          } else {
            // Add to target user's followers
            userNode
              .get(targetUserId)
              .get('followers')
              .get(userId)
              .put(true, (followAck: any) => {
                if (followAck.err) {
                  reject(new Error(followAck.err))
                } else {
                  resolve()
                }
              })
          }
        })
    })
  }

  /**
   * Unfollow a user
   */
  async unfollowUser(userId: string, targetUserId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // Remove from following list
      userNode
        .get(userId)
        .get('following')
        .get(targetUserId)
        .put(null, (ack: any) => {
          if (ack.err) {
            reject(new Error(ack.err))
          } else {
            // Remove from target user's followers
            userNode
              .get(targetUserId)
              .get('followers')
              .get(userId)
              .put(null, (unfollowAck: any) => {
                if (unfollowAck.err) {
                  reject(new Error(unfollowAck.err))
                } else {
                  resolve()
                }
              })
          }
        })
    })
  }

  /**
   * Get user settings
   */
  async getUserSettings(userId: string): Promise<UserSettings> {
    return new Promise((resolve) => {
      userNode
        .get(userId)
        .get('settings')
        .once((data: any) => {
          if (data) {
            resolve(data as UserSettings)
          } else {
            // Return default settings
            resolve({
              privacy: 'public',
              notifications: {
                email: true,
                push: true,
                messages: true,
                mentions: true
              },
              visibility: {
                showEmail: false,
                showPhone: false,
                showLocation: true
              }
            })
          }
        })
    })
  }

  /**
   * Save user settings
   */
  async saveUserSettings(userId: string, settings: UserSettings): Promise<void> {
    return new Promise((resolve, reject) => {
      userNode
        .get(userId)
        .get('settings')
        .put(settings, (ack: any) => {
          if (ack.err) {
            reject(new Error(ack.err))
          } else {
            resolve()
          }
        })
    })
  }

  /**
   * Search users by name or username
   */
  async searchUsers(query: string): Promise<UserProfile[]> {
    return new Promise((resolve) => {
      const results: UserProfile[] = []
      const lowerQuery = query.toLowerCase()

      userNode.map().once((user: any, userId: string) => {
        if (user && typeof user === 'object') {
          const name = (user.name || '').toLowerCase()
          const username = (user.username || '').toLowerCase()

          if (name.includes(lowerQuery) || username.includes(lowerQuery)) {
            results.push({ ...user, id: userId } as UserProfile)
          }
        }
      })

      // Wait a bit for results to accumulate
      setTimeout(() => {
        resolve(results)
      }, 1000)
    })
  }
}

export const userService = new UserService()
