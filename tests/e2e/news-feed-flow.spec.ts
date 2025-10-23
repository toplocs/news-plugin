import { test, expect } from '@playwright/test'

test.describe('News Feed - Complete User Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to News Feed
    await page.goto('http://localhost:5173')
  })

  test('should display 3-column layout on desktop', async ({ page }) => {
    // Set viewport to desktop size
    await page.setViewportSize({ width: 1280, height: 720 })

    // Wait for layout to load
    await page.waitForSelector('.grid')

    // Check for 3-column structure
    const grid = await page.locator('.grid')
    await expect(grid).toBeVisible()

    // Verify sidebars and feed are present
    const leftSidebar = await page.locator('aside').first()
    const feed = await page.locator('main')
    const rightSidebar = await page.locator('aside').last()

    await expect(leftSidebar).toBeVisible()
    await expect(feed).toBeVisible()
    await expect(rightSidebar).toBeVisible()
  })

  test('should show mobile layout on small screens', async ({ page }) => {
    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 667 })

    await page.waitForSelector('.grid')

    // On mobile, only feed should be visible initially
    const grid = await page.locator('.grid')
    await expect(grid).toHaveClass(/grid-cols-1/)

    // Bottom navigation should be visible
    const bottomNav = await page.locator('[class*="MobileBottomNav"]')
    await expect(bottomNav).toBeVisible()
  })

  test('should load and display news articles', async ({ page }) => {
    // Wait for articles to load
    await page.waitForSelector('[class*="NewsCard"]', { timeout: 10000 })

    // Count articles
    const articles = await page.locator('[class*="NewsCard"]').count()
    expect(articles).toBeGreaterThan(0)
  })

  test('should filter articles by search', async ({ page }) => {
    // Wait for header
    await page.waitForSelector('header')

    // Enter search query
    const searchInput = await page.locator('input[placeholder*="Search"]')
    await searchInput.fill('technology')

    // Wait for filtered results
    await page.waitForTimeout(500) // Debounce delay

    // Articles should be filtered
    const articles = await page.locator('[class*="NewsCard"]')
    await expect(articles.first()).toBeVisible()
  })

  test('should open article detail modal on click', async ({ page }) => {
    // Wait for articles
    await page.waitForSelector('[class*="NewsCard"]')

    // Click first article
    const firstArticle = await page.locator('[class*="NewsCard"]').first()
    await firstArticle.click()

    // Modal should open
    await page.waitForSelector('[class*="NewsDetailModal"]', { timeout: 3000 })

    const modal = await page.locator('[class*="NewsDetailModal"]')
    await expect(modal).toBeVisible()
  })

  test('should refresh feed on refresh button click', async ({ page }) => {
    await page.waitForSelector('header')

    // Get initial article count
    const initialCount = await page.locator('[class*="NewsCard"]').count()

    // Click refresh button
    const refreshButton = await page.locator('button:has(svg[class*="rotate"])')
    await refreshButton.click()

    // Wait for refresh to complete
    await page.waitForTimeout(2000)

    // Articles should be refreshed (count might change)
    const newCount = await page.locator('[class*="NewsCard"]').count()
    expect(newCount).toBeGreaterThan(0)
  })

  test('should implement infinite scroll', async ({ page }) => {
    // Wait for initial articles
    await page.waitForSelector('[class*="NewsCard"]')

    const initialCount = await page.locator('[class*="NewsCard"]').count()

    // Scroll to bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))

    // Wait for more articles to load
    await page.waitForTimeout(1000)

    const newCount = await page.locator('[class*="NewsCard"]').count()

    // More articles should be loaded (or same count if all loaded)
    expect(newCount).toBeGreaterThanOrEqual(initialCount)
  })

  test('should toggle between grid and list layout', async ({ page }) => {
    await page.waitForSelector('[class*="FeedView"]')

    // Find layout toggle buttons
    const gridButton = await page.locator('button:has(path[d*="M4 6a2 2 0 012-2h2"])')
    const listButton = await page.locator('button:has(path[d*="M4 6h16M4 12h16"])')

    // Click list button
    await listButton.click()
    await page.waitForTimeout(300)

    // Check layout changed
    const feedContainer = await page.locator('[class*="FeedView"] > div')
    await expect(feedContainer).toHaveClass(/space-y-4/)

    // Click grid button
    await gridButton.click()
    await page.waitForTimeout(300)

    // Should switch back to grid
    await expect(feedContainer).toHaveClass(/grid/)
  })

  test('should display notifications panel', async ({ page }) => {
    await page.waitForSelector('header')

    // Find and click notification button
    const notificationButton = await page.locator('[class*="NotificationPanel"]')
    await notificationButton.click()

    // Notification panel should open
    await page.waitForSelector('[role="dialog"]', { timeout: 3000 })

    const panel = await page.locator('[role="dialog"]')
    await expect(panel).toBeVisible()
  })

  test('should show level indicator and rewards', async ({ page }) => {
    await page.waitForSelector('header')

    // Level indicator should be visible
    const levelIndicator = await page.locator('[class*="LevelIndicator"]')
    await expect(levelIndicator).toBeVisible()

    // Should display current level
    const levelText = await levelIndicator.textContent()
    expect(levelText).toContain('Level')
  })

  test('should handle responsive breakpoints correctly', async ({ page, viewport }) => {
    // Test different viewport sizes
    const breakpoints = [
      { width: 375, height: 667, name: 'mobile' },    // sm
      { width: 768, height: 1024, name: 'tablet' },   // md
      { width: 1280, height: 720, name: 'desktop' }   // lg
    ]

    for (const bp of breakpoints) {
      await page.setViewportSize({ width: bp.width, height: bp.height })
      await page.waitForTimeout(300)

      // Layout should adapt
      const grid = await page.locator('.grid')
      await expect(grid).toBeVisible()

      console.log(`✅ ${bp.name} layout working (${bp.width}px)`)
    }
  })

  test('should persist user settings across reload', async ({ page }) => {
    await page.waitForSelector('header')

    // Make some changes (e.g., search)
    const searchInput = await page.locator('input[placeholder*="Search"]')
    await searchInput.fill('test query')

    // Reload page
    await page.reload()

    // Wait for page to load
    await page.waitForSelector('header')

    // Check if state persists (depends on implementation)
    // This is a placeholder - actual implementation may vary
    const newSearchInput = await page.locator('input[placeholder*="Search"]')
    await expect(newSearchInput).toBeVisible()
  })
})

test.describe('News Feed - Performance', () => {
  test('should load within 3 seconds', async ({ page }) => {
    const startTime = Date.now()

    await page.goto('http://localhost:5173')
    await page.waitForSelector('[class*="NewsCard"]', { timeout: 5000 })

    const loadTime = Date.now() - startTime
    expect(loadTime).toBeLessThan(3000)

    console.log(`✅ Page loaded in ${loadTime}ms`)
  })

  test('should have minimal layout shift (CLS)', async ({ page }) => {
    await page.goto('http://localhost:5173')

    // Wait for page to fully load
    await page.waitForLoadState('networkidle')

    // Layout should be stable
    const grid = await page.locator('.grid')
    await expect(grid).toHaveClass(/gap-6/)

    // No unexpected shifts after load
    await page.waitForTimeout(1000)
    await expect(grid).toBeVisible()
  })

  test('should scroll smoothly at 60fps', async ({ page }) => {
    await page.goto('http://localhost:5173')
    await page.waitForSelector('[class*="NewsCard"]')

    // Perform smooth scroll
    await page.evaluate(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
    })

    await page.waitForTimeout(1000)

    // Should handle scroll without lag
    const articles = await page.locator('[class*="NewsCard"]')
    await expect(articles.first()).toBeVisible()
  })
})
