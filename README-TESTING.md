# 🧪 Testing Guide - News Plugin

**Quick Start für Tests**

---

## 📍 WICHTIG: Control Center

**Alle aktuellen Test-Ergebnisse und Status:**
→ **[`CONTROL-CENTER.md`](./CONTROL-CENTER.md)** ← **HIER SCHAUEN!**

---

## 🚀 Quick Commands

```bash
# Dev-Server starten
pnpm dev
# → http://localhost:5173/demo-phase3.html

# Unit-Tests ausführen
pnpm test run

# E2E-Tests ausführen
pnpm test:e2e

# Port-Mismatch beheben (ZUERST!)
./fix-port-mismatch.sh
```

---

## 📁 Datei-Struktur

```
news-plugin/
├── CONTROL-CENTER.md           ← 🎯 MAIN: Alle Test-Status & Blocker
├── README-TESTING.md           ← 📖 DU BIST HIER
├── fix-port-mismatch.sh        ← 🔧 Quick Fix für Port-Problem
│
├── docs/
│   └── PHASE-3-TEST-GUIDE.md   ← 📝 Test-Anleitung (manuell)
│
├── tests/
│   ├── unit/                   ← ⚠️ 87% Pass Rate
│   └── e2e/                    ← ❌ Port-Mismatch (Blocker)
│       ├── test-1-punkte-system.spec.ts
│       ├── test-2-level-up-confetti.spec.ts
│       └── ... (12 Phase 3 Tests)
│
└── testing-archive/            ← 📦 Alte Test-Dateien (archiviert)
```

---

## ⚡ Aktuelle Blocker

1. **Port-Mismatch** (BLOCKER)
   - Tests erwarten Port 5175, Server läuft auf 5173
   - **Fix:** `./fix-port-mismatch.sh`

2. **Achievement-Definitionen** (BLOCKER)
   - Test Guide dokumentiert andere Achievements als im Code
   - **Fix:** Test Guide aktualisieren oder Code anpassen

Details siehe: [`CONTROL-CENTER.md`](./CONTROL-CENTER.md)

---

## 📊 Aktueller Status

```
✅ Code-Implementierung:  100%
⚠️ Unit-Tests:            87%
❌ E2E-Tests:             0% (Port-Mismatch)
❌ Dokumentation:         60% (Veraltet)
```

---

**Für Details siehe:** [`CONTROL-CENTER.md`](./CONTROL-CENTER.md)
