/*
═══════════════════════════════════════════════════════════════════════════════
🧪 TEST-DOKUMENTATION - userService.ts (PHASE 2) - 295 ZEILEN + SEA!
═══════════════════════════════════════════════════════════════════════════════

📋 WAS WIRD HIER GETESTET:
- Gun.js User Profile CRUD (Create, Read, Update)
- 🔐 SEA Encryption für private Felder (email, phone)
- Encryption Key Management (localStorage per userId)
- Avatar Upload (Base64)
- Follow/Unfollow System
- User Search (name, username)
- User Settings (privacy, notifications, visibility)

🎯 ERWARTETE ERGEBNISSE:
✅ getUserProfile(id): Lädt Profil, decrypted email + phone
✅ saveUserProfile(): Speichert mit SEA encrypted email + phone
✅ SEA Encryption: email/phone start mit "SEA{" (encrypted)
✅ SEA Decryption: Returned plaintext email/phone
✅ Encryption Key: Unique per userId, stored in localStorage
✅ Avatar Upload: Base64 string → Gun.js avatar node
✅ Follow/Unfollow: Bidirectional (following + followers)
✅ User Search: Case-insensitive name/username search

🔧 WIE ZU TESTEN:
1. Save Profile Test:
   - profile = { id: 'user1', email: 'test@example.com', phone: '+49123' }
   - await userService.saveUserProfile(profile)
   - Gun.js Browser Extension → Check users/user1
   - email sollte starten mit "SEA{" (encrypted!)
   - phone sollte starten mit "SEA{" (encrypted!)
2. Load Profile Test:
   - profile = await userService.getUserProfile('user1')
   - profile.email sollte "test@example.com" sein (decrypted!)
   - profile.phone sollte "+49123" sein (decrypted!)
3. Encryption Key Test:
   - localStorage → Check "news_plugin_key_user1"
   - Sollte JSON-Stringified SEA pair sein { pub, priv, epub, epriv }
4. Avatar Upload:
   - base64 = "data:image/png;base64,..."
   - await userService.uploadAvatar('user1', base64)
   - Gun.js → users/user1/avatar sollte base64 sein
5. Follow Test:
   - await userService.followUser('user1', 'user2')
   - Gun.js → users/user1/following/user2 = true
   - Gun.js → users/user2/followers/user1 = true
6. Unfollow Test:
   - await userService.unfollowUser('user1', 'user2')
   - Gun.js → users/user1/following/user2 = null
   - Gun.js → users/user2/followers/user1 = null
7. Search Test:
   - await userService.searchUsers('alice')
   - Sollte alle Users mit "alice" in name/username returnen

🔐 SEA ENCRYPTION DETAILS:
- Encryption: await SEA.encrypt(plaintext, pair)
- Decryption: await SEA.decrypt(ciphertext, pair)
- Key Generation: await SEA.pair() → { pub, priv, epub, epriv }
- Storage: localStorage: news_plugin_key_{userId}
- Encrypted Format: "SEA{..." (String starting mit SEA{)

📊 GUN.JS NODES:
- Users: gun.get('news_plugin_users').get(userId)
- Avatar: .get(userId).get('avatar')
- Following: .get(userId).get('following').get(targetId)
- Followers: .get(targetId).get('followers').get(userId)
- Settings: .get(userId).get('settings')

🚨 BEKANNTE ISSUES:
- Keine (Phase 2 vollständig implementiert ✅)

🔒 SECURITY NOTES:
- In Production: Keys sollten von WebAuthn/Passkey derived werden
- Demo: Keys in localStorage (nicht production-safe!)
- Private Fields: Nur email + phone encrypted
- Public Fields: name, username, bio, avatar (not encrypted)

═══════════════════════════════════════════════════════════════════════════════
*/
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
