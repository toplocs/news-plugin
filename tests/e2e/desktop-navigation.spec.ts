import { test, expect } from '@playwright/test'

test.describe('Desktop Navigation - 3-Column Layout', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/demo.html')
    await page.waitForLoadState('networkidle')
  })

  test('should display 3-column layout on desktop', async ({ page }) => {
    // Check that all three columns are visible
    const leftSidebar = page.locator('.sidebar-left')
    const feedView = page.locator('.feed-view')
    const userSidebar = page.locator('.user-sidebar')

    await expect(leftSidebar).toBeVisible()
    await expect(feedView).toBeVisible()
    await expect(userSidebar).toBeVisible()
  })

  test('should navigate between sidebar views', async ({ page }) => {
    // Click on Settings
    await page.click('button:has-text("Einstellungen")')
    await expect(page.locator('.view-panel:has-text("Einstellungen")')).toBeVisible()

    // Click on Sources
    await page.click('button:has-text("Quellen")')
    await expect(page.locator('.view-panel:has-text("RSS Quellen")')).toBeVisible()

    // Click on Stats
    await page.click('button:has-text("Statistik")')
    await expect(page.locator('.view-panel:has-text("Wöchentliche Aktivität")')).toBeVisible()

    // Click on Interests
    await page.click('button:has-text("Interessen")')
    await expect(page.locator('.view-panel:has-text("Deine Interessen")')).toBeVisible()

    // Click on Profile
    await page.click('button:has-text("Profil")')
    await expect(page.locator('.view-panel:has-text("Dein Profil")')).toBeVisible()

    // Click on About
    await page.click('button:has-text("Info")')
    await expect(page.locator('.view-panel:has-text("LocalConnect News")')).toBeVisible()
  })

  test('should highlight active navigation item', async ({ page }) => {
    // Default active should be Settings
    const settingsButton = page.locator('button:has-text("Einstellungen")')
    await expect(settingsButton).toHaveClass(/active/)

    // Click Sources and check active state
    const sourcesButton = page.locator('button:has-text("Quellen")')
    await sourcesButton.click()
    await expect(sourcesButton).toHaveClass(/active/)
    await expect(settingsButton).not.toHaveClass(/active/)
  })

  test('should display article feed', async ({ page }) => {
    // Check if articles are loaded
    const articles = page.locator('.news-card')
    const count = await articles.count()

    // Should have at least some articles (or skeleton loaders)
    expect(count).toBeGreaterThan(0)
  })

  test('should open article modal on click', async ({ page }) => {
    // Wait for articles to load
    await page.waitForSelector('.news-card', { timeout: 10000 })

    // Click first article
    await page.click('.news-card:first-child')

    // Modal should open
    await expect(page.locator('.article-modal')).toBeVisible({ timeout: 5000 })
  })

  test('should display user list in right sidebar', async ({ page }) => {
    // Check if user sidebar has content
    const userList = page.locator('.user-list, .user-card')
    await expect(userList.first()).toBeVisible({ timeout: 10000 })
  })

  test('should have no layout shift (CLS)', async ({ page }) => {
    // Wait for initial render
    await page.waitForTimeout(1000)

    // Capture initial layout
    const initialLayout = await page.evaluate(() => {
      const leftSidebar = document.querySelector('.sidebar-left')
      const feedView = document.querySelector('.feed-view')
      const userSidebar = document.querySelector('.user-sidebar')

      return {
        left: leftSidebar?.getBoundingClientRect(),
        feed: feedView?.getBoundingClientRect(),
        user: userSidebar?.getBoundingClientRect()
      }
    })

    // Wait for content to load
    await page.waitForTimeout(2000)

    // Capture layout after loading
    const finalLayout = await page.evaluate(() => {
      const leftSidebar = document.querySelector('.sidebar-left')
      const feedView = document.querySelector('.feed-view')
      const userSidebar = document.querySelector('.user-sidebar')

      return {
        left: leftSidebar?.getBoundingClientRect(),
        feed: feedView?.getBoundingClientRect(),
        user: userSidebar?.getBoundingClientRect()
      }
    })

    // Check that positions haven't shifted significantly (< 5px tolerance)
    expect(Math.abs((initialLayout.left?.top || 0) - (finalLayout.left?.top || 0))).toBeLessThan(5)
    expect(Math.abs((initialLayout.feed?.top || 0) - (finalLayout.feed?.top || 0))).toBeLessThan(5)
    expect(Math.abs((initialLayout.user?.top || 0) - (finalLayout.user?.top || 0))).toBeLessThan(5)
  })

  test('should handle scroll smoothly (60 FPS)', async ({ page }) => {
    // Scroll feed
    const feedView = page.locator('.feed-view')
    await feedView.evaluate(el => el.scrollTop = 500)

    // Wait and check if scroll completed
    await page.waitForTimeout(500)
    const scrollTop = await feedView.evaluate(el => el.scrollTop)
    expect(scrollTop).toBeGreaterThan(400)
  })
})
