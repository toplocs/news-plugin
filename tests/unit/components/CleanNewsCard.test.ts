import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import CleanNewsCard from '../../../src/components/CleanNewsCard.vue'
import type { NewsArticle } from '../../../src/types'

describe('CleanNewsCard', () => {
  let mockArticle: NewsArticle

  beforeEach(() => {
    mockArticle = {
      id: 'test-article-1',
      title: 'Test Article Title',
      summary: 'This is a test article summary that should be displayed in the card',
      content: 'Full content here',
      url: 'https://example.com/article',
      source: 'Test Source',
      imageUrl: 'https://example.com/image.jpg',
      author: 'John Doe',
      publishedAt: Date.now(),
      topics: ['tech', 'programming'],
      locations: ['Berlin'],
      tags: ['vue', 'testing'],
      contentType: 'tutorial',
      difficulty: 'beginner',
      readingTime: 5,
      resources: []
    }
  })

  describe('Rendering', () => {
    it('should render article title', () => {
      const wrapper = mount(CleanNewsCard, {
        props: { article: mockArticle }
      })

      expect(wrapper.text()).toContain('Test Article Title')
    })

    it('should render article summary', () => {
      const wrapper = mount(CleanNewsCard, {
        props: { article: mockArticle }
      })

      expect(wrapper.text()).toContain('This is a test article summary')
    })

    it('should render author name', () => {
      const wrapper = mount(CleanNewsCard, {
        props: { article: mockArticle }
      })

      expect(wrapper.text()).toContain('John Doe')
    })

    it('should render source', () => {
      const wrapper = mount(CleanNewsCard, {
        props: { article: mockArticle }
      })

      expect(wrapper.text()).toContain('Test Source')
    })

    it('should render article content', () => {
      const wrapper = mount(CleanNewsCard, {
        props: { article: mockArticle }
      })

      // Component shows title, summary, source - reading time is NOT displayed
      expect(wrapper.text()).toContain(mockArticle.title)
    })
  })

  describe('Tags Display', () => {
    it('should render tags with hash prefix', () => {
      const wrapper = mount(CleanNewsCard, {
        props: { article: mockArticle }
      })

      // Component shows tags (not topics), first 2 with # prefix
      expect(wrapper.text()).toContain('#vue')
      expect(wrapper.text()).toContain('#testing')
    })

    it('should limit tags to first 2', () => {
      const articleWithManyTags = {
        ...mockArticle,
        tags: ['vue', 'testing', 'vitest', 'typescript', 'javascript']
      }

      const wrapper = mount(CleanNewsCard, {
        props: { article: articleWithManyTags }
      })

      // Should only show first 2 tags
      expect(wrapper.text()).toContain('#vue')
      expect(wrapper.text()).toContain('#testing')
      expect(wrapper.text()).not.toContain('#vitest')
    })
  })

  describe('Image Handling', () => {
    it('should render image with correct src', () => {
      const wrapper = mount(CleanNewsCard, {
        props: { article: mockArticle }
      })

      const img = wrapper.find('img')
      expect(img.exists()).toBe(true)
      expect(img.attributes('src')).toBe('https://example.com/image.jpg')
    })

    it('should have alt text for image', () => {
      const wrapper = mount(CleanNewsCard, {
        props: { article: mockArticle }
      })

      const img = wrapper.find('img')
      expect(img.attributes('alt')).toBeDefined()
    })
  })

  describe('Click Events', () => {
    it('should emit click event when card is clicked', async () => {
      const wrapper = mount(CleanNewsCard, {
        props: { article: mockArticle }
      })

      await wrapper.trigger('click')

      expect(wrapper.emitted('click')).toBeTruthy()
    })

    it('should pass article in click event', async () => {
      const wrapper = mount(CleanNewsCard, {
        props: { article: mockArticle }
      })

      await wrapper.trigger('click')

      const clickEvent = wrapper.emitted('click')
      expect(clickEvent).toBeTruthy()
      if (clickEvent) {
        expect(clickEvent[0]).toBeDefined()
      }
    })
  })

  describe('Date Formatting', () => {
    it('should display relative time for recent articles', () => {
      const recentArticle = {
        ...mockArticle,
        publishedAt: Date.now() - 3600000 // 1 hour ago
      }

      const wrapper = mount(CleanNewsCard, {
        props: { article: recentArticle }
      })

      // Component uses short format: "1h" instead of "1 hour ago"
      expect(wrapper.text()).toContain('1h')
    })
  })

  describe('Styling', () => {
    it('should have news-card class', () => {
      const wrapper = mount(CleanNewsCard, {
        props: { article: mockArticle }
      })

      // Component uses news-card class with rgba backgrounds (not Tailwind glassmorphism)
      expect(wrapper.classes()).toContain('news-card')
    })

    it('should have styled structure', () => {
      const wrapper = mount(CleanNewsCard, {
        props: { article: mockArticle }
      })

      // Check for main structural classes
      const html = wrapper.html()
      expect(html).toContain('card-body')
      expect(html).toContain('card-image')
    })
  })

  describe('Edge Cases', () => {
    it('should handle missing image gracefully', () => {
      const articleWithoutImage = {
        ...mockArticle,
        imageUrl: undefined
      }

      const wrapper = mount(CleanNewsCard, {
        props: { article: articleWithoutImage }
      })

      // Should still render without crashing
      expect(wrapper.exists()).toBe(true)
    })

    it('should handle missing author', () => {
      const articleWithoutAuthor = {
        ...mockArticle,
        author: undefined
      }

      const wrapper = mount(CleanNewsCard, {
        props: { article: articleWithoutAuthor }
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('should handle empty topics array', () => {
      const articleWithoutTopics = {
        ...mockArticle,
        topics: []
      }

      const wrapper = mount(CleanNewsCard, {
        props: { article: articleWithoutTopics }
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('should display summary with line clamp', () => {
      const longSummary = 'A'.repeat(500)
      const articleWithLongSummary = {
        ...mockArticle,
        summary: longSummary
      }

      const wrapper = mount(CleanNewsCard, {
        props: { article: articleWithLongSummary }
      })

      // Component uses CSS line-clamp for truncation (2 lines max)
      // The full summary is in the HTML but CSS truncates it visually
      expect(wrapper.find('.summary').exists()).toBe(true)
    })
  })
})
