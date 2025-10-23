import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ProfileForm from '../../src/components/ProfileForm.vue'

describe('ProfileForm Component', () => {
  let wrapper: any

  beforeEach(() => {
    wrapper = mount(ProfileForm, {
      props: {
        initialProfile: {
          name: 'Test User',
          bio: 'Test Bio',
          interests: ['Technology', 'AI']
        }
      }
    })
  })

  describe('Rendering', () => {
    it('should render form fields', () => {
      expect(wrapper.find('input[type="text"]').exists()).toBe(true)
      expect(wrapper.find('textarea').exists()).toBe(true)
    })

    it('should display initial profile data', () => {
      const nameInput = wrapper.find('input[type="text"]')
      expect(nameInput.element.value).toBe('Test User')
    })
  })

  describe('Bio Limit', () => {
    it('should enforce 200 character limit', async () => {
      const bioTextarea = wrapper.find('textarea')
      const longBio = 'a'.repeat(250)
      
      await bioTextarea.setValue(longBio)
      
      // Should be truncated to 200
      expect(bioTextarea.element.value.length).toBeLessThanOrEqual(200)
    })
  })

  describe('Interests', () => {
    it('should allow adding interests', async () => {
      const initialLength = wrapper.vm.interests.length
      // Simulate adding interest
      await wrapper.vm.addInterest('Climate')
      
      expect(wrapper.vm.interests.length).toBe(initialLength + 1)
      expect(wrapper.vm.interests).toContain('Climate')
    })

    it('should allow removing interests', async () => {
      const interestToRemove = wrapper.vm.interests[0]
      await wrapper.vm.removeInterest(interestToRemove)
      
      expect(wrapper.vm.interests).not.toContain(interestToRemove)
    })
  })

  describe('Validation', () => {
    it('should validate required fields', async () => {
      const nameInput = wrapper.find('input[type="text"]')
      await nameInput.setValue('')
      
      // Trigger validation
      await wrapper.vm.validateForm()
      
      expect(wrapper.vm.errors.name).toBeDefined()
    })
  })
})
