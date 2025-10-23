<!--
═══════════════════════════════════════════════════════════════════════════════
🧪 TEST-DOKUMENTATION - NotificationPanel.vue (PHASE 2) - 727 ZEILEN!
═══════════════════════════════════════════════════════════════════════════════

📋 WAS WIRD HIER GETESTET:
- Top-Right Popover (420px breit, max-height 600px)
- 4 Tabs (All, Discovery, Users, System) mit Badge-Counts
- Gun.js Real-time Subscription (news_plugin/notifications)
- Discovery Polling alle 60 Sekunden
- UnreadBadge Integration
- ARIA Labels + Keyboard Navigation (ESC, Enter, Space)
- Backdrop mit Blur
- Mark as Read/Mark All/Clear All
- Throttled localStorage saves (1000ms)

🎯 ERWARTETE ERGEBNISSE:
✅ Bell Icon: Puls-Animation wenn unreadCount > 0
✅ Panel öffnet Top-Right (absolute, right: 0, top: calc(100% + 0.5rem))
✅ Tabs: 4 sichtbar mit korrekten Counts
✅ Gun.js: Subscription aktiv (Console: "📡 Subscribed to Gun.js notifications")
✅ Discovery: High-Score Matches (>0.9) erscheinen als Notifications
✅ Polling: Discovery check alle 60 Sekunden
✅ ESC: Schließt Panel
✅ Backdrop: Click schließt Panel
✅ Mark All: Alle unread → read, Toast "Alle als gelesen markiert"
✅ Clear All: notifications.value = [], Toast "Alle gelöscht"

🔧 WIE ZU TESTEN:
1. Bell Icon Test:
   - Sollte UnreadBadge haben (rot, 20×20px)
   - Bei unread > 0: Puls-Animation (box-shadow glow)
2. Panel öffnen:
   - Bell-Icon klicken → Panel erscheint rechts
   - Width: 420px, max-height: 600px
   - Glassmorphism: rgba(30, 41, 59, 0.95) + backdrop-blur(16px)
3. Tabs Test:
   - 4 Tabs: All | Entdecken | Nutzer | System
   - Active Tab: Gradient (indigo → purple)
   - Badge Count: Zeigt unread count pro Tab
4. Gun.js Subscription:
   - Console öffnen → sollte "📡 Subscribed to Gun.js notifications" sehen
   - Andere Instanz sendet Notification → sollte erscheinen
5. Discovery Polling:
   - Warte 60 Sekunden → Discovery check sollte laufen
   - High-Score Match (>0.9) → Notification erscheint
   - Gun.js publishMatch() wird aufgerufen
6. Keyboard Navigation:
   - Panel geöffnet
   - ESC → Panel schließt
   - Tab durch Buttons → Enter/Space aktiviert
7. Mark All Test:
   - 5 unread Notifications
   - "Alle gelesen" klicken → Alle read = true
   - Toast: "Alle als gelesen markiert"
8. Clear All Test:
   - "Alle löschen" klicken → notifications.value = []
   - localStorage cleared

📊 DESIGN-SPECS:
- Panel Width: 420px (Mobile: calc(100vw - 2rem))
- Panel max-height: 600px
- Backdrop: rgba(0,0,0,0.3) + blur(2px)
- Tabs Gradient: linear-gradient(135deg, #6366f1, #8b5cf6)
- Notification Icons: 40×40px circles
- Transitions: slide-fade 0.3s, list-enter 0.3s

🎬 ANIMATIONS:
- Slide-fade: translateY(-10px) opacity 0 → 0
- List-enter: translateX(-20px) opacity 0 → 1
- Badge Pulse: box-shadow 0 → 8px glow, 2s infinite

🔌 GUN.JS INTEGRATION:
- Subscribe: gun.get('news_plugin').get('notifications').map().on()
- Filter: nur Notifications < 7 Tage alt
- Auto-add: Neue Notifications von anderen Users

🚨 BEKANNTE ISSUES:
- Keine (Phase 2 vollständig implementiert ✅)

═══════════════════════════════════════════════════════════════════════════════
-->
<template>
  <div class="notification-panel">
    <!-- Notification Button -->
    <button
      @click="togglePanel"
      @keydown.enter="togglePanel"
      @keydown.space.prevent="togglePanel"
      class="notification-btn"
      :class="{ 'has-unread': unreadCount > 0 }"
      :aria-label="`Benachrichtigungen ${totalUnreadCount > 0 ? `(${totalUnreadCount} ungelesen)` : ''}`"
      :aria-expanded="isOpen"
      aria-haspopup="dialog"
    >
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
        />
      </svg>
      <UnreadBadge :count="totalUnreadCount" variant="danger" />
    </button>

    <!-- Panel Popover -->
    <Transition name="slide-fade">
      <div
        v-if="isOpen"
        class="notification-popover"
        role="dialog"
        aria-modal="true"
        aria-labelledby="notification-panel-title"
        @keydown.esc="togglePanel"
      >
        <!-- Header -->
        <div class="panel-header">
          <h3 id="notification-panel-title" class="panel-title">Benachrichtigungen</h3>
          <div class="header-actions">
            <button
              v-if="notifications.length > 0"
              @click="markAllAsRead"
              class="btn-mark-read"
              aria-label="Alle Benachrichtigungen als gelesen markieren"
            >
              Alle gelesen
            </button>
            <button
              @click="togglePanel"
              class="btn-close"
              aria-label="Benachrichtigungen schließen"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <!-- Tabs -->
        <div class="panel-tabs" role="tablist" aria-label="Benachrichtigungskategorien">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            class="tab-btn"
            :class="{ active: activeTab === tab.id }"
            role="tab"
            :aria-selected="activeTab === tab.id"
            :aria-controls="`panel-${tab.id}`"
            :aria-label="`${tab.label}${tab.count > 0 ? ` (${tab.count} ungelesen)` : ''}`"
          >
            {{ tab.label }}
            <span v-if="tab.count > 0" class="tab-badge" aria-hidden="true">{{ tab.count }}</span>
          </button>
        </div>

        <!-- Notifications List -->
        <div
          class="notifications-list"
          role="tabpanel"
          :id="`panel-${activeTab}`"
          :aria-labelledby="`tab-${activeTab}`"
        >
          <!-- Loading -->
          <div v-if="isLoading" class="loading-state" aria-live="polite" aria-busy="true">
            <div class="spinner" aria-hidden="true"></div>
            <span>Lade Benachrichtigungen...</span>
          </div>

          <!-- Empty State -->
          <div v-else-if="filteredNotifications.length === 0" class="empty-state" role="status">
            <svg class="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <p>Keine Benachrichtigungen</p>
          </div>

          <!-- Notification Items -->
          <TransitionGroup v-else name="list" tag="div">
            <div
              v-for="notification in filteredNotifications"
              :key="notification.id"
              class="notification-item"
              :class="{ unread: !notification.read }"
              @click="handleNotificationClick(notification)"
            >
              <!-- Icon -->
              <div class="notification-icon" :class="`icon-${notification.type}`">
                <component :is="getIconComponent(notification.type)" />
              </div>

              <!-- Content -->
              <div class="notification-content">
                <p class="notification-title">{{ notification.title }}</p>
                <p class="notification-message">{{ notification.message }}</p>
                <span class="notification-time">{{ formatTime(notification.timestamp) }}</span>
              </div>

              <!-- Action Button -->
              <button
                v-if="!notification.read"
                @click.stop="markAsRead(notification.id)"
                class="btn-mark-single"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </button>
            </div>
          </TransitionGroup>
        </div>

        <!-- Footer -->
        <div v-if="filteredNotifications.length > 0" class="panel-footer">
          <button @click="clearAll" class="btn-clear-all">
            Alle löschen
          </button>
        </div>
      </div>
    </Transition>

    <!-- Backdrop -->
    <Transition name="fade">
      <div v-if="isOpen" class="backdrop" @click="togglePanel"></div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, h } from 'vue'
import { useNotifications, type Notification } from '../stores/useNotifications'
import { useDiscovery } from '../stores/useDiscovery'
import { useToast } from '../composables/useToast'
import UnreadBadge from './UnreadBadge.vue'

type TabId = 'all' | 'discovery' | 'users' | 'system'

const emit = defineEmits<{
  'notification-click': [notification: Notification]
}>()

const { success } = useToast()
const discovery = useDiscovery()
const notificationStore = useNotifications()

const isOpen = ref(false)
const activeTab = ref<TabId>('all')

// Use store state
const notifications = notificationStore.notifications
const unreadCount = notificationStore.unreadCount
const totalUnreadCount = notificationStore.totalUnreadCount
const isLoading = notificationStore.isLoading

const tabs = computed(() => [
  { id: 'all' as TabId, label: 'Alle', count: notifications.value.filter(n => !n.read).length },
  { id: 'discovery' as TabId, label: 'Entdecken', count: notifications.value.filter(n => n.type === 'discovery' && !n.read).length },
  { id: 'users' as TabId, label: 'Nutzer', count: notifications.value.filter(n => n.type === 'user' && !n.read).length },
  { id: 'system' as TabId, label: 'System', count: notifications.value.filter(n => n.type === 'system' && !n.read).length }
])

const filteredNotifications = computed(() => {
  if (activeTab.value === 'all') return notifications.value
  return notifications.value.filter(n => n.type === activeTab.value || (n.type === 'article' && activeTab.value === 'discovery'))
})

const togglePanel = () => {
  isOpen.value = !isOpen.value
}

const markAsRead = (id: string) => {
  notificationStore.markAsRead(id)
}

const markAllAsRead = () => {
  notificationStore.markAllAsRead()
  success('Alle als gelesen markiert')
}

const clearAll = () => {
  notificationStore.clearAll()
  success('Alle Benachrichtigungen gelöscht')
}

const handleNotificationClick = (notification: Notification) => {
  if (!notification.read) {
    markAsRead(notification.id)
  }
  emit('notification-click', notification)
}

const formatTime = (timestamp: number): string => {
  const now = Date.now()
  const diff = now - timestamp
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'Gerade eben'
  if (minutes < 60) return `vor ${minutes} Min`
  if (hours < 24) return `vor ${hours} Std`
  if (days < 7) return `vor ${days} Tag${days > 1 ? 'en' : ''}`

  return new Date(timestamp).toLocaleDateString('de-DE')
}

const getIconComponent = (type: string) => {
  const icons: Record<string, () => any> = {
    article: () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' })
    ]),
    user: () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' })
    ]),
    discovery: () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9' })
    ]),
    system: () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' })
    ])
  }
  return icons[type] || icons.system
}

// Use store methods for notifications
const addNotification = notificationStore.addNotification

// Poll discovery system for new matches
const checkDiscovery = async () => {
  // Check high-score matches (>0.7)
  const highScoreMatches = discovery.highScoreMatches.value

  for (const match of highScoreMatches) {
    // Skip if already notified
    const existing = notifications.value.find(n =>
      n.type === 'discovery' && n.data?.id === match.id
    )

    if (!existing) {
      addNotification({
        type: 'discovery',
        title: '🔍 Neue Entdeckung',
        message: `${match.title} - ${match.reason}`,
        data: match
      })

      // Publish to Gun.js for P2P sharing
      if (match.score > 0.9) {
        discovery.publishMatch(match)
      }
    }
  }
}

// Polling interval
let discoveryInterval: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  // Load notifications from localStorage
  notificationStore.loadNotifications()

  // Subscribe to Gun.js
  notificationStore.subscribeToGun()

  // Check discovery every 60 seconds
  discoveryInterval = setInterval(checkDiscovery, 60000)

  // Add a welcome notification on first load
  if (notifications.value.length === 0) {
    addNotification({
      type: 'system',
      title: 'Willkommen!',
      message: 'Hier findest du personalisierte Nachrichten und Empfehlungen basierend auf deinen Interessen.'
    })
  }
})

onUnmounted(() => {
  notificationStore.unsubscribeFromGun()
  if (discoveryInterval) clearInterval(discoveryInterval)
})
</script>

<style scoped>
.notification-panel {
  position: relative;
}

.notification-btn {
  position: relative;
  padding: 0.625rem;
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  color: #cbd5e1;
  cursor: pointer;
  transition: all 0.2s;
}

.notification-btn:hover {
  background: rgba(30, 41, 59, 0.8);
  border-color: rgba(99, 102, 241, 0.5);
  color: #f8fafc;
  transform: translateY(-2px);
}

.notification-btn.has-unread {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(99, 102, 241, 0);
  }
}

/* Unread badge now handled by UnreadBadge.vue component */

.notification-popover {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  width: 420px;
  max-height: 600px;
  background: rgba(30, 41, 59, 0.95);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
  z-index: 100;
  display: flex;
  flex-direction: column;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.panel-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #f8fafc;
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-mark-read {
  padding: 0.375rem 0.75rem;
  background: rgba(99, 102, 241, 0.2);
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 0.375rem;
  color: #a5b4fc;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-mark-read:hover {
  background: rgba(99, 102, 241, 0.3);
  color: #c7d2fe;
}

.btn-close {
  padding: 0.375rem;
  background: transparent;
  border: none;
  color: #cbd5e1;
  cursor: pointer;
  transition: all 0.2s;
  border-radius: 0.375rem;
}

.btn-close:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #f8fafc;
}

.panel-tabs {
  display: flex;
  padding: 0.75rem;
  gap: 0.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  overflow-x: auto;
}

.tab-btn {
  position: relative;
  padding: 0.5rem 1rem;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  color: #94a3b8;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.tab-btn:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #cbd5e1;
}

.tab-btn.active {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border-color: transparent;
  color: white;
}

.tab-badge {
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 999px;
  font-size: 0.625rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tab-btn.active .tab-badge {
  background: rgba(255, 255, 255, 0.3);
}

.notifications-list {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem;
  min-height: 200px;
  max-height: 400px;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1.5rem;
  gap: 1rem;
  color: #64748b;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(99, 102, 241, 0.2);
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.empty-icon {
  width: 48px;
  height: 48px;
  color: #475569;
}

.notification-item {
  display: flex;
  align-items: start;
  gap: 0.75rem;
  padding: 0.875rem;
  background: rgba(15, 23, 42, 0.4);
  border: 1px solid transparent;
  border-radius: 0.75rem;
  margin-bottom: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.notification-item:hover {
  background: rgba(15, 23, 42, 0.6);
  border-color: rgba(99, 102, 241, 0.3);
  transform: translateX(4px);
}

.notification-item.unread {
  background: rgba(99, 102, 241, 0.1);
  border-color: rgba(99, 102, 241, 0.2);
}

.notification-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.icon-article {
  background: rgba(59, 130, 246, 0.2);
  color: #60a5fa;
}

.icon-user {
  background: rgba(168, 85, 247, 0.2);
  color: #c084fc;
}

.icon-discovery {
  background: rgba(236, 72, 153, 0.2);
  color: #f472b6;
}

.icon-system {
  background: rgba(100, 116, 139, 0.2);
  color: #94a3b8;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #f8fafc;
  margin: 0 0 0.25rem 0;
}

.notification-message {
  font-size: 0.8125rem;
  color: #cbd5e1;
  line-height: 1.5;
  margin: 0 0 0.5rem 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.notification-time {
  font-size: 0.75rem;
  color: #64748b;
}

.btn-mark-single {
  padding: 0.375rem;
  background: rgba(34, 197, 94, 0.2);
  border: 1px solid rgba(34, 197, 94, 0.3);
  border-radius: 0.375rem;
  color: #4ade80;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.btn-mark-single:hover {
  background: rgba(34, 197, 94, 0.3);
  transform: scale(1.1);
}

.panel-footer {
  padding: 0.75rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.btn-clear-all {
  width: 100%;
  padding: 0.625rem;
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 0.5rem;
  color: #fca5a5;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-clear-all:hover {
  background: rgba(239, 68, 68, 0.3);
  color: #fecaca;
}

.backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(2px);
  z-index: 99;
}

/* Transitions */
.slide-fade-enter-active {
  transition: all 0.3s ease;
}

.slide-fade-leave-active {
  transition: all 0.2s ease;
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.list-enter-active {
  transition: all 0.3s ease;
}

.list-leave-active {
  transition: all 0.2s ease;
  position: absolute;
}

.list-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.list-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

.list-move {
  transition: transform 0.3s ease;
}

/* Scrollbar */
.notifications-list::-webkit-scrollbar {
  width: 6px;
}

.notifications-list::-webkit-scrollbar-track {
  background: rgba(15, 23, 42, 0.4);
  border-radius: 3px;
}

.notifications-list::-webkit-scrollbar-thumb {
  background: rgba(99, 102, 241, 0.3);
  border-radius: 3px;
}

.notifications-list::-webkit-scrollbar-thumb:hover {
  background: rgba(99, 102, 241, 0.5);
}

@media (max-width: 640px) {
  .notification-popover {
    width: calc(100vw - 2rem);
    max-width: 420px;
    right: -1rem;
  }
}
</style>
