import { test, expect } from '@playwright/test';

test('full login and sign out flow', async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // === LOGIN ===
  await page.goto('http://localhost:8081/auth/login');
  await page.getByRole('button', { name: 'Advertiser' }).click();
  await page.fill('input[type="email"]', 'aayushchauhan@gmail.com');
  await page.fill('input[type="password"]', 'Abcd@1234');
  await page.getByRole('button', { name: 'Sign in' }).click();
  
  await page.waitForURL('**/app/advertiser', { timeout: 10000 });
  console.log('✅ Login successful! URL:', page.url());
  
  // === SIGN OUT ===
  const signoutBtn = page.getByRole('button', { name: 'Sign out' });
  await signoutBtn.click();
  
  await page.waitForURL('**/auth/login**', { timeout: 5000 });
  console.log('✅ Sign out successful! URL:', page.url());
  
  const cookies = await context.cookies();
  const authCookies = cookies.filter(c => c.name === 'adconnect_token');
  console.log('Auth cookie after signout:', authCookies.map(c => ({ name: c.name, value: c.value.substring(0, 20) })));
  
  await context.close();
});
