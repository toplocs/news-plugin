import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import UnreadBadge from '../../src/components/UnreadBadge.vue'

describe('UnreadBadge Component', () => {
  let wrapper: any

  describe('Rendering', () => {
    it('should render with count 0 (no badge visible)', () => {
      wrapper = mount(UnreadBadge, {
        props: { count: 0 }
      })
      
      const badge = wrapper.find('.badge')
      expect(badge.exists()).toBe(false)
    })

    it('should render badge when count > 0', () => {
      wrapper = mount(UnreadBadge, {
        props: { count: 5 }
      })
      
      const badge = wrapper.find('.badge')
      expect(badge.exists()).toBe(true)
      expect(badge.text()).toBe('5')
    })

    it('should show "9+" for counts > 9', () => {
      wrapper = mount(UnreadBadge, {
        props: { count: 15 }
      })
      
      const badge = wrapper.find('.badge')
      expect(badge.text()).toBe('9+')
    })
  })

  describe('Fixed Size (No Layout Shift)', () => {
    it('should have fixed 16x16px size', () => {
      wrapper = mount(UnreadBadge, {
        props: { count: 1 }
      })
      
      const badge = wrapper.find('.badge')
      const styles = window.getComputedStyle(badge.element)
      
      // Badge should have fixed dimensions
      expect(badge.classes()).toContain('w-4') // 16px
      expect(badge.classes()).toContain('h-4') // 16px
    })
  })

  describe('Animations', () => {
    it('should have pulse animation class', () => {
      wrapper = mount(UnreadBadge, {
        props: { count: 1 }
      })
      
      const badge = wrapper.find('.badge')
      expect(badge.classes()).toContain('animate-pulse')
    })
  })

  describe('Accessibility', () => {
    it('should have aria-label', () => {
      wrapper = mount(UnreadBadge, {
        props: { count: 5 }
      })
      
      const badge = wrapper.find('.badge')
      expect(badge.attributes('aria-label')).toContain('5')
    })
  })
})
