# 📋 Implementation Plan

## Phase 3: Gamification & Engagement

**Letzter Update:** 2025-01-15

---

## ✅ Abgeschlossene Features

### 1. Points & Levels System ✅
- useRewards.ts (322 lines)
- 7 Aktionstypen mit Punktevergabe
- 5 Level-Stufen
- LocalStorage Persistenz
- **Status:** IMPLEMENTIERT & GETESTET

### 2. Achievement System ✅
- 6 Achievements
- Unlock-Bedingungen
- Confetti bei Unlock
- Achievement-Modal
- **Status:** IMPLEMENTIERT & GETESTET

### 3. Confetti Effect ✅
- ConfettiEffect.vue (107 lines)
- 50 bunte Partikel
- 3s Animation
- Event-getriggert
- **Status:** IMPLEMENTIERT & GETESTET

### 4. Events Demo ✅
- EventsDemo.vue (246 lines)
- 3 Demo-Events
- RSVP Buttons
- Countdown Timer
- +20 Punkte pro RSVP
- **Status:** IMPLEMENTIERT & GETESTET

### 5. Activity Feed Demo ✅
- ActivityFeedDemo.vue (355 lines)
- Live Updates (3-5 Sek)
- Social Proof
- 10 Aktionstypen
- **Status:** IMPLEMENTIERT & GETESTET (100%)

---

## 🚧 In Arbeit / Fehler gefunden

### 6. Chat Modal ⚠️
- **Problem:** Input-Feld nicht gefunden in Tests
- **Status:** FIXES_NEEDED
- **Datei:** src/components/ChatModal.vue
- **Test:** tests/e2e/test-3-chat-rewards.spec.ts
- **Lösung:** Input-Feld Selector prüfen

### 7. Voting Demo ⚠️
- **Problem:** Keine +5 Punkte bei Vote
- **Status:** FIXES_NEEDED
- **Datei:** src/components/demos/VotingDemo.vue
- **Erwartung:** +5 Punkte bei jeder Abstimmung
- **Lösung:** rewards.awardPoints('vote_cast') hinzufügen

### 8. Onboarding Demo ⚠️
- **Problem:** "Erledigen" Button nicht gefunden
- **Status:** FIXES_NEEDED
- **Datei:** src/components/demos/OnboardingDemo.vue
- **Lösung:** Button Markup prüfen

### 9. FOMO Countdown ⚠️
- **Problem:** Timer zählt nicht runter
- **Status:** FIXES_NEEDED
- **Datei:** src/components/demos/FOMODemo.vue
- **Erwartung:** Timer update jede Sekunde
- **Lösung:** setInterval für countdown implementieren

### 10. FOMO Limited Spots ⚠️
- **Problem:** Spots erhöhen sich nicht (bleibt 0/6)
- **Status:** FIXES_NEEDED
- **Datei:** src/components/demos/FOMODemo.vue
- **Erwartung:** Spots +1 alle 5-6 Sekunden
- **Lösung:** setInterval für spots auto-increment

---

## 📝 Nächste Todo-Liste (Claude 1)

### Todo 1: Voting Rewards implementieren
**Datei:** `src/components/demos/VotingDemo.vue`
**Was:**
```typescript
// In der vote() Methode nach Vote-Registrierung:
import { useRewards } from '../../stores/useRewards'
const rewards = useRewards()

// Nach erfolgreichem Vote:
rewards.awardPoints('vote_cast') // +5 Punkte
```

### Todo 2: FOMO Countdown Timer
**Datei:** `src/components/demos/FOMODemo.vue`
**Was:**
```typescript
// countdown Timer hinzufügen:
const countdown = ref({ hours: 23, minutes: 45, seconds: 30 })

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
```

### Todo 3: Limited Spots Auto-Increment
**Datei:** `src/components/demos/FOMODemo.vue`
**Was:**
```typescript
// spots auto-increment alle 5-6 Sekunden:
const spots = ref({ current: 42, total: 50 })

setInterval(() => {
  if (spots.value.current < spots.value.total) {
    spots.value.current++
  }
}, 5000)
```

### Todo 4: Onboarding Button Markup prüfen
**Datei:** `src/components/demos/OnboardingDemo.vue`
**Was:**
- Sicherstellen dass "Erledigen" Button Text enthält: `hasText: /erledigen|complete|done|✓/i`
- Oder Button mit eindeutigem Selector versehen

### Todo 5: Chat Input-Feld prüfen
**Datei:** `src/components/ChatModal.vue`
**Was:**
- Input-Feld sollte `input[type="text"]` oder `textarea` sein
- Oder `placeholder` Attribut haben
- Selector für Tests: `chatModal.locator('input, textarea').first()`

---

## 🎯 Priorität

1. **Hoch:** Voting Rewards (einfach, schnell)
2. **Hoch:** FOMO Timer (wichtig für FOMO-Tests)
3. **Mittel:** Limited Spots (nice-to-have)
4. **Niedrig:** Onboarding/Chat (Tests können angepasst werden)

---

## 📊 Aktueller Fortschritt

**Implementiert:** 5/10 Features (50%)
**Tests bestanden:** 14/24 Tests (58%)
**Nächstes Ziel:** 20/24 Tests (83%)

**Letzte Änderung:** 2025-01-15 15:00
**Nächster Check:** Nach Implementation von Todo 1-3
