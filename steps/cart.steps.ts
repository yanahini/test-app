import { createBdd, type DataTable } from 'playwright-bdd';
import { expect, test } from '../fixtures/test';

const { Given, When, Then } = createBdd(test);

Given('I open my cart', async ({ ui }) => {
  await ui.catalog.cart.click();
  await expect(ui.cart.heading).toBeVisible();
});

Then('I should see my cart', async ({ page, ui }) => {
  await expect(page).toHaveURL(/\/cart\.html$/);
  await expect(ui.cart.heading).toBeVisible();
});

Then('my cart should contain:', async ({ ui }, table: DataTable) => {
  await expect(ui.cart.items).toHaveCount(table.hashes().length);
  const names = await ui.cart.itemNames.allTextContents();
  const quantities = await ui.cart.itemQuantities.allTextContents();
  const prices = await ui.cart.itemPrices.allTextContents();
  const rows = names.map((name, index) => ({ name, quantity: quantities[index], price: prices[index] }));
  expect(rows).toEqual(table.hashes());
});

Then('my cart should have no items', async ({ ui }) => {
  await expect(ui.cart.items).toHaveCount(0);
});

When('I continue shopping', async ({ ui }) => {
  await ui.cart.continueShopping.click();
});

When('I reload the page', async ({ page }) => {
  await page.reload();
});
