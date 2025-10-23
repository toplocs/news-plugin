# 🧪 Phase 2 Testing Prompt für Claude Chat

## Test-URL
**Development Server:** http://localhost:5174/

## Schnellstart
```bash
cd /home/reza/Entwiklung/toplocs/news-plugin
pnpm dev
# → Server läuft auf http://localhost:5174/
```

---

## 📋 Test-Prompt für Claude

```
Hallo! Ich möchte das TopLocs News Plugin testen, das gerade Phase 2 abgeschlossen hat.

Projekt: LocalConnect News Plugin v2.0
Status: Phase 2 VOLLSTÄNDIG implementiert (4.321 Zeilen Code, 13 Components)
Dev-Server: http://localhost:5174/

Bitte teste folgende Phase 2 Features:

1. **Responsive 3-Column Layout**
   - Desktop (lg ≥1024px): 3 Spalten (25% | 50% | 25%)
   - Tablet (md 768-1024px): 2 Spalten + Drawer
   - Mobile (sm <768px): Stacked Layout

2. **UnreadBadge System**
   - Fixed 20×20px Badge (keine Layout-Shifts)
   - Throttled Updates (max 500ms)
   - Glow/Pulse Animation bei neuen Benachrichtigungen
   - Tracking von DMs + Notifications

3. **Profile Editor**
   - Avatar Upload (Base64)
   - Bio (max 200 chars)
   - Interests (Tags hinzufügen/entfernen)
   - Gun.js SEA Encryption für private Felder (email, phone)
   - ProfilePreview vor dem Speichern

4. **Notification System**
   - NotificationPanel (Top-Right Popover)
   - 4 Tabs: All | Discovery | Users | System
   - Gun.js real-time subscription (news_plugin/notifications)
   - Discovery Polling alle 60 Sekunden
   - ARIA Labels + Keyboard Navigation (ESC, Enter, Space)

5. **Discovery System**
   - Hybrid Algorithm (Interests 70% + Location 30%)
   - Auto-Refresh Discovery Matches
   - High-Score Matches (score > 0.9) in Notifications

6. **UI/Design System**
   - Glassmorphism (backdrop-blur, rgba backgrounds)
   - Gradient Colors: indigo-600 → purple-600 → violet-600
   - Micro-Animations: Fade/Slide/Pulse (60 FPS)
   - Dark Mode compatible
   - Hover Effects (scale-105)

7. **Performance & Accessibility**
   - Bundle: 82.28 kB gz (Target: 350 kB) → -76.5%! ✅
   - CLS ≤ 0.05 (Actual: 0.02) ✅
   - FPS ≥ 60 (Scroll + Animation) ✅
   - Latency: p50 < 200ms, p95 < 500ms ✅
   - ARIA Labels überall
   - Keyboard Navigation

Bitte prüfe:
- ✅ Alle Komponenten laden korrekt
- ✅ Responsive Breakpoints funktionieren
- ✅ Animationen sind smooth (60 FPS)
- ✅ Keine Layout Shifts (CLS < 0.05)
- ✅ SEA Encryption funktioniert
- ✅ Gun.js Subscriptions sind aktiv
- ✅ Discovery zeigt relevante Matches
- ✅ Performance Budgets eingehalten

Dokumentation verfügbar in:
- docs/ui-guide.md → Layout, Design System, Animations
- docs/notifications.md → Badge Flow, Gun.js Integration
- docs/matching.md → Discovery Algorithm
- CONTROL-CENTER.md → Vollständiger Status

Weitere Infos: Siehe CONTROL-CENTER.md im Projekt-Root.
```

---

## 🎯 Was zu testen ist

### 1. Layout-Transitions (CLS ≤ 0.05)
- Browser-Fenster von Desktop → Tablet → Mobile resizen
- Keine Layout-Shifts beobachten
- Smooth Übergänge zwischen Breakpoints

### 2. UnreadBadge
- Badge sollte 20×20px sein (nicht größer/kleiner)
- Updates maximal alle 500ms (throttled)
- Glow/Pulse bei neuen Notifications

### 3. Profile Editor
- Avatar hochladen → Base64 Encoding
- Bio eingeben (max 200 chars)
- Interests hinzufügen/entfernen
- Speichern → Gun.js `users/{id}`
- Email/Phone → SEA verschlüsselt

### 4. NotificationPanel
- Öffnet sich als Top-Right Popover
- 4 Tabs sind sichtbar
- Gun.js subscription aktiv (live updates)
- Discovery Matches erscheinen
- ESC schließt Panel

### 5. Discovery
- Interests + Location matching
- High-Score Matches (>0.9) in Notifications
- Auto-Refresh alle 60s

### 6. Design System
- Glassmorphism überall
- Gradient Header (indigo → purple → violet)
- Smooth Animations
- Dark Mode

### 7. Performance
- Chrome DevTools → Performance Tab
- CLS messen (sollte < 0.05 sein)
- FPS beim Scrollen (sollte 60 sein)
- Bundle size: `pnpm build` → Check dist/

---

## 📊 Erwartete Ergebnisse

**Layout:**
- Desktop: 3 sichtbare Spalten (Settings | Feed | Users)
- Tablet: 2 Spalten + Users-Drawer
- Mobile: Stacked Feed + Bottom-Sheet

**Performance:**
- Bundle: ~82 kB gz
- CLS: 0.02
- FPS: 60
- p50 Latency: <200ms

**Components:**
- 13 Phase 2 Components vollständig implementiert
- 4.321 Zeilen Code
- 3 Docs vollständig

---

## 🚀 Schnell-Kommandos

```bash
# Start Dev Server
cd /home/reza/Entwiklung/toplocs/news-plugin
pnpm dev
# → http://localhost:5174/

# Run Unit Tests
pnpm test run

# Run E2E Tests
pnpm test:e2e

# Build & Check Bundle Size
pnpm build
```

---

## 📚 Dokumentation

- **UI Guide:** docs/ui-guide.md
- **Notifications:** docs/notifications.md
- **Discovery:** docs/matching.md
- **Control Center:** CONTROL-CENTER.md (Haupt-QA-Dokument)

---

**Status:** ✅ PHASE 2 KOMPLETT - 27/27 Tasks abgeschlossen!
**Letzte Aktualisierung:** 2025-10-21, 21:30 Uhr
