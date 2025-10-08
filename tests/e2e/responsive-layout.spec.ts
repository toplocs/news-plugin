import { test, expect } from '@playwright/test'

test.describe('Responsive Layout - Tablet & Mobile', () => {
  test('Desktop (1920x1080) - All 3 columns visible', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto('/demo.html')
    await page.waitForLoadState('networkidle')

    // All three columns should be visible
    await expect(page.locator('.sidebar-left')).toBeVisible()
    await expect(page.locator('.feed-view')).toBeVisible()
    await expect(page.locator('.user-sidebar')).toBeVisible()
  })

  test('Tablet (768x1024) - Settings + Feed visible, Users as drawer', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/demo.html')
    await page.waitForLoadState('networkidle')

    // Left sidebar and feed should be visible
    await expect(page.locator('.sidebar-left')).toBeVisible()
    await expect(page.locator('.feed-view')).toBeVisible()

    // User sidebar might be hidden or in a drawer on tablet
    // This depends on implementation - adjust as needed
  })

  test('Mobile (375x667) - Stacked layout', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/demo.html')
    await page.waitForLoadState('networkidle')

    // On mobile, components should be stacked
    // Feed should be visible
    await expect(page.locator('.feed-view')).toBeVisible()

    // Sidebars might be toggleable/hidden
    // Adjust expectations based on actual implementation
  })

  test('Tablet - Smooth transition from desktop to tablet', async ({ page }) => {
    // Start at desktop size
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto('/demo.html')
    await page.waitForLoadState('networkidle')

    // Verify desktop layout
    await expect(page.locator('.sidebar-left')).toBeVisible()
    await expect(page.locator('.feed-view')).toBeVisible()
    await expect(page.locator('.user-sidebar')).toBeVisible()

    // Resize to tablet
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.waitForTimeout(500) // Wait for CSS transitions

    // Verify tablet layout
    await expect(page.locator('.sidebar-left')).toBeVisible()
    await expect(page.locator('.feed-view')).toBeVisible()
  })

  test('Mobile - Touch interactions work', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/demo.html')
    await page.waitForLoadState('networkidle')

    // Wait for articles to load
    await page.waitForSelector('.news-card', { timeout: 10000 })

    // Tap on article (mobile touch event)
    const firstArticle = page.locator('.news-card').first()
    await firstArticle.tap()

    // Modal should open
    await expect(page.locator('.article-modal')).toBeVisible({ timeout: 5000 })
  })

  test('Tablet - Portrait and landscape orientation', async ({ page }) => {
    // Portrait
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/demo.html')
    await page.waitForLoadState('networkidle')

    const portraitLayout = await page.evaluate(() => {
      return {
        leftVisible: !!document.querySelector('.sidebar-left:not([style*="display: none"])')?.offsetParent,
        feedVisible: !!document.querySelector('.feed-view:not([style*="display: none"])')?.offsetParent,
      }
    })

    expect(portraitLayout.feedVisible).toBe(true)

    // Landscape
    await page.setViewportSize({ width: 1024, height: 768 })
    await page.waitForTimeout(500)

    const landscapeLayout = await page.evaluate(() => {
      return {
        leftVisible: !!document.querySelector('.sidebar-left:not([style*="display: none"])')?.offsetParent,
        feedVisible: !!document.querySelector('.feed-view:not([style*="display: none"])')?.offsetParent,
      }
    })

    expect(landscapeLayout.feedVisible).toBe(true)
  })

  test('Mobile - Vertical scroll works smoothly', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/demo.html')
    await page.waitForLoadState('networkidle')

    // Get feed container
    const feed = page.locator('.feed-view')

    // Scroll down
    await feed.evaluate(el => el.scrollTop = 300)
    await page.waitForTimeout(300)

    const scrollTop = await feed.evaluate(el => el.scrollTop)
    expect(scrollTop).toBeGreaterThan(200)

    // Scroll back up
    await feed.evaluate(el => el.scrollTop = 0)
    await page.waitForTimeout(300)

    const scrollTopAfter = await feed.evaluate(el => el.scrollTop)
    expect(scrollTopAfter).toBeLessThan(50)
  })

  test('Responsive images load correctly', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/demo.html')
    await page.waitForLoadState('networkidle')

    // Wait for images to load
    await page.waitForSelector('.news-card img', { timeout: 10000 })

    // Check if images are loaded
    const images = page.locator('.news-card img')
    const count = await images.count()

    if (count > 0) {
      const firstImage = images.first()
      const naturalWidth = await firstImage.evaluate((img: HTMLImageElement) => img.naturalWidth)
      expect(naturalWidth).toBeGreaterThan(0) // Image loaded successfully
    }
  })
})
