# 📰 TopLocs News Plugin

A local news discovery and community journalism plugin for the TopLocs platform. Brings location-based news aggregation, semantic search, and community publishing to your TopLocs spheres.

---

## 🎮 **TESTING & QA**

**📊 Current Test Status:** ⚠️ 2 Blockers found
**🎯 Control Center:** [`CONTROL-CENTER.md`](./CONTROL-CENTER.md) ← **All test results here!**
**📖 Testing Guide:** [`README-TESTING.md`](./README-TESTING.md)

**Quick Fix:** `./fix-port-mismatch.sh` (Port 5175 → 5173)

---

## ✨ Features

- **📍 Location-Based News** - Discover news relevant to your location with radius-based filtering
- **🔍 Semantic Search** - AI-powered search that understands context and meaning
- **🗞️ Multi-Source Aggregation** - Aggregate news from RSS feeds, APIs, and community sources
- **🔄 P2P Sync** - Real-time synchronization using Gun.js
- **🎯 Interest Matching** - Get news tailored to your interests and community topics
- **✍️ Community Publishing** - Members can publish local news stories

## 🚀 Quick Start

### Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

### Installation in TopLocs

Add the plugin to your TopLocs configuration:

```javascript
{
  id: 'news_plugin',
  name: 'News',
  url: 'https://toplocs.github.io/news-plugin/plugin.js',
  version: '1.0.0'
}
```

## 📦 Plugin Structure

```
news-plugin/
├── src/
│   ├── components/       # Vue components
│   ├── views/
│   │   ├── info/        # Info sidebar view
│   │   └── settings/    # Settings content view
│   ├── services/        # Gun.js and API services
│   ├── stores/          # Pinia stores (future)
│   ├── types/           # TypeScript definitions
│   ├── index.ts         # Plugin configuration
│   ├── info.ts          # Landing page entry
│   └── InfoPage.vue     # Plugin info page
├── docs/                # Comprehensive documentation
├── dist/                # Build output (auto-generated)
└── public/              # Static assets
```

## 📚 Documentation

Comprehensive documentation is available in the `docs/` folder:

- [Architecture](./docs/ARCHITECTURE.md) - Technical design and system architecture
- [Features](./docs/FEATURES.md) - Detailed feature specifications
- [Gun.js Schema](./docs/GUN_SCHEMA.md) - Data structures and Gun.js integration
- [API Reference](./docs/API_REFERENCE.md) - Complete API documentation
- [Integration Guide](./docs/INTEGRATION.md) - How to integrate with TopLocs
- [UI Components](./docs/UI_COMPONENTS.md) - Component library and design system
- [Scraper Service](./docs/SCRAPER_SERVICE.md) - News aggregation service
- [Auto-Promote System](./docs/AUTO_PROMOTE.md) - Community promotion features
- [Roadmap](./docs/ROADMAP.md) - Development roadmap

## 🏗️ Tech Stack

- **Framework**: Vue 3 + TypeScript
- **Build Tool**: Vite + Module Federation
- **P2P Database**: Gun.js
- **Styling**: Tailwind CSS
- **Testing**: Vitest
- **Deployment**: GitHub Pages

## 🔌 Plugin Slots

The News Plugin integrates with TopLocs through the following slots:

- **Topic → Info → Sidebar**: Displays recent news for the topic
- **Topic → Settings → Content**: News feed preferences and source configuration
- **Location → Info → Sidebar**: Location-specific news and local events
- **Location → Settings → Content**: Location-based news settings and radius filters

## 🛠️ Development

### Prerequisites

- Node.js 20.19+ or 22.12+
- pnpm 8+

### Commands

```bash
pnpm dev          # Start dev server
pnpm build        # Build for production
pnpm preview      # Preview production build
pnpm test         # Run tests
pnpm type-check   # Type checking
pnpm lint         # Lint code
```

## 📄 License

MIT License - See LICENSE file for details

## 👥 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## 🔗 Links

- **Plugin Landing Page**: https://toplocs.github.io/news-plugin/
- **Main Platform**: https://github.com/toplocs/tribelike
- **Plugin SDK**: https://github.com/toplocs/plugin-sdk
- **Documentation**: https://toplocs.github.io/toplocs-workspace/

## 📞 Support

For issues and questions:
- GitHub Issues: https://github.com/toplocs/news-plugin/issues
- Discord: [TopLocs Community]

---

Built with ❤️ by the TopLocs Team
