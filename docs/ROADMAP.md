# Roadmap

→ Siehe Details: [../NEWS_PLUGIN_KONZEPT.md](../NEWS_PLUGIN_KONZEPT.md#-roadmap)

**Letzte Aktualisierung:** 2025-10-24

---

## ✅ Phase 1: MVP (COMPLETE)
**Status:** ✅ **100% ABGESCHLOSSEN**
**Dauer:** 4-6 Wochen

- ✅ NewsArticle Type (topics[], locations[])
- ✅ Gun.js Schema + Indexing
- ✅ Basic Scraper (RSS + NLP)
- ✅ Topic/Location Matching
- ✅ Frequency Tracking
- ✅ **KRITISCHER FIX:** Lokaler Gun.js (kein gun-manhattan mehr!)

**Deliverables:**
- Dezentrale Datenspeicherung (100% lokal)
- Gun.js P2P Database
- SEA Encryption
- Complete Data Layer

---

## ✅ Phase 2: Layout & UI (COMPLETE)
**Status:** ✅ **100% ABGESCHLOSSEN**
**Dauer:** 2-3 Wochen
**Delivery Date:** 2025-10-23

- ✅ 3-Column Responsive Layout (Desktop/Tablet/Mobile)
- ✅ UnreadBadge Component (fixed 16×16px, no layout shift)
- ✅ ArticleCard + ArticleDetail
- ✅ Infinite Scroll
- ✅ Responsive Breakpoints (sm/md/lg)
- ✅ Glassmorphism Design System
- ✅ Accessibility (WCAG 2.1 Level AA)
- ✅ Performance Optimization (86 kB gz bundle)

**Deliverables:**
- 📝 docs/decentralization.md (~500 lines)
- 📝 docs/ui-guide.md (~300 lines)
- 📝 docs/notifications.md (~200 lines)
- 📝 docs/matching.md (~200 lines)
- 📝 demo-phase2.html + TESTING-GUIDE-PHASE2.md
- 📝 PERFORMANCE-ACCESSIBILITY-AUDIT.md
- 🧪 3 neue Unit Test Files
- 📄 PHASE-2-DELIVERY-REPORT.md

---

## ✅ Phase 3.1: Solid Pods Integration (COMPLETE)
**Status:** ✅ **100% ABGESCHLOSSEN**
**Dauer:** 3-4 Wochen
**Delivery Date:** 2025-10-24

### 3.1: Solid Pods Integration ✅
- ✅ **@inrupt/solid-client** - Installed & integrated
- ✅ **Community Solid Server (CSS)** - Docker setup complete
- ✅ Pod Authentication (OIDC with provider selection)
- ✅ User Profile → Solid Pod (RDF/Turtle format)
- ✅ Bookmarks → Solid Pod (with import/export)
- ✅ Settings → Solid Pod (auto-sync)
- ✅ Avatar Upload (with image resizing)
- ✅ Migration Wizard (localStorage → Pod)
- ✅ Auto-Sync System (offline queue + retry)
- ✅ Error Handling (circuit breaker + exponential backoff)
- ✅ Security Hardening (URL validation + CSP)
- ✅ Accessibility (ARIA + keyboard nav)

**Deliverables:**
- 📝 ~4,320 lines of Solid Pods code
- 📝 docs/USER-GUIDE-SOLID-PODS.md
- 📝 docs/DEVELOPER-GUIDE-SOLID.md
- 📝 docs/solid-security.md
- 🐳 Docker Compose + CSS setup
- 🧪 Complete dashboard UI (solid-dashboard.html)

**Vorteile:**
- ✅ GDPR Compliant (EU-konform!)
- ✅ User Ownership (User besitzt Daten)
- ✅ Portabilität (Daten mitnehmen)
- ✅ Interoperabilität (Apps teilen Daten)

### 3.2: Privacy Analytics (Priority: MEDIUM)
- ✅ **Plausible Analytics** - Docker Compose included in setup
- ⏳ Self-hosted deployen
- ⏳ Tracking Script einbinden
- ⏳ Custom Events definieren
- ⏳ Dashboard für Admins

**Vorteil:**
- ✅ Keine Cookies
- ✅ GDPR/CCPA Compliant
- ✅ Lightweight (< 1 KB Script)
- ✅ Open Source (AGPLv3)

**Status:** Ready for deployment (Docker Compose included)

### 3.3: Matrix Chat Integration (Priority: LOW)
- 🔬 **Matrix Protocol (Synapse)** - Docker Setup researched
- 🔬 **matrix-js-sdk** - JavaScript SDK documented
- ⏳ Evaluieren: Matrix vs Gun.js für Chat
- ⏳ Entscheidung: Migration oder Dual-Support
- ⏳ Implementation (falls gewählt)

**Vorteil:**
- ✅ Dezentrales Netzwerk (wie Email)
- ✅ End-to-End Encryption (E2EE)
- ✅ Open Standard
- ✅ Bridging (zu WhatsApp, Slack, etc.)

**Status:** Research complete, implementation pending decision

### 3.4: ActivityPub Integration (Priority: FUTURE)
- 🔬 **ActivityPub Express** - JavaScript Libraries researched
- 🔬 **Fedify** - TypeScript Library documented
- ⏳ Federation evaluieren
- ⏳ Mastodon Kompatibilität?
- ⏳ Posts aus TopLocs → Mastodon teilen?

**Vorteil:**
- ✅ Federation (TopLocs News kann mit Mastodon interagieren!)
- ✅ W3C Standard (weit verbreitet)
- ✅ No vendor lock-in

**Status:** Research complete, future consideration

---

## 📦 Phase 3.1 Complete Deliverables

**Research & Planning:**
- ✅ docs/open-source-alternatives.md (~400+ lines)
  - Solid Pods Installation (CSS, npx, Docker)
  - Plausible Analytics (Docker Compose)
  - Matrix Protocol (Synapse Setup)
  - ActivityPub (JavaScript Libraries)
  - Decision Matrix & Integration Roadmap

**Architecture & Design:**
- ✅ docs/solid-pods-integration.md (~695 lines)
  - Architecture Design
  - Authentication Flow
  - Data Migration Strategy
  - Code Implementation Plans

**Implementation (9 Services):**
- ✅ src/services/solidAuth.ts (~200 lines)
- ✅ src/services/solidProfile.ts (~250 lines)
- ✅ src/services/solidBookmarks.ts (~280 lines)
- ✅ src/services/solidSettings.ts (~200 lines)
- ✅ src/services/solidAutoSync.ts (~180 lines)
- ✅ src/services/solidMigration.ts (~350 lines)
- ✅ src/services/solidAvatarUpload.ts (~220 lines)
- ✅ src/utils/solidUrlValidator.ts (~145 lines)
- ✅ src/utils/solidErrorHandler.ts (~280 lines)

**State Management:**
- ✅ src/stores/useSolidSession.ts (~200 lines)

**UI Components (7 Components):**
- ✅ src/components/SolidDashboard.vue (~450 lines)
- ✅ src/components/SolidLoginForm.vue (~180 lines)
- ✅ src/components/SolidProfileEditor.vue (~300 lines)
- ✅ src/components/SolidBookmarksManager.vue (~320 lines)
- ✅ src/components/SolidSettingsPanel.vue (~280 lines)
- ✅ src/components/SolidMigrationWizard.vue (~380 lines)
- ✅ src/components/LoadingSpinner.vue (~60 lines)

**Accessibility:**
- ✅ src/utils/accessibility.ts (~180 lines)
- ✅ src/assets/styles/accessibility.css (~80 lines)

**Infrastructure:**
- ✅ docker-compose.solid.yml (Community Solid Server + Plausible)
- ✅ solid-config/config.json
- ✅ scripts/setup-solid-server.sh

**Pages:**
- ✅ solid-dashboard.html (Dashboard entry point)

**Documentation:**
- ✅ docs/USER-GUIDE-SOLID-PODS.md (~80 lines)
- ✅ docs/DEVELOPER-GUIDE-SOLID.md (~200 lines)
- ✅ docs/solid-security.md (~180 lines)

**Total Implementation:** ~4,320 lines of production code + documentation

---

## ⏳ Phase 4: Polish & Performance (FUTURE)
**Status:** ⏳ **PENDING**
**Dauer:** 2-3 Wochen

- ⏳ Virtual Scrolling (optimization)
- ⏳ Image Optimization (lazy loading enhanced)
- ⏳ Code Splitting (route-based)
- ⏳ E2E Tests (comprehensive suite)
- ⏳ PWA Support (manifest + service worker)
- ⏳ Deployment CI/CD (GitHub Actions)

---

## Timeline

**Phase 1:** ✅ 4-6 Wochen (COMPLETE)
**Phase 2:** ✅ 2-3 Wochen (COMPLETE - 2025-10-23)
**Phase 3.1:** ✅ 3-4 Wochen (COMPLETE - 2025-10-24)
**Phase 3.2-3.4:** ⏳ Research complete, implementation optional
**Phase 4:** ⏳ 2-3 Wochen (Pending)

**Total:** Phase 1-3.1 complete! (~12 weeks delivered)

---

## 🎯 Next Immediate Steps

**Phase 3.1 Complete! ✅**

### Production Deployment:
1. **Start Community Solid Server:**
   ```bash
   ./scripts/setup-solid-server.sh
   # Opens http://localhost:3000/
   ```

2. **Open Solid Dashboard:**
   ```bash
   pnpm dev
   # Visit http://localhost:5176/solid-dashboard.html
   ```

3. **Test Full Flow:**
   - Login with Solid Provider
   - Edit Profile & Upload Avatar
   - Add Bookmarks
   - Configure Settings
   - Test Auto-Sync

### Optional Next Phases:
4. **Phase 3.2:** Deploy Plausible Analytics (already in docker-compose.solid.yml)
5. **Phase 3.3:** Evaluate Matrix Chat Integration
6. **Phase 4:** Performance optimization & PWA support

### Testing & QA:
- Bundle size analysis
- Unit tests for Solid services
- E2E tests for full user journey

---

**Philosophie:** "Nutze die besten Tools, nicht die neuesten Features."

Wir nutzen bewährte Open Source Lösungen statt alles neu zu erfinden:
- ✅ Solid Pods (Tim Berners-Lee, 10+ Jahre Entwicklung)
- ✅ Plausible (GDPR-konform, geprüft)
- ✅ Matrix (Millionen User, battle-tested)
- ✅ ActivityPub (W3C Standard, Mastodon-kompatibel)
