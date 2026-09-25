import { test, expect } from '@playwright/test';

test.describe('AdsConnect Home Page', () => {
  test('should load the homepage, take a screenshot, and record a video', async ({ page }) => {
    // 1. Navigate to the application
    await page.goto('/');

    // 2. Perform a simple assertion (e.g., check if the title exists or a certain element is visible)
    // Since we don't know the exact title, we can just assert that the body is visible
    await expect(page.locator('body')).toBeVisible();

    // 3. Take a manual screenshot if you want a specific state (optional)
    // Note: Since we set `screenshot: 'on'` in the config, Playwright takes one automatically at the end.
    // But manual screenshots are great for capturing mid-test states!
    await page.screenshot({ path: 'test-artifacts/manual-home-screenshot.png', fullPage: true });

    // Note: Video is recorded automatically because `video: 'on'` is set in playwright.config.ts!
  });
});
