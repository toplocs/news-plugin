import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright E2E Test Configuration
 * Tests run against the dev server at http://localhost:5174
 */
export default defineConfig({
  testDir: './tests/e2e',

  // Maximum time one test can run
  timeout: 30 * 1000,

  // Run tests in parallel
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Opt out of parallel tests on CI
  workers: process.env.CI ? 1 : undefined,

  // Reporter to use
  reporter: [
    ['html', { outputFolder: 'test-results/e2e-report' }],
    ['list']
  ],

  use: {
    // Base URL to use in actions like `await page.goto('/')`
    baseURL: 'http://localhost:5174',

    // Collect trace when retrying the failed test
    trace: 'on-first-retry',

    // Screenshot on failure
    screenshot: 'only-on-failure',

    // Video on first retry
    video: 'retain-on-failure',
  },

  // Configure projects for major browsers and viewports
  projects: [
    {
      name: 'Desktop Chrome',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 }
      },
    },

    {
      name: 'Desktop Firefox',
      use: {
        ...devices['Desktop Firefox'],
        viewport: { width: 1920, height: 1080 }
      },
    },

    {
      name: 'Tablet iPad',
      use: {
        ...devices['iPad Pro'],
      },
    },

    {
      name: 'Mobile iPhone',
      use: {
        ...devices['iPhone 14 Pro'],
      },
    },

    {
      name: 'Mobile Android',
      use: {
        ...devices['Pixel 7'],
      },
    },
  ],

  // Run local dev server before starting tests
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:5174',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
})
