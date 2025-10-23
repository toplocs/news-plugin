import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useChat } from '../../src/stores/useChat'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { store = {} }
  }
})()

Object.defineProperty(global, 'localStorage', { value: localStorageMock })

// Mock Gun
vi.mock('../../src/services/gun', () => ({
  default: {
    get: vi.fn(() => ({
      get: vi.fn(() => ({
        get: vi.fn(() => ({
          put: vi.fn(),
          on: vi.fn(),
          once: vi.fn()
        })),
        put: vi.fn(),
        on: vi.fn()
      })),
      put: vi.fn()
    }))
  }
}))

describe('useChat', () => {
  let chat: ReturnType<typeof useChat>

  beforeEach(() => {
    localStorageMock.clear()
    chat = useChat()
  })

  describe('Initialization', () => {
    it('should initialize with empty messages', () => {
      expect(chat.messages.value).toEqual([])
    })

    it('should initialize with no active partner', () => {
      expect(chat.activePartnerId.value).toBeNull()
    })

    it('should load messages from localStorage', () => {
      const savedMessages = [
        { id: '1', text: 'Hello', from: 'user1', to: 'user2', timestamp: Date.now() }
      ]
      localStorageMock.setItem('chat_messages_user1', JSON.stringify(savedMessages))

      const newChat = useChat()
      newChat.loadMessages('user1')

      expect(newChat.messages.value).toHaveLength(1)
      expect(newChat.messages.value[0].text).toBe('Hello')
    })
  })

  describe('Message Sending', () => {
    beforeEach(() => {
      chat.setActivePartner('partner123')
    })

    it('should send a message', () => {
      chat.sendMessage('Hello, World!')

      expect(chat.messages.value).toHaveLength(1)
      expect(chat.messages.value[0].text).toBe('Hello, World!')
    })

    it('should assign unique IDs to messages', () => {
      chat.sendMessage('Message 1')
      chat.sendMessage('Message 2')

      expect(chat.messages.value[0].id).not.toBe(chat.messages.value[1].id)
    })

    it('should include sender and recipient info', () => {
      const userId = 'test-user-123'
      chat.sendMessage('Test message', userId)

      const message = chat.messages.value[0]
      expect(message.from).toBe(userId)
      expect(message.to).toBe('partner123')
    })

    it('should include timestamp', () => {
      const before = Date.now()
      chat.sendMessage('Test')
      const after = Date.now()

      const timestamp = chat.messages.value[0].timestamp
      expect(timestamp).toBeGreaterThanOrEqual(before)
      expect(timestamp).toBeLessThanOrEqual(after)
    })

    it('should not send empty messages', () => {
      chat.sendMessage('')
      chat.sendMessage('  ')
      chat.sendMessage('\n')

      expect(chat.messages.value).toHaveLength(0)
    })

    it('should trim whitespace from messages', () => {
      chat.sendMessage('  Hello  ')

      expect(chat.messages.value[0].text).toBe('Hello')
    })

    it('should save messages to localStorage', () => {
      chat.sendMessage('Test message', 'user123')

      const saved = JSON.parse(localStorageMock.getItem('chat_messages_partner123')!)
      expect(saved).toHaveLength(1)
      expect(saved[0].text).toBe('Test message')
    })
  })

  describe('Message History', () => {
    beforeEach(() => {
      chat.setActivePartner('partner123')
    })

    it('should maintain message order (newest last)', () => {
      chat.sendMessage('First')
      chat.sendMessage('Second')
      chat.sendMessage('Third')

      expect(chat.messages.value[0].text).toBe('First')
      expect(chat.messages.value[1].text).toBe('Second')
      expect(chat.messages.value[2].text).toBe('Third')
    })

    it('should load previous messages when switching partners', () => {
      chat.sendMessage('Message to partner123')

      chat.setActivePartner('partner456')
      chat.sendMessage('Message to partner456')

      chat.setActivePartner('partner123')
      chat.loadMessages('partner123')

      expect(chat.messages.value).toHaveLength(1)
      expect(chat.messages.value[0].text).toBe('Message to partner123')
    })

    it('should separate conversations by partner', () => {
      chat.setActivePartner('partner1')
      chat.sendMessage('Hello partner 1')

      chat.setActivePartner('partner2')
      chat.sendMessage('Hello partner 2')

      chat.loadMessages('partner1')
      expect(chat.messages.value).toHaveLength(1)
      expect(chat.messages.value[0].text).toBe('Hello partner 1')

      chat.loadMessages('partner2')
      expect(chat.messages.value).toHaveLength(1)
      expect(chat.messages.value[0].text).toBe('Hello partner 2')
    })

    it('should handle large message history', () => {
      for (let i = 0; i < 100; i++) {
        chat.sendMessage(`Message ${i}`)
      }

      expect(chat.messages.value).toHaveLength(100)
      expect(chat.messages.value[99].text).toBe('Message 99')
    })
  })

  describe('Partner Management', () => {
    it('should set active partner', () => {
      chat.setActivePartner('newPartner')
      expect(chat.activePartnerId.value).toBe('newPartner')
    })

    it('should clear messages when switching partners', () => {
      chat.setActivePartner('partner1')
      chat.sendMessage('Message to partner 1')

      chat.setActivePartner('partner2')

      expect(chat.messages.value).toHaveLength(0)
    })

    it('should track chat partners', () => {
      chat.setActivePartner('partner1')
      chat.sendMessage('Hello 1')

      chat.setActivePartner('partner2')
      chat.sendMessage('Hello 2')

      const partners = chat.getChatPartners()
      expect(partners).toContain('partner1')
      expect(partners).toContain('partner2')
    })
  })

  describe('Unread Messages', () => {
    it('should track unread message count', () => {
      chat.setActivePartner('partner1')

      // Simulate receiving messages
      chat.receiveMessage({
        id: '1',
        text: 'New message',
        from: 'partner1',
        to: 'test-user',
        timestamp: Date.now(),
        read: false
      })

      expect(chat.unreadCount.value).toBe(1)
    })

    it('should mark messages as read', () => {
      chat.setActivePartner('partner1')
      chat.receiveMessage({
        id: '1',
        text: 'New message',
        from: 'partner1',
        to: 'test-user',
        timestamp: Date.now(),
        read: false
      })

      chat.markAsRead('1')

      expect(chat.messages.value[0].read).toBe(true)
      expect(chat.unreadCount.value).toBe(0)
    })

    it('should mark all messages as read', () => {
      chat.setActivePartner('partner1')

      for (let i = 0; i < 5; i++) {
        chat.receiveMessage({
          id: `${i}`,
          text: `Message ${i}`,
          from: 'partner1',
          to: 'test-user',
          timestamp: Date.now(),
          read: false
        })
      }

      expect(chat.unreadCount.value).toBe(5)

      chat.markAllAsRead()

      expect(chat.unreadCount.value).toBe(0)
      expect(chat.messages.value.every(m => m.read)).toBe(true)
    })
  })

  describe('Message Reactions', () => {
    beforeEach(() => {
      chat.setActivePartner('partner1')
      chat.sendMessage('Test message')
    })

    it('should add reaction to message', () => {
      const messageId = chat.messages.value[0].id

      chat.addReaction(messageId, '👍')

      expect(chat.messages.value[0].reactions).toContain('👍')
    })

    it('should not duplicate reactions', () => {
      const messageId = chat.messages.value[0].id

      chat.addReaction(messageId, '❤️')
      chat.addReaction(messageId, '❤️')
      chat.addReaction(messageId, '❤️')

      const heartCount = chat.messages.value[0].reactions?.filter(r => r === '❤️').length
      expect(heartCount).toBe(1)
    })

    it('should remove reaction', () => {
      const messageId = chat.messages.value[0].id

      chat.addReaction(messageId, '👍')
      chat.removeReaction(messageId, '👍')

      expect(chat.messages.value[0].reactions || []).not.toContain('👍')
    })
  })

  describe('Typing Indicators', () => {
    it('should set typing status', () => {
      chat.setTyping('partner1', true)

      expect(chat.isPartnerTyping.value).toBe(true)
    })

    it('should clear typing status', () => {
      chat.setTyping('partner1', true)
      chat.setTyping('partner1', false)

      expect(chat.isPartnerTyping.value).toBe(false)
    })

    it('should auto-clear typing status after timeout', (done) => {
      chat.setTyping('partner1', true)

      setTimeout(() => {
        expect(chat.isPartnerTyping.value).toBe(false)
        done()
      }, 3100) // Typing indicator timeout is usually 3 seconds
    }, 4000)
  })

  describe('Message Search', () => {
    beforeEach(() => {
      chat.setActivePartner('partner1')
      chat.sendMessage('Hello World')
      chat.sendMessage('Testing search functionality')
      chat.sendMessage('Another message here')
    })

    it('should search messages by text', () => {
      const results = chat.searchMessages('search')

      expect(results).toHaveLength(1)
      expect(results[0].text).toContain('search')
    })

    it('should be case insensitive', () => {
      const results = chat.searchMessages('HELLO')

      expect(results).toHaveLength(1)
      expect(results[0].text).toBe('Hello World')
    })

    it('should return empty array for no matches', () => {
      const results = chat.searchMessages('nonexistent')

      expect(results).toHaveLength(0)
    })
  })

  describe('Gun.js Integration', () => {
    it('should sync messages to Gun', () => {
      chat.setActivePartner('partner1')
      chat.sendMessage('Test Gun sync')

      // Gun mock should have been called
      // This would need proper Gun mock verification
      expect(chat.messages.value).toHaveLength(1)
    })

    it('should receive messages from Gun', () => {
      chat.setActivePartner('partner1')

      // Simulate incoming Gun message
      const incomingMessage = {
        id: 'gun-msg-1',
        text: 'Message from Gun',
        from: 'partner1',
        to: 'test-user',
        timestamp: Date.now()
      }

      chat.receiveMessage(incomingMessage)

      expect(chat.messages.value).toContain(incomingMessage)
    })
  })

  describe('Edge Cases', () => {
    it('should handle very long messages', () => {
      const longMessage = 'a'.repeat(10000)

      chat.setActivePartner('partner1')
      chat.sendMessage(longMessage)

      expect(chat.messages.value[0].text).toBe(longMessage)
    })

    it('should handle special characters', () => {
      chat.setActivePartner('partner1')
      chat.sendMessage('Special: <>&"\' 😀')

      expect(chat.messages.value[0].text).toBe('Special: <>&"\' 😀')
    })

    it('should handle corrupted localStorage data', () => {
      localStorageMock.setItem('chat_messages_partner1', 'invalid json')

      const newChat = useChat()
      newChat.setActivePartner('partner1')
      newChat.loadMessages('partner1')

      // Should fall back to empty array
      expect(newChat.messages.value).toEqual([])
    })

    it('should handle null/undefined partner IDs', () => {
      chat.setActivePartner(null as any)
      chat.sendMessage('Test')

      // Should not crash
      expect(chat.messages.value).toHaveLength(0)
    })
  })

  describe('Performance', () => {
    it('should handle rapid message sending', () => {
      chat.setActivePartner('partner1')

      for (let i = 0; i < 1000; i++) {
        chat.sendMessage(`Rapid message ${i}`)
      }

      expect(chat.messages.value).toHaveLength(1000)
    })

    it('should throttle localStorage saves', () => {
      chat.setActivePartner('partner1')

      const saveSpy = vi.spyOn(localStorageMock, 'setItem')

      for (let i = 0; i < 10; i++) {
        chat.sendMessage(`Message ${i}`)
      }

      // Should batch saves, not save 10 times
      // (Actual implementation may vary)
      expect(saveSpy.mock.calls.length).toBeLessThan(10)
    })
  })
})
