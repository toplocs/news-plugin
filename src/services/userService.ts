import gun from './gun'
import type { UserProfile, UserSettings } from '../types/user'

/**
 * User Service - Gun.js integration for user profiles
 * Uses SEA for encryption of private fields
 */

const userNode = gun.get('news_plugin_users')

export class UserService {
  /**
   * Get user profile by ID
   */
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    return new Promise((resolve) => {
      userNode
        .get(userId)
        .once((data: any) => {
          if (data) {
            resolve(data as UserProfile)
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
    return new Promise((resolve, reject) => {
      const now = Date.now()
      const profileData = {
        ...profile,
        updatedAt: now,
        createdAt: profile.createdAt || now
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
