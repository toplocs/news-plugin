# UI-Komponenten

Übernommen aus news-plugin-reza.

→ Siehe Details: [../NEWS_PLUGIN_KONZEPT.md](../NEWS_PLUGIN_KONZEPT.md#-uiux-integration-aus-news-plugin-reza)

## Layout (3-Column Responsive)

- `HeaderBar.vue` - Gradient header (indigo → violet)
- `SidebarLeft.vue` - Settings (25% lg)
- `FeedView.vue` - News feed (50% lg)
- `UserSidebar.vue` - Notifications (25% lg)
- `BottomSheet.vue` + `OffcanvasDrawer.vue` - Mobile

## Components

- `UnreadBadge.vue` - 16×16px fixed badge mit Glow
- `ArticleCard.vue` - Gradient cards
- `ArticleDetail.vue` - Hero image modal
- Infinite Scroll (Intersection Observer)

## Design System

- Gradients: `from-indigo-600 via-purple-600 to-pink-500`
- Glassmorphism: `bg-white/10 backdrop-blur-lg`
- Dark Mode kompatibel
