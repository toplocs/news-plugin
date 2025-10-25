/**
 * Gun.js Service - Dezentrales P2P Datenbank System
 * Real-time sync, encryption, peer discovery
 */

import Gun from 'gun'
import 'gun/sea'
import 'gun/axe'
import { ref, reactive } from 'vue'

// Gun.js Setup mit mehreren Peers für Dezentralität
const peers = [
  'https://gun-manhattan.herokuapp.com/gun',
  'https://gunjs.herokuapp.com/gun',
  'https://e2eec.herokuapp.com/gun'
]

export const gun = Gun({
  peers,
  localStorage: true,
  radisk: true,
  multicast: true
})

// User reference
export const user = gun.user().recall({ sessionStorage: true })

// SEA für Verschlüsselung
export const SEA = Gun.SEA

/**
 * Gun Auth State
 */
export const gunAuth = reactive({
  isLoggedIn: false,
  alias: '',
  pub: '',
  pair: null as any
})

/**
 * Login mit Gun.js
 */
export async function gunLogin(alias: string, password: string): Promise<boolean> {
  return new Promise((resolve) => {
    user.auth(alias, password, (ack: any) => {
      if (ack.err) {
        console.error('[Gun] Login failed:', ack.err)
        resolve(false)
      } else {
        gunAuth.isLoggedIn = true
        gunAuth.alias = alias
        gunAuth.pub = user.is.pub
        gunAuth.pair = user._.sea
        console.log('[Gun] Login successful:', alias)
        resolve(true)
      }
    })
  })
}

/**
 * Registrierung
 */
export async function gunSignup(alias: string, password: string): Promise<boolean> {
  return new Promise((resolve) => {
    user.create(alias, password, (ack: any) => {
      if (ack.err) {
        console.error('[Gun] Signup failed:', ack.err)
        resolve(false)
      } else {
        console.log('[Gun] Signup successful, now logging in...')
        gunLogin(alias, password).then(resolve)
      }
    })
  })
}

/**
 * Logout
 */
export function gunLogout() {
  user.leave()
  gunAuth.isLoggedIn = false
  gunAuth.alias = ''
  gunAuth.pub = ''
  gunAuth.pair = null
  console.log('[Gun] Logged out')
}

/**
 * Check if logged in
 */
export function checkGunAuth() {
  const is = user.is
  if (is) {
    gunAuth.isLoggedIn = true
    gunAuth.alias = is.alias
    gunAuth.pub = is.pub
    gunAuth.pair = user._.sea
    return true
  }
  return false
}

/**
 * Profile Interface
 */
export interface GunProfile {
  alias: string
  displayName: string
  bio: string
  avatar?: string
  interests: string[]
  location?: {
    city: string
    country: string
    lat?: number
    lng?: number
  }
  created: number
  updated: number
}

/**
 * Get User Profile
 */
export async function getProfile(pub?: string): Promise<GunProfile | null> {
  const targetUser = pub ? gun.user(pub) : user

  return new Promise((resolve) => {
    targetUser.get('profile').once((data: any) => {
      if (data) {
        resolve(data as GunProfile)
      } else {
        resolve(null)
      }
    })
  })
}

/**
 * Save User Profile
 */
export async function saveProfile(profile: Partial<GunProfile>): Promise<boolean> {
  if (!gunAuth.isLoggedIn) {
    console.error('[Gun] Not logged in')
    return false
  }

  const currentProfile = await getProfile()
  const updatedProfile: GunProfile = {
    ...currentProfile,
    ...profile,
    alias: gunAuth.alias,
    updated: Date.now()
  } as GunProfile

  return new Promise((resolve) => {
    user.get('profile').put(updatedProfile, (ack: any) => {
      if (ack.err) {
        console.error('[Gun] Profile save failed:', ack.err)
        resolve(false)
      } else {
        console.log('[Gun] Profile saved')
        resolve(true)
      }
    })
  })
}

/**
 * Post Interface
 */
export interface GunPost {
  id: string
  author: string
  authorPub: string
  title: string
  content: string
  tags: string[]
  location?: {
    city: string
    country: string
  }
  created: number
  likes: number
  comments: number
}

/**
 * Create Post
 */
export async function createPost(post: Omit<GunPost, 'id' | 'author' | 'authorPub' | 'created' | 'likes' | 'comments'>): Promise<string | null> {
  if (!gunAuth.isLoggedIn) {
    console.error('[Gun] Not logged in')
    return null
  }

  const postId = `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  const newPost: GunPost = {
    ...post,
    id: postId,
    author: gunAuth.alias,
    authorPub: gunAuth.pub,
    created: Date.now(),
    likes: 0,
    comments: 0
  }

  return new Promise((resolve) => {
    // Save to public posts
    gun.get('posts').get(postId).put(newPost, (ack: any) => {
      if (ack.err) {
        console.error('[Gun] Post creation failed:', ack.err)
        resolve(null)
      } else {
        // Add to user's posts
        user.get('posts').get(postId).put(newPost)
        console.log('[Gun] Post created:', postId)
        resolve(postId)
      }
    })
  })
}

/**
 * Get Posts Feed
 */
export function subscribeToPosts(callback: (post: GunPost) => void, limit: number = 20) {
  let count = 0

  gun.get('posts').map().on((post: any, id: string) => {
    if (post && count < limit) {
      count++
      callback(post as GunPost)
    }
  })
}

/**
 * Like Post
 */
export async function likePost(postId: string): Promise<boolean> {
  if (!gunAuth.isLoggedIn) return false

  return new Promise((resolve) => {
    gun.get('posts').get(postId).get('likes').once((likes: number) => {
      gun.get('posts').get(postId).get('likes').put((likes || 0) + 1, (ack: any) => {
        if (ack.err) {
          resolve(false)
        } else {
          // Track user like
          user.get('liked').get(postId).put(true)
          resolve(true)
        }
      })
    })
  })
}

/**
 * Message Interface
 */
export interface GunMessage {
  id: string
  from: string
  fromPub: string
  to: string
  toPub: string
  content: string
  encrypted: boolean
  created: number
  read: boolean
}

/**
 * Send Direct Message (Encrypted)
 */
export async function sendMessage(toPub: string, content: string): Promise<boolean> {
  if (!gunAuth.isLoggedIn) {
    console.error('[Gun] Not logged in')
    return false
  }

  try {
    // Encrypt message for recipient
    const theirPub = await gun.user(toPub).get('pub').then()
    const secret = await SEA.secret(theirPub, gunAuth.pair)
    const encrypted = await SEA.encrypt(content, secret)

    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const message: GunMessage = {
      id: messageId,
      from: gunAuth.alias,
      fromPub: gunAuth.pub,
      to: '',
      toPub,
      content: encrypted,
      encrypted: true,
      created: Date.now(),
      read: false
    }

    return new Promise((resolve) => {
      // Save to recipient's inbox
      gun.user(toPub).get('inbox').get(messageId).put(message, (ack: any) => {
        if (ack.err) {
          console.error('[Gun] Message send failed:', ack.err)
          resolve(false)
        } else {
          // Save to sender's outbox
          user.get('outbox').get(messageId).put(message)
          console.log('[Gun] Message sent')
          resolve(true)
        }
      })
    })
  } catch (error) {
    console.error('[Gun] Message encryption failed:', error)
    return false
  }
}

/**
 * Subscribe to Messages
 */
export function subscribeToMessages(callback: (message: GunMessage) => void) {
  if (!gunAuth.isLoggedIn) return

  user.get('inbox').map().on(async (encMsg: any, id: string) => {
    if (encMsg && encMsg.encrypted) {
      try {
        // Decrypt message
        const theirPub = encMsg.fromPub
        const secret = await SEA.secret(theirPub, gunAuth.pair)
        const decrypted = await SEA.decrypt(encMsg.content, secret)

        const message: GunMessage = {
          ...encMsg,
          content: decrypted,
          encrypted: false
        }

        callback(message)
      } catch (error) {
        console.error('[Gun] Message decryption failed:', error)
      }
    }
  })
}

/**
 * Find Users by Interest or Location
 */
export async function findUsers(filter: {
  interests?: string[]
  location?: string
  limit?: number
}): Promise<GunProfile[]> {
  const profiles: GunProfile[] = []
  const limit = filter.limit || 10

  return new Promise((resolve) => {
    gun.get('profiles').map().once((profile: any) => {
      if (!profile || profiles.length >= limit) return

      let matches = false

      // Filter by interests
      if (filter.interests && profile.interests) {
        const hasMatchingInterest = filter.interests.some(interest =>
          profile.interests.includes(interest)
        )
        if (hasMatchingInterest) matches = true
      }

      // Filter by location
      if (filter.location && profile.location) {
        if (profile.location.city === filter.location || profile.location.country === filter.location) {
          matches = true
        }
      }

      if (matches || (!filter.interests && !filter.location)) {
        profiles.push(profile as GunProfile)
      }
    })

    // Wait a bit for results, then resolve
    setTimeout(() => resolve(profiles), 2000)
  })
}

/**
 * Get Peers Count
 */
export function getPeersCount(): number {
  return gun._.opt.peers ? Object.keys(gun._.opt.peers).length : 0
}

/**
 * Initialize Gun on app start
 */
export function initGun() {
  checkGunAuth()
  console.log('[Gun] Initialized with', getPeersCount(), 'peers')
}
