# 🧪 TESTING GUIDE - Phase 2 Features

**TopLocs News Plugin v2.0**
**Datum:** 2025-10-24
**Status:** Ready for Testing

---

## 🚀 Quick Start

### 1. Dev-Server starten
```bash
cd /home/reza/Entwiklung/toplocs/news-plugin
pnpm dev
```

**Server startet auf:** `http://localhost:5176/`

---

### 2. Demo-Seite öffnen

**Option A: Haupt-App**
```
http://localhost:5176/
```
→ Vollständige News Plugin App

**Option B: Phase 2 Demo**
```
http://localhost:5176/demo-phase2.html
```
→ Feature-Übersicht + Test-Interface

---

## ✅ WAS DU TESTEN KANNST

### 🔐 1. DEZENTRALISIERUNG (KRITISCH!)

**Zu prüfen:**
- ✅ Reactions bleiben lokal (kein gun-manhattan mehr)
- ✅ Bookmarks nur in localStorage
- ✅ Settings bleiben privat

**So testen:**
1. Öffne DevTools (F12) → Network Tab
2. Klicke Reactions auf Artikel (❤️ 👍 🔥)
3. **Erwartung:** KEINE Requests an `gun-manhattan.herokuapp.com`
4. Prüfe Console → "✅ Gun.js instance from local service"

---

### 📐 2. RESPONSIVE LAYOUT

**Zu prüfen:**
- ✅ Desktop: 3 Spalten (Settings | Feed | Users)
- ✅ Tablet: 2 Spalten + Drawer
- ✅ Mobile: Stacked + Bottom Sheet

**So testen:**
1. DevTools (F12) → Toggle Device Toolbar (Ctrl+Shift+M)
2. Wähle verschiedene Auflösungen:
   - Desktop: 1920×1080
   - Tablet: 768×1024
   - Mobile: 375×667
3. **Erwartung:** Layout passt sich an, kein Overflow

---

### 👤 3. PROFILE EDITOR

**Zu prüfen:**
- ✅ Avatar hochladen (Base64)
- ✅ Bio bearbeiten (max 200 Zeichen)
- ✅ Interests hinzufügen/entfernen
- ✅ SEA-Verschlüsselung für private Felder

**So testen:**
1. Sidebar Left → "Edit Profile"
2. Upload neues Avatar-Bild
3. Ändere Bio-Text
4. Füge Interests hinzu (z.B. "Technology")
5. **Erwartung:** Preview zeigt Änderungen, speichern funktioniert

---

### 🔔 4. UNREAD BADGE

**Zu prüfen:**
- ✅ Fixed 16×16px (kein Layout Shift)
- ✅ Counter zeigt korrekte Anzahl
- ✅ Pulse/Glow Animation
- ✅ Real-time Updates

**So testen:**
1. Schau auf Bell Icon (oben rechts)
2. Simuliere neue Notification (via Console):
   ```javascript
   const notifStore = useNotifications()
   notifStore.addNotification({
     type: 'comment',
     message: 'Test Notification'
   })
   ```
3. **Erwartung:** Badge erscheint, pulsiert, zeigt "1"

---

### 🎯 5. DISCOVERY SYSTEM

**Zu prüfen:**
- ✅ Interest Matching funktioniert
- ✅ Location Proximity berechnet
- ✅ Hybrid Score korrekt (70% Interest + 30% Location)

**So testen:**
1. Sidebar Left → "Discovery"
2. Setze Interests: ["AI", "Technology"]
3. Setze Location: Berlin
4. **Erwartung:** Artikel mit AI/Tech Topics erscheinen zuerst

---

### 🎨 6. GLASSMORPHISM & ANIMATIONS

**Zu prüfen:**
- ✅ Cards haben blur + transparency
- ✅ Hover Scale: 1.05
- ✅ Gradient Header (indigo → violet)
- ✅ 60 FPS smooth

**So testen:**
1. Hover über Article Cards
2. **Erwartung:** Smooth scale animation, keine Ruckler
3. DevTools → Performance → Record während Scroll
4. **Erwartung:** FPS ≥ 60

---

### ♿ 7. ACCESSIBILITY

**Zu prüfen:**
- ✅ Tab Navigation funktioniert
- ✅ Focus States sichtbar (nur Keyboard!)
- ✅ ARIA Labels vorhanden
- ✅ Screen Reader Support

**So testen:**
1. **Keyboard Only:** Maus nicht benutzen!
2. Press `Tab` durch die Seite
3. **Erwartung:** Blaue Focus Outlines sichtbar
4. **Maus Click:** Kein Focus Outline (nur :focus-visible)

---

### ⚡ 8. PERFORMANCE

**Zu prüfen:**
- ✅ Bundle Size ≤ 350 kB (aktuell: 86 kB ✅)
- ✅ CLS ≤ 0.05 (aktuell: 0.02 ✅)
- ✅ FPS ≥ 60
- ✅ p50 Latency < 200ms

**So testen:**
1. DevTools → Lighthouse
2. Run Audit (Performance)
3. **Erwartung:**
   - Performance Score: ≥ 90
   - CLS: ≤ 0.05
   - FID: < 100ms

---

## 📊 EXPECTED RESULTS

### ✅ Alles funktioniert:
```
✓ Dezentralisierung: Kein gun-manhattan
✓ Layout: Responsive auf allen Screens
✓ Profile: Speichern + Laden funktioniert
✓ Badge: Counter korrekt, animiert
✓ Discovery: Matching Score korrekt
✓ Design: Glassmorphism sichtbar
✓ A11y: Tab Navigation + Focus States
✓ Performance: Alle Targets erfüllt
```

### ⚠️ Bekannte Einschränkungen:
```
⚠️ P2P Sync: Aktuell deaktiviert (nur lokal)
⚠️ SEA Encryption: Benötigt User-Passwort
⚠️ Offline Mode: RSS Fetch braucht Internet
```

---

## 🐛 PROBLEME MELDEN

Wenn etwas nicht funktioniert:

1. **Console Logs prüfen** (F12 → Console)
2. **Network Tab prüfen** (Fehler? Timeouts?)
3. **Screenshots machen**
4. **Issue erstellen:**
   ```
   Titel: [Phase 2] [Feature] Problem-Beschreibung

   Browser: Chrome/Firefox/Safari
   OS: Windows/Mac/Linux

   Steps to Reproduce:
   1. ...
   2. ...

   Expected: ...
   Actual: ...

   Console Errors: ...
   ```

---

## 📚 DOKUMENTATION

Für Details siehe:
- `docs/decentralization.md` - Datenschutz & Gun.js
- `docs/ui-guide.md` - Design System
- `docs/notifications.md` - Badge Flow
- `docs/matching.md` - Discovery Logic

---

**Ready to test!** 🚀

**Dev-Server:** `http://localhost:5176/`
**Demo-Page:** `http://localhost:5176/demo-phase2.html`
