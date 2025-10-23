# 🔒 Dezentralisierung & Datenschutz - TopLocs News Plugin

**Version:** 2.0
**Datum:** 2025-10-24
**Status:** Production Ready

---

## 🎯 Was ist dezentrales Internet?

### Traditionelles Internet (Zentralisiert)
```
User → Server (Facebook/Google) → Andere User
         ↑
    Alle Daten hier!
    - Firma kontrolliert
    - Firma kann lesen
    - Firma kann verkaufen
```

### TopLocs (Dezentralisiert)
```
User ←→ User (direkt!)
  ↓         ↓
Lokal    Lokal
(Du)     (Andere)
```

**Unterschied:**
- ✅ **Keine zentrale Firma** kontrolliert deine Daten
- ✅ **Du speicherst lokal** auf deinem Computer
- ✅ **Peer-to-Peer (P2P)** wenn du es aktivierst

---

## 🔧 Wie funktioniert Gun.js?

### Gun.js = Dezentrale Datenbank

**Konzept:**
```javascript
// Traditionelle Datenbank:
fetch('https://server.com/api/data')  // ❌ Zentral

// Gun.js:
gun.get('data').on(data => ...)  // ✅ Lokal oder P2P
```

### 3 Modi in TopLocs News Plugin:

#### 1️⃣ **LOCAL Mode** (Standard) ✅ SICHER
```typescript
// src/services/gun.ts
const gun = Gun({
  peers: [],           // Keine Server!
  localStorage: true   // Nur auf deinem Computer
})
```

**Was bedeutet das?**
- ✅ Daten NUR auf deinem Computer
- ✅ Keine Synchronisation
- ✅ 100% Privat
- ✅ Funktioniert offline
- ❌ Nicht auf anderen Geräten verfügbar

#### 2️⃣ **P2P Mode** (Optional) ⚠️ TEILEN
```typescript
const gun = Gun({
  peers: ['https://relay.toplocs.org/gun']  // Community-Server
})
```

**Was bedeutet das?**
- ✅ Synchronisation zwischen deinen Geräten
- ✅ Teilen mit anderen (wenn gewollt)
- ⚠️ Daten auf Relay-Server (temporär)
- ⚠️ Andere können sehen (bei öffentlichen Daten)

#### 3️⃣ **HYBRID Mode** (Empfohlen) 🎯
```typescript
const usePeerSync = settings.enableP2PSync || false

const gun = Gun(usePeerSync ? {
  peers: ['https://relay.toplocs.org/gun']
} : {
  peers: [],
  localStorage: true
})
```

**Was bedeutet das?**
- ✅ **Du entscheidest!**
- ✅ Privat by Default
- ✅ P2P nur wenn aktiviert
- ✅ User hat Kontrolle

---

## 📊 Welche Daten bleiben lokal?

### ✅ 100% LOKAL (Immer privat):

| Feature | Speicherort | Wer kann lesen? |
|---------|-------------|-----------------|
| **Bookmarks** | localStorage | ✅ Nur DU |
| **Settings** | localStorage | ✅ Nur DU |
| **Search History** | localStorage | ✅ Nur DU |
| **Filters** | localStorage | ✅ Nur DU |
| **User Preferences** | localStorage | ✅ Nur DU |

### ⚠️ LOKAL + OPTIONAL P2P:

| Feature | Speicherort | Wer kann lesen? |
|---------|-------------|-----------------|
| **Reactions** | Gun.js (lokal) | ✅ Nur DU (wenn P2P off) |
| **Comments** | Gun.js (lokal) | ✅ Nur DU (wenn P2P off) |
| **Chat** | Gun.js (lokal) | ✅ Nur DU (wenn P2P off) |
| **Profile** | Gun.js (lokal) | ✅ Nur DU (wenn P2P off) |

**Wenn P2P aktiviert:**
- ⚠️ Reactions → Sichtbar für andere
- ⚠️ Comments → Öffentlich
- 🔒 Chat → Nur Chat-Partner (verschlüsselt mit SEA)
- 🔒 Profile → Nur was du teilst

---

## 🔐 Verschlüsselung mit Gun SEA

### Was ist SEA?

**SEA = Security, Encryption, and Authorization**

```javascript
// Privates Feld verschlüsseln:
const secret = await Gun.SEA.encrypt('Mein Geheimnis', 'mein-passwort')
gun.get('profile').put({ secret })

// Entschlüsseln (nur mit Passwort):
const decrypted = await Gun.SEA.decrypt(data.secret, 'mein-passwort')
```

### In TopLocs News Plugin:

**Verschlüsselt:**
- 🔒 Private Profile-Felder (Email, Phone)
- 🔒 Private Chat-Nachrichten
- 🔒 Private Notizen

**NICHT verschlüsselt:**
- 📢 Öffentliche Kommentare
- 📢 Reactions (Emoji)
- 📢 Öffentliches Profil (Name, Avatar)

---

## 🎯 Datenschutz-Garantien

### Was TopLocs News Plugin GARANTIERT:

1. ✅ **Keine Tracking-Cookies**
2. ✅ **Keine Analytics** (Google, Facebook, etc.)
3. ✅ **Keine externen APIs** (außer RSS-Feeds für News)
4. ✅ **Kein Datenverkauf**
5. ✅ **Open Source** (du kannst Code prüfen)

### Was TopLocs NICHT kann:

1. ❌ **Deine Daten lesen** (lokal gespeichert)
2. ❌ **Deine Daten löschen** (du hast Kontrolle)
3. ❌ **Zugriff ohne Passwort** (SEA-verschlüsselt)
4. ❌ **Tracking** (kein Backend-Server)

---

## 🚀 P2P Synchronisation (Optional)

### Wie aktiviere ich P2P?

**In den Einstellungen:**
```
Settings → Advanced → Enable P2P Sync ✓
```

**Was wird synchronisiert:**
- ✅ Reactions (auf Artikel)
- ✅ Kommentare (öffentlich)
- ✅ Öffentliches Profil
- ❌ Bookmarks (bleiben lokal!)
- ❌ Settings (bleiben lokal!)

### Welche Server werden genutzt?

**Option 1: TopLocs Community Relays**
```
https://relay1.toplocs.org/gun
https://relay2.toplocs.org/gun
```
- ✅ Von Community betrieben
- ✅ Non-Profit
- ✅ Keine Daten-Logs
- ✅ Open Source

**Option 2: Eigener Server**
```
https://dein-server.com/gun
```
- ✅ 100% deine Kontrolle
- ✅ Du betreibst Server
- ✅ Kein Dritter involviert

---

## 🔍 Technische Details

### Gun.js Konfiguration

**Standard (LOCAL):**
```typescript
// src/services/gun.ts
const gun = Gun({
  peers: [],              // Keine P2P Server
  localStorage: true,     // Browser localStorage
  radisk: true            // IndexedDB für große Daten
})
```

**Mit P2P:**
```typescript
const gun = Gun({
  peers: [
    'https://relay1.toplocs.org/gun',
    'https://relay2.toplocs.org/gun'
  ],
  localStorage: true,
  radisk: true,
  multicast: false       // Kein lokales Netzwerk-Sharing
})
```

### Daten-Schema

**Gun.js Struktur:**
```
gun
├── news_plugin
│   ├── articles/
│   │   └── {article-id}           → Artikel-Daten
│   ├── reactions/
│   │   └── {article-id}/
│   │       └── {user-id}_{article-id}  → User Reaction
│   ├── comments/
│   │   └── {article-id}/
│   │       └── {comment-id}       → Kommentar
│   ├── users/
│   │   └── {user-id}              → User Profil
│   └── notifications/
│       └── {user-id}              → Benachrichtigungen
```

---

## 📋 Häufig gestellte Fragen (FAQ)

### 1. Können andere meine Bookmarks sehen?

**Nein!** Bookmarks werden NUR in localStorage gespeichert:
```typescript
// src/stores/useBookmarks.ts
localStorage.setItem('news_plugin_bookmarks', JSON.stringify(bookmarks))
```
Niemand außer dir kann auf localStorage zugreifen.

---

### 2. Was passiert, wenn ich P2P aktiviere?

**Vorher:**
- Daten nur auf deinem Computer
- Keine Sync zwischen Geräten

**Nachher:**
- Reactions synchronisieren zwischen deinen Geräten
- Kommentare werden öffentlich sichtbar
- Profil wird mit anderen geteilt (nur öffentliche Felder!)
- **Bookmarks bleiben trotzdem lokal!**

---

### 3. Kann TopLocs meine Daten löschen?

**Nein!** TopLocs hat keinen zentralen Server. Deine Daten sind:
- Lokal auf deinem Computer (localStorage + IndexedDB)
- Optional auf P2P Relays (temporär gecacht)
- **Du hast Kontrolle** über Löschen/Behalten

---

### 4. Was ist der Unterschied zu Facebook/Google?

**Facebook/Google:**
```
User → Server (Facebook/Google) → Andere User
         ↑
    - Liest alle Daten
    - Verkauft Daten
    - Kontrolliert alles
```

**TopLocs:**
```
User ←→ User (direkt, optional)
  ↓
Lokal (immer)
```

---

### 5. Kann ich komplett offline arbeiten?

**Ja!** Im LOCAL Mode funktioniert alles offline:
- ✅ Artikel lesen (gecacht)
- ✅ Bookmarks setzen
- ✅ Reactions hinzufügen
- ✅ Kommentare schreiben

**Nur RSS-Feed-Refresh braucht Internet.**

---

## 🎯 Empfohlene Konfiguration

### Für maximale Privatsphäre:
```
P2P Sync:     OFF ❌
Mode:         LOCAL
Verschlüsselung: ON (für Profile)
```

**Ergebnis:** Alles bleibt auf deinem Computer!

---

### Für Multi-Geräte-Sync:
```
P2P Sync:     ON ✓
Relays:       TopLocs Community
Verschlüsselung: ON (für sensible Daten)
```

**Ergebnis:** Sync zwischen deinen Geräten, aber Bookmarks bleiben lokal!

---

### Für öffentliche Community:
```
P2P Sync:     ON ✓
Relays:       TopLocs Community
Public Profile: ON ✓
```

**Ergebnis:** Volle Community-Features, aber du kontrollierst was geteilt wird!

---

## 📚 Weiterführende Links

- **Gun.js Dokumentation:** https://gun.eco/docs/
- **SEA Encryption:** https://gun.eco/docs/SEA
- **TopLocs Datenschutz:** https://toplocs.org/privacy
- **Open Source Code:** https://github.com/toplocs/news-plugin

---

**🔒 Deine Daten. Deine Kontrolle. Dezentral.**
