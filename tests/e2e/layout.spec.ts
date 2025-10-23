import { test, expect } from '@playwright/test'

test.describe('Responsive Layout', () => {
  test('shows 3-column layout on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/')

    // Wait for layout to render
    await page.waitForSelector('.news-layout', { timeout: 5000 })

    // Check all 3 columns are visible
    const sidebar = await page.locator('[data-testid="sidebar-left"]')
    const feed = await page.locator('[data-testid="feed-view"]')
    const userSidebar = await page.locator('[data-testid="user-sidebar"]')

    await expect(sidebar).toBeVisible()
    await expect(feed).toBeVisible()
    await expect(userSidebar).toBeVisible()
  })

  test('shows 2-column layout on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/')

    await page.waitForSelector('.news-layout')

    // Sidebar and feed visible, user sidebar hidden
    await expect(page.locator('[data-testid="sidebar-left"]')).toBeVisible()
    await expect(page.locator('[data-testid="feed-view"]')).toBeVisible()
    
    // User sidebar should be hidden on tablet
    const userSidebar = page.locator('[data-testid="user-sidebar"]')
    await expect(userSidebar).toBeHidden()
  })

  test('shows stacked layout with bottom nav on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }) // iPhone SE
    await page.goto('/')

    await page.waitForSelector('.news-layout')

    // Bottom navigation should be visible
    await expect(page.locator('[data-testid="mobile-bottom-nav"]')).toBeVisible()

    // Only feed visible by default
    await expect(page.locator('[data-testid="feed-view"]')).toBeVisible()
  })

  test('switches views on mobile bottom nav', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    await page.waitForSelector('[data-testid="mobile-bottom-nav"]')

    // Click discover tab
    await page.click('[data-testid="mobile-nav-discover"]')
    await expect(page.locator('[data-testid="user-sidebar"]')).toBeVisible()

    // Click feed tab
    await page.click('[data-testid="mobile-nav-feed"]')
    await expect(page.locator('[data-testid="feed-view"]')).toBeVisible()
  })
})

test.describe('Header Bar', () => {
  test('displays unread notification badge', async ({ page }) => {
    await page.goto('/')

    // Wait for notifications to load
    await page.waitForSelector('.notification-btn', { timeout: 5000 })

    // Check if badge is visible
    const badge = page.locator('.unread-badge')
    await expect(badge).toBeVisible()
  })

  test('opens notification panel on click', async ({ page }) => {
    await page.goto('/')

    await page.click('.notification-btn')

    // Panel should appear
    await expect(page.locator('.notification-popover')).toBeVisible()
  })

  test('search input works', async ({ page }) => {
    await page.goto('/')

    const searchInput = page.locator('input[placeholder*="Search"]')
    await searchInput.fill('AI')

    // Wait for debounce (300ms)
    await page.waitForTimeout(400)

    // Feed should update (articles filtered)
    const articles = page.locator('.news-card')
    const count = await articles.count()
    expect(count).toBeGreaterThan(0)
  })
})
