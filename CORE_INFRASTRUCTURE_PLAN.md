# 🏗️ CORE INFRASTRUCTURE PLAN - Die Grosse Ausrüstung

**Datum:** 2025-10-08
**Status:** 🟡 PLANNING
**Ziel:** Strategische Kern-Infrastruktur für "Hyperlocal Information Cooperative"

---

## 🎯 Vision Statement

**"Wir bauen KEINE Social Media App - wir bauen eine dezentralisierte Information Cooperative mit Revenue Sharing"**

### Die 4 Säulen der Differenzierung:

1. **Revenue Sharing** → User verdient mit seinen Interessen
2. **P2P Ownership** → User besitzt seine Daten
3. **Interest Graph** → AI-powered Discovery & Matching
4. **Community Organization** → Offline Impact über Online Connections

---

## 📊 PRIORITY MATRIX - Was zuerst?

| Komponente | Impact | Komplexität | Priority | Zeit |
|------------|--------|-------------|----------|------|
| **Revenue System** | SEHR HOCH | Mittel | 🔴 1 | 2-3 Tage |
| **Channel System** | SEHR HOCH | Mittel | 🔴 2 | 2-3 Tage |
| **Interest Graph** | HOCH | Hoch | 🟡 3 | 3-4 Tage |
| **P2P Full Integration** | HOCH | Sehr Hoch | 🟢 4 | 5-7 Tage |

**Begründung:**
- Revenue System ZUERST → Das ist unser USP, das unterscheidet uns
- Channel System → Wo User tatsächlich organisieren und treffen
- Interest Graph → Macht das System besser über Zeit
- P2P Full → Wichtig, aber komplex, kommt wenn Basis steht

---

## 🔥 PHASE 1: Revenue Sharing System (2-3 Tage)

### Ziel
User sieht im Dashboard: "Du hast diese Woche 8.50€ mit deinen Interessen verdient"

### Komponenten

#### 1.1 Interest-Ad Matching Engine
**File:** `src/services/adMatchingService.ts`

```typescript
// Core Logic
interface AdPlacement {
  adId: string
  articleId: string
  userId: string
  interests: string[]
  matchScore: number  // 0-1, wie gut matched Ad zu User Interests
  timestamp: number
  revenue: number     // Revenue für diesen Ad
}

// Revenue Distribution
const calculateRevenue = (adRevenue: number, matchScore: number) => {
  const baseRevenue = adRevenue * matchScore
  return {
    platform: baseRevenue * 0.40,  // 40% Platform
    user: baseRevenue * 0.30,      // 30% User
    channel: baseRevenue * 0.20,   // 20% Channel
    author: baseRevenue * 0.10     // 10% Content Author
  }
}
```

#### 1.2 Revenue Tracking Store
**File:** `src/stores/useRevenue.ts`

- Track Ad Views pro User
- Calculate Earnings basierend auf Interest Match
- Persist in localStorage + Gun.js
- Export für Auszahlung

#### 1.3 Revenue Dashboard
**File:** `src/components/RevenueDashboard.vue`

**UI Elemente:**
```
┌─────────────────────────────────────┐
│ 💰 Deine Einnahmen                  │
├─────────────────────────────────────┤
│ Diese Woche:     8.50€              │
│ Diesen Monat:   34.20€              │
│ Gesamt:        127.80€              │
│                                     │
│ [Auszahlen ab 10€] (PayPal/SEPA)  │
├─────────────────────────────────────┤
│ 📊 Deine Top Interessen (Revenue):  │
│ • Tech:          45%  (57.50€)     │
│ • Startup:       30%  (38.30€)     │
│ • Urban:         25%  (32.00€)     │
├─────────────────────────────────────┤
│ 💡 Info:                            │
│ Du verdienst, weil deine Interessen │
│ helfen bessere Ads zu zeigen.       │
│                                     │
│ [Details] [Export CSV]              │
└─────────────────────────────────────┘
```

#### 1.4 Mock Ad Integration
**File:** `src/components/AdBanner.vue`

- Mock Ads für Demo (Google AdSense später)
- Track Impressions & Clicks
- Calculate Revenue pro User
- Visual Design (native-looking, nicht störend)

### Success Criteria Phase 1
- [ ] User sieht Revenue Dashboard in Settings
- [ ] Revenue wird pro Artikel tracked
- [ ] Top Interests zeigen Revenue Breakdown
- [ ] Mock Auszahlung möglich (> 10€)
- [ ] Transparent: User versteht WARUM er verdient

---

## 🏘️ PHASE 2: Channel System (2-3 Tage)

### Ziel
User kann Channels beitreten/erstellen → Dort werden Meetups organisiert

### Komponenten

#### 2.1 Channel Store
**File:** `src/stores/useChannels.ts`

```typescript
interface Channel {
  id: string
  name: string                    // "#tech-berlin-kreuzberg"
  description: string
  interests: string[]             // ["tech", "startup"]
  location: {
    lat: number
    lng: number
    radius: number                // in km
  }
  members: string[]               // User IDs
  admins: string[]
  revenue: number                 // Channel bekommt 20% von Ads
  createdAt: number
  stats: {
    articles: number              // Wie viele relevante News
    events: number                // Wie viele Meetups
    activeMembers: number         // Letzte 7 Tage
  }
}
```

#### 2.2 Channel Feed View
**File:** `src/views/ChannelView.vue`

**3-Spalten Layout:**
```
┌───────────┬─────────────┬───────────┐
│ Channel   │ News Feed   │ Members   │
│ Info      │ (filtered)  │ & Events  │
│           │             │           │
│ #tech-xb  │ [ARTIKEL 1] │ 12 Mbrs   │
│ 12 Mbrs   │ Tech News   │           │
│ 5 online  │             │ 🟢 Anna   │
│           │ [ARTIKEL 2] │ 🟢 Max    │
│ 💰 8.50€  │ Startup     │ 🔴 Lisa   │
│ Channel $ │             │           │
│           │ [AD BANNER] │ ───────   │
│ [Invite]  │ → Revenue   │ 📅 Events │
│ [Leave]   │   to Chan.  │           │
│           │             │ Sa 15:00  │
│           │             │ Garden    │
│           │             │ [Join]    │
└───────────┴─────────────┴───────────┘
```

#### 2.3 Channel Discovery
**File:** `src/components/ChannelDiscovery.vue`

- Suggested Channels basierend auf User Interests + Location
- "3 Channels in deiner Nähe passen zu dir"
- Join/Leave Funktionalität
- Channel Search

#### 2.4 Channel Events
**File:** `src/components/ChannelEvents.vue`

```typescript
interface ChannelEvent {
  id: string
  channelId: string
  title: string                   // "Urban Garden Besuch"
  description: string
  location: {
    name: string
    address: string
    lat: number
    lng: number
  }
  datetime: number
  attendees: string[]             // User IDs
  maxAttendees?: number
  createdBy: string
}
```

**UI:**
- Event erstellen (Channel Admins)
- Event beitreten (Zusagen)
- Event Chat (Organisation)

### Success Criteria Phase 2
- [ ] User kann Channels beitreten
- [ ] Channel zeigt gefilterten News Feed (nur relevante Artikel)
- [ ] Channel Revenue wird angezeigt (20% der Ads)
- [ ] Events können erstellt werden
- [ ] Members sehen Events und können zusagen
- [ ] Discovery schlägt passende Channels vor

---

## 🧠 PHASE 3: Advanced Interest Graph (3-4 Tage)

### Ziel
System lernt über Zeit was User WIRKLICH interessiert → bessere Matches

### Komponenten

#### 3.1 Behavioral Scoring Engine
**File:** `src/services/behavioralLearning.ts`

**Was wird getrackt:**
```typescript
interface UserBehavior {
  articleClicks: {
    articleId: string
    interests: string[]
    timestamp: number
    timeSpent: number           // Wie lange gelesen
    scrollDepth: number         // 0-100%
  }[]

  bookmarks: {
    articleId: string
    interests: string[]
    timestamp: number
  }[]

  shares: {
    articleId: string
    interests: string[]
    platform: string
    timestamp: number
  }[]

  channelJoins: {
    channelId: string
    interests: string[]
    timestamp: number
  }[]
}

// Scoring Algorithm
const calculateInterestScore = (behavior: UserBehavior, interest: string) => {
  let score = 0

  // Clicks = 1 point
  score += behavior.articleClicks.filter(c => c.interests.includes(interest)).length * 1

  // Time spent = 2-5 points (based on duration)
  score += behavior.articleClicks
    .filter(c => c.interests.includes(interest))
    .reduce((sum, c) => sum + Math.min(5, c.timeSpent / 60), 0)

  // Bookmark = 10 points
  score += behavior.bookmarks.filter(b => b.interests.includes(interest)).length * 10

  // Share = 15 points
  score += behavior.shares.filter(s => s.interests.includes(interest)).length * 15

  // Channel join = 20 points
  score += behavior.channelJoins.filter(j => j.interests.includes(interest)).length * 20

  return score
}
```

#### 3.2 Auto-Discovery Engine
**File:** `src/services/autoDiscovery.ts`

- Matched Users basierend auf Interest Overlap + Location
- Weighted Scoring (nicht nur "gleiche Interests")
- "Diese 5 Leute passen am besten zu dir" (täglich updated)

#### 3.3 Interest Evolution Timeline
**File:** `src/components/InterestTimeline.vue`

**UI zeigt:**
```
Deine Interest-Evolution:

Januar 2025:  Tech (90%), Startup (70%), Urban (40%)
Februar 2025: Tech (85%), Urban (75%), Community (60%)
März 2025:    Urban (90%), Community (85%), Tech (70%)

💡 Du interessierst dich immer mehr für Community & Urban!
   Möchtest du #urban-gardening-berlin Channel beitreten?
```

### Success Criteria Phase 3
- [ ] Behavioral Scoring trackt alle User Actions
- [ ] Interest Weights werden automatisch updated
- [ ] Discovery zeigt bessere Matches über Zeit
- [ ] Timeline zeigt Interest-Evolution
- [ ] User versteht WARUM bestimmte Matches vorgeschlagen werden

---

## 🔐 PHASE 4: P2P Full Integration (5-7 Tage)

### Ziel
ALLE User-Daten auf Gun.js → echte Dezentralisierung

### Komponenten

#### 4.1 Gun.js Data Migration
**Files:** Update all stores to use Gun.js

**Current:** localStorage only
**Target:** Gun.js primary + localStorage backup

```typescript
// Beispiel: Bookmarks Store
import gun from '../services/gunService'

// Save to Gun.js
gun.get('users').get(userId).get('bookmarks').set({
  articleId,
  timestamp: Date.now()
})

// Sync from Gun.js on load
gun.get('users').get(userId).get('bookmarks').map().on((data) => {
  // Update local state
  localBookmarks.value.push(data)
})
```

#### 4.2 E2E Encryption für Chats
**File:** Update `src/services/chatService.ts`

- SEA.encrypt() für alle Messages
- Key Exchange via Gun.js
- Nur Sender & Empfänger können lesen

#### 4.3 P2P Relay Setup
**Infrastructure:**

- Gun.js Relay Server (self-hosted)
- Peer Discovery
- Sync Status Indicator ("3/5 Peers connected")

#### 4.4 Data Ownership Dashboard
**File:** `src/components/DataDashboard.vue`

**UI:**
```
┌─────────────────────────────────────┐
│ 🔐 Deine Daten                      │
├─────────────────────────────────────┤
│ Gespeichert auf Gun.js P2P:         │
│ • Profil:       ✅ Encrypted        │
│ • Chats:        ✅ E2E Encrypted    │
│ • Bookmarks:    ✅ Private          │
│ • Interessen:   ✅ Private          │
│ • Revenue Data: ✅ Encrypted        │
│                                     │
│ 🌐 Sync Status: 4/5 Peers          │
│                                     │
│ [Export alles] [Daten löschen]     │
└─────────────────────────────────────┘
```

### Success Criteria Phase 4
- [ ] Gun.js als primary storage für User-Daten
- [ ] E2E Encryption für Chats funktioniert
- [ ] Multi-Device Sync (same user, different devices)
- [ ] Export/Import funktioniert
- [ ] User kann alle Daten löschen (GDPR compliant)

---

## 📊 TIMELINE & MILESTONES

### Week 1 (Phase 1 + 2)
**Days 1-3:** Revenue System
- Day 1: Ad Matching Engine + Revenue Store
- Day 2: Revenue Dashboard UI
- Day 3: Testing & Integration

**Days 4-6:** Channel System
- Day 4: Channel Store + Basic UI
- Day 5: Channel Events + Discovery
- Day 6: Testing & Polish

**Milestone:** User kann Revenue sehen & Channels beitreten

---

### Week 2 (Phase 3 + 4 Start)
**Days 7-10:** Interest Graph
- Day 7: Behavioral Scoring Engine
- Day 8: Auto-Discovery Engine
- Day 9: Interest Timeline UI
- Day 10: Testing & Optimization

**Days 11-13:** P2P Integration (Start)
- Day 11: Gun.js Migration für Stores
- Day 12: E2E Encryption Setup
- Day 13: Testing

**Milestone:** System lernt & verbessert sich automatisch

---

### Week 3 (Phase 4 Complete)
**Days 14-17:** P2P Full Integration
- Day 14-15: Relay Server Setup
- Day 16: Data Dashboard UI
- Day 17: Export/Import Tools

**Days 18-20:** Integration Testing
- Cross-device sync
- Performance optimization
- Security audit

**Milestone:** Full P2P Dezentralisierung

---

## 🎯 SUCCESS METRICS

### Business Metrics
- [ ] 30% Revenue Share funktioniert
- [ ] User versteht Value Proposition
- [ ] Channels haben >5 active members
- [ ] Events werden organisiert (Offline Impact!)

### Technical Metrics
- [ ] Gun.js Sync < 500ms latency
- [ ] E2E Encryption 100% der Chats
- [ ] Data Export funktioniert
- [ ] Multi-device sync funktioniert

### User Experience Metrics
- [ ] Revenue Dashboard verständlich
- [ ] Channel Discovery relevant (>50% join rate)
- [ ] Interest Timeline zeigt Evolution
- [ ] Data Dashboard transparent

---

## 🚀 NEXT IMMEDIATE STEPS

**Soll ich starten mit Phase 1 (Revenue System)?**

Das wäre:
1. `src/services/adMatchingService.ts` - Interest-Ad Matching Engine
2. `src/stores/useRevenue.ts` - Revenue Tracking
3. `src/components/RevenueDashboard.vue` - User sieht Einnahmen
4. `src/components/AdBanner.vue` - Mock Ads mit Revenue

**Oder willst du die Reihenfolge ändern?**

Z.B. erst Channel System, dann Revenue?

---

**Generated:** 2025-10-08
**Status:** 🟡 AWAITING APPROVAL
