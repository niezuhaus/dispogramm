import { test as setup } from '@playwright/test';
import path from 'path';

export const storagePath = path.join(__dirname, 'env/storage.json');

setup('backend_setup', async ({ page }) => {
    await page.goto('http://localhost:4200/');
    await page.getByRole('link', { name: 'einstellungen' }).click();
    await page.locator('#mat-input-0').fill('http://localhost:8081');
    await page.getByRole('button', { name: 'speichern' }).click();
    await page.context().storageState({ path: storagePath });
});