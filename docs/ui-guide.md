# UI Guide - News Plugin

## Design System

### Color Palette

**Primary Gradient**
```css
background: linear-gradient(135deg, #6366f1, #8b5cf6);
```

**Background**
```css
background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
```

**Text Colors**
- Primary: `#f8fafc`
- Secondary: `#cbd5e1`
- Muted: `#94a3b8`
- Accent: `#6366f1`

### Typography

**Font Sizes**
- Heading 1: `2rem` (32px)
- Heading 2: `1.5rem` (24px)
- Heading 3: `1.125rem` (18px)
- Body: `0.9375rem` (15px)
- Small: `0.875rem` (14px)
- Tiny: `0.75rem` (12px)

**Font Weights**
- Regular: 400
- Medium: 500
- Semibold: 600
- Bold: 700
- Extrabold: 800

## Responsive Breakpoints

### Desktop (`lg:` >= 1024px)
3-column layout:
- Left Sidebar (Settings): 25%
- Center Feed: 50%
- Right Sidebar (Users): 25%

### Tablet (`md:` >= 768px)
2-column layout:
- Left Sidebar + Feed visible
- Users as offcanvas drawer

### Mobile (`sm:` < 768px)
Single column:
- Stacked feed
- Bottom-sheet for users
- Hamburger menu

## Layout Structure

### CleanLayout.vue

Main responsive layout with:
- **Header**: Fixed top navigation
- **Main Content**: Scrollable feed area
- **Sidebars**: Drawer-based on mobile

```vue
<div class="clean-layout">
  <CleanHeader />
  <main class="main-content">
    <StatsBar />
    <LocationBar />
    <NewsGrid />
  </main>
  <UserSidebar /> <!-- Drawer on mobile -->
</div>
```

## Components

### Cards

**Glassmorphism Style**
```css
background: rgba(30, 41, 59, 0.4);
border: 1px solid rgba(255, 255, 255, 0.1);
border-radius: 0.75rem;
backdrop-filter: blur(10px);
```

**Hover Effect**
```css
.card:hover {
  transform: translateY(-2px);
  border-color: rgba(99, 102, 241, 0.5);
  box-shadow: 0 8px 20px rgba(99, 102, 241, 0.2);
}
```

### Badges

**Content Type**
```vue
<span class="content-type-badge">
  {{ getContentTypeLabel(contentType) }}
</span>
```

**Difficulty** (Color-coded)
- Beginner: Green (`#86efac`)
- Intermediate: Yellow (`#fde047`)
- Advanced: Red (`#fca5a5`)

### Modals

**Overlay**
```css
background: rgba(0, 0, 0, 0.8);
backdrop-filter: blur(4px);
```

**Content**
```css
max-width: 700px;
max-height: 90vh;
overflow-y: auto;
```

## Animations

### Transitions

**Default Duration**: 200ms

**Easing**
- Ease-out: General UI
- Ease-in-out: Modals, drawers

### Micro-animations

**Scale on Hover**
```css
transform: scale(1.02);
transition: transform 0.2s;
```

**Fade In**
```css
opacity: 0;
animation: fadeIn 0.3s forwards;

@keyframes fadeIn {
  to { opacity: 1; }
}
```

**Slide Sidebar**
```css
.slide-sidebar-enter-active,
.slide-sidebar-leave-active {
  transition: transform 0.3s ease-out;
}

.slide-sidebar-enter-from,
.slide-sidebar-leave-to {
  transform: translateX(100%);
}
```

**Skeleton Loading**
```css
@keyframes skeleton-loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

## Dark Mode

All components are **dark-mode first** with:
- Dark backgrounds
- Light text
- Semi-transparent overlays
- Glassmorphism effects

## Accessibility

### ARIA Labels
All interactive elements have proper ARIA attributes:
```vue
<button aria-label="Artikel schließen">×</button>
<div role="dialog" aria-modal="true">...</div>
```

### Keyboard Navigation
- Tab through interactive elements
- Escape closes modals
- Enter confirms actions

### Focus States
```css
.btn:focus-visible {
  outline: 2px solid #6366f1;
  outline-offset: 2px;
}
```

## Performance

### CLS Prevention
```css
.skeleton-card {
  /* Reserve space to prevent layout shift */
  min-height: 350px;
}
```

### Lazy Loading
Images use `IntersectionObserver` with 50px root margin

### Virtual Scrolling
For lists > 100 items (future enhancement)

## Mobile Optimization

### Touch Targets
Minimum 44x44px for all interactive elements

### Viewport
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

### Safe Areas
```css
padding-bottom: env(safe-area-inset-bottom);
```
