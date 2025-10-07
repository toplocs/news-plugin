# News-Plugin Dokumentation

Vollständige Dokumentation für das TopLocs News-Plugin.

## 📚 Dokumentations-Übersicht

### Kern-Dokumentation
- **[../NEWS_PLUGIN_KONZEPT.md](../NEWS_PLUGIN_KONZEPT.md)** - Vollständiges Konzept (v2.0)
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System-Architektur & Data Flow
- **[INTEGRATION.md](INTEGRATION.md)** - TopLocs Topics/Locations/Relations Integration
- **[AUTO_PROMOTE.md](AUTO_PROMOTE.md)** - Auto-Promote System für Topics & Locations

### Technische Details
- **[GUN_SCHEMA.md](GUN_SCHEMA.md)** - Gun.js Datenmodell & Indexing
- **[SCRAPER_SERVICE.md](SCRAPER_SERVICE.md)** - News-Scraping Service Details
- **[UI_COMPONENTS.md](UI_COMPONENTS.md)** - UI-Komponenten aus news-plugin-reza
- **[API_REFERENCE.md](API_REFERENCE.md)** - API & Composables Reference

### Projekt-Management
- **[FEATURES.md](FEATURES.md)** - Feature-Liste & Status
- **[ROADMAP.md](ROADMAP.md)** - Implementierungs-Plan (10 Wochen)

## 🚀 Quick Start

1. **Konzept verstehen**: Start mit [NEWS_PLUGIN_KONZEPT.md](../NEWS_PLUGIN_KONZEPT.md)
2. **Integration verstehen**: [INTEGRATION.md](INTEGRATION.md)
3. **Datenmodell verstehen**: [GUN_SCHEMA.md](GUN_SCHEMA.md)
4. **Implementation starten**: [ROADMAP.md](ROADMAP.md)

## 🎯 Kernprinzipien

1. ✅ **Keine Duplikate** - Nutzt bestehende TopLocs Topics/Locations
2. ✅ **Relations-basiert** - Liest User-Interessen aus Profile Relations
3. ✅ **Auto-Discovery** - Neue Entities werden automatisch vorgeschlagen
4. ✅ **Pure P2P** - Gun.js für alle Daten, minimaler Relay
5. ✅ **Multi-Profile** - Verschiedene Feeds für Work/Hobby/Family

## 📊 Status

- **Version**: 2.0
- **Status**: Ready for Implementation
- **Last Updated**: 2025-10-07
