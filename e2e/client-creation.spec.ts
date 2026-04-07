import { test, expect } from '@playwright/test';

test.describe('Client Creation', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:4200/clients');
    await page.waitForSelector('table');
  });

  test('should open new client dialog', async ({ page }) => {
    await page.getByRole('button', { name: 'neue kund:in' }).click();
    await expect(page.locator('mat-dialog-container')).toBeVisible();
    await expect(page.locator('mat-tab-group')).toContainText('neue kund:in erstellen');
  });

  test('should show validation error when name is empty', async ({ page }) => {
    await page.getByRole('button', { name: 'neue kund:in' }).click();
    await expect(page.locator('mat-dialog-container')).toBeVisible();

    // Try saving without filling in the name
    await page.getByRole('button', { name: 'speichern' }).click();

    // Dialog should stay open and show the error
    await expect(page.locator('mat-dialog-container')).toBeVisible();
    await expect(page.locator('mat-error')).toContainText('feld darf nicht leer sein');
  });

  test('should create a new Rechnungskund:in', async ({ page }) => {
    const clientName = `E2E Testkunde ${Date.now()}`;

    await page.getByRole('button', { name: 'neue kund:in' }).click();
    await expect(page.locator('mat-dialog-container')).toBeVisible();

    // Rechnungskund:in should be selected by default
    const billToggle = page.locator('mat-button-toggle', { hasText: 'rechnungskund:in' });
    await expect(billToggle).toHaveClass(/mat-button-toggle-checked/);

    // Fill in the form
    await page.getByLabel('name').fill(clientName);
    await page.getByLabel('postleitzahl').fill('10115');
    await page.getByLabel('stadt').fill('Berlin');

    // Save
    await page.getByRole('button', { name: 'speichern' }).click();

    // Dialog should close and snackbar should appear
    await expect(page.locator('mat-dialog-container')).toBeHidden();
    await expect(page.locator('simple-snack-bar')).toContainText('gespeichert');

    // Client should appear in the list
    await expect(page.locator('table')).toContainText(clientName);
  });

  test('should create a new Barkund:in', async ({ page }) => {
    const clientName = `E2E Barkunde ${Date.now()}`;

    await page.getByRole('button', { name: 'neue kund:in' }).click();
    await expect(page.locator('mat-dialog-container')).toBeVisible();

    // Switch to Barkund:in
    await page.locator('mat-button-toggle', { hasText: 'barkund:in' }).click();

    // Fill in the form
    await page.getByLabel('name').fill(clientName);

    // Save
    await page.getByRole('button', { name: 'speichern' }).click();

    // Dialog should close
    await expect(page.locator('mat-dialog-container')).toBeHidden();
    await expect(page.locator('simple-snack-bar')).toContainText('gespeichert');

    // Client should appear in the list
    await expect(page.locator('table')).toContainText(clientName);
  });

  test('should toggle client ID when switching bill type', async ({ page }) => {
    await page.getByRole('button', { name: 'neue kund:in' }).click();
    await expect(page.locator('mat-dialog-container')).toBeVisible();

    // Capture the default (Rechnungskund:in) client ID
    const clientIdInput = page.getByLabel('fred kund:innennummer');
    const nettoId = await clientIdInput.inputValue();

    // Switch to Barkund:in
    await page.locator('mat-button-toggle', { hasText: 'barkund:in' }).click();
    const bruttoId = await clientIdInput.inputValue();

    // IDs should be different
    expect(nettoId).not.toEqual(bruttoId);

    // Switch back to Rechnungskund:in
    await page.locator('mat-button-toggle', { hasText: 'rechnungskund:in' }).click();
    const nettoIdAgain = await clientIdInput.inputValue();

    // Should be back to the original netto ID
    expect(nettoIdAgain).toEqual(nettoId);
  });

  test('should close dialog without saving on backdrop click', async ({ page }) => {
    await page.getByRole('button', { name: 'neue kund:in' }).click();
    await expect(page.locator('mat-dialog-container')).toBeVisible();

    // Click the backdrop to close the dialog
    await page.locator('.cdk-overlay-backdrop').click({ force: true });

    await expect(page.locator('mat-dialog-container')).toBeHidden();
  });

  test('should prefill rufname with the name', async ({ page }) => {
    await page.getByRole('button', { name: 'neue kund:in' }).click();
    await expect(page.locator('mat-dialog-container')).toBeVisible();

    const name = 'Testname';
    await page.getByLabel('name').fill(name);

    // The rufname field should be synced via keyup
    // Type character by character to trigger keyup
    await page.getByLabel('name').clear();
    await page.getByLabel('name').pressSequentially(name);

    const rufname = await page.getByLabel('rufname').inputValue();
    expect(rufname).toEqual(name);
  });
});
