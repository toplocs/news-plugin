# 🧪 Phase B - Comprehensive Testing Plan

**Datum:** 2025-10-08
**Version:** 2.2
**Test-URL:** http://localhost:5174/

---

## Test-Protokoll

### ✅ Phase A: Setup
- [ ] TypeScript Check: OK/FEHLER
- [ ] Git Commit: ERSTELLT
- [ ] Dev Server läuft: http://localhost:5174/

---

## 🏷️ Test 1: Interessen Tab

### Setup
1. Öffne http://localhost:5174/
2. Linke Sidebar → Interessen Tab (sollte aktiv sein beim Start)

### Test Cases

#### TC1.1: Initial Survey
- [ ] Initial Survey wird angezeigt (wenn keine Interessen)
- [ ] 3 Interessen auswählbar
- [ ] "Fertig" Button funktioniert
- [ ] Interessen werden gespeichert
- [ ] Badge zeigt "3"

#### TC1.2: Interessen hinzufügen
- [ ] "+" Button öffnet Input-Feld
- [ ] Neues Interesse eingeben (z.B. "Kunst")
- [ ] Enter oder Bestätigen
- [ ] Interesse erscheint in Liste
- [ ] Badge zeigt neue Anzahl

#### TC1.3: Interessen entfernen
- [ ] "×" Button auf Interesse-Tag klicken
- [ ] Interesse wird entfernt
- [ ] Badge aktualisiert sich
- [ ] Feed aktualisiert sich (weniger Artikel)

#### TC1.4: Filter-Wirkung
- [ ] Console Log zeigt: "📊 Interest Filter: X/Y Artikel matchen..."
- [ ] Nur relevante Artikel im Feed
- [ ] Änderung von Interessen = Feed Update

**Status:** ⬜ NICHT GETESTET | ✅ OK | ❌ FEHLER

---

## 🔖 Test 2: Bookmarks Tab

### Setup
1. Zurück zum Feed (Center Column)
2. Hover über Artikel-Karte

### Test Cases

#### TC2.1: Artikel bookmarken
- [ ] Bookmark Icon (Stern) sichtbar beim Hover
- [ ] Click auf Icon
- [ ] Toast erscheint: "Artikel gespeichert"
- [ ] Icon wird gold/gefüllt

#### TC2.2: Bookmarks Tab öffnen
- [ ] Linke Sidebar → Bookmarks Tab
- [ ] Badge zeigt Anzahl (z.B. "1")
- [ ] Gespeicherter Artikel wird angezeigt
- [ ] Titel + Source + Zeit sichtbar

#### TC2.3: Artikel aus Bookmarks öffnen
- [ ] Click auf Bookmark-Artikel
- [ ] Article Modal öffnet sich
- [ ] Richtiger Artikel wird angezeigt
- [ ] Modal schließen funktioniert

#### TC2.4: Bookmark entfernen
- [ ] 🗑️ Button sichtbar
- [ ] Click auf 🗑️
- [ ] Artikel verschwindet aus Liste
- [ ] Badge aktualisiert (z.B. "1" → "0")
- [ ] Empty State erscheint wenn leer

#### TC2.5: Persistence Test
- [ ] Browser Reload (F5)
- [ ] Bookmarks noch vorhanden
- [ ] Badge korrekt

**Status:** ⬜ NICHT GETESTET | ✅ OK | ❌ FEHLER

---

## ⚙️ Test 3: Settings Tab

### Setup
1. Linke Sidebar → Settings Tab

### Test Cases

#### TC3.1: Radius Einstellung
- [ ] Slider/Input für Radius sichtbar
- [ ] Wert ändern (z.B. 5km → 25km)
- [ ] Wert wird gespeichert
- [ ] Feed aktualisiert (mehr/weniger Artikel je nach Radius)
- [ ] Console Log: "📍 Location Filter: X → Y Artikel innerhalb 25km"

#### TC3.2: Profil bearbeiten Button
- [ ] "👤 Profil bearbeiten" Button sichtbar
- [ ] Button ist NICHT redundant (nicht 2x vorhanden)
- [ ] Click öffnet Profile Editor
- [ ] Profile Editor zeigt bestehende Daten

#### TC3.3: Profile Save & Load
- [ ] Name eingeben
- [ ] Username eingeben
- [ ] Bio eingeben
- [ ] Interessen auswählen
- [ ] "Speichern" Button
- [ ] Toast: "Profil gespeichert"
- [ ] Editor schließen
- [ ] Editor erneut öffnen
- [ ] Daten sind geladen ✅

**Status:** ⬜ NICHT GETESTET | ✅ OK | ❌ FEHLER

---

## ✨ Test 4: Community/Discovery Tab

### Setup
1. Linke Sidebar → Community Tab

### Test Cases

#### TC4.1: Discovery Panel
- [ ] Discovery Panel wird angezeigt
- [ ] User mit ähnlichen Interessen werden gezeigt
- [ ] "Aktualisieren" Button funktioniert

#### TC4.2: User Profile öffnen
- [ ] Click auf User-Card
- [ ] User Profile Modal öffnet
- [ ] Profil-Daten werden angezeigt
- [ ] "Chat" Button sichtbar

#### TC4.3: Chat starten
- [ ] Click auf "Chat" Button
- [ ] Chat Modal öffnet
- [ ] Nachricht eingeben
- [ ] Enter oder Send
- [ ] Nachricht erscheint

#### TC4.4: Chat History
- [ ] Chat schließen
- [ ] Chat erneut öffnen (gleicher User)
- [ ] Nachrichten sind noch da
- [ ] History wurde geladen (Console Log)

**Status:** ⬜ NICHT GETESTET | ✅ OK | ❌ FEHLER

---

## 📊 Phase C: Performance Checks

### Console Check
- [ ] Keine roten Errors in Console
- [ ] Keine kritischen Warnings
- [ ] Gun.js Verbindungen OK (oder localStorage-only)

### Performance Metrics
- [ ] Lighthouse Score abrufen
- [ ] Performance Score: ___/100
- [ ] Accessibility Score: ___/100
- [ ] Best Practices: ___/100

### Bundle Size
- [ ] `pnpm build` ausführen
- [ ] Bundle Size: ___ kB
- [ ] Target: < 350 kB gzip

**Status:** ⬜ NICHT GETESTET | ✅ OK | ❌ FEHLER

---

## 🚀 Phase D: Deployment

### Build Test
- [ ] `pnpm build` erfolgreich
- [ ] Keine Build-Errors
- [ ] Dist-Dateien generiert
- [ ] plugin.js vorhanden

### Git Deployment
- [ ] Git add + commit
- [ ] Git push
- [ ] GitHub Actions erfolgreich
- [ ] GitHub Pages Live

**Status:** ⬜ NICHT GETESTET | ✅ OK | ❌ FEHLER

---

## 📝 Notizen

### Gefundene Bugs:


### Verbesserungs-Ideen:


### Nächste Schritte:


---

**Tester:** Claude
**Browser:** Firefox/Chrome
**OS:** Linux
