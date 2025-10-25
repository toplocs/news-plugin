# 📚 TopLocs News Plugin - User Guide

Willkommen zum vollständigen User Guide für das TopLocs News Plugin!

## 🎯 Was ist das TopLocs News Plugin?

Ein **dezentraler News Aggregator** mit:
- 🌐 P2P Technologie (Gun.js)
- 🔒 Solid Pods für Data Ownership
- 💬 Echtzeit Messaging
- 👥 User Discovery
- 📱 PWA Support (Offline-first)

---

## 🚀 Quick Start

### 1. Entwicklungsserver starten

```bash
pnpm install
pnpm dev
```

Der Server läuft auf: http://localhost:5176

### 2. Demo-Seiten

| Seite | URL | Beschreibung |
|-------|-----|--------------|
| **P2P Demo** | /p2p-demo.html | Gun.js Features, Community Feed |
| **Solid Dashboard** | /solid-dashboard.html | Solid Pods, Profile, Bookmarks |
| **Control Center** | /control-center.html | Testing & Monitoring |
| **3-Column Layout** | /demo-3col.html | Responsive Layout Demo |

---

## 🌐 P2P Demo Features

### Gun.js Login

1. Öffne http://localhost:5176/p2p-demo.html
2. Wähle "Registrieren" oder "Login"
3. Gib Username und Passwort ein
4. Klicke auf "Registrieren" oder "Einloggen"

**Features:**
- ✅ Dezentrale Authentifizierung
- ✅ SEA-Verschlüsselung
- ✅ Peer Counter (zeigt verbundene Peers)
- ✅ Session Persistence

### Community Feed

**Post erstellen:**
1. Klicke auf "✏️ Neuer Post"
2. Fülle Titel, Content und Tags aus
3. Klicke auf "Posten"
4. Dein Post erscheint sofort im Feed

**Posts liken:**
- Klicke auf "❤️ Like" unter jedem Post
- Like-Counter wird in Echtzeit aktualisiert

**Features:**
- ✅ Real-time Sync zwischen Tabs
- ✅ Tags für Kategorisierung
- ✅ Like-System
- ✅ Autor-Anzeige

### Direct Messages (Neu!)

**Nachricht senden:**
1. Klicke auf "✏️ Neue Nachricht"
2. Gib den Public Key des Empfängers ein
3. Schreibe deine Nachricht
4. Klicke auf "Senden"

**Features:**
- ✅ End-to-End Verschlüsselung
- ✅ Unread Badge
- ✅ Reply-Funktion
- ✅ Nachrichtenverlauf

### User Discovery (Neu!)

**User finden:**
1. Gib Interessen ein (z.B. "Musik, Sport")
2. Gib Standort ein (z.B. "Berlin")
3. Wähle Radius
4. Klicke auf "Suchen"

**Aktionen:**
- 👋 Verbinden - Verbindungsanfrage senden
- 💬 Nachricht - Direkte Nachricht schreiben
- 👤 Profil - User-Profil ansehen

**Features:**
- ✅ Interest-based Matching
- ✅ Location-based Discovery
- ✅ Grid/List View Toggle
- ✅ Real-time Results

### Profile Management (Neu!)

**Profil bearbeiten:**
1. Öffne dein Profil
2. Klicke auf "✏️ Bearbeiten"
3. Ändere Bio, Standort, Interessen
4. Klicke auf "Speichern"

**Privacy Settings:**
- ☑️ Profil öffentlich sichtbar
- ☑️ Standort für andere sichtbar

**Features:**
- ✅ Avatar mit Initialen
- ✅ Bio (max. 200 Zeichen)
- ✅ Interests Tags
- ✅ Stats (Posts, Connections, Messages)

---

## 🔒 Solid Dashboard

### Solid Login

1. Öffne http://localhost:5176/solid-dashboard.html
2. Wähle deinen Solid Provider:
   - solidcommunity.net
   - inrupt.net
   - Eigener Provider
3. Logge dich mit deinen Solid Credentials ein

### Profile Editor

**Profil bearbeiten:**
- Name, Bio, Interests
- Location
- Avatar URL
- Speichert automatisch in deinem Solid Pod

### Bookmarks Manager

**Bookmark erstellen:**
1. Klicke auf "Neues Bookmark"
2. Fülle Titel, URL, Tags aus
3. Klicke auf "Speichern"

**Bookmark bearbeiten:**
- Klicke auf "✏️" bei einem Bookmark
- Ändere die Daten
- Klicke auf "Speichern"

**Bookmark löschen:**
- Klicke auf "🗑️" bei einem Bookmark
- Bestätige die Löschung

### Settings

**Konfigurierbare Einstellungen:**
- ☑️ Profil öffentlich
- ☑️ Standort anzeigen
- ☑️ Analytics aktivieren
- ☑️ Dark Mode

---

## 🎛️ Control Center

### Test Suite

**Tests ausführen:**
1. Öffne http://localhost:5176/control-center.html
2. Wähle Test-Typ:
   - Unit Tests
   - E2E Tests
   - All Tests
3. Klicke auf "Run Tests"
4. Warte auf Ergebnisse

### Feature Tests (Neu!)

**Features testen:**
1. Gehe zum "Features" Tab
2. Wähle ein Feature:
   - 💬 Direct Messaging
   - 🔍 User Discovery
   - 👤 Profile Management
   - 🔔 Toast Notifications
   - 🌓 Theme Toggle
   - 📰 Community Feed
3. Klicke auf "Testen"
4. Überprüfe die Test-Ergebnisse

**Live Demo öffnen:**
- Klicke auf "📺 Live Demo" um das Feature in Aktion zu sehen

### Component Tests (Neu!)

**Components einzeln testen:**
1. Gehe zum "Components" Tab
2. Sieh die Liste aller Components
3. Klicke auf "Test" bei jedem Component
4. Überprüfe den Status:
   - ⏳ Nicht getestet
   - 🔄 Testing...
   - ✅ Passed

**Coverage:**
- Total Components: 8
- Getestet: X/8
- Coverage: X%

### Performance Monitoring

**Metriken ansehen:**
1. Gehe zum "Performance" Tab
2. Sieh Core Web Vitals:
   - LCP (Largest Contentful Paint)
   - FID (First Input Delay)
   - CLS (Cumulative Layout Shift)
3. Überprüfe Bundle Sizes
4. Klicke auf "Refresh Metrics"

### Error Tracking

**Fehler überwachen:**
1. Gehe zum "Errors" Tab
2. Sieh alle JavaScript Errors
3. Überprüfe Stack Traces
4. Klicke auf "Clear Errors" zum Löschen

### Konfiguration

**Einstellungen ändern:**
1. Gehe zum "Config" Tab
2. Ändere Einstellungen:
   - Analytics (Domain, Enable/Disable)
   - PWA (Enable/Disable, Offline Support)
   - Gun.js Peers
3. Klicke auf "Konfiguration speichern"

---

## 🎨 Neue Features

### Toast Notifications

**Toast anzeigen:**
```typescript
import { useToast } from '@/composables/useToast'

const { success, error, warning, info } = useToast()

// Success Toast
success('Feature funktioniert!')

// Error Toast
error('Ein Fehler ist aufgetreten')

// Warning Toast
warning('Achtung, bitte prüfen')

// Info Toast
info('Neue Information verfügbar')
```

**Features:**
- ✅ 4 Toast-Typen (Success, Error, Warning, Info)
- ✅ Auto-dismiss nach 3 Sekunden
- ✅ Click to dismiss
- ✅ Smooth Animations
- ✅ Mobile-optimiert

### Theme Toggle

**Theme wechseln:**
```typescript
import { useTheme } from '@/composables/useTheme'

const { theme, setTheme, toggleTheme } = useTheme()

// Theme setzen
setTheme('light')  // oder 'dark', 'auto'

// Theme togglen
toggleTheme()  // wechselt zwischen light/dark
```

**Features:**
- ✅ 3 Themes: Light, Dark, Auto
- ✅ localStorage Persistence
- ✅ System Theme Detection (Auto mode)
- ✅ Smooth Transitions

---

## 📊 API Reference

### Gun.js Service

```typescript
import {
  gunLogin,
  gunSignup,
  gunLogout,
  createPost,
  subscribeToPosts,
  likePost,
  sendMessage,
  subscribeToMessages,
  findUsers
} from '@/services/gunService'
```

**Authentication:**
```typescript
// Login
await gunLogin('username', 'password')

// Signup
await gunSignup('username', 'password')

// Logout
gunLogout()
```

**Posts:**
```typescript
// Create Post
await createPost({
  title: 'Hello World',
  content: 'This is my first post',
  tags: ['hello', 'test']
})

// Subscribe to Posts
subscribeToPosts((post) => {
  console.log('New post:', post)
}, 20) // limit to 20 posts

// Like Post
await likePost('post-id')
```

**Messages:**
```typescript
// Send Message
await sendMessage('recipient-pub-key', 'Hello!')

// Subscribe to Messages
subscribeToMessages((message) => {
  console.log('New message:', message)
})
```

**User Discovery:**
```typescript
// Find Users
const users = await findUsers({
  interests: ['music', 'sports'],
  location: 'Berlin',
  radius: 25
})
```

---

## 🔧 Development

### Struktur

```
src/
├── components/
│   ├── GunMessages.vue      (Direct Messaging)
│   ├── UserDiscovery.vue    (User Discovery)
│   ├── GunProfile.vue       (Profile Management)
│   ├── ToastContainer.vue   (Notifications)
│   ├── ThemeToggle.vue      (Theme Switcher)
│   ├── GunLogin.vue         (Gun.js Auth)
│   └── CommunityFeed.vue    (Posts Feed)
├── composables/
│   ├── useToast.ts          (Toast System)
│   └── useTheme.ts          (Theme System)
├── services/
│   ├── gunService.ts        (Gun.js P2P)
│   └── solidAutoSync.ts     (Solid Sync)
├── views/
│   ├── P2PDemo.vue          (P2P Demo Page)
│   ├── ControlCenter.vue    (Control Center)
│   └── SolidDashboard.vue   (Solid Dashboard)
└── utils/
    ├── analytics.ts         (Plausible)
    └── pwa.ts              (Service Worker)
```

### Scripts

```bash
# Development
pnpm dev

# Build
pnpm build

# Preview
pnpm preview

# Tests
pnpm test

# Coverage
pnpm test:coverage
```

---

## 🎯 Best Practices

### Security

1. **Niemals Private Keys teilen**
2. **Starke Passwörter verwenden**
3. **HTTPS in Production**
4. **CSP Headers konfigurieren**

### Performance

1. **Lazy Loading für Components**
2. **Code Splitting nutzen**
3. **Images optimieren**
4. **Service Worker für Offline**

### Accessibility

1. **Keyboard Navigation**
2. **Screen Reader Support**
3. **ARIA Labels**
4. **Focus Indicators**

---

## 🐛 Troubleshooting

### Gun.js Verbindung fehlgeschlagen

**Problem:** "Could not connect to peers"

**Lösung:**
1. Überprüfe Internet-Verbindung
2. Überprüfe Peer-URLs in Config
3. Checke Browser Console für Errors

### Solid Login funktioniert nicht

**Problem:** "Login failed"

**Lösung:**
1. Überprüfe Solid Provider URL
2. Checke Credentials
3. Versuche anderen Provider

### PWA Installation nicht möglich

**Problem:** "Install button not showing"

**Lösung:**
1. Überprüfe manifest.json
2. Service Worker muss registriert sein
3. HTTPS erforderlich (in Production)

---

## 📞 Support

- **GitHub:** https://github.com/toplocs/news-plugin
- **Issues:** /issues
- **Discussions:** /discussions

---

## 🎉 Fazit

Du hast jetzt:
- ✅ 6 neue Features implementiert
- ✅ 8 Components verfügbar
- ✅ Vollständiges Testing im Control Center
- ✅ Production-ready Code
- ✅ Umfassende Dokumentation

**Viel Spaß mit dem TopLocs News Plugin! 🚀**
