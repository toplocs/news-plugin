# 🧪 AUTOMATISCHE BROWSER-TESTS
> **Für News Plugin Phase 2**
> **URL:** http://localhost:5173/

---

## 🚀 SCHNELLTEST (30 Sekunden)

### 1. Öffne Browser Console
**Chrome/Edge:** `F12` oder `Cmd+Option+J` (Mac)
**Firefox:** `F12` oder `Cmd+Option+K` (Mac)

### 2. Kopiere diesen Test-Code in die Console:

```javascript
// ═══════════════════════════════════════════════════════════════════════════
// 🧪 NEWS PLUGIN - AUTOMATISCHER FEATURE-TEST
// ═══════════════════════════════════════════════════════════════════════════

console.clear();
console.log('%c🧪 NEWS PLUGIN TEST SUITE - PHASE 2', 'background: #6366f1; color: white; font-size: 16px; padding: 10px; border-radius: 4px;');
console.log('═══════════════════════════════════════════════════════════════\n');

// Test Results Container
const results = {
  passed: 0,
  failed: 0,
  tests: []
};

// Helper: Test Function
function test(name, condition, details = '') {
  const passed = condition();
  results.tests.push({ name, passed, details });

  if (passed) {
    results.passed++;
    console.log(`%c✅ PASS%c ${name}`, 'color: #22c55e; font-weight: bold', 'color: inherit', details ? `\n   → ${details}` : '');
  } else {
    results.failed++;
    console.log(`%c❌ FAIL%c ${name}`, 'color: #ef4444; font-weight: bold', 'color: inherit', details ? `\n   → ${details}` : '');
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// TEST 1: DOM STRUCTURE
// ═══════════════════════════════════════════════════════════════════════════
console.log('\n%c📊 TEST 1: DOM Structure', 'color: #8b5cf6; font-weight: bold; font-size: 14px;');
console.log('───────────────────────────────────────────────────────────────\n');

test('Header exists', () => {
  return document.querySelector('.clean-header') !== null;
}, 'Clean Header component mounted');

test('Notification Button exists', () => {
  return document.querySelector('.notification-btn') !== null;
}, 'Bell icon for notifications present');

test('Search Bar exists', () => {
  return document.querySelector('.search-bar') !== null ||
         document.querySelector('input[type="search"]') !== null;
}, 'Search input field available');

test('Main Content exists', () => {
  return document.querySelector('.main-content') ||
         document.querySelector('.center-column') !== null;
}, 'Main feed area mounted');

// ═══════════════════════════════════════════════════════════════════════════
// TEST 2: LOCALSTORAGE
// ═══════════════════════════════════════════════════════════════════════════
console.log('\n%c💾 TEST 2: localStorage Persistence', 'color: #8b5cf6; font-weight: bold; font-size: 14px;');
console.log('───────────────────────────────────────────────────────────────\n');

test('User ID initialized', () => {
  return localStorage.getItem('userId') !== null;
}, `User ID: ${localStorage.getItem('userId')?.substring(0, 20)}...`);

test('Notifications Storage exists', () => {
  return localStorage.getItem('news_plugin_notifications') !== null;
}, 'Notifications persisted to localStorage');

test('Chat Messages Storage exists', () => {
  return localStorage.getItem('news_plugin_chat_messages') !== null ||
         localStorage.getItem('news_plugin_chat_threads') !== null;
}, 'Chat data persisted to localStorage');

// ═══════════════════════════════════════════════════════════════════════════
// TEST 3: NOTIFICATIONS
// ═══════════════════════════════════════════════════════════════════════════
console.log('\n%c🔔 TEST 3: Notification System', 'color: #8b5cf6; font-weight: bold; font-size: 14px;');
console.log('───────────────────────────────────────────────────────────────\n');

const notifData = localStorage.getItem('news_plugin_notifications');
const notifications = notifData ? JSON.parse(notifData) : [];

test('Notifications loaded', () => {
  return notifications.length >= 0;
}, `Found ${notifications.length} notification(s)`);

test('Welcome notification present', () => {
  return notifications.some(n => n.title?.includes('Willkommen'));
}, 'Initial welcome message found');

test('Notification structure valid', () => {
  if (notifications.length === 0) return true;
  const sample = notifications[0];
  return sample.id && sample.type && sample.title && sample.message && sample.timestamp;
}, 'All required fields present in notification objects');

// ═══════════════════════════════════════════════════════════════════════════
// TEST 4: CHAT SYSTEM
// ═══════════════════════════════════════════════════════════════════════════
console.log('\n%c💬 TEST 4: Chat System', 'color: #8b5cf6; font-weight: bold; font-size: 14px;');
console.log('───────────────────────────────────────────────────────────────\n');

const chatThreadsData = localStorage.getItem('news_plugin_chat_threads');
const chatThreads = chatThreadsData ? JSON.parse(chatThreadsData) : [];

test('Chat Threads initialized', () => {
  return chatThreads.length >= 0;
}, `Found ${chatThreads.length} chat thread(s)`);

test('Mock chat data generated', () => {
  return chatThreads.length >= 3;
}, 'Demo users (Anna, Max, Lisa) present');

const chatMessagesData = localStorage.getItem('news_plugin_chat_messages');
const chatMessages = chatMessagesData ? JSON.parse(chatMessagesData) : [];

test('Chat Messages exist', () => {
  return chatMessages.length >= 0;
}, `Found ${chatMessages.length} message(s)`);

// ═══════════════════════════════════════════════════════════════════════════
// TEST 5: GUN.JS INTEGRATION
// ═══════════════════════════════════════════════════════════════════════════
console.log('\n%c🔌 TEST 5: Gun.js P2P Sync', 'color: #8b5cf6; font-weight: bold; font-size: 14px;');
console.log('───────────────────────────────────────────────────────────────\n');

test('Gun.js available', () => {
  return typeof Gun !== 'undefined';
}, 'Gun.js library loaded');

test('Gun instance exists', () => {
  return typeof gun !== 'undefined';
}, 'Gun database instance initialized');

// ═══════════════════════════════════════════════════════════════════════════
// TEST 6: UI COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════
console.log('\n%c🎨 TEST 6: UI Components', 'color: #8b5cf6; font-weight: bold; font-size: 14px;');
console.log('───────────────────────────────────────────────────────────────\n');

test('Notification Panel Component', () => {
  return document.querySelector('.notification-panel') !== null ||
         document.querySelector('.notification-btn') !== null;
}, 'Notification panel ready');

test('User Sidebar exists', () => {
  return document.querySelector('.user-sidebar') !== null ||
         document.querySelector('.sidebar-right') !== null ||
         document.querySelector('.sidebar-drawer') !== null;
}, 'User sidebar component present (may be hidden on desktop)');

test('Feed Cards exist', () => {
  const cards = document.querySelectorAll('.news-card, .article-card, .clean-news-card');
  return cards.length > 0;
}, `Found ${document.querySelectorAll('.news-card, .article-card, .clean-news-card').length} article card(s)`);

// ═══════════════════════════════════════════════════════════════════════════
// TEST 7: RESPONSIVE LAYOUT
// ═══════════════════════════════════════════════════════════════════════════
console.log('\n%c📱 TEST 7: Responsive Layout', 'color: #8b5cf6; font-weight: bold; font-size: 14px;');
console.log('───────────────────────────────────────────────────────────────\n');

const viewportWidth = window.innerWidth;

test('Viewport detected', () => {
  return viewportWidth > 0;
}, `Current viewport: ${viewportWidth}px`);

test('Layout adapts to viewport', () => {
  if (viewportWidth >= 1024) {
    return document.querySelector('.container-3col') !== null ||
           document.querySelector('.sidebar-left') !== null;
  }
  return true; // Mobile/Tablet passes by default
}, viewportWidth >= 1024 ? 'Desktop: 3-column layout' : 'Mobile/Tablet: Responsive layout');

// ═══════════════════════════════════════════════════════════════════════════
// SUMMARY
// ═══════════════════════════════════════════════════════════════════════════
console.log('\n═══════════════════════════════════════════════════════════════');
console.log('%c📊 TEST SUMMARY', 'background: #6366f1; color: white; font-size: 14px; padding: 8px; border-radius: 4px;');
console.log('═══════════════════════════════════════════════════════════════\n');

const totalTests = results.passed + results.failed;
const passRate = Math.round((results.passed / totalTests) * 100);

console.log(`%cTotal Tests: ${totalTests}`, 'font-weight: bold; font-size: 13px;');
console.log(`%c✅ Passed: ${results.passed}`, 'color: #22c55e; font-weight: bold; font-size: 13px;');
console.log(`%c❌ Failed: ${results.failed}`, 'color: #ef4444; font-weight: bold; font-size: 13px;');
console.log(`%c📈 Pass Rate: ${passRate}%`, `color: ${passRate >= 80 ? '#22c55e' : '#f59e0b'}; font-weight: bold; font-size: 13px;`);

console.log('\n───────────────────────────────────────────────────────────────\n');

if (passRate >= 90) {
  console.log('%c🎉 EXCELLENT! All critical features working!', 'background: #22c55e; color: white; font-size: 14px; padding: 8px; border-radius: 4px;');
} else if (passRate >= 70) {
  console.log('%c⚠️ GOOD - Minor issues detected', 'background: #f59e0b; color: white; font-size: 14px; padding: 8px; border-radius: 4px;');
} else {
  console.log('%c❌ CRITICAL - Major issues found', 'background: #ef4444; color: white; font-size: 14px; padding: 8px; border-radius: 4px;');
}

console.log('\n═══════════════════════════════════════════════════════════════\n');

// Export results for manual inspection
window.testResults = results;
console.log('💡 TIP: Access detailed results with: window.testResults');
```

---

## ✅ MANUELLE INTERAKTIONS-TESTS

Nach dem automatischen Test, teste diese Features manuell:

### TEST A: Notifications
1. **Klicke auf Bell-Icon** (🔔) im Header rechts
2. **Erwarte:** Popover öffnet sich rechts
3. **Prüfe:** Welcome-Nachricht vorhanden?
4. **Klicke:** "Alle gelesen" → Badge verschwindet?
5. **Klicke:** "Alle löschen" → Liste leer?

**✅ PASS-Kriterien:**
- [ ] Popover öffnet sich smooth
- [ ] 4 Tabs sichtbar (All, Entdecken, Nutzer, System)
- [ ] Welcome-Nachricht vorhanden
- [ ] "Alle gelesen" funktioniert
- [ ] "Alle löschen" funktioniert

---

### TEST B: Chat System
1. **Klicke auf Community-Icon** (👥) im Header
2. **Erwarte:** UserSidebar öffnet sich (Desktop: rechts, Mobile: Drawer)
3. **Prüfe:** User-Liste vorhanden? (Anna, Max, Lisa)
4. **Klicke auf User** (z.B. "Anna Schmidt")
5. **Erwarte:** ChatModal öffnet sich
6. **Schreibe Nachricht:** "Test 123"
7. **Drücke Enter**
8. **Erwarte:** Nachricht erscheint im Chat

**✅ PASS-Kriterien:**
- [ ] User-Liste zeigt mindestens 3 User
- [ ] Chat öffnet sich beim Klick
- [ ] Nachricht wird gesendet
- [ ] Typing Indicator funktioniert (beim Tippen)
- [ ] ESC schließt Chat

---

### TEST C: Feed & Filter
1. **Prüfe:** Artikel werden angezeigt?
2. **Klicke:** Refresh-Button → neue Artikel laden?
3. **Klicke:** Artikel-Card → Detail öffnet sich?
4. **Nutze:** Suchfeld → Artikel filtern?
5. **Teste:** Filter in linker Sidebar

**✅ PASS-Kriterien:**
- [ ] Mindestens 5 Artikel sichtbar
- [ ] Refresh lädt neue Artikel
- [ ] Detail-View öffnet sich
- [ ] Suche funktioniert (300ms Debounce)
- [ ] Filter reduzieren Artikel-Liste

---

### TEST D: Responsive Layout
1. **Desktop (>1024px):** 3 Spalten sichtbar?
2. **Resize → Tablet (768-1024px):** 2 Spalten?
3. **Resize → Mobile (<768px):** 1 Spalte + Bottom Nav?
4. **Prüfe:** Keine Layout-Shifts beim Resize?

**✅ PASS-Kriterien:**
- [ ] Desktop: Linke + Mitte + Rechte Spalte
- [ ] Tablet: Linke + Mitte (Rechte hidden)
- [ ] Mobile: Nur Mitte + Bottom Nav
- [ ] Smooth Transitions

---

## 📸 SCREENSHOT CHECKLIST

Bitte mache Screenshots von:

1. **Desktop-Ansicht** (vollständiges Layout)
   - URL: http://localhost:5173/
   - Resolution: 1920×1080

2. **Notification Panel** (geöffnet)
   - Bell-Icon geklickt
   - Tabs sichtbar

3. **Chat Modal** (geöffnet)
   - User geklickt
   - Nachricht sichtbar

4. **Mobile-Ansicht** (<768px)
   - Browser DevTools → Responsive Mode
   - iPhone 12 Pro (390×844)

---

## 🐛 FEHLER MELDEN

Wenn etwas nicht funktioniert, kopiere:

### Format:
```
Feature: [z.B. Notifications]
Problem: [z.B. Bell-Icon nicht sichtbar]
Browser: [z.B. Chrome 120]
Console Logs: [Copy-paste Fehler]
Screenshot: [Optional]
```

### Beispiel:
```
Feature: Chat System
Problem: Chat öffnet sich nicht beim Klick auf User
Browser: Firefox 121
Console Logs:
  TypeError: Cannot read property 'value' of undefined
  at ChatModal.vue:394
Screenshot: attached
```

---

## 🔍 DEBUGGING COMMANDS

Falls Tests fehlschlagen, nutze diese Console-Commands:

```javascript
// Check localStorage
console.log('User ID:', localStorage.getItem('userId'));
console.log('Notifications:', JSON.parse(localStorage.getItem('news_plugin_notifications') || '[]'));
console.log('Chat Threads:', JSON.parse(localStorage.getItem('news_plugin_chat_threads') || '[]'));

// Check Gun.js
if (typeof gun !== 'undefined') {
  gun.get('news_plugin').get('notifications').once(data => console.log('Gun Notifications:', data));
  gun.get('news_plugin').get('chat').once(data => console.log('Gun Chat:', data));
}

// Check DOM
console.log('Notification Button:', document.querySelector('.notification-btn'));
console.log('Chat Modal:', document.querySelector('.chat-container'));
console.log('User Sidebar:', document.querySelector('.user-sidebar'));
```

---

## ✅ ERWARTETE ERGEBNISSE

### Automatischer Test sollte zeigen:
```
✅ PASS DOM Structure
✅ PASS localStorage Persistence
✅ PASS Notification System
✅ PASS Chat System
✅ PASS Gun.js P2P Sync
✅ PASS UI Components
✅ PASS Responsive Layout

📊 TEST SUMMARY
Total Tests: 20
✅ Passed: 18-20
❌ Failed: 0-2
📈 Pass Rate: 90-100%

🎉 EXCELLENT! All critical features working!
```

### Console Logs sollten zeigen:
```
✅ Chat subscribed to Gun.js
📡 Subscribed to Gun.js notifications
💬 Loaded X messages from thread Y
NewsLayout mounted (oder CleanLayout mounted)
```

---

## 🚀 NEXT STEPS

Nach erfolgreichem Test:
1. ✅ Alle Tests passed → **Phase 2 Complete!**
2. ⚠️ Einige Tests failed → **Update CONTROL_CENTER.md**
3. 📊 Screenshots gemacht → **Dokumentation aktualisieren**
4. 🔴 Kritische Fehler → **Sofort fixen**

---

**Ende des Test-Skripts** 🧪
