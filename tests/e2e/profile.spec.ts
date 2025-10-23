import { test, expect } from '@playwright/test'

test.describe('Profile Editor', () => {
  test('opens profile editor', async ({ page }) => {
    await page.goto('/profile/edit')

    await expect(page.locator('h1:has-text("Profil bearbeiten")')).toBeVisible()
  })

  test('fills out profile form', async ({ page }) => {
    await page.goto('/profile/edit')

    // Fill name
    await page.fill('input[placeholder="Dein Name"]', 'Test User')

    // Fill username
    await page.fill('input[placeholder="@benutzername"]', '@testuser')

    // Fill bio
    await page.fill('textarea[placeholder*="Erzähle"]', 'This is my test bio')

    // Add interest
    await page.fill('input[placeholder="Interesse hinzufügen"]', 'Tech')
    await page.click('button:has-text("+")')

    // Interest tag should appear
    await expect(page.locator('.interest-tag:has-text("Tech")')).toBeVisible()
  })

  test('validates required fields', async ({ page }) => {
    await page.goto('/profile/edit')

    // Clear name field
    await page.fill('input[placeholder="Dein Name"]', '')

    // Try to save
    const saveBtn = page.locator('button:has-text("Speichern")')
    
    // Button should be disabled
    await expect(saveBtn).toBeDisabled()
  })

  test('removes interest tag', async ({ page }) => {
    await page.goto('/profile/edit')

    // Add interest
    await page.fill('input[placeholder="Interesse hinzufügen"]', 'Sports')
    await page.click('button:has-text("+")')

    // Remove it
    await page.click('.interest-tag:has-text("Sports") .remove-tag')

    // Should be gone
    await expect(page.locator('.interest-tag:has-text("Sports")')).not.toBeVisible()
  })

  test('shows preview while editing', async ({ page }) => {
    await page.goto('/profile/edit')

    await page.fill('input[placeholder="Dein Name"]', 'Preview Test')

    // Preview should update in real-time
    await expect(page.locator('.profile-preview')).toContainText('Preview Test')
  })

  test('cancels editing', async ({ page }) => {
    await page.goto('/profile/edit')

    await page.fill('input[placeholder="Dein Name"]', 'Temp Name')

    // Click cancel
    await page.click('button:has-text("Abbrechen")')

    // Should navigate away or close
    await expect(page).not.toHaveURL(/.*profile\/edit/)
  })
})

test.describe('Keyboard Navigation', () => {
  test('news cards are keyboard accessible', async ({ page }) => {
    await page.goto('/')

    // Wait for cards to load
    await page.waitForSelector('.news-card')

    // Tab to first card
    await page.keyboard.press('Tab')
    
    // First card should have focus
    const firstCard = page.locator('.news-card').first()
    await expect(firstCard).toBeFocused()

    // Press Enter to open
    await page.keyboard.press('Enter')

    // Detail modal should open
    await expect(page.locator('.news-detail-modal')).toBeVisible()
  })

  test('can navigate with Tab key', async ({ page }) => {
    await page.goto('/')

    // Tab through interactive elements
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab')
      
      // Should have visible focus ring
      const focused = page.locator(':focus-visible')
      await expect(focused).toBeVisible()
    }
  })
})
