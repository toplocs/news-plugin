# E2E Testing Guide - News Plugin

## 🎯 Overview

End-to-End (E2E) tests verify complete user workflows across different devices and browsers using Playwright.

## 📦 Test Structure

```
tests/e2e/
├── desktop-navigation.spec.ts    # Desktop 3-column layout tests
├── responsive-layout.spec.ts     # Tablet & mobile responsive tests
└── user-journey.spec.ts          # Complete user workflow tests
```

## 🚀 Running E2E Tests

### Prerequisites

1. **Install browsers** (first time only):
   ```bash
   pnpm exec playwright install chromium
   ```

2. **Ensure dev server runs** at `http://localhost:5174`

### Test Commands

```bash
# Run all E2E tests (headless)
pnpm test:e2e

# Run with UI mode (interactive)
pnpm test:e2e:ui

# Run in headed mode (see browser)
pnpm test:e2e:headed

# Debug mode (step through tests)
pnpm test:e2e:debug

# View test report
pnpm test:e2e:report
```

### Run Specific Test File

```bash
pnpm exec playwright test desktop-navigation
pnpm exec playwright test responsive-layout
pnpm exec playwright test user-journey
```

### Run Single Test

```bash
pnpm exec playwright test -g "should display 3-column layout"
```

## 🖥️ Test Coverage

### Desktop Navigation (desktop-navigation.spec.ts)

✅ 3-column layout rendering
✅ Navigation between sidebar views (Settings, Sources, Stats, Interests, Profile, About)
✅ Active state highlighting
✅ Article feed display
✅ Article modal opening
✅ User list in right sidebar
✅ Layout shift detection (CLS < 0.05)
✅ Smooth scrolling (60 FPS)

### Responsive Layout (responsive-layout.spec.ts)

✅ Desktop (1920x1080) - All 3 columns
✅ Tablet (768x1024) - 2 columns + drawer
✅ Mobile (375x667) - Stacked layout
✅ Smooth transitions between breakpoints
✅ Touch interactions on mobile
✅ Portrait/landscape orientation
✅ Vertical scroll performance
✅ Responsive image loading

### User Journey (user-journey.spec.ts)

✅ Complete article reading flow
✅ Profile editing workflow
✅ Interest management
✅ Settings adjustment
✅ RSS source management
✅ Statistics viewing
✅ User discovery and matching
✅ Notification badge updates
✅ Search and filter
✅ End-to-end user journey

## 🎭 Browser & Device Matrix

| Project         | Browser  | Viewport       | Use Case              |
|-----------------|----------|----------------|-----------------------|
| Desktop Chrome  | Chromium | 1920x1080      | Desktop development   |
| Desktop Firefox | Firefox  | 1920x1080      | Cross-browser testing |
| Tablet iPad     | WebKit   | 1024x1366      | iPad Pro              |
| Mobile iPhone   | WebKit   | 393x852        | iPhone 14 Pro         |
| Mobile Android  | Chromium | 412x915        | Pixel 7               |

## 📊 Performance Targets

| Metric            | Target        | Test                    |
|-------------------|---------------|-------------------------|
| TTI               | < 2.5s        | Page load time          |
| CLS               | ≤ 0.05        | Layout shift detection  |
| FPS               | ≥ 60          | Scroll performance      |
| Touch Response    | < 100ms       | Mobile tap interactions |

## 🔧 Configuration

E2E tests are configured in `playwright.config.ts`:

- **Test directory**: `tests/e2e`
- **Base URL**: `http://localhost:5174`
- **Timeout**: 30 seconds per test
- **Retries**: 2 on CI, 0 locally
- **Screenshots**: On failure only
- **Videos**: On first retry
- **Traces**: On first retry

## 📝 Writing New E2E Tests

### Basic Test Structure

```typescript
import { test, expect } from '@playwright/test'

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/demo.html')
    await page.waitForLoadState('networkidle')
  })

  test('should do something', async ({ page }) => {
    // 1. Arrange - set up test data
    // 2. Act - perform user actions
    await page.click('button:has-text("Click Me")')

    // 3. Assert - verify results
    await expect(page.locator('.result')).toBeVisible()
  })
})
```

### Best Practices

1. **Use data-testid for stable selectors**:
   ```typescript
   await page.locator('[data-testid="article-card"]').click()
   ```

2. **Wait for network idle**:
   ```typescript
   await page.waitForLoadState('networkidle')
   ```

3. **Use semantic locators**:
   ```typescript
   // Good
   await page.click('button:has-text("Submit")')

   // Avoid
   await page.click('.btn-primary')
   ```

4. **Test user flows, not implementation**:
   ```typescript
   // Good - tests user flow
   test('user can read article', async ({ page }) => {
     await page.click('.news-card:first-child')
     await expect(page.locator('.article-modal')).toBeVisible()
   })

   // Avoid - tests implementation
   test('modal component renders', async ({ page }) => {
     // ...
   })
   ```

## 🐛 Debugging Tips

### 1. Run in UI Mode

```bash
pnpm test:e2e:ui
```

Interactive UI with timeline, network, DOM snapshots.

### 2. Run in Debug Mode

```bash
pnpm test:e2e:debug
```

Step through test execution with browser DevTools.

### 3. Take Screenshots

```typescript
test('debug screenshot', async ({ page }) => {
  await page.screenshot({ path: 'debug.png' })
})
```

### 4. Check Console Logs

```typescript
page.on('console', msg => console.log('PAGE LOG:', msg.text()))
```

### 5. Slow Down Execution

```typescript
test.use({ slowMo: 1000 }) // 1 second delay between actions
```

## 📈 CI/CD Integration

E2E tests run automatically on CI with:
- 2 retries on failure
- Video recording on failure
- Trace collection on first retry
- HTML report generation

### GitHub Actions Example

```yaml
- name: Run E2E Tests
  run: pnpm test:e2e

- name: Upload Test Report
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: test-results/e2e-report/
```

## 🎯 Known Issues & Limitations

1. **Dev server must be running** - Tests expect `http://localhost:5174`
2. **Async data loading** - Some tests wait for network idle
3. **Modal animations** - Tests use timeouts for smooth transitions
4. **Browser compatibility** - Chromium only (Firefox/WebKit optional)

## 📚 Resources

- [Playwright Documentation](https://playwright.dev)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Debugging Tests](https://playwright.dev/docs/debug)
- [UI Mode](https://playwright.dev/docs/test-ui-mode)

---

**Last Updated**: 2025-10-08
**Test Coverage**: 30+ E2E test scenarios
**Supported Devices**: Desktop, Tablet, Mobile
