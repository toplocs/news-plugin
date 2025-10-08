# Testing Guide - News Plugin v2.0

## 🎉 Test Status: 102/102 Unit Tests Passing! ✅

---

## Quick Start for Manual UI Testing

### 1. Start Development Server
```bash
pnpm dev
```
Server will run on: **http://localhost:5174/**

### 2. Open in Browser
- Navigate to: http://localhost:5174/demo.html
- The CleanLayout component will load
- Initial survey modal should appear

### 3. Follow Test Checklist
Open `UI_TEST_CHECKLIST.md` and go through each section:
- ✅ Initial Survey Flow
- ✅ Article Browse & Feed
- ✅ Article Reading Flow
- ✅ Profile Management
- ✅ Notifications & Discovery
- ✅ Chat & DM Threads
- ✅ Responsive Layouts (Desktop/Tablet/Mobile)
- ✅ Performance Metrics
- ✅ Data Persistence
- ✅ Error Handling
- ✅ Visual Quality
- ✅ Accessibility
- ✅ Cross-Browser Compatibility

---

## Automated Tests (Current Status)

### ✅ Unit Tests (102/102 passing)
```bash
pnpm test
```

**Coverage:**
- **newsService.test.ts**: 18 tests ✅
  - Article generation, filtering, extended fields

- **rssService.test.ts**: 13 tests ✅
  - RSS parsing, content detection, error handling

- **useNewsStore.test.ts**: 18 tests ✅
  - Article CRUD, filtering, settings management

- **useNotifications.test.ts**: 25 tests ✅
  - Notifications, DM threads, badge updates

- **useDiscovery.test.ts**: 28 tests ✅
  - Discovery algorithm, relevance scoring, hybrid search

### ⏳ Component Tests (Pending)
```bash
# Create component tests for:
# - CleanLayout.vue
# - CleanNewsCard.vue
# - SkeletonCard.vue
# - NotificationPanel.vue
# - ProfileForm.vue
# ... and 22 more components
```

### ⏳ E2E Tests (Pending)
```bash
# Install Playwright
pnpm add -D @playwright/test

# Run E2E tests
pnpm exec playwright test
```

---

## Testing Scenarios to Focus On

### 🎯 Priority 1: Core User Flows
1. **First-Time User Journey**
   - [ ] Open demo page
   - [ ] See initial survey modal
   - [ ] Select 3+ interests
   - [ ] Enter location
   - [ ] Submit survey
   - [ ] See personalized feed

2. **Article Discovery & Reading**
   - [ ] Browse article cards
   - [ ] See article metadata (date, author, reading time, difficulty)
   - [ ] Click article to open modal
   - [ ] Read full content
   - [ ] See related articles
   - [ ] Click related article

3. **Profile Management**
   - [ ] Open profile editor
   - [ ] Change avatar
   - [ ] Edit interests
   - [ ] Update bio
   - [ ] Save changes
   - [ ] Verify persistence (reload page)

### 🎯 Priority 2: Interactive Features
4. **Search & Filter**
   - [ ] Type in search box
   - [ ] See results update
   - [ ] Apply topic filter
   - [ ] Apply source filter
   - [ ] Apply date range
   - [ ] Clear all filters

5. **Notifications**
   - [ ] Trigger notification (new article, new user, etc.)
   - [ ] See badge update with count
   - [ ] Click badge to open panel
   - [ ] Mark notification as read
   - [ ] Mark all as read

6. **User Discovery & Chat**
   - [ ] See users with similar interests
   - [ ] Click user to open chat
   - [ ] Send message
   - [ ] Receive message
   - [ ] See DM badge update

### 🎯 Priority 3: Responsive & Visual
7. **Responsive Layouts**
   - [ ] Test on desktop (1920x1080)
   - [ ] Test on tablet (768x1024)
   - [ ] Test on mobile (375x667)
   - [ ] Verify 3-column → 2-column → stacked transitions
   - [ ] Check drawer/bottom-sheet behavior

8. **Visual Quality**
   - [ ] Verify glassmorphism effects
   - [ ] Check gradient backgrounds
   - [ ] Test hover animations
   - [ ] Verify skeleton loading states
   - [ ] Check dark mode (if implemented)

---

## Performance Testing

### Run Lighthouse Audit
1. Build production bundle:
   ```bash
   pnpm build
   ```

2. Preview production build:
   ```bash
   pnpm preview
   ```

3. Open Chrome DevTools → Lighthouse
4. Run audit for:
   - Performance
   - Accessibility
   - Best Practices
   - SEO

### Target Metrics
- **Performance Score:** ≥ 90
- **Accessibility Score:** ≥ 95
- **TTI:** < 2.5s
- **FCP:** < 1.5s
- **LCP:** < 2.5s
- **CLS:** ≤ 0.05
- **FPS:** ≥ 60

---

## Bundle Analysis

```bash
# Analyze bundle size
pnpm build

# Check dist/ folder size
du -sh dist/

# Expected:
# - Total: ~500 kB (uncompressed)
# - Gzipped: ≤ 350 kB ✅
```

---

## Common Issues & Solutions

### Issue: Survey doesn't appear
**Solution:** Check browser console for errors, verify demo.ts loads CleanLayout

### Issue: Articles don't load
**Solution:** Check network tab, verify RSS feeds accessible, check newsService

### Issue: Notifications don't update
**Solution:** Check localStorage, verify useNotifications store working

### Issue: Profile changes don't persist
**Solution:** Check localStorage quota, verify Gun.js sync

### Issue: Slow performance
**Solution:** Check bundle size, verify lazy loading, check memory leaks

---

## Test Reports Location

- **UI_TEST_CHECKLIST.md** - Detailed manual testing checklist (150+ checks)
- **TEST_SUMMARY.md** - Complete test results and coverage report
- **TESTING_README.md** - This file (quick reference)

---

## Quick Commands

```bash
# Run all unit tests
pnpm test

# Run tests in watch mode
pnpm test -- --watch

# Run tests with coverage
pnpm test -- --coverage

# Run specific test file
pnpm test -- tests/unit/newsService.test.ts

# Build production
pnpm build

# Preview production build
pnpm preview

# Type check
pnpm type-check

# Lint code
pnpm lint
```

---

## Next Steps After Manual Testing

1. ✅ **Document Issues** - Add to TEST_SUMMARY.md under "Issues Found"
2. ✅ **Create Component Tests** - Write tests for Vue components
3. ✅ **Setup Playwright** - Add E2E testing framework
4. ✅ **Performance Optimization** - Based on Lighthouse results
5. ✅ **Accessibility Fixes** - Address any WCAG violations
6. ✅ **Cross-Browser Testing** - Test on Chrome, Firefox, Safari, Edge

---

## Test Coverage Goals

- ✅ Unit Tests: **100%** (102/102 passing)
- ⏳ Component Tests: **0%** (0/27 components tested)
- ⏳ E2E Tests: **0%** (framework not set up)
- ⏳ Manual UI Tests: **Requires user interaction**

**Overall Target:** 90%+ test coverage across all layers

---

## Contact & Support

**Issues:** Report bugs and issues in TEST_SUMMARY.md
**Documentation:** See docs/ folder for detailed guides
**Performance:** Check bundle size and Lighthouse scores
**Accessibility:** Use axe DevTools for automated a11y testing

---

**Happy Testing! 🚀**

*Last Updated: 2025-10-08*
*Test Suite: v2.0*
*Status: ✅ All automated tests passing*
