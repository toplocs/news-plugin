import { ref } from 'vue'
import { useToast } from './useToast'

export interface ShareData {
  title: string
  text?: string
  url: string
}

export function useShare() {
  const { success, error } = useToast()
  const isSharing = ref(false)

  /**
   * Check if Native Web Share API is available
   */
  const canShare = () => {
    return typeof navigator !== 'undefined' && 'share' in navigator
  }

  /**
   * Share using Native Web Share API (mobile)
   * Falls back to copy-to-clipboard on desktop
   */
  const share = async (data: ShareData) => {
    isSharing.value = true

    try {
      if (canShare()) {
        // Use Native Share API on supported devices (mobile)
        await navigator.share({
          title: data.title,
          text: data.text || '',
          url: data.url
        })
        success('Artikel geteilt')
      } else {
        // Fallback: Copy to clipboard
        await copyToClipboard(data.url)
      }
    } catch (err: any) {
      // User cancelled share or error occurred
      if (err.name !== 'AbortError') {
        console.error('Share failed:', err)
        error('Teilen fehlgeschlagen')
      }
    } finally {
      isSharing.value = false
    }
  }

  /**
   * Copy URL to clipboard
   */
  const copyToClipboard = async (url: string) => {
    try {
      // Modern Clipboard API
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url)
        success('Link kopiert')
        return
      }

      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = url
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()

      const successful = document.execCommand('copy')
      document.body.removeChild(textArea)

      if (successful) {
        success('Link kopiert')
      } else {
        throw new Error('Copy command failed')
      }
    } catch (err) {
      console.error('Copy to clipboard failed:', err)
      error('Kopieren fehlgeschlagen')
    }
  }

  /**
   * Generate social media share URLs
   */
  const getSocialShareUrl = (platform: 'twitter' | 'facebook' | 'linkedin' | 'whatsapp', data: ShareData) => {
    const encodedUrl = encodeURIComponent(data.url)
    const encodedTitle = encodeURIComponent(data.title)
    const encodedText = encodeURIComponent(data.text || data.title)

    switch (platform) {
      case 'twitter':
        return `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`

      case 'facebook':
        return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`

      case 'linkedin':
        return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`

      case 'whatsapp':
        return `https://wa.me/?text=${encodedText}%20${encodedUrl}`

      default:
        return ''
    }
  }

  /**
   * Share to specific social media platform
   */
  const shareToSocial = (platform: 'twitter' | 'facebook' | 'linkedin' | 'whatsapp', data: ShareData) => {
    const url = getSocialShareUrl(platform, data)
    if (url) {
      // Open in new window
      window.open(url, '_blank', 'noopener,noreferrer,width=600,height=600')
      success(`Artikel auf ${platform} geteilt`)
    }
  }

  return {
    isSharing,
    canShare,
    share,
    copyToClipboard,
    shareToSocial,
    getSocialShareUrl
  }
}
