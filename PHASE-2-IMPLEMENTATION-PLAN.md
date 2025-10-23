# 🚀 PHASE 2 IMPLEMENTATION PLAN - Dezentrales Internet

**Datum:** 2025-10-24
**Ziel:** Production-ready Phase 2 mit 100% dezentraler Datenspeicherung
**Format:** PLAN → CHANGESET → TESTS → QA → DOCS → NOTES → CL_META

---

## 📊 AKTUELLE SITUATION

### ✅ Bereits Implementiert:
1. **Main Layout** - CleanLayout.vue (68 KB), NewsLayout.vue (21 KB)
2. **Profile System** - ProfileEdit.vue, ProfileForm.vue, ProfilePreview.vue
3. **Notification System** - NotificationPanel.vue, useNotifications.ts
4. **Discovery System** - useDiscovery.ts (626 lines)
5. **UI Components** - UnreadBadge, UserSidebar, HeaderBar
6. **Gun.js Service** - gun.ts (localStorage mode)

### ⚠️ Zu Fixen:
1. **useReactions.ts** - Nutzt externen Server (gun-manhattan.herokuapp.com)
2. **Dokumentation** - Fehlt für dezentrale Features
3. **Tests** - Nicht für alle Features vorhanden

### ❌ Zu Erstellen:
1. **docs/ui-guide.md** - Design System Dokumentation
2. **docs/notifications.md** - Notification Flow & API
3. **docs/matching.md** - Discovery Logic
4. **docs/decentralization.md** - Datenschutz & Gun.js Erklärung

---

## 🎯 TASKS (in Reihenfolge)

### TASK 1: FIX DEZENTRALISIERUNG ⚠️ KRITISCH
**Priority:** 🔴 HIGH
**File:** `src/stores/useReactions.ts`

**Problem:**
```typescript
// Zeile 39 - FALSCH (externer Server):
const gun = Gun(['https://gun-manhattan.herokuapp.com/gun'])
```

**Lösung:**
```typescript
// RICHTIG (dezentral):
import gun from '../services/gun'  // Verwendet lokalen Gun.js (peers: [])
```

**Deliverable:**
- ✅ useReactions.ts nutzt lokalen Gun.js
- ✅ Keine Daten verlassen Computer
- ✅ 100% Datenschutz

---

### TASK 2: DOKUMENTATION - DEZENTRALES INTERNET
**Priority:** 🔴 HIGH

#### 2.1 docs/decentralization.md
**Inhalt:**
- Was ist dezentrales Internet?
- Wie funktioniert Gun.js P2P?
- Welche Daten bleiben lokal?
- Wie kann User P2P aktivieren?
- Datenschutz-Garantien

#### 2.2 docs/ui-guide.md
**Inhalt:**
- Breakpoints (sm/md/lg)
- Design System (Glassmorphism)
- Animations (60 FPS)
- Layout Structure (3-Column)
- Color Palette
- Typography

#### 2.3 docs/notifications.md
**Inhalt:**
- Badge Flow (Unread Counter)
- Discovery API (Interest + Location)
- Real-time Gun.js Subscription
- Event Examples
- Notification Types

#### 2.4 docs/matching.md
**Inhalt:**
- Discovery Logic (Hybrid Scoring)
- Interest Matching Algorithm
- Location Proximity Calculation
- Score Weights
- Examples

---

### TASK 3: TEST-OBERFLÄCHE ERSTELLEN
**Priority:** 🟡 MEDIUM

**Ziel:** User kann alle Features testen

#### 3.1 Demo-Seite: demo-phase2.html
**Features:**
- Main Layout (3-Column)
- Profile Editor
- Notifications Panel
- Unread Badge
- Discovery Panel
- Reactions (JETZT DEZENTRAL!)

#### 3.2 Test-Anleitung: TESTING-GUIDE-PHASE2.md
**Inhalt:**
- Wie starte ich Dev-Server?
- Welche URL öffnen?
- Was kann ich testen?
- Schritt-für-Schritt Flows
- Expected Results

---

### TASK 4: PERFORMANCE & ACCESSIBILITY AUDIT
**Priority:** 🟡 MEDIUM

#### 4.1 Performance Check
- ✅ Bundle Size ≤ 350 kB (aktuell: 86 kB ✅)
- ✅ p50 Latency < 200 ms
- ✅ CLS ≤ 0.05 (aktuell: 0.02 ✅)
- ✅ FPS ≥ 60

#### 4.2 Accessibility Check
- ✅ ARIA Labels vorhanden
- ✅ Keyboard Navigation funktioniert
- ✅ Focus States (`:focus-visible`)
- ✅ Screen Reader Support

---

### TASK 5: UNIT TESTS ERWEITERN
**Priority:** 🟢 LOW

#### 5.1 Neue Test Files
- `tests/unit/useReactions.test.ts` (nach Fix!)
- `tests/unit/ProfileForm.test.ts`
- `tests/unit/UnreadBadge.test.ts`

#### 5.2 Test Coverage Goal
- Target: 95%+
- Current: ~80%

---

## 📝 OUTPUT FORMAT

### Jede Task folgt diesem Format:

```markdown
## 📦 TASK X: [NAME]

### 🎯 PLAN
- Was wird gemacht?
- Warum ist es nötig?
- Welches Problem löst es?

### 🔧 CHANGESET
```diff
+ Added files
- Removed files
~ Modified files
```

### 🧪 TESTS
- Welche Tests wurden erstellt?
- Welche Test-Cases?
- Pass Rate?

### ✅ QA
- Manuelle Tests durchgeführt?
- Performance geprüft?
- Accessibility getestet?

### 📚 DOCS
- Welche Docs erstellt/updated?
- Screenshots?
- Examples?

### 📝 NOTES
- Wichtige Erkenntnisse
- Offene Fragen
- Future TODOs

### 🏷️ CL_META
- Commit Message
- Files Changed
- Lines Added/Removed
```

---

## 🎯 FINAL DELIVERABLES

Nach Abschluss aller Tasks:

1. ✅ **100% Dezentral** - Keine externen Server (außer User aktiviert P2P)
2. ✅ **Vollständig Dokumentiert** - 4 neue Markdown Files
3. ✅ **Test-Oberfläche** - demo-phase2.html + Testing Guide
4. ✅ **Performance Audit** - Alle Targets erfüllt
5. ✅ **Test Coverage** - 95%+ Unit Tests
6. ✅ **Production Ready** - Bereit für Deployment

---

## 🚀 NEXT STEPS

1. **User Approval** - Ist dieser Plan OK?
2. **Start Implementation** - TASK 1 beginnen
3. **Iterative Delivery** - Nach jedem Task: PLAN → CHANGESET → TESTS → QA → DOCS
4. **Final Review** - User testet alles

---

**Estimated Time:** 4-6 Stunden
**Complexity:** Medium
**Risk:** Low (meiste Features existieren bereits)

---

**Ready to start?** 🚀
