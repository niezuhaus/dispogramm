import { test as setup } from '@playwright/test';
import { storagePath } from "./paths";

setup('backend_setup', async ({ page }) => {
  //   await page.goto('http://localhost:4200/');
  //   await page.getByRole('link', { name: 'einstellungen' }).click();
  //   await page.locator('#mat-input-0').fill('http://localhost:8081');
  //   await page.getByRole('button', { name: 'speichern' }).click();
  //   await page.context().storageState({ path: storagePath });

  await page.goto("http://localhost:4200/");
  await page.getByRole("combobox", { name: "disponent:in" }).fill("de");
  await page.getByRole("option", { name: "dezwo" }).locator("span").click();
  await page.getByRole("button", { name: "jetzt einchecken" }).click();
  await page.getByText("kurier:innen eingecheckt!").click();
});