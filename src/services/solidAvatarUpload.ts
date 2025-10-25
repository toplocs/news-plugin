/**
 * Solid Avatar Upload Service
 * Handles avatar image upload and storage in Solid Pod
 */

import { solidAuth } from './solidAuth'
import { executeSolidOperation } from '../utils/solidErrorHandler'
import {
  overwriteFile,
  getFile,
  deleteFile
} from '@inrupt/solid-client'

const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

export interface UploadResult {
  success: boolean
  url?: string
  error?: string
}

class SolidAvatarUploadService {
  /**
   * Upload avatar from File object
   */
  async uploadAvatar(file: File): Promise<UploadResult> {
    try {
      // Validate file
      const validation = this.validateFile(file)
      if (!validation.valid) {
        return { success: false, error: validation.error }
      }

      const webId = solidAuth.getWebId()
      if (!webId) {
        return { success: false, error: 'Not logged in' }
      }

      // Generate avatar URL in Pod
      const avatarUrl = this.getAvatarUrl(webId, file.name)

      // Upload to Pod
      await executeSolidOperation(
        async () => {
          await overwriteFile(
            avatarUrl,
            file,
            {
              contentType: file.type,
              fetch: solidAuth.getFetch()
            }
          )
        },
        {
          operationName: 'Upload Avatar',
          retryConfig: { maxRetries: 2 },
          timeoutMs: 30000
        }
      )

      return { success: true, url: avatarUrl }
    } catch (error) {
      console.error('Avatar upload error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      }
    }
  }

  /**
   * Upload avatar from Base64 string
   */
  async uploadAvatarBase64(base64: string, filename: string = 'avatar.png'): Promise<UploadResult> {
    try {
      const blob = this.base64ToBlob(base64)
      const file = new File([blob], filename, { type: blob.type })
      return await this.uploadAvatar(file)
    } catch (error) {
      return {
        success: false,
        error: 'Invalid Base64 format'
      }
    }
  }

  /**
   * Delete current avatar
   */
  async deleteAvatar(): Promise<boolean> {
    try {
      const webId = solidAuth.getWebId()
      if (!webId) return false

      const avatarUrl = this.getAvatarUrl(webId, 'avatar')

      await executeSolidOperation(
        async () => {
          await deleteFile(avatarUrl, {
            fetch: solidAuth.getFetch()
          })
        },
        {
          operationName: 'Delete Avatar',
          retryConfig: { maxRetries: 2 }
        }
      )

      return true
    } catch (error) {
      console.error('Avatar delete error:', error)
      return false
    }
  }

  /**
   * Get avatar Blob from Pod
   */
  async getAvatar(avatarUrl: string): Promise<Blob | null> {
    try {
      return await executeSolidOperation(
        async () => {
          const file = await getFile(avatarUrl, {
            fetch: solidAuth.getFetch()
          })
          return file
        },
        {
          operationName: 'Get Avatar',
          retryConfig: { maxRetries: 2 }
        }
      )
    } catch (error) {
      console.error('Avatar fetch error:', error)
      return null
    }
  }

  /**
   * Convert File to Base64
   */
  async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsDataURL(file)
    })
  }

  /**
   * Convert Base64 to Blob
   */
  private base64ToBlob(base64: string): Blob {
    const parts = base64.split(';base64,')
    const contentType = parts[0].split(':')[1] || 'image/png'
    const raw = atob(parts[1])
    const bytes = new Uint8Array(raw.length)

    for (let i = 0; i < raw.length; i++) {
      bytes[i] = raw.charCodeAt(i)
    }

    return new Blob([bytes], { type: contentType })
  }

  /**
   * Validate file before upload
   */
  private validateFile(file: File): { valid: boolean; error?: string } {
    if (file.size > MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `File too large (max ${MAX_FILE_SIZE / 1024 / 1024} MB)`
      }
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: `Invalid file type (allowed: ${ALLOWED_TYPES.join(', ')})`
      }
    }

    return { valid: true }
  }

  /**
   * Generate avatar URL in Pod
   */
  private getAvatarUrl(webId: string, filename: string): string {
    const podRoot = webId.split('/profile')[0]
    const ext = filename.split('.').pop() || 'png'
    return `${podRoot}/toplocs/avatar.${ext}`
  }

  /**
   * Resize image before upload
   */
  async resizeImage(file: File, maxWidth: number = 400, maxHeight: number = 400): Promise<File> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      if (!ctx) {
        reject(new Error('Canvas not supported'))
        return
      }

      img.onload = () => {
        let { width, height } = img

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          width *= ratio
          height *= ratio
        }

        canvas.width = width
        canvas.height = height
        ctx.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(new File([blob], file.name, { type: file.type }))
            } else {
              reject(new Error('Failed to resize image'))
            }
          },
          file.type,
          0.9
        )
      }

      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = URL.createObjectURL(file)
    })
  }
}

export const solidAvatarUpload = new SolidAvatarUploadService()
