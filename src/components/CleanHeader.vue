<!--
🎯 CLEAN HEADER - SELF-DOC
═══════════════════════════════════════════════════════════════

✅ IMPLEMENTIERT:
- Logo + Location Badge
- Search Bar (Debounced 300ms)
- GunSyncStatus Indicator
- NotificationPanel Integration (Bell-Icon)
- Community Toggle Button (UserSidebar öffnen)
- Refresh Button (Feed aktualisieren)
- Settings Button (Einstellungen öffnen)
- Sticky Positioning (bleibt oben beim Scrollen)
- ARIA Labels für Accessibility

🧪 ZU TESTEN:
1. Search Input → emit('search') nach 300ms
2. Bell-Icon → NotificationPanel öffnet sich
3. Community Button → emit('toggle-sidebar')
4. Refresh Button → emit('refresh')
5. Settings Button → emit('settings')
6. GunSyncStatus zeigt Connection Status
7. Header sticky beim Scrollen
8. ARIA Labels vorhanden (Screen Reader Test)

🔧 ZU FIXEN:
- Keine Issues ✅

📖 USAGE:
<CleanHeader
  :location="locationName"
  @search="handleSearch"
  @refresh="handleRefresh"
  @settings="showSettings = true"
  @toggle-sidebar="showUserSidebar = !showUserSidebar"
  @notification-click="handleNotificationClick"
/>

🔌 INTEGRATION:
- CleanLayout.vue als Header-Component
- NotificationPanel.vue (Zeile 31)
- GunSyncStatus.vue (Zeile 28)
═══════════════════════════════════════════════════════════════
-->
<template>
  <header class="clean-header">
    <div class="container">
      <!-- Logo & Title -->
      <div class="brand">
        <span class="logo">📰</span>
        <div class="brand-text">
          <h1>TopLocs News</h1>
          <span class="location">{{ location }}</span>
        </div>
      </div>

      <!-- Search Bar (minimal) -->
      <div class="search-bar">
        <label for="news-search" class="sr-only">Nachrichten durchsuchen</label>
        <input
          id="news-search"
          v-model="searchQuery"
          type="search"
          placeholder="Suche..."
          @input="handleSearch"
          aria-label="Nachrichten durchsuchen"
        />
      </div>

      <!-- Actions -->
      <div class="actions">
        <GunSyncStatus />

        <!-- Notification Panel -->
        <NotificationPanel @notification-click="handleNotificationClick" />

        <!-- Community/Discovery Sidebar Toggle -->
        <button
          class="action-btn"
          @click="$emit('toggle-sidebar')"
          aria-label="Community & Entdeckungen öffnen"
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
          </svg>
        </button>

        <button
          class="action-btn"
          @click="$emit('refresh')"
          aria-label="Nachrichten aktualisieren"
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
          </svg>
        </button>
        <button
          class="action-btn"
          @click="$emit('settings')"
          aria-label="Einstellungen öffnen"
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import GunSyncStatus from './GunSyncStatus.vue'
import NotificationPanel from './NotificationPanel.vue'
import type { Notification } from '../stores/useNotifications'

defineProps<{
  location?: string
}>()

const emit = defineEmits<{
  search: [query: string]
  refresh: []
  settings: []
  'notification-click': [notification: Notification]
  'toggle-sidebar': []
}>()

const searchQuery = ref('')

let debounce: ReturnType<typeof setTimeout>
const handleSearch = () => {
  clearTimeout(debounce)
  debounce = setTimeout(() => {
    emit('search', searchQuery.value)
  }, 300)
}

const handleNotificationClick = (notification: Notification) => {
  emit('notification-click', notification)
  console.log('Notification clicked:', notification)
}
</script>

<style scoped>
.clean-header {
  background: rgba(15, 23, 42, 0.95);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 50;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1.5rem;
  display: flex;
  align-items: center;
  gap: 2rem;
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 200px;
}

.logo {
  font-size: 1.75rem;
}

.brand-text h1 {
  font-size: 1.125rem;
  font-weight: 700;
  color: #f8fafc;
  line-height: 1.2;
  margin: 0;
}

.location {
  font-size: 0.8125rem;
  color: #94a3b8;
}

.search-bar {
  flex: 1;
  max-width: 500px;
}

.search-bar input {
  width: 100%;
  padding: 0.625rem 1rem;
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  color: #f8fafc;
  font-size: 0.9375rem;
  transition: all 0.2s;
}

.search-bar input::placeholder {
  color: #64748b;
}

.search-bar input:focus {
  outline: none;
  background: rgba(30, 41, 59, 0.8);
  border-color: #6366f1;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  color: #cbd5e1;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  background: rgba(99, 102, 241, 0.2);
  border-color: #6366f1;
  color: #6366f1;
}

@media (max-width: 768px) {
  .container {
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  .brand {
    min-width: auto;
    flex: 1 1 auto;
  }

  .brand-text h1 {
    font-size: 0.9375rem;
  }

  .location {
    display: none;
  }

  .search-bar {
    order: 3;
    flex: 1 1 100%;
    max-width: none;
  }

  .actions {
    gap: 0.25rem;
  }

  .action-btn {
    width: 32px;
    height: 32px;
  }
}

@media (max-width: 480px) {
  .logo {
    font-size: 1.5rem;
  }

  .brand-text h1 {
    font-size: 0.875rem;
  }

  .search-bar input {
    font-size: 0.875rem;
    padding: 0.5rem 0.875rem;
  }
}

/* Screen reader only */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
</style>
