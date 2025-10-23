# 🎨 UI Guide - TopLocs News Plugin Design System

**Version:** 2.0  
**Last Updated:** 2025-10-24  
**Status:** Production Ready

---

## 📐 Layout Structure - 3-Column Responsive Grid

### Desktop (lg: ≥1024px): 25% | 50% | 25%
### Tablet (md: 768-1024px): 25% | 75% + Drawer
### Mobile (sm: <768px): 100% Stacked + Bottom Sheet

---

## 🎨 Design System

### Colors
- Gradient Header: `indigo-600 → violet-600`
- Primary: `from-indigo-600 via-purple-600 to-pink-500`
- Text: `slate-100` (primary), `slate-400` (secondary)
- Background: `slate-900` (main), `slate-800` (cards)

### Glassmorphism
```css
background: rgba(30, 41, 59, 0.7);
backdrop-filter: blur(10px);
border: 1px solid rgba(148, 163, 184, 0.1);
box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
```

### Animations (60 FPS)
- Fade In: 300ms ease-in-out
- Slide In: 300ms ease-out
- Pulse: 2s infinite
- Hover Scale: transform scale(1.05) 200ms

---

## ♿ Accessibility
- `:focus-visible` for keyboard navigation
- ARIA labels on all interactive elements
- 2px outline + 4px glow on focus
- Tab order: Header → Search → Feed → Sidebar

---

## ⚡ Performance Targets
- Bundle: ≤ 350 kB gz
- p50 Latency: < 200 ms
- CLS: ≤ 0.05
- FPS: ≥ 60

