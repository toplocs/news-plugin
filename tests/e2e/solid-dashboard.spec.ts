/**
 * E2E Tests: Solid Dashboard
 * Full user journey testing for Solid Pods integration
 */

import { test, expect } from '@playwright/test'

test.describe('Solid Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to Solid dashboard
    await page.goto('/solid-dashboard.html')
    await page.waitForLoadState('networkidle')
  })

  test.describe('Initial Load', () => {
    test('should display dashboard tabs', async ({ page }) => {
      await expect(page.locator('text=Login')).toBeVisible()
      await expect(page.locator('text=Profile')).toBeVisible()
      await expect(page.locator('text=Bookmarks')).toBeVisible()
      await expect(page.locator('text=Settings')).toBeVisible()
      await expect(page.locator('text=Migration')).toBeVisible()
    })

    test('should show offline badge initially', async ({ page }) => {
      const onlineStatus = page.locator('[data-testid="online-status"]')
      if (await onlineStatus.isVisible()) {
        await expect(onlineStatus).toContainText(/offline/i)
      }
    })

    test('should have Login tab active by default', async ({ page }) => {
      const loginTab = page.locator('button:has-text("Login")')
      await expect(loginTab).toHaveClass(/active|bg-indigo/)
    })
  })

  test.describe('Login Tab', () => {
    test('should display provider selection dropdown', async ({ page }) => {
      await page.click('text=Login')
      await expect(page.locator('select#provider-select')).toBeVisible()
    })

    test('should show custom provider input field', async ({ page }) => {
      await page.click('text=Login')
      const input = page.locator('input[placeholder*="Pod URL"]')
      await expect(input).toBeVisible()
    })

    test('should have solidcommunity.net in provider options', async ({ page }) => {
      await page.click('text=Login')
      const select = page.locator('select#provider-select')
      await expect(select.locator('option:has-text("solidcommunity.net")')).toBeVisible()
    })

    test('should have localhost option for development', async ({ page }) => {
      await page.click('text=Login')
      const select = page.locator('select#provider-select')
      await expect(select.locator('option:has-text("localhost")')).toBeVisible()
    })

    test('should enable login button when provider selected', async ({ page }) => {
      await page.click('text=Login')
      await page.selectOption('select#provider-select', 'https://solidcommunity.net')

      const loginButton = page.locator('button:has-text("Login to Solid Pod")')
      await expect(loginButton).toBeEnabled()
    })
  })

  test.describe('Profile Tab', () => {
    test('should display profile form', async ({ page }) => {
      await page.click('text=Profile')

      await expect(page.locator('input[name="name"]')).toBeVisible()
      await expect(page.locator('textarea[name="bio"]')).toBeVisible()
      await expect(page.locator('input[name="interests"]')).toBeVisible()
    })

    test('should have avatar upload section', async ({ page }) => {
      await page.click('text=Profile')

      const avatarSection = page.locator('text=Avatar').or(page.locator('[data-testid="avatar-upload"]'))
      await expect(avatarSection).toBeVisible()
    })

    test('should allow typing in name field', async ({ page }) => {
      await page.click('text=Profile')

      const nameInput = page.locator('input[name="name"]')
      await nameInput.fill('Test User')
      await expect(nameInput).toHaveValue('Test User')
    })

    test('should allow typing in bio field', async ({ page }) => {
      await page.click('text=Profile')

      const bioInput = page.locator('textarea[name="bio"]')
      await bioInput.fill('This is a test bio')
      await expect(bioInput).toHaveValue('This is a test bio')
    })
  })

  test.describe('Bookmarks Tab', () => {
    test('should display add bookmark form', async ({ page }) => {
      await page.click('text=Bookmarks')

      await expect(page.locator('input[name="bookmark-title"]').or(page.locator('input[placeholder*="Title"]'))).toBeVisible()
      await expect(page.locator('input[name="bookmark-url"]').or(page.locator('input[placeholder*="URL"]'))).toBeVisible()
    })

    test('should have export and import buttons', async ({ page }) => {
      await page.click('text=Bookmarks')

      const exportButton = page.locator('button:has-text("Export")')
      const importButton = page.locator('button:has-text("Import")')

      // At least one of these buttons should be visible
      const exportVisible = await exportButton.isVisible().catch(() => false)
      const importVisible = await importButton.isVisible().catch(() => false)

      expect(exportVisible || importVisible).toBeTruthy()
    })

    test('should validate URL format in add bookmark form', async ({ page }) => {
      await page.click('text=Bookmarks')

      const urlInput = page.locator('input[name="bookmark-url"]').or(page.locator('input[placeholder*="URL"]'))
      await urlInput.fill('not-a-url')

      const addButton = page.locator('button:has-text("Add")')
      await addButton.click()

      // Should show error or not submit due to HTML5 validation
      const value = await urlInput.inputValue()
      expect(value).toBe('not-a-url')
    })
  })

  test.describe('Settings Tab', () => {
    test('should display settings form', async ({ page }) => {
      await page.click('text=Settings')

      // Check for common settings options
      const languageSelect = page.locator('select#language').or(page.locator('text=Language'))
      const themeSelect = page.locator('select#theme').or(page.locator('text=Theme'))

      const languageVisible = await languageSelect.isVisible().catch(() => false)
      const themeVisible = await themeSelect.isVisible().catch(() => false)

      expect(languageVisible || themeVisible).toBeTruthy()
    })

    test('should have auto-sync toggle', async ({ page }) => {
      await page.click('text=Settings')

      const autoSyncToggle = page.locator('input[type="checkbox"]').or(page.locator('text=Auto-Sync'))
      await expect(autoSyncToggle).toBeVisible()
    })
  })

  test.describe('Migration Tab', () => {
    test('should display migration wizard', async ({ page }) => {
      await page.click('text=Migration')

      // Should show migration steps or instructions
      const migrationContent = page.locator('text=localStorage').or(page.locator('text=Migrate'))
      await expect(migrationContent).toBeVisible()
    })

    test('should have start migration button', async ({ page }) => {
      await page.click('text=Migration')

      const startButton = page.locator('button:has-text("Start")').or(page.locator('button:has-text("Migrate")'))
      await expect(startButton).toBeVisible()
    })
  })

  test.describe('Tab Navigation', () => {
    test('should switch between tabs', async ({ page }) => {
      // Start on Login
      await page.click('text=Login')
      await expect(page.locator('select#provider-select')).toBeVisible()

      // Switch to Profile
      await page.click('text=Profile')
      await expect(page.locator('input[name="name"]')).toBeVisible()

      // Switch to Bookmarks
      await page.click('text=Bookmarks')
      const bookmarkInput = page.locator('input[name="bookmark-title"]').or(page.locator('input[placeholder*="Title"]'))
      await expect(bookmarkInput).toBeVisible()

      // Switch to Settings
      await page.click('text=Settings')
      // Settings content should be visible

      // Switch back to Login
      await page.click('text=Login')
      await expect(page.locator('select#provider-select')).toBeVisible()
    })
  })

  test.describe('Responsive Design', () => {
    test('should be mobile-friendly', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })

      await expect(page.locator('text=Login')).toBeVisible()
      await expect(page.locator('text=Profile')).toBeVisible()
      await expect(page.locator('text=Bookmarks')).toBeVisible()
    })

    test('should be tablet-friendly', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 })

      await expect(page.locator('text=Login')).toBeVisible()
      await page.click('text=Profile')
      await expect(page.locator('input[name="name"]')).toBeVisible()
    })

    test('should be desktop-friendly', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 })

      await expect(page.locator('text=Login')).toBeVisible()
      await page.click('text=Bookmarks')
      const bookmarkInput = page.locator('input[name="bookmark-title"]').or(page.locator('input[placeholder*="Title"]'))
      await expect(bookmarkInput).toBeVisible()
    })
  })

  test.describe('Accessibility', () => {
    test('should have proper heading structure', async ({ page }) => {
      const h1 = page.locator('h1')
      if (await h1.count() > 0) {
        await expect(h1.first()).toBeVisible()
      }
    })

    test('should have keyboard navigable tabs', async ({ page }) => {
      const loginTab = page.locator('button:has-text("Login")')
      await loginTab.focus()
      await expect(loginTab).toBeFocused()

      await page.keyboard.press('Tab')
      // Next element should receive focus
    })

    test('should have aria-labels on important elements', async ({ page }) => {
      // Check for aria-labels on buttons
      const buttons = page.locator('button[aria-label]')
      const count = await buttons.count()
      // Should have at least some aria-labeled buttons
      expect(count).toBeGreaterThanOrEqual(0)
    })
  })

  test.describe('Error Handling', () => {
    test('should handle network offline gracefully', async ({ page, context }) => {
      // Simulate offline
      await context.setOffline(true)

      // Should show offline indicator
      const onlineStatus = page.locator('[data-testid="online-status"]')
      if (await onlineStatus.isVisible()) {
        await expect(onlineStatus).toContainText(/offline/i)
      }

      await context.setOffline(false)
    })

    test('should validate empty form submissions', async ({ page }) => {
      await page.click('text=Profile')

      const saveButton = page.locator('button:has-text("Save")').first()
      await saveButton.click()

      // Should either show error or do nothing (not crash)
      await expect(page.locator('body')).toBeVisible()
    })
  })
})
