# 🔔 Notifications & Badge System - TopLocs News Plugin

**Version:** 2.0
**Last Updated:** 2025-10-24

---

## 📊 System Overview

### Unread Badge System

**Purpose:** Track unread DM threads & notifications

**Components:**
- `UnreadBadge.vue` - Visual badge (16×16px fixed)
- `useNotifications.ts` - Store (Gun.js + localStorage)
- `NotificationPanel.vue` - Notification list

---

## 🎯 Badge Flow

### 1. New Notification Arrives
```
Gun.js Event → useNotifications.ts → UnreadBadge.vue
                      ↓
              +1 unread count
                      ↓
        Badge animates (glow/pulse)
```

### 2. User Opens Notification
```
User clicks NotificationPanel
        ↓
Mark notification as read
        ↓
-1 unread count
        ↓
Badge updates (or hides if 0)
```

### 3. Throttled Updates
```
New notifications → Debounce 500ms → Update UI
```
**Why?** Prevents layout shift from rapid updates

---

## 📡 Real-time Gun.js Subscription

### Subscribe to Notifications
```typescript
gun.get('news_plugin')
   .get('notifications')
   .get(userId)
   .on((data) => {
     // Real-time notification update
     notifications.value.push(data)
     unreadCount.value++
   })
```

### Data Structure
```typescript
interface Notification {
  id: string
  type: 'dm' | 'comment' | 'reaction' | 'mention'
  fromUser: string
  message: string
  articleId?: string
  timestamp: number
  read: boolean
}
```

---

## 🎨 UI Components

### UnreadBadge
```vue
<div class="relative">
  <BellIcon />
  <span v-if="count > 0" class="badge">
    {{ count > 9 ? '9+' : count }}
  </span>
</div>
```

**Fixed 16×16px prevents layout shift!**

---

## 📚 API Reference

### Store Methods
- `addNotification(notification)` - Add new
- `markAsRead(id)` - Mark single as read
- `markAllAsRead()` - Clear all unread
- `getUnreadCount()` - Get count

