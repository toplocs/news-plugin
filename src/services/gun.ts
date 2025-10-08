import Gun from 'gun'
import 'gun/sea'

// Initialize Gun instance
// For development: localStorage-only mode (no P2P sync errors)
// For production: Add active relay servers in peers array
const gun = Gun({
  peers: [], // Empty = localStorage-only mode (no network errors)
  localStorage: true,
  radisk: true
})

// News plugin namespace
export const newsGun = gun.get('news_plugin')

// Helper functions for news operations
export const newsService = {
  // Get news for a specific parent (location or topic)
  getNewsForParent(parentId: string) {
    return newsGun.get(parentId).get('news')
  },

  // Add news item
  async addNews(parentId: string, newsItem: any) {
    const timestamp = Date.now()
    const newsId = `news_${timestamp}`

    return new Promise((resolve) => {
      newsGun
        .get(parentId)
        .get('news')
        .get(newsId)
        .put({
          ...newsItem,
          id: newsId,
          createdAt: timestamp
        }, (ack: any) => {
          resolve(ack)
        })
    })
  },

  // Get settings for a parent
  getSettings(parentId: string) {
    return newsGun.get(parentId).get('settings')
  },

  // Save settings
  async saveSettings(parentId: string, settings: any) {
    return new Promise((resolve) => {
      newsGun
        .get(parentId)
        .get('settings')
        .put(settings, (ack: any) => {
          resolve(ack)
        })
    })
  }
}

export default gun
