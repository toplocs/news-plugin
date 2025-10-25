# 🔓 Open Source Alternativen für Dezentrales Internet

**Datum:** 2025-10-24
**Status:** Research Phase

---

## 🎯 Philosophie

**Nicht alles neu erfinden!** Wir nutzen bewährte Open Source Lösungen:

> "Stand on the shoulders of giants" - Isaac Newton

---

## 📦 SOLID PODS - Persönliche Datenspeicher

### Was ist Solid?

**Erfinder:** Tim Berners-Lee (Erfinder des WWW)
**Ziel:** True data ownership - User besitzt seine Daten

### Wie es funktioniert:
```
User → Solid Pod (persönlicher Datentresor)
         ↓
    Du entscheidest:
    - Wo der Pod läuft (dein Server/Cloud)
    - Wer Zugriff hat
    - Welche Apps deine Daten nutzen
```

### JavaScript Library:
```bash
npm install @inrupt/solid-client
npm install @inrupt/solid-client-authn-browser
npm install @inrupt/vocab-common-rdf
```

### Code-Beispiel:
```typescript
import {
  getSolidDataset,
  getStringNoLocale,
  setThing,
  saveSolidDatasetAt
} from '@inrupt/solid-client'

// User Profile aus Pod lesen
const profileDataset = await getSolidDataset(
  'https://user.solidcommunity.net/profile/card'
)

// Daten speichern
await saveSolidDatasetAt(
  'https://user.solidcommunity.net/bookmarks',
  bookmarksDataset
)
```

### Vorteile für TopLocs:
- ✅ **GDPR Compliant** (EU-konform!)
- ✅ **User Ownership** (User besitzt Daten)
- ✅ **Portabilität** (Daten mitnehmen)
- ✅ **Interoperabilität** (Apps teilen Daten)

### Pod Provider Optionen:
1. **Community Solid Server (CSS)** - ✅ EMPFOHLEN! Open Source, Node.js, einfach
2. **solidcommunity.net** - Kostenlos, Community-betrieben
3. **Inrupt PodSpaces** - Commercial, Enterprise-ready (Email für Zugang)
4. **Inrupt ESS** - Self-hosted Enterprise (benötigt Kubernetes + Lizenz)

### Community Solid Server Installation (EMPFOHLEN):
```bash
# Methode 1: npx (schnellster Start)
npx @solid/community-server -c @css:config/file.json -f .data

# Methode 2: Docker
docker run -p 3000:3000 solidproject/community-server

# Methode 3: Von Source (für Development)
git clone https://github.com/CommunitySolidServer/CommunitySolidServer
cd CommunitySolidServer
npm ci && npm start
```

**Requirements:**
- Node.js 18.0+ oder höher
- 2 GB RAM minimum
- Port 3000 (default)

**Vorteil CSS:** 100% Open Source (MIT License), keine Enterprise-Lizenz nötig!

**Links:**
- Docs: https://docs.inrupt.com/developer-tools/javascript/client-libraries/
- GitHub: https://github.com/inrupt/solid-client-js
- Website: https://solidproject.org/

---

## 📊 PLAUSIBLE ANALYTICS - Privacy-First Analytics

### Was ist Plausible?

**Alternative zu:** Google Analytics
**Vorteil:** Kein Tracking, GDPR-konform, Open Source

### Features:
- ✅ Keine Cookies
- ✅ Keine persönlichen Daten
- ✅ GDPR/CCPA Compliant
- ✅ Lightweight (< 1 KB Script)
- ✅ Open Source (AGPLv3)

### Installation (Docker Compose - EMPFOHLEN):
```bash
# 1. Clone Plausible Community Edition
git clone -b v3.0.1 --single-branch \
  https://github.com/plausible/community-edition plausible-ce
cd plausible-ce

# 2. Configure .env file
cat > .env <<EOF
BASE_URL=https://analytics.toplocs.org
SECRET_KEY_BASE=$(openssl rand -base64 48)
HTTP_PORT=80
HTTPS_PORT=443
EOF

# 3. Start mit Docker Compose
docker-compose up -d
```

**Requirements:**
- Docker + Docker Compose
- 2 GB RAM minimum (für ClickHouse + PostgreSQL)
- CPU mit SSE 4.2 oder NEON support

**Komponenten:**
- PostgreSQL (User-Daten)
- ClickHouse (Analytics-Daten)
- Plausible App
- Automatisches Let's Encrypt SSL

### Code-Beispiel:
```html
<!-- Einbinden in HTML -->
<script defer data-domain="news.toplocs.org"
  src="https://analytics.toplocs.org/js/script.js">
</script>
```

```typescript
// Custom Events tracken:
plausible('Article Read', {
  props: { category: 'Technology', source: 'Local' }
})
```

### Was wird NICHT getrackt:
- ❌ Keine IP-Adressen
- ❌ Keine User IDs
- ❌ Keine Cookies
- ❌ Keine persönlichen Daten

### Was wird getrackt:
- ✅ Seitenaufrufe (anonym)
- ✅ Referrer (woher kam User)
- ✅ Browser/OS (aggregiert)
- ✅ Custom Events (z.B. "Bookmark added")

**Links:**
- Website: https://plausible.io/
- Docs: https://plausible.io/docs
- GitHub: https://github.com/plausible/analytics

---

## 💬 MATRIX PROTOCOL - Dezentraler Chat

### Was ist Matrix?

**Alternative zu:** WhatsApp, Telegram, Discord
**Vorteil:** Dezentral, End-to-End verschlüsselt, Open Source

### Features:
- ✅ Dezentrales Netzwerk (wie Email)
- ✅ End-to-End Encryption (E2EE)
- ✅ Open Standard
- ✅ Bridging (zu WhatsApp, Slack, etc.)

### JavaScript SDK:
```bash
npm install matrix-js-sdk
```

### Code-Beispiel:
```typescript
import sdk from 'matrix-js-sdk'

// Matrix Client erstellen
const client = sdk.createClient({
  baseUrl: 'https://matrix.org',
  userId: '@user:matrix.org',
  accessToken: 'access_token_here'
})

// Raum beitreten
await client.joinRoom('!roomId:matrix.org')

// Nachricht senden
await client.sendMessage('!roomId:matrix.org', {
  body: 'Hello from TopLocs!',
  msgtype: 'm.text'
})

// Nachrichten empfangen
client.on('Room.timeline', (event) => {
  if (event.getType() === 'm.room.message') {
    console.log('New message:', event.getContent().body)
  }
})
```

### Matrix Homeserver Optionen:
1. **Synapse** - ✅ EMPFOHLEN! Self-hosted Server (Python, stabil)
2. **Dendrite** - Self-hosted (Go, leichter, noch Beta)
3. **matrix.org** - Kostenlos, öffentlich (für Testing)

### Synapse Installation (Docker Compose):
```bash
# 1. Clone Setup mit Element + NGINX + Admin UI
git clone https://github.com/AmirDez/matrix-on-premise
cd matrix-on-premise

# 2. Configure docker-compose.yml
# Edit: server_name, database credentials, ports

# 3. Start services
docker-compose up -d
```

**Komponenten:**
- Synapse (Matrix Homeserver)
- PostgreSQL (Datenbank)
- Element Web (Web-Client)
- NGINX (Reverse Proxy)
- Coturn (TURN Server für Voice/Video)
- Synapse Admin (Admin UI)

**Requirements:**
- Docker + Docker Compose
- 2-4 GB RAM (mehr für viele föderiete Server)
- Raspberry Pi möglich (für kleine Communities)

**Vorteil:** Komplettes Setup mit einer Zeile!

### Vorteile für TopLocs:
- ✅ **Keine zentrale Kontrolle** (User wählt Server)
- ✅ **Interoperabilität** (verschiedene Clients)
- ✅ **End-to-End verschlüsselt** (nur Sender + Empfänger)
- ✅ **Bridging** (Integration mit anderen Netzwerken)

**Links:**
- Website: https://matrix.org/
- Docs: https://matrix.org/docs/guides/
- GitHub: https://github.com/matrix-org/matrix-js-sdk

---

## 🌐 ACTIVITYPUB - Dezentrale Social Networks

### Was ist ActivityPub?

**Alternative zu:** Twitter, Facebook, Instagram
**Verwendet von:** Mastodon, Pixelfed, PeerTube

### Features:
- ✅ Föderiertes Netzwerk (wie Email)
- ✅ W3C Standard
- ✅ Posts, Likes, Shares, Follows

### Konzept:
```
User A (server1.org) → Post → Follower B (server2.org)
                                      ↓
                                Server 2 empfängt Activity
```

### JavaScript Libraries (Optionen):

**1. ActivityPub Express** (EMPFOHLEN für Node.js):
```bash
npm install activitypub-express
```
- Express.js Middleware
- MongoDB Storage (austauschbar)
- Vollständige AP-Implementierung

**2. Fedify** (TypeScript):
```bash
npm install @fedify/fedify
```
- TypeScript-native
- Moderne API
- Standards-konform

**3. Express ActivityPub** (Simple Reference):
- Minimale Implementierung
- Gut für Prototyping
- GitHub: immers-space/activitypub-express

### JavaScript Implementation Beispiel:
```typescript
// ActivityPub Post erstellen:
const activity = {
  "@context": "https://www.w3.org/ns/activitystreams",
  "type": "Create",
  "actor": "https://toplocs.org/users/alice",
  "object": {
    "type": "Note",
    "content": "Hello TopLocs Community!",
    "published": "2024-10-24T12:00:00Z"
  }
}

// An Follower-Server senden:
await fetch('https://follower-server.org/inbox', {
  method: 'POST',
  headers: { 'Content-Type': 'application/ld+json' },
  body: JSON.stringify(activity)
})
```

### Vorteile für TopLocs:
- ✅ **Federation** (TopLocs News kann mit Mastodon interagieren!)
- ✅ **W3C Standard** (weit verbreitet)
- ✅ **No vendor lock-in** (User kann Server wechseln)

**Links:**
- W3C Spec: https://www.w3.org/TR/activitypub/
- Mastodon API: https://docs.joinmastodon.org/

---

## 🔐 WEBAUTHN / PASSKEYS - Passwordlose Auth

### Was ist WebAuthn?

**Alternative zu:** Passwörter, SMS-Codes
**Vorteil:** Sicherer, benutzerfreundlicher, kein Phishing

### Features:
- ✅ Biometrische Auth (Fingerprint, Face ID)
- ✅ Hardware Keys (YubiKey)
- ✅ Kein Passwort nötig
- ✅ W3C Standard (alle Browser)

### Code-Beispiel:
```typescript
// WebAuthn Registration:
const credential = await navigator.credentials.create({
  publicKey: {
    challenge: new Uint8Array([/* server challenge */]),
    rp: { name: 'TopLocs' },
    user: {
      id: new Uint8Array([/* user id */]),
      name: 'alice@toplocs.org',
      displayName: 'Alice'
    },
    pubKeyCredParams: [
      { type: 'public-key', alg: -7 }  // ES256
    ]
  }
})

// Server speichert Public Key
```

### Browser Support:
- ✅ Chrome/Edge (94%+)
- ✅ Firefox (92%+)
- ✅ Safari (iOS 14+, macOS 11+)

**Links:**
- WebAuthn Guide: https://webauthn.guide/
- W3C Spec: https://www.w3.org/TR/webauthn/

---

## 📋 DECISION MATRIX

### Was nutzen wir wofür?

| Feature | Aktuelle Lösung | Open Source Alternative | Empfehlung |
|---------|-----------------|-------------------------|------------|
| **Datenspeicher** | Gun.js (P2P) | **Solid Pods** | ✅ Migration zu Solid |
| **Chat** | Gun.js | **Matrix Protocol** | ✅ Evaluieren |
| **Social Posts** | Custom | **ActivityPub** | ✅ Evaluieren |
| **Analytics** | Keine | **Plausible** | ✅ Implementieren |
| **Auth** | Gun SEA | **WebAuthn** | ✅ Beide nutzen |
| **News Feed** | Custom RSS | **Custom** (OK) | ✅ Behalten |

---

## 🎯 INTEGRATION ROADMAP

### Phase 3.1: Solid Pods Integration (Priority: HIGH)
```
1. @inrupt/solid-client installieren
2. Pod Authentication implementieren
3. Profile → Solid Pod migrieren
4. Bookmarks → Solid Pod
5. Settings → Solid Pod
```

### Phase 3.2: Privacy Analytics (Priority: MEDIUM)
```
1. Plausible self-hosted deployen
2. Tracking Script einbinden
3. Custom Events definieren
4. Dashboard für Admins
```

### Phase 3.3: Matrix Chat (Priority: LOW)
```
1. matrix-js-sdk evaluieren
2. Vergleich mit Gun.js Chat
3. Entscheidung: Migration oder Dual-Support
```

### Phase 3.4: ActivityPub (Priority: FUTURE)
```
1. Federation evaluieren
2. Mastodon Kompatibilität?
3. Posts aus TopLocs → Mastodon teilen?
```

---

## 💡 WARUM OPEN SOURCE?

### 1. **Nicht alles neu erfinden**
- Solid Pods: 10+ Jahre Entwicklung (Tim Berners-Lee!)
- Matrix: Millionen User, battle-tested
- Plausible: GDPR-konform, geprüft

### 2. **Community Support**
- GitHub Issues, PRs
- Dokumentation
- Sicherheits-Audits

### 3. **Interoperabilität**
- Solid Pods → alle Solid Apps können Daten nutzen
- Matrix → mit anderen Matrix-Servern föderiert
- ActivityPub → mit Mastodon kompatibel

### 4. **Keine Vendor Lock-In**
- User kann Server wechseln
- Daten portieren
- Eigene Kontrolle

---

## 📚 NÄCHSTE SCHRITTE

### Sofort (diese Woche):
1. [ ] @inrupt/solid-client installieren + testen
2. [ ] Solid Pod Authentication Flow implementieren
3. [ ] Profile in Pod speichern (Proof of Concept)

### Bald (nächste 2 Wochen):
1. [ ] Plausible Analytics deployen (Docker)
2. [ ] Matrix SDK evaluieren (Vergleich mit Gun.js)
3. [ ] Dokumentation erweitern

### Später (Monat):
1. [ ] ActivityPub Integration evaluieren
2. [ ] Migration Plan: Gun.js → Solid Pods
3. [ ] User Testing mit Solid Pods

---

**Motto:** "Nutze die besten Tools, nicht die neuesten Features."
