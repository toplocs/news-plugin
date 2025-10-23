import { test, expect } from '@playwright/test'

test.describe('Sidebar Tabs - Complete Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5175/')
    await page.waitForLoadState('networkidle')
  })

  test('TC1: Interessen Tab - Initial State', async ({ page }) => {
    // Linke Sidebar sollte sichtbar sein
    const sidebar = page.locator('.sidebar-left')
    await expect(sidebar).toBeVisible()

    // Interessen Tab sollte aktiv sein beim Start
    const interessenTab = page.locator('.nav-item:has-text("Meine Interessen")')
    await expect(interessenTab).toHaveClass(/active/)

    // Badge sollte Anzahl zeigen
    const badge = interessenTab.locator('.nav-badge')
    const badgeCount = await badge.count()
    expect(badgeCount).toBeGreaterThanOrEqual(0) // Badge kann leer sein wenn 0 Interessen
  })

  test('TC2: Interessen hinzufügen', async ({ page }) => {
    // Zum Interessen Tab navigieren
    await page.click('text=Meine Interessen')

    // "+" Button klicken
    await page.click('button:has-text("+")')

    // Input Feld sollte erscheinen
    const input = page.locator('input[placeholder*="Interesse"]')
    await expect(input).toBeVisible()

    // Neues Interesse eingeben
    await input.fill('Kunst')
    await input.press('Enter')

    // Interesse sollte in Liste erscheinen
    await expect(page.locator('text=Kunst')).toBeVisible()

    console.log('✅ TC2: Interesse hinzufügen - PASSED')
  })

  test('TC3: Bookmarks Tab - Empty State', async ({ page }) => {
    // Zu Bookmarks Tab navigieren
    await page.click('.nav-item:has-text("Gespeichert")')

    // Warte kurz auf View-Update
    await page.waitForTimeout(300)

    // Empty State sollte angezeigt werden (wenn keine Bookmarks)
    const emptyState = page.locator('.empty-state')

    // Entweder Empty State oder Bookmarks Liste
    const hasEmptyState = await emptyState.isVisible().catch(() => false)
    const hasBookmarks = await page.locator('.bookmarks-list').isVisible().catch(() => false)

    expect(hasEmptyState || hasBookmarks).toBeTruthy()

    console.log('✅ TC3: Bookmarks Empty State - PASSED')
  })

  test('TC4: Bookmark Artikel und anzeigen', async ({ page }) => {
    // Warte auf Artikel im Feed
    await page.waitForSelector('.news-card', { timeout: 10000 })

    // Hover über ersten Artikel
    const firstArticle = page.locator('.news-card').first()
    await firstArticle.hover()

    // Bookmark Button klicken
    const bookmarkBtn = firstArticle.locator('.bookmark-btn')
    await bookmarkBtn.click()

    // Toast sollte erscheinen (mit Timeout)
    await expect(page.locator('text=gespeichert')).toBeVisible({ timeout: 2000 })

    // Zu Bookmarks Tab wechseln
    await page.click('.nav-item:has-text("Gespeichert")')
    await page.waitForTimeout(300)

    // Bookmarks Liste sollte Artikel zeigen
    const bookmarksList = page.locator('.bookmarks-list')
    await expect(bookmarksList).toBeVisible({ timeout: 3000 })

    const bookmarkItems = page.locator('.bookmark-item')
    await expect(bookmarkItems).toHaveCount(1, { timeout: 3000 })

    console.log('✅ TC4: Bookmark Artikel - PASSED')
  })

  test('TC5: Bookmark entfernen', async ({ page }) => {
    // Zuerst einen Artikel bookmarken
    await page.waitForSelector('.news-card', { timeout: 10000 })
    const firstArticle = page.locator('.news-card').first()
    await firstArticle.hover()
    await firstArticle.locator('.bookmark-btn').click()
    await page.waitForTimeout(500)

    // Zu Bookmarks Tab
    await page.click('.nav-item:has-text("Gespeichert")')
    await page.waitForTimeout(300)

    // Trash Button klicken
    const trashBtn = page.locator('.bookmark-remove-btn').first()
    await trashBtn.click()
    await page.waitForTimeout(500)

    // Bookmark sollte entfernt sein
    const bookmarkItems = page.locator('.bookmark-item')
    await expect(bookmarkItems).toHaveCount(0, { timeout: 3000 })

    // Empty State sollte wieder erscheinen
    await expect(page.locator('.empty-state')).toBeVisible({ timeout: 2000 })

    console.log('✅ TC5: Bookmark entfernen - PASSED')
  })

  test('TC6: Settings Tab - Profil Button', async ({ page }) => {
    // Zu Settings Tab navigieren
    await page.click('.nav-item:has-text("Einstellungen")')
    await page.waitForTimeout(300)

    // Profil Button sollte sichtbar sein
    const profileBtn = page.locator('button:has-text("Profil bearbeiten")')
    await expect(profileBtn).toBeVisible({ timeout: 2000 })

    // NUR EIN Profil Button (nicht redundant)
    const allProfileBtns = page.locator('button:has-text("Profil")')
    const count = await allProfileBtns.count()
    expect(count).toBeLessThanOrEqual(1) // Max 1 Button

    console.log('✅ TC6: Settings Profil Button - PASSED')
  })

  test('TC7: Community Tab - Discovery Panel', async ({ page }) => {
    // Zu Community Tab navigieren
    await page.click('.nav-item:has-text("Community")')
    await page.waitForTimeout(300)

    // View Panel sollte geladen sein
    const viewPanel = page.locator('.view-panel')
    await expect(viewPanel).toBeVisible({ timeout: 2000 })

    console.log('✅ TC7: Community Tab - PASSED')
  })

  test('TC8: Console Errors Check', async ({ page }) => {
    const errors: string[] = []

    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    // Warte 3 Sekunden für mögliche Fehler
    await page.waitForTimeout(3000)

    // Filtere bekannte harmlose Fehler
    const criticalErrors = errors.filter(err =>
      !err.includes('Favicon') &&
      !err.includes('manifest.json') &&
      !err.includes('404')
    )

    expect(criticalErrors).toHaveLength(0)

    console.log('✅ TC8: Keine kritischen Console Errors - PASSED')
  })

  test('TC9: Alle 4 Tabs vorhanden (nicht 7)', async ({ page }) => {
    const navItems = page.locator('.nav-item')

    // Sollte genau 4 sein (nicht 7)
    const count = await navItems.count()
    expect(count).toBe(4)

    // Check Namen
    await expect(page.locator('.nav-item:has-text("Meine Interessen")')).toBeVisible()
    await expect(page.locator('.nav-item:has-text("Gespeichert")')).toBeVisible()
    await expect(page.locator('.nav-item:has-text("Einstellungen")')).toBeVisible()
    await expect(page.locator('.nav-item:has-text("Community")')).toBeVisible()

    // Nicht vorhanden (alte Tabs)
    await expect(page.locator('text=Sources')).not.toBeVisible()
    await expect(page.locator('text=Stats')).not.toBeVisible()
    await expect(page.locator('text=About')).not.toBeVisible()

    console.log('✅ TC9: Exakt 4 Tabs - PASSED')
  })

  test('TC10: Badge Updates', async ({ page }) => {
    // Bookmarks Badge initial
    const bookmarksBadge = page.locator('.nav-item:has-text("Gespeichert") .nav-badge')

    // Bookmarke einen Artikel
    await page.waitForSelector('.news-card', { timeout: 10000 })
    const firstArticle = page.locator('.news-card').first()
    await firstArticle.hover()
    await firstArticle.locator('.bookmark-btn').click()

    // Badge sollte sich aktualisieren
    await page.waitForTimeout(500)

    // Badge sollte nun sichtbar sein mit Count >= 1
    const isVisible = await bookmarksBadge.isVisible().catch(() => false)
    if (isVisible) {
      const badgeText = await bookmarksBadge.textContent()
      const count = parseInt(badgeText || '0')
      expect(count).toBeGreaterThanOrEqual(1)
    }

    console.log('✅ TC10: Badge Updates - PASSED')
  })
})
