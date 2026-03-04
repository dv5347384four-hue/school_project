import { test, expect } from '@playwright/test';

test('login page opens', async ({ page }) => {
  await page.goto('http://localhost:3000/login');
  await expect(page.getByText('Вход в школьный дневник')).toBeVisible();
});
