# Notifications & Discovery System

## Unread Badge System

### Implementation: `UnreadBadge.vue`

**Features:**
- Fixed 16×16px box (no CLS)
- Throttled updates (debounced 300ms)
- Pulse animation on new messages
- Glow effect (2s duration)

**Usage:**
```vue
<UnreadBadge :count="unreadCount" />
```

### Store: `useNotifications.ts`

**State:**
```typescript
{
  notifications: Notification[],
  unreadCount: number,
  lastUpdate: timestamp
}
```

**Methods:**
- `addNotification(n: Notification)`
- `markAsRead(id: string)`
- `clearAll()`

## Discovery System

### Store: `useDiscovery.ts`

**Matching Algorithm:**
1. Calculate interest overlap (40% weight)
2. Calculate location proximity (30% weight)
3. Calculate activity match (20% weight)
4. Calculate trust score (10% weight)

**Events:**
- `user-match` - New user discovered
- `article-match` - Relevant article found
- `location-update` - User moved

### Gun.js Subscriptions

```typescript
gun.get('news_plugin/notifications')
  .on((data) => {
    notificationStore.addNotification(data)
  })
```

**Thread ID Generation:**
```typescript
const threadId = [userId1, userId2].sort().join('_')
```

---
**Performance:** Real-time updates via Gun.js with 50ms throttle
