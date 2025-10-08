# 🔍 Browser Verification Checklist

**Date:** 2025-10-08
**Version:** 2.2
**URL:** http://localhost:5174/

---

## ✅ Code-Analyse: Was sollte funktionieren

### 1. Sidebar - 4 Tabs (7→4 Reduktion)
**Code Check:**
- ✅ `SidebarLeft.vue` hat nur 4 menuItems definiert
- ✅ Interessen, Bookmarks, Settings, Community
- ✅ Keine Sources, Stats, About, Profile Tabs mehr

**Browser Test:**
- [ ] Öffne http://localhost:5174/
- [ ] Linke Sidebar zeigt genau 4 Tabs
- [ ] "Meine Interessen" ist aktiv beim Start
- [ ] Alle Tabs sind klickbar

---

### 2. Bookmarks System - COMPLETE
**Code Check:**
- ✅ `useBookmarks.ts` - Store vorhanden
- ✅ `SidebarLeft.vue` Lines 122-144 - Bookmarks Liste implementiert
- ✅ Badge zeigt Count (Line 222)
- ✅ localStorage Persistence

**Browser Test:**
- [ ] Hover über Artikel → Bookmark Icon erscheint
- [ ] Click Icon → Toast "Artikel gespeichert"
- [ ] Tab "Gespeichert" → Badge zeigt "1"
- [ ] In Bookmarks Liste → Artikel sichtbar
- [ ] Click Artikel → Modal öffnet
- [ ] Click 🗑️ → Artikel wird entfernt
- [ ] Reload Page → Bookmarks bleiben erhalten

---

### 3. RSS Feeds - Optimiert
**Code Check:**
- ✅ `rssService.ts` - Cache implementiert (5 Min)
- ✅ Error Handling verbessert
- ✅ Console Logs: "📦 RSS Cache HIT", "✅ RSS fetched"

**Browser Test:**
- [ ] Öffne DevTools Console (F12)
- [ ] Page Reload
- [ ] Console zeigt RSS Logs
- [ ] Entweder: "✅ RSS fetched X articles" ODER "Mock data" fallback
- [ ] 2. Reload → "📦 RSS Cache HIT" (wenn RSS erfolgreich)

---

### 4. Interest Filter - STRICT Mode
**Code Check:**
- ✅ `CleanLayout.vue` Lines 379-409 - Interest Filter ohne Fallback
- ✅ Console Log: "📊 Interest Filter: X/Y Artikel"

**Browser Test:**
- [ ] Wähle 2-3 Interessen (z.B. tech, community)
- [ ] Console zeigt: "📊 Interest Filter: X/Y Artikel matchen..."
- [ ] NUR relevante Artikel im Feed
- [ ] Kein Fallback auf "alle Artikel"

---

### 5. Location/Radius Filter
**Code Check:**
- ✅ `CleanLayout.vue` Lines 410-424 - Haversine Formula
- ✅ Console Log: "📍 Location Filter: X → Y Artikel"

**Browser Test:**
- [ ] Click Location Button → "Aktueller Standort"
- [ ] Settings Tab → Radius auf 10km setzen
- [ ] Console zeigt: "📍 Location Filter: X → Y Artikel innerhalb 10km"
- [ ] Feed aktualisiert sich

---

### 6. Profile Save & Load
**Code Check:**
- ✅ `userService.ts` - User ID in localStorage
- ✅ Encryption Keys persistent
- ✅ `CleanLayout.vue` - initializeUserId()

**Browser Test:**
- [ ] Settings → "Profil bearbeiten"
- [ ] Fülle Formular aus (Name, Username, Bio)
- [ ] Click "Speichern" → Toast erscheint
- [ ] Schließe Editor
- [ ] Öffne Editor erneut
- [ ] Daten sind geladen ✅
- [ ] Reload Page → Daten bleiben erhalten

---

### 7. Chat History
**Code Check:**
- ✅ `ChatModal.vue` - Timeout 1500ms
- ✅ `.on()` statt `.once()`

**Browser Test:**
- [ ] Discovery Tab → User auswählen → Chat
- [ ] Schreibe Nachricht
- [ ] Schließe Chat
- [ ] Öffne Chat erneut
- [ ] Nachricht ist noch da

---

## 🔧 Known Issues zu prüfen:

### Playwright Tests
**Status:** Selektoren updated, Tests timeout
- [ ] Teste manuell: Alle Selektoren korrekt?
- [ ] Run: `pnpm exec playwright test --headed --project="Desktop Chrome"`

### RSS Feeds
**Potential Issue:** rss2json.com API Rate Limit
- [ ] Prüfe Console: "✅ RSS fetched" oder "❌ Failed"
- [ ] Falls Failed → Fallback zu Mock Data (OK)

---

## 📊 Performance Check

- [ ] Öffne DevTools → Network Tab
- [ ] Hard Reload (Ctrl+Shift+R)
- [ ] Check Bundle Sizes:
  - CleanLayout.js: ~46 kB gzip
  - vue-shared.js: ~70 kB gzip
  - Total: ~190 kB gzip

---

## ✅ Verification Summary

**Features Tested:** ___ / 7
**Issues Found:** ___
**All Working:** YES / NO

**Notes:**


---

**Next Steps:**
1. Fix any issues found
2. Continue Sprint 1 (Loading States, Empty States, Share Feature)
3. Deploy to GitHub Pages

