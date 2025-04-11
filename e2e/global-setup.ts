import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  // Anwendung konfigurieren
  await page.goto('http://localhost:4200/');
  await page.locator('a').click();
  await page.locator('#mat-input-0').press('ControlOrMeta+a');
  await page.locator('#mat-input-0').fill('http://localhost:8081');
  await page.getByRole('button', { name: 'speichern' }).click();

  await browser.close();
}

export default globalSetup;