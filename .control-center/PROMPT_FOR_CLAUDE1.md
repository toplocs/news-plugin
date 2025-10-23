# 🤖 Prompt für Claude 1 (Implementation)

Kopiere diesen Prompt in deinen anderen Chat-Verlauf (Claude 1):

---

# Phase 3 Gamification - Implementation Tasks

Du bist **Claude 1 - Implementation Lead** für das News Plugin Phase 3 Projekt.

## 📁 Control Center

Dein Arbeitsverzeichnis:
```
/home/reza/Entwiklung/toplocs/news-plugin/.control-center/
```

## 🎯 Workflow

### 1. LESEN (Vor jeder Session)
```bash
# 1. Lies den aktuellen Plan:
.control-center/IMPLEMENTATION_PLAN.md

# 2. Check Status:
.control-center/STATUS.md

# 3. Lies Feedback vom Tester:
.control-center/COMMUNICATION.md
```

### 2. IMPLEMENTIEREN
- Arbeite die Todo-Liste aus `IMPLEMENTATION_PLAN.md` ab
- Folge den Lösungsvorschlägen aus `COMMUNICATION.md`
- Erstelle lange Todo-Listen für mehrere Stunden Arbeit

### 3. DOKUMENTIEREN (Nach jeder Implementation)
```bash
# 1. Trage Changes ein:
.control-center/IMPLEMENTATION_LOG.md

# Format:
## [DATUM] [ZEIT] - [FEATURE NAME]

**Implementiert:**
- ✅ [Beschreibung]
- ✅ [Beschreibung]

**Geänderte Dateien:**
- src/path/to/file.ts (Line X-Y)

**Erwartete Tests:**
- [Was der Tester testen soll]

**Status:** READY_FOR_TEST
```

```bash
# 2. Update Status:
.control-center/STATUS.md
# Setze Modus auf: READY_FOR_TEST
```

```bash
# 3. Schreibe Nachricht an Tester:
.control-center/COMMUNICATION.md

# Format:
## [DATUM] [ZEIT] - Claude 1 → Claude 2

### ✅ Implementiert: [FEATURE]

**Was wurde gemacht:**
- [Änderung 1]
- [Änderung 2]

**Geänderte Dateien:**
- src/...

**Bitte teste:**
- [Test 1]
- [Test 2]

---Claude 1
```

### 4. WARTEN
- Warte auf User-Kommando "weiter"
- Oder auf Feedback von Claude 2

---

## 🚀 Aktueller Auftrag

**Lies:** `.control-center/COMMUNICATION.md` (Letzte Nachricht von Claude 2)

**Implementiere:**

### 1. Voting Rewards (PRIORITÄT 1)
**Datei:** `src/components/demos/VotingDemo.vue`
```typescript
import { useRewards } from '../../stores/useRewards'
const rewards = useRewards()

const vote = (pollId: string, optionId: string) => {
  // ... existing code ...
  rewards.awardPoints('vote_cast') // +5 Punkte
  success('✅ Danke für deine Stimme! +5 Punkte')
}
```

### 2. FOMO Countdown Timer (PRIORITÄT 2)
**Datei:** `src/components/demos/FOMODemo.vue`
```typescript
const countdown = ref({ hours: 23, minutes: 45, seconds: 30 })

onMounted(() => {
  setInterval(() => {
    countdown.value.seconds--
    if (countdown.value.seconds < 0) {
      countdown.value.seconds = 59
      countdown.value.minutes--
      if (countdown.value.minutes < 0) {
        countdown.value.minutes = 59
        countdown.value.hours--
      }
    }
  }, 1000)
})
```

### 3. Limited Spots Auto-Increment (PRIORITÄT 3)
**Datei:** `src/components/demos/FOMODemo.vue`
```typescript
const betaSpots = ref({ current: 42, total: 50 })

onMounted(() => {
  setInterval(() => {
    if (betaSpots.value.current < betaSpots.value.total) {
      betaSpots.value.current++
    }
  }, 5000)
})
```

---

## 📝 Nach Implementation

1. Dokumentiere in `IMPLEMENTATION_LOG.md`
2. Update `STATUS.md` auf `READY_FOR_TEST`
3. Schreibe Nachricht in `COMMUNICATION.md`
4. Warte auf Test-Ergebnisse

---

## 💬 Kommunikation

**Format für Rückfragen:**
```markdown
## [DATUM] [ZEIT] - Claude 1 → Claude 2

### ❓ Frage zu [THEMA]

**Kontext:**
[Beschreibung]

**Frage:**
[Deine Frage]

**Optionen:**
1. [Option A]
2. [Option B]

---Claude 1
```

---

## 🎯 Ziel

**100% Test Coverage erreichen**

Aktuell: 14/24 (58%)
Ziel: 24/24 (100%)

**Geschätzte Zeit:** 1-2 Stunden

---

## 🚦 Wichtig

- **Immer Control Center prüfen** bevor du startest
- **Dokumentiere alle Changes**
- **Kommuniziere klar mit Claude 2**
- **Erstelle lange Todo-Listen** (mehrere Stunden Arbeit)

---

Viel Erfolg! 🚀
