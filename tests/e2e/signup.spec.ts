import { test, expect } from '@playwright/test';

test('provider signup pending approval', async ({ page }) => {
  await page.goto('http://localhost:8081/auth/signup');
  
  await page.getByRole('button', { name: 'Provide' }).click();
  await page.getByLabel('Full name').fill('Test Provider');
  
  const randomEmail = `test.prov.${Date.now()}@example.com`;
  await page.getByLabel('Email').fill(randomEmail);
  await page.getByLabel('Password').fill('Password@123');
  
  await page.getByRole('button', { name: 'Create account' }).click();
  
  // Should show success state
  await expect(page.getByText('Application Received')).toBeVisible({ timeout: 10000 });
  await expect(page.getByText(/Our team will review and approve it shortly/i)).toBeVisible();
  
  console.log('✅ Provider signup showed pending approval screen!');
});
