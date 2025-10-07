# 📰 News Plugin Design System

## 🎯 Vision
**TopLocs News** = Lokale Nachrichten + Community Connection

Das Design muss sofort zeigen:
- 📍 **Lokaler Bezug** - Du bist hier, das passiert in deiner Nähe
- 👥 **Community** - Echte Menschen, echte Stories
- 📰 **Nachrichten** - Zeitungs-Feeling, aber modern

---

## 🎨 Color Palette

### Primary Colors (TopLocs Brand)
```css
--tl-primary: #6366f1;      /* Indigo - Hauptfarbe */
--tl-primary-dark: #4f46e5; /* Darker Indigo */
--tl-secondary: #8b5cf6;    /* Purple - Akzent */
--tl-accent: #ec4899;       /* Pink - Highlights */
```

### News-Specific Colors
```css
--news-warm: #f59e0b;       /* Amber - Breaking News */
--news-local: #10b981;      /* Green - Local News */
--news-community: #3b82f6;  /* Blue - Community */
--news-urgent: #ef4444;     /* Red - Urgent */
```

### Background & Surface
```css
--bg-primary: #0f172a;      /* Slate 900 */
--bg-secondary: #1e293b;    /* Slate 800 */
--surface: #334155;         /* Slate 700 */
--surface-glass: rgba(51, 65, 85, 0.7);
```

---

## 🔤 Typography

### Font Stack
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

### Headlines (News-Style)
```css
.news-headline {
  font-weight: 800;
  font-size: clamp(1.5rem, 4vw, 2.5rem);
  line-height: 1.2;
  letter-spacing: -0.02em;
}
```

### Body Text
```css
.news-body {
  font-weight: 400;
  font-size: 1rem;
  line-height: 1.6;
  color: #cbd5e1; /* Slate 300 */
}
```

---

## 🧱 Components

### 1. News Card
**Konzept:** Zeitungs-Artikel trifft moderne Card

```
┌─────────────────────────────────┐
│ [Image with Location Pin]      │
│                                 │
│ 📍 Berlin Mitte · 2h ago       │
│                                 │
│ ████ Headline in Bold ████     │
│ Summary text with preview...   │
│                                 │
│ 👤 Author  |  🏷️ #local #tech  │
└─────────────────────────────────┘
```

**Features:**
- Location Badge prominent
- Zeit-Anzeige für Aktualität
- Hover: Lift-Effekt + Glow
- Click: Smooth Modal Transition

### 2. Location Header
**Konzept:** Zeigt SOFORT wo du bist

```
┌───────────────────────────────────────┐
│  🗺️  Berlin Mitte                     │
│  ━━━ 10km Radius · 45 News heute     │
│                                       │
│  [────────●─────] Radius Slider       │
└───────────────────────────────────────┘
```

### 3. News Feed Layout
**Konzept:** Zeitungs-Grid mit Priorität

```
┌─────────────────────────────────────────┐
│ 📰 BREAKING (wenn vorhanden)            │
│ ════════════════════════════════════    │
├─────────────┬───────────────────────────┤
│ TOP STORY   │  LATEST NEWS              │
│ (groß)      │  [Small Card]             │
│             │  [Small Card]             │
│             │  [Small Card]             │
└─────────────┴───────────────────────────┘
```

---

## 🎭 UI Patterns

### Glassmorphism (TopLocs Signature)
```css
.glass-card {
  background: rgba(30, 41, 59, 0.7);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}
```

### Gradient Accents
```css
.gradient-primary {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%);
}

.gradient-news {
  background: linear-gradient(to right, #f59e0b, #ef4444);
}
```

### Location Pin Style
```css
.location-badge {
  background: linear-gradient(135deg, #10b981, #3b82f6);
  border-radius: 999px;
  padding: 0.25rem 0.75rem;
  font-size: 0.875rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}
```

---

## 🎬 Animations

### Card Hover
```css
.news-card:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 12px 40px rgba(99, 102, 241, 0.3);
}
```

### Breaking News Pulse
```css
@keyframes urgent-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
  50% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
}
```

### Location Pin Drop
```css
@keyframes pin-drop {
  0% { transform: translateY(-100px) scale(0); }
  60% { transform: translateY(10px) scale(1.1); }
  100% { transform: translateY(0) scale(1); }
}
```

---

## 📐 Layout Grid

### Desktop (1200px+)
```
┌──────────┬────────────────────┬───────────┐
│ Filters  │   Main Feed        │ Community │
│ (20%)    │   (50%)            │ (30%)     │
│          │                    │           │
│ Location │   News Cards       │ Trending  │
│ Sources  │   Grid/List        │ Authors   │
│ Topics   │                    │ Map       │
└──────────┴────────────────────┴───────────┘
```

### Tablet (768px-1199px)
```
┌──────────┬────────────────────┐
│ Filters  │   Main Feed        │
│ (30%)    │   (70%)            │
│          │                    │
└──────────┴────────────────────┘
[Map als Overlay/Sheet]
```

### Mobile (<768px)
```
┌─────────────────────────────┐
│  Location Bar (fixed top)   │
├─────────────────────────────┤
│                             │
│     News Feed               │
│     (Full Width)            │
│                             │
└─────────────────────────────┘
│  [Tabs: Feed|Filter|Map]    │
└─────────────────────────────┘
```

---

## 🎯 Key Visual Elements

### 1. **Location Context** (IMMER sichtbar)
- Pin Icon mit Ortsnamen
- Radius-Indikator
- Anzahl verfügbarer News

### 2. **Time Indicators** (Aktualität)
- "2h ago" → Normal
- "Breaking" → Red Badge
- "Just now" → Green Pulse

### 3. **Community Elements**
- Avatar circles
- "12 people reading"
- Author credits prominent

### 4. **Category Badges**
```
🏠 Local     🎭 Culture    💼 Business
🏃 Sports    🎓 Education  🌱 Environment
```

---

## ✅ Design Checklist

Jede Komponente muss:
- [ ] Location-Context zeigen
- [ ] TopLocs Brand Colors nutzen
- [ ] Glassmorphism Style haben
- [ ] Hover States haben
- [ ] Mobile-responsive sein
- [ ] Smooth Transitions haben
- [ ] Sofort verständlich sein

---

## 🚀 Implementation Priority

1. **Location Header** - Zeigt WO du bist
2. **News Card** - Core Component
3. **Feed Layout** - Zeitungs-Grid
4. **Mini Map** - Visualisiert Nähe
5. **Community Sidebar** - Wer liest mit?

Dieses Design macht das Plugin **sofort verständlich** und **beautiful to use**! 🎨
