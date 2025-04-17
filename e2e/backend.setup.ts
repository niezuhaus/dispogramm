import { test as setup, expect } from '@playwright/test';

setup('backend_setup', async ({ page }) => {
    await page.goto('http://localhost:4200/');
    await page.locator('a').click();
    await page.locator('#mat-input-0').press('ControlOrMeta+a');
    await page.locator('#mat-input-0').fill('https://cloud.niezuhaus.de/api/');
    await page.getByRole('button', { name: 'speichern' }).click();
    await page.context().storageState({ path: "e2e/env/storage.json" })
});