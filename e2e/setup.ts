import { test, expect } from '@playwright/test';

test.beforeAll(async ({ page }) => {
  await page.goto('http://localhost:4200/');
  await page.locator('a').click();
  await page.locator('#mat-input-0').press('ControlOrMeta+a');
  await page.locator('#mat-input-0').fill('http://localhost:8081');
  await page.getByRole('button', { name: 'speichern' }).click();
});