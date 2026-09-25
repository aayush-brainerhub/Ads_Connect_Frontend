import { test, expect } from '@playwright/test';

test('check for console errors on click', async ({ page, context }) => {
  const errors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  page.on('pageerror', error => {
    errors.push(error.message);
  });

  await page.goto('http://localhost:8080/');
  
  const openAppBtn = page.getByRole('link', { name: 'Open app' });
  await openAppBtn.click();
  
  await page.waitForTimeout(2000);
  
  console.log('Errors found:', errors);
});
