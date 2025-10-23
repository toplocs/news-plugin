import { test, expect } from '@playwright/test'

test.describe('Notification System', () => {
  test('notification panel displays tabs correctly', async ({ page }) => {
    await page.goto('/')

    // Open notification panel
    await page.click('.notification-btn')
    await expect(page.locator('.notification-popover')).toBeVisible()

    // Check all tabs are present
    await expect(page.locator('text=Alle')).toBeVisible()
    await expect(page.locator('text=Entdecken')).toBeVisible()
    await expect(page.locator('text=Nutzer')).toBeVisible()
    await expect(page.locator('text=System')).toBeVisible()
  })

  test('switches between notification tabs', async ({ page }) => {
    await page.goto('/')
    await page.click('.notification-btn')

    // Click "Entdecken" tab
    await page.click('button:has-text("Entdecken")')
    
    // Tab should be active
    const discoveryTab = page.locator('button:has-text("Entdecken")')
    await expect(discoveryTab).toHaveClass(/active/)
  })

  test('marks notification as read', async ({ page }) => {
    await page.goto('/')
    await page.click('.notification-btn')

    // Find an unread notification
    const unreadNotif = page.locator('.notification-item.unread').first()
    
    if (await unreadNotif.count() > 0) {
      // Click mark as read button
      await unreadNotif.locator('.btn-mark-single').click()

      // Should no longer have unread class
      await expect(unreadNotif).not.toHaveClass(/unread/)
    }
  })

  test('marks all as read', async ({ page }) => {
    await page.goto('/')
    await page.click('.notification-btn')

    // Click "Alle gelesen" button
    const markAllBtn = page.locator('button:has-text("Alle gelesen")')
    
    if (await markAllBtn.isVisible()) {
      await markAllBtn.click()

      // Wait a moment
      await page.waitForTimeout(500)

      // No unread notifications should remain
      const unreadCount = await page.locator('.notification-item.unread').count()
      expect(unreadCount).toBe(0)
    }
  })

  test('unread badge updates correctly', async ({ page }) => {
    await page.goto('/')

    // Get initial badge count
    const badge = page.locator('.unread-badge')
    const initialText = await badge.textContent()

    // Open panel and mark all as read
    await page.click('.notification-btn')
    
    const markAllBtn = page.locator('button:has-text("Alle gelesen")')
    if (await markAllBtn.isVisible()) {
      await markAllBtn.click()
      await page.waitForTimeout(500)

      // Badge should disappear or show 0
      await expect(badge).not.toBeVisible()
    }
  })

  test('closes notification panel with Escape key', async ({ page }) => {
    await page.goto('/')
    await page.click('.notification-btn')

    await expect(page.locator('.notification-popover')).toBeVisible()

    // Press Escape
    await page.keyboard.press('Escape')

    // Panel should close
    await expect(page.locator('.notification-popover')).not.toBeVisible()
  })

  test('closes panel when clicking backdrop', async ({ page }) => {
    await page.goto('/')
    await page.click('.notification-btn')

    await expect(page.locator('.notification-popover')).toBeVisible()

    // Click backdrop
    await page.click('.backdrop')

    // Panel should close
    await expect(page.locator('.notification-popover')).not.toBeVisible()
  })
})

test.describe('UnreadBadge Component', () => {
  test('badge has correct ARIA attributes', async ({ page }) => {
    await page.goto('/')

    const notifBtn = page.locator('.notification-btn')
    
    // Check ARIA label
    const ariaLabel = await notifBtn.getAttribute('aria-label')
    expect(ariaLabel).toContain('Benachrichtigungen')

    // Check aria-expanded
    const expanded = await notifBtn.getAttribute('aria-expanded')
    expect(['true', 'false']).toContain(expanded)
  })

  test('badge animates on new notification', async ({ page }) => {
    await page.goto('/')

    // Trigger a new notification (mock or wait for real one)
    // Badge should have glow animation
    const badge = page.locator('.unread-badge')
    
    if (await badge.isVisible()) {
      // Check if badge-glow class is applied
      await expect(badge).toHaveClass(/badge-glow/, { timeout: 2000 })
    }
  })
})
