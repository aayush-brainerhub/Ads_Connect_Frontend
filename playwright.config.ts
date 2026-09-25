import { defineConfig, devices } from '@playwright/test';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests/e2e',
  /* Maximum time one test can run for. */
  timeout: 30 * 1000,
  expect: {
    timeout: 5000
  },
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',

  /* Shared settings for all the projects below. */
  use: {
    /* Maximum time each action such as `click()` can take. Defaults to 0 (no limit). */
    actionTimeout: 0,
    
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:8080', 

    /* Collect trace for debugging. 'retain-on-failure' records the full DOM snapshot and network requests for failing tests */
    trace: 'retain-on-failure',
    
    // ==========================================
    // SENIOR QA CONFIG: VIDEO AND SCREENSHOTS
    // ==========================================
    // Take a screenshot automatically ONLY when a test fails
    screenshot: 'only-on-failure',
    
    // Record video automatically for every test execution
    video: 'on',
  },
  
  /* Output directory for videos, screenshots, traces, etc. */
  // All screenshots and videos will automatically be saved into this folder for each test!
  outputDir: 'test-artifacts/',

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    }
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'bun run dev',
    port: 8080,
    reuseExistingServer: !process.env.CI,
  },
});
