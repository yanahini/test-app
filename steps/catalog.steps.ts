import { createBdd } from 'playwright-bdd';
import { expect, test } from '../fixtures/test';

const { When, Then } = createBdd(test);

When('I add the backpack to my cart', async ({ ui }) => {
  await ui.catalog.addProduct('sauce-labs-backpack').click();
});

Then('the cart should show 1 item', async ({ ui }) => {
  await expect(ui.catalog.cartBadge).toHaveText('1');
  await expect(ui.catalog.cart).toBeVisible();
});

When('I sort products by price from low to high', async ({ ui }) => {
  await ui.catalog.sort.selectOption('lohi');
});

Then('products should be ordered from lowest to highest price', async ({ page }) => {
  const prices = await page.locator('.inventory_item_price').allTextContents();
  const values = prices.map((price) => Number.parseFloat(price.replace(/[^0-9.]/g, '')));

  expect(values.every((value, index, list) => index === 0 || list[index - 1] <= value)).toBeTruthy();
  await expect(page.locator('.inventory_item_price').first()).toHaveText('$7.99');
  await expect(page.locator('.inventory_item_price').last()).toHaveText('$49.99');
});
