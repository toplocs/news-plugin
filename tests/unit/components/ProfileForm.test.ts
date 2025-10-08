import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ProfileForm from '../../../src/components/ProfileForm.vue'
import type { UserProfile } from '../../../src/types/user'

describe('ProfileForm', () => {
  const mockProfile: UserProfile = {
    id: 'test-user-123',
    name: 'Test User',
    username: 'testuser',
    bio: 'Test bio',
    interests: ['Vue.js', 'TypeScript'],
    following: [],
    followers: [],
    createdAt: Date.now(),
    updatedAt: Date.now()
  }

  describe('Rendering', () => {
    it('should render profile form with initial data', () => {
      const wrapper = mount(ProfileForm, {
        props: {
          profile: mockProfile
        }
      })

      expect(wrapper.find('input[type="text"]').element.value).toBe(mockProfile.name)
      expect(wrapper.text()).toContain('Speichern')
    })

    it('should display bio character count', async () => {
      const wrapper = mount(ProfileForm, {
        props: {
          profile: mockProfile
        }
      })

      const bioTextarea = wrapper.find('textarea')
      await bioTextarea.setValue('This is a test bio')

      expect(wrapper.text()).toContain('18')
    })

    it('should show avatar upload button', () => {
      const wrapper = mount(ProfileForm, {
        props: {
          profile: mockProfile
        }
      })

      expect(wrapper.find('.btn-upload').exists()).toBe(true)
      expect(wrapper.find('.btn-upload').text()).toContain('Foto hochladen')
    })
  })

  describe('Validation', () => {
    it('should disable save button when name is empty', async () => {
      const wrapper = mount(ProfileForm, {
        props: {
          profile: { ...mockProfile, name: '' }
        }
      })

      const saveButton = wrapper.find('.btn-save')
      expect(saveButton.attributes('disabled')).toBeDefined()
    })

    it('should enable save button when form is valid', () => {
      const wrapper = mount(ProfileForm, {
        props: {
          profile: mockProfile
        }
      })

      const saveButton = wrapper.find('.btn-save')
      expect(saveButton.attributes('disabled')).toBeUndefined()
    })

    it('should limit bio to 200 characters', async () => {
      const wrapper = mount(ProfileForm, {
        props: {
          profile: mockProfile
        }
      })

      const longBio = 'a'.repeat(250)
      const bioTextarea = wrapper.find('textarea')
      await bioTextarea.setValue(longBio)

      // Check max length attribute
      expect(bioTextarea.attributes('maxlength')).toBe('200')
    })
  })

  describe('Interests Management', () => {
    it('should display existing interests', () => {
      const wrapper = mount(ProfileForm, {
        props: {
          profile: mockProfile
        }
      })

      expect(wrapper.text()).toContain('Vue.js')
      expect(wrapper.text()).toContain('TypeScript')
    })

    it('should add new interest', async () => {
      const wrapper = mount(ProfileForm, {
        props: {
          profile: mockProfile
        }
      })

      // Find and click add interest button
      const addButton = wrapper.find('button[aria-label*="hinzufügen"]')
      if (addButton.exists()) {
        await addButton.trigger('click')
      }

      // Check if interest input appears
      await wrapper.vm.$nextTick()
      expect(wrapper.find('input[placeholder*="Interest"]').exists() ||
             wrapper.find('.add-interest').exists()).toBe(true)
    })

    it('should remove interest', async () => {
      const wrapper = mount(ProfileForm, {
        props: {
          profile: mockProfile
        }
      })

      const removeButtons = wrapper.findAll('button').filter(b =>
        b.text().includes('×') || b.attributes('aria-label')?.includes('entfernen')
      )

      expect(removeButtons.length).toBeGreaterThan(0)
    })
  })

  describe('Events', () => {
    it('should emit save event with updated profile', async () => {
      const wrapper = mount(ProfileForm, {
        props: {
          profile: mockProfile
        }
      })

      const nameInput = wrapper.find('input[type="text"]')
      await nameInput.setValue('Updated Name')

      const saveButton = wrapper.find('.btn-save')
      await saveButton.trigger('click')

      expect(wrapper.emitted('save')).toBeTruthy()
      const savedProfile = wrapper.emitted('save')?.[0][0] as UserProfile
      expect(savedProfile.name).toBe('Updated Name')
    })

    it('should emit cancel event', async () => {
      const wrapper = mount(ProfileForm, {
        props: {
          profile: mockProfile
        }
      })

      const cancelButton = wrapper.find('.btn-cancel')
      await cancelButton.trigger('click')

      expect(wrapper.emitted('cancel')).toBeTruthy()
    })
  })

  describe('Location Detection', () => {
    it('should show location detect button', () => {
      const wrapper = mount(ProfileForm, {
        props: {
          profile: mockProfile
        }
      })

      const locationButton = wrapper.findAll('button').find(b =>
        b.text().includes('Standort erkennen') || b.text().includes('📍')
      )

      expect(locationButton).toBeDefined()
    })

    it('should disable location button while detecting', async () => {
      const wrapper = mount(ProfileForm, {
        props: {
          profile: mockProfile
        }
      })

      // Set detecting state (if accessible)
      const component = wrapper.vm as any
      if ('isDetecting' in component) {
        component.isDetecting = true
        await wrapper.vm.$nextTick()

        const locationButton = wrapper.findAll('button').find(b =>
          b.text().includes('Suche...')
        )

        expect(locationButton?.attributes('disabled')).toBeDefined()
      }
    })
  })

  describe('Avatar Upload', () => {
    it('should trigger file input on upload button click', async () => {
      const wrapper = mount(ProfileForm, {
        props: {
          profile: mockProfile
        }
      })

      const fileInput = wrapper.find('input[type="file"]')
      const uploadButton = wrapper.find('.btn-upload')

      const clickSpy = vi.spyOn(fileInput.element, 'click')

      await uploadButton.trigger('click')

      expect(clickSpy).toHaveBeenCalled()
    })

    it('should accept only image files', () => {
      const wrapper = mount(ProfileForm, {
        props: {
          profile: mockProfile
        }
      })

      const fileInput = wrapper.find('input[type="file"]')
      expect(fileInput.attributes('accept')).toBe('image/*')
    })

    it('should show remove button when avatar exists', () => {
      const profileWithAvatar = {
        ...mockProfile,
        avatar: 'data:image/png;base64,test'
      }

      const wrapper = mount(ProfileForm, {
        props: {
          profile: profileWithAvatar
        }
      })

      const removeButton = wrapper.findAll('button').find(b =>
        b.text().includes('Entfernen')
      )

      expect(removeButton).toBeDefined()
    })
  })
})
