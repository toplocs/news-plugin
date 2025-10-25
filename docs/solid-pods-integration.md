# 🔒 Solid Pods Integration - Architecture Design

**Created:** 2025-10-24
**Updated:** 2025-10-24
**Status:** ✅ **IMPLEMENTATION COMPLETE**
**Priority:** HIGH

> **Note:** This document served as the planning blueprint. All features described below have been **successfully implemented**. See [PHASE-3-IMPLEMENTATION-REPORT.md](./PHASE-3-IMPLEMENTATION-REPORT.md) for complete delivery details.

---

## 🎯 Übersicht

Dieses Dokument beschreibt die Architektur für die Integration von **Solid Pods** in das TopLocs News Plugin, um echte Datenselbstbestimmung und Interoperabilität mit anderen Solid-Apps zu ermöglichen.

### Ziele

1. **User Ownership:** User besitzen ihre Daten in persönlichen Pods
2. **GDPR Compliance:** EU-konforme Datenspeicherung
3. **Portabilität:** User können ihre Daten zu anderen Apps mitnehmen
4. **Interoperabilität:** Daten können mit anderen Solid-Apps geteilt werden
5. **Privacy:** Kein Tracking, keine zentrale Speicherung

---

## 📊 Aktuelle Architektur (Gun.js)

### Was wir JETZT haben:

```
TopLocs News Plugin
        ↓
   Gun.js (P2P)
        ↓
   localStorage (Browser)
```

**Gespeicherte Daten:**
- **User Profile** → `localStorage + Gun.js users/{id}`
- **Bookmarks** → `localStorage only`
- **Settings** → `localStorage only`
- **Chat Messages** → `Gun.js news_plugin/chats/{id}`
- **Reactions** → `Gun.js news_plugin/reactions/{articleId}` (LOKAL seit 2025-10-23!)

**Probleme:**
- ❌ Daten sind im Browser locked (kein Export)
- ❌ User hat keine Kontrolle über Speicherort
- ❌ Keine Interoperabilität mit anderen Apps
- ❌ Bei Browser-Wechsel: Daten verloren

---

## 🚀 Ziel-Architektur (Solid Pods)

### Was wir WOLLEN:

```
TopLocs News Plugin
        ↓
   @inrupt/solid-client (Library)
        ↓
   User's Solid Pod
   (user wählt Provider!)
        ↓
   ┌─────────────────────────┐
   │ solidcommunity.net     │ ← Option 1: Public Provider
   │ Self-hosted CSS        │ ← Option 2: Eigener Server
   │ Inrupt PodSpaces       │ ← Option 3: Commercial
   └─────────────────────────┘
```

**Gespeicherte Daten:**
- **User Profile** → `https://{user-pod}/profile/card#me`
- **Bookmarks** → `https://{user-pod}/toplocs/bookmarks`
- **Settings** → `https://{user-pod}/toplocs/settings`
- **Private Data** → `https://{user-pod}/private/` (Access Control)

**Chat Messages & Reactions:**
- **Option A:** Hybrid - Solid Pods für Profile, Gun.js für Echtzeit-Chat
- **Option B:** Full Solid - Auch Chat in Pods (LDP Containers)
- **Empfehlung:** Option A (Hybrid) für Phase 3.1

**Vorteile:**
- ✅ User kontrolliert Speicherort (Provider-Wahl)
- ✅ Daten portabel (kann zu anderer App migrieren)
- ✅ GDPR-konform (EU-Data-Sovereignty)
- ✅ Interoperabel (andere Solid-Apps können Profile lesen)

---

## 🔐 Authentication Flow

### Aktuell (Gun.js SEA):
```
1. User → Creates Gun.js Keypair
2. User → Encrypts private data with SEA
3. User → Stores in Gun.js + localStorage
```

### Neu (Solid WebID + OIDC):
```
1. User → Wählt Solid Provider (z.B. solidcommunity.net)
2. User → Authenticates via OIDC (OpenID Connect)
3. App → Erhält Access Token
4. App → Liest/schreibt in User's Pod mit Permission
```

### Code-Beispiel (Solid Authentication):

```typescript
import {
  login,
  handleIncomingRedirect,
  getDefaultSession
} from '@inrupt/solid-client-authn-browser'

// 1. User initiates login
async function loginToSolidProvider() {
  await login({
    // Provider URL (user can choose!)
    oidcIssuer: 'https://solidcommunity.net',
    // Where to redirect after login
    redirectUrl: window.location.href,
    // App name
    clientName: 'TopLocs News Plugin'
  })
}

// 2. Handle redirect after login
async function handleAuthRedirect() {
  await handleIncomingRedirect()

  const session = getDefaultSession()
  if (session.info.isLoggedIn) {
    console.log('Logged in as:', session.info.webId)
    // webId: https://alice.solidcommunity.net/profile/card#me
  }
}

// 3. Use session for all Pod requests
const session = getDefaultSession()
```

---

## 📦 Pod Data Structure

### Empfohlene Struktur:

```
https://alice.solidcommunity.net/
├── profile/
│   └── card (public profile: name, avatar, bio)
│
├── toplocs/ (TopLocs-specific data)
│   ├── bookmarks (article URLs + timestamps)
│   ├── settings (preferences, language, theme)
│   ├── interests (topics user follows)
│   └── subscriptions (RSS feeds)
│
├── private/ (encrypted, access-controlled)
│   ├── private-profile (email, phone)
│   └── sensitive-data
│
└── inbox/ (notifications, messages)
    └── notifications
```

### RDF Format (Solid nutzt RDF/Turtle):

```turtle
# Profile (card)
@prefix foaf: <http://xmlns.com/foaf/0.1/> .
@prefix vcard: <http://www.w3.org/2006/vcard/ns#> .

<#me> a foaf:Person ;
  foaf:name "Alice" ;
  vcard:hasPhoto <https://alice.solidcommunity.net/avatar.png> ;
  foaf:knows <https://bob.solidcommunity.net/profile/card#me> .
```

```turtle
# Bookmarks (toplocs/bookmarks)
@prefix dc: <http://purl.org/dc/terms/> .
@prefix bookmark: <http://www.w3.org/2002/01/bookmark#> .

<#bookmark1> a bookmark:Bookmark ;
  dc:title "Klima-Artikel" ;
  bookmark:recalls <https://example.com/article-123> ;
  dc:created "2025-10-24T12:00:00Z" .
```

---

## 🔄 Migration Strategy

### Phase 3.1: Solid Pods Integration (4 Wochen)

#### Week 1: Setup & Authentication
**Tasks:**
- ✅ Research Complete
- [ ] `pnpm add @inrupt/solid-client @inrupt/solid-client-authn-browser`
- [ ] Create `src/services/solidAuth.ts` (Authentication Service)
- [ ] Create `src/stores/useSolidSession.ts` (Session Store)
- [ ] UI: Login/Logout Button (Provider-Auswahl)
- [ ] Test: Authentication Flow

#### Week 2: Profile Migration
**Tasks:**
- [ ] Create `src/services/solidProfile.ts` (Profile CRUD)
- [ ] Migrate Profile Editor → Solid Pod
- [ ] Read Profile from Pod (avatar, bio, interests)
- [ ] Write Profile to Pod (save changes)
- [ ] Fallback: localStorage falls Pod offline
- [ ] Test: Profile Read/Write

#### Week 3: Bookmarks & Settings Migration
**Tasks:**
- [ ] Create `src/services/solidBookmarks.ts` (Bookmarks CRUD)
- [ ] Create `src/services/solidSettings.ts` (Settings CRUD)
- [ ] Migrate Bookmarks Store → Solid Pod
- [ ] Migrate Settings Store → Solid Pod
- [ ] Sync: localStorage ↔ Pod (bidirektional)
- [ ] Test: Bookmarks & Settings Sync

#### Week 4: Testing & Documentation
**Tasks:**
- [ ] Unit Tests: Solid Services (read/write)
- [ ] Integration Tests: Authentication Flow
- [ ] E2E Tests: Full User Journey
- [ ] docs/solid-pods-user-guide.md (für User!)
- [ ] Update CONTROL-CENTER.md
- [ ] Update ROADMAP.md

---

## 💻 Code Implementation Plan

### 1. Solid Authentication Service

**File:** `src/services/solidAuth.ts`

```typescript
import {
  login,
  logout,
  handleIncomingRedirect,
  getDefaultSession,
  Session
} from '@inrupt/solid-client-authn-browser'

export class SolidAuthService {
  private session: Session

  constructor() {
    this.session = getDefaultSession()
  }

  async init() {
    // Handle redirect nach Login
    await handleIncomingRedirect()
  }

  async login(providerUrl: string) {
    await login({
      oidcIssuer: providerUrl,
      redirectUrl: window.location.href,
      clientName: 'TopLocs News Plugin'
    })
  }

  async logout() {
    await logout()
  }

  isLoggedIn(): boolean {
    return this.session.info.isLoggedIn
  }

  getWebId(): string | undefined {
    return this.session.info.webId
  }

  getFetch() {
    // Authenticated fetch function für Pod requests
    return this.session.fetch
  }
}

export const solidAuth = new SolidAuthService()
```

---

### 2. Solid Profile Service

**File:** `src/services/solidProfile.ts`

```typescript
import {
  getSolidDataset,
  getThing,
  getStringNoLocale,
  setThing,
  saveSolidDatasetAt,
  createThing,
  setStringNoLocale
} from '@inrupt/solid-client'
import { FOAF, VCARD } from '@inrupt/vocab-common-rdf'
import { solidAuth } from './solidAuth'

export interface SolidProfile {
  name: string
  avatar?: string
  bio?: string
  interests: string[]
}

export class SolidProfileService {
  async getProfile(webId: string): Promise<SolidProfile | null> {
    try {
      // Load profile dataset
      const profileDataset = await getSolidDataset(webId, {
        fetch: solidAuth.getFetch()
      })

      // Get profile Thing
      const profile = getThing(profileDataset, webId)
      if (!profile) return null

      // Extract fields
      const name = getStringNoLocale(profile, FOAF.name) || ''
      const avatar = getStringNoLocale(profile, VCARD.hasPhoto)
      const bio = getStringNoLocale(profile, VCARD.note)

      return {
        name,
        avatar,
        bio,
        interests: [] // TODO: Load from separate file
      }
    } catch (error) {
      console.error('Error loading profile:', error)
      return null
    }
  }

  async saveProfile(webId: string, profile: Partial<SolidProfile>) {
    try {
      // Load dataset
      let profileDataset = await getSolidDataset(webId, {
        fetch: solidAuth.getFetch()
      })

      // Get/Create profile Thing
      let profileThing = getThing(profileDataset, webId)
      if (!profileThing) {
        profileThing = createThing({ url: webId })
      }

      // Update fields
      if (profile.name) {
        profileThing = setStringNoLocale(profileThing, FOAF.name, profile.name)
      }
      if (profile.avatar) {
        profileThing = setStringNoLocale(profileThing, VCARD.hasPhoto, profile.avatar)
      }
      if (profile.bio) {
        profileThing = setStringNoLocale(profileThing, VCARD.note, profile.bio)
      }

      // Save back
      profileDataset = setThing(profileDataset, profileThing)
      await saveSolidDatasetAt(webId, profileDataset, {
        fetch: solidAuth.getFetch()
      })

      return true
    } catch (error) {
      console.error('Error saving profile:', error)
      return false
    }
  }
}

export const solidProfile = new SolidProfileService()
```

---

### 3. Solid Bookmarks Service

**File:** `src/services/solidBookmarks.ts`

```typescript
import {
  getSolidDataset,
  saveSolidDatasetAt,
  createThing,
  setThing,
  getThingAll,
  getStringNoLocale,
  setStringNoLocale,
  setDatetime
} from '@inrupt/solid-client'
import { DC } from '@inrupt/vocab-common-rdf'
import { solidAuth } from './solidAuth'

export interface Bookmark {
  id: string
  title: string
  url: string
  createdAt: Date
}

export class SolidBookmarksService {
  private getBookmarksUrl(webId: string): string {
    // Extract Pod root from webId
    const podRoot = webId.split('/profile')[0]
    return `${podRoot}/toplocs/bookmarks`
  }

  async getBookmarks(webId: string): Promise<Bookmark[]> {
    try {
      const bookmarksUrl = this.getBookmarksUrl(webId)
      const dataset = await getSolidDataset(bookmarksUrl, {
        fetch: solidAuth.getFetch()
      })

      const things = getThingAll(dataset)
      return things.map(thing => ({
        id: thing.url,
        title: getStringNoLocale(thing, DC.title) || '',
        url: getStringNoLocale(thing, 'http://www.w3.org/2002/01/bookmark#recalls') || '',
        createdAt: new Date(getStringNoLocale(thing, DC.created) || Date.now())
      }))
    } catch (error) {
      console.error('Error loading bookmarks:', error)
      return []
    }
  }

  async addBookmark(webId: string, bookmark: Omit<Bookmark, 'id' | 'createdAt'>) {
    try {
      const bookmarksUrl = this.getBookmarksUrl(webId)
      let dataset = await getSolidDataset(bookmarksUrl, {
        fetch: solidAuth.getFetch()
      }).catch(() => {
        // File doesn't exist yet, create new dataset
        return null
      })

      if (!dataset) {
        dataset = await saveSolidDatasetAt(bookmarksUrl, [], {
          fetch: solidAuth.getFetch()
        })
      }

      // Create bookmark thing
      let bookmarkThing = createThing({ name: `bookmark-${Date.now()}` })
      bookmarkThing = setStringNoLocale(bookmarkThing, DC.title, bookmark.title)
      bookmarkThing = setStringNoLocale(
        bookmarkThing,
        'http://www.w3.org/2002/01/bookmark#recalls',
        bookmark.url
      )
      bookmarkThing = setDatetime(bookmarkThing, DC.created, new Date())

      // Save
      dataset = setThing(dataset, bookmarkThing)
      await saveSolidDatasetAt(bookmarksUrl, dataset, {
        fetch: solidAuth.getFetch()
      })

      return true
    } catch (error) {
      console.error('Error adding bookmark:', error)
      return false
    }
  }
}

export const solidBookmarks = new SolidBookmarksService()
```

---

## 🔄 Hybrid Architecture (Empfehlung)

### Was bleibt bei Gun.js:
- ✅ **Chat Messages** (Echtzeit P2P)
- ✅ **Reactions** (Echtzeit, anonym)
- ✅ **Typing Indicators** (Echtzeit, ephemeral)

**Grund:** Gun.js ist optimal für Echtzeit-Features

### Was geht zu Solid Pods:
- ✅ **User Profile** (Portabilität, Interoperabilität)
- ✅ **Bookmarks** (User-owned data)
- ✅ **Settings** (Sync über Geräte)
- ✅ **Interests** (Privacy, Kontrolle)

**Grund:** Solid Pods sind optimal für User-owned persistent data

---

## 🧪 Testing Strategy

### Unit Tests:
```typescript
// tests/unit/solidAuth.test.ts
describe('SolidAuthService', () => {
  it('should login to Solid Provider', async () => {
    await solidAuth.login('https://solidcommunity.net')
    expect(solidAuth.isLoggedIn()).toBe(true)
  })
})

// tests/unit/solidProfile.test.ts
describe('SolidProfileService', () => {
  it('should read profile from Pod', async () => {
    const profile = await solidProfile.getProfile(webId)
    expect(profile.name).toBe('Alice')
  })

  it('should save profile to Pod', async () => {
    const result = await solidProfile.saveProfile(webId, { bio: 'New bio' })
    expect(result).toBe(true)
  })
})
```

### Integration Tests:
- Login → Read Profile → Edit → Save → Verify
- Add Bookmark → Reload → Verify Persistence
- Offline → Online → Auto-Sync

### E2E Tests (Playwright):
- Full User Journey: Register → Login → Edit Profile → Add Bookmarks → Logout → Login → Verify Data

---

## 📊 Performance Considerations

### Latency:
- **Solid Pod Read:** ~200-500ms (abhängig von Provider)
- **Gun.js P2P:** ~50-100ms (lokal)
- **Strategie:** Cache in localStorage, Sync in Background

### Caching Strategy:
```typescript
// Read from cache first, then Pod
async function getCachedProfile(webId: string) {
  // 1. Try cache
  const cached = localStorage.getItem(`profile:${webId}`)
  if (cached) return JSON.parse(cached)

  // 2. Fetch from Pod
  const profile = await solidProfile.getProfile(webId)

  // 3. Update cache
  localStorage.setItem(`profile:${webId}`, JSON.stringify(profile))

  return profile
}
```

### Bundle Size Impact:
```
@inrupt/solid-client:              ~150 kB (gzipped: ~40 kB)
@inrupt/solid-client-authn-browser: ~80 kB (gzipped: ~20 kB)
─────────────────────────────────────────────────────────
TOTAL:                             ~230 kB (gzipped: ~60 kB)

Current Bundle:                    ~500 kB (gzipped: ~86 kB)
With Solid:                        ~730 kB (gzipped: ~146 kB)
Target:                           ~1200 kB (gzipped: ~350 kB)

✅ Still WELL UNDER budget! (-58% under target)
```

---

## 🚀 Deployment Considerations

### Community Solid Server (CSS) Setup:

**Option 1: npx (Development):**
```bash
npx @solid/community-server -c @css:config/file.json -f .data
# → http://localhost:3000
```

**Option 2: Docker (Production):**
```bash
docker run -p 3000:3000 \
  -v $(pwd)/data:/data \
  solidproject/community-server
```

**Option 3: Docker Compose (Recommended):**
```yaml
version: '3.8'
services:
  solid-server:
    image: solidproject/community-server:latest
    ports:
      - "3000:3000"
    volumes:
      - ./solid-data:/data
      - ./solid-config:/config
    environment:
      - BASE_URL=https://pods.toplocs.org
    restart: unless-stopped
```

### Provider Recommendations:

| Provider | Use Case | Pros | Cons |
|----------|----------|------|------|
| **solidcommunity.net** | Development, Testing | Free, Easy, No Setup | Public, Limited Storage |
| **Self-hosted CSS** | Production | Full Control, Privacy | Requires Server, Maintenance |
| **Inrupt PodSpaces** | Enterprise | Commercial Support, SLA | Paid, Vendor Lock-in |

**Empfehlung für TopLocs:**
- **Development:** solidcommunity.net
- **Production:** Self-hosted CSS (Docker Compose)

---

## 📚 Documentation TODO

### User Documentation:
- [ ] **docs/solid-pods-user-guide.md** - Wie nutze ich Solid Pods?
  - Was ist ein Solid Pod?
  - Wie wähle ich einen Provider?
  - Wie sichere ich meine Daten?
  - FAQ

### Developer Documentation:
- [ ] **docs/solid-pods-dev-guide.md** - Developer Guide
  - API Reference (Services)
  - Testing Guide
  - Deployment Guide
  - Troubleshooting

---

## ✅ Success Criteria

Phase 3.1 ist erfolgreich wenn:

- ✅ User kann sich mit Solid Provider einloggen
- ✅ User kann Provider wählen (solidcommunity.net oder self-hosted)
- ✅ Profile wird in Solid Pod gespeichert
- ✅ Bookmarks werden in Solid Pod gespeichert
- ✅ Settings werden in Solid Pod gespeichert
- ✅ Offline → Online Sync funktioniert
- ✅ Unit Tests: 95%+ Coverage
- ✅ E2E Tests: Full User Journey
- ✅ Bundle Size: < 350 kB gz
- ✅ Documentation: User + Dev Guide

---

## 🎯 Next Immediate Steps

1. **Install Dependencies:**
   ```bash
   cd /home/reza/Entwiklung/toplocs/news-plugin
   pnpm add @inrupt/solid-client @inrupt/solid-client-authn-browser @inrupt/vocab-common-rdf
   ```

2. **Create Services:**
   - `src/services/solidAuth.ts`
   - `src/services/solidProfile.ts`
   - `src/stores/useSolidSession.ts`

3. **Create UI:**
   - `src/components/SolidLoginButton.vue`
   - `src/components/SolidProviderSelector.vue`

4. **Test Locally:**
   ```bash
   # Terminal 1: Start CSS
   npx @solid/community-server -c @css:config/file.json -f .data

   # Terminal 2: Start App
   pnpm dev
   ```

---

**Status:** Planning Complete ✅
**Next:** Implementation Phase
**Timeline:** 4 Wochen
**Priority:** HIGH
