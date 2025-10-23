import { describe, test, expect, beforeEach } from 'vitest'
import { useNotifications } from '../../stores/useNotifications'

describe('useNotifications', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
  })

  test('adds notification and increments unread count', () => {
    const { addNotification, unreadCount } = useNotifications()
    
    addNotification({
      type: 'system',
      title: 'Test Notification',
      message: 'This is a test'
    })

    expect(unreadCount.value).toBe(1)
  })

  test('marks notification as read', () => {
    const { addNotification, markAsRead, unreadCount, notifications } = useNotifications()
    
    const notif = addNotification({
      type: 'article',
      title: 'New Article',
      message: 'Check this out'
    })

    expect(unreadCount.value).toBe(1)
    
    markAsRead(notif.id)
    
    expect(unreadCount.value).toBe(0)
    expect(notifications.value[0].read).toBe(true)
  })

  test('marks all as read', () => {
    const { addNotification, markAllAsRead, unreadCount } = useNotifications()
    
    addNotification({ type: 'system', title: 'Notif 1', message: 'Test 1' })
    addNotification({ type: 'system', title: 'Notif 2', message: 'Test 2' })
    addNotification({ type: 'system', title: 'Notif 3', message: 'Test 3' })

    expect(unreadCount.value).toBe(3)
    
    markAllAsRead()
    
    expect(unreadCount.value).toBe(0)
  })

  test('clears all notifications', () => {
    const { addNotification, clearAll, notifications } = useNotifications()
    
    addNotification({ type: 'system', title: 'Test', message: 'Test' })
    addNotification({ type: 'user', title: 'Test 2', message: 'Test 2' })

    expect(notifications.value.length).toBe(2)
    
    clearAll()
    
    expect(notifications.value.length).toBe(0)
  })

  test('updates DM thread unread count', () => {
    const { updateDMThread, unreadDMCount } = useNotifications()
    
    updateDMThread({
      userId: 'user-123',
      userName: 'Alice',
      lastMessage: 'Hello!',
      lastMessageTime: Date.now(),
      unreadCount: 3
    })

    expect(unreadDMCount.value).toBe(3)
  })

  test('marks DM thread as read', () => {
    const { updateDMThread, markDMThreadAsRead, unreadDMCount, dmThreads } = useNotifications()
    
    updateDMThread({
      userId: 'user-123',
      userName: 'Alice',
      lastMessage: 'Hello!',
      lastMessageTime: Date.now(),
      unreadCount: 5
    })

    const threadId = dmThreads.value[0].id
    
    markDMThreadAsRead(threadId)
    
    expect(unreadDMCount.value).toBe(0)
  })

  test('calculates total unread count correctly', () => {
    const { addNotification, updateDMThread, totalUnreadCount } = useNotifications()
    
    // Add 2 unread notifications
    addNotification({ type: 'system', title: 'N1', message: 'M1' })
    addNotification({ type: 'article', title: 'N2', message: 'M2' })
    
    // Add DM thread with 3 unread
    updateDMThread({
      userId: 'user-123',
      userName: 'Alice',
      lastMessage: 'Hi',
      lastMessageTime: Date.now(),
      unreadCount: 3
    })

    expect(totalUnreadCount.value).toBe(5) // 2 notifs + 3 DMs
  })

  test('limits notifications to 50', () => {
    const { addNotification, notifications } = useNotifications()
    
    // Add 60 notifications
    for (let i = 0; i < 60; i++) {
      addNotification({
        type: 'system',
        title: \`Notification \${i}\`,
        message: \`Message \${i}\`
      })
    }

    expect(notifications.value.length).toBe(50)
  })

  test('filters notifications by type', () => {
    const { addNotification, getNotificationsByType } = useNotifications()
    
    addNotification({ type: 'system', title: 'S1', message: 'M1' })
    addNotification({ type: 'article', title: 'A1', message: 'M2' })
    addNotification({ type: 'system', title: 'S2', message: 'M3' })
    
    const systemNotifs = getNotificationsByType('system')
    
    expect(systemNotifs.value.length).toBe(2)
    expect(systemNotifs.value.every(n => n.type === 'system')).toBe(true)
  })
})
