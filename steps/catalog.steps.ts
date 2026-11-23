import { createBdd } from 'playwright-bdd';
import { expect, test } from '../fixtures/test';
import { products } from '../test-data/checkout';

const { When, Then } = createBdd(test);

const toPrice = (text: string) => Number.parseFloat(text.replace(/[^0-9.]/g, ''));

Then('I should see {int} products', async ({ ui }, count: number) => {
  await expect(ui.catalog.items).toHaveCount(count);
});

When('I add the backpack to my cart', async ({ ui }) => {
  await ui.catalog.addProduct(products.backpack.slug).click();
  await expect(ui.catalog.removeProduct(products.backpack.slug)).toBeVisible();
});

When('I add the bike light to my cart', async ({ ui }) => {
  await ui.catalog.addProduct(products.bikeLight.slug).click();
  await expect(ui.catalog.removeProduct(products.bikeLight.slug)).toBeVisible();
});

When('I remove the backpack from my cart', async ({ ui }) => {
  await ui.catalog.removeProduct(products.backpack.slug).click();
  await expect(ui.catalog.addProduct(products.backpack.slug)).toBeVisible();
});

Then(/^the cart should show (\d+) items?$/, async ({ ui }, count: number) => {
  await expect(ui.catalog.cartBadge).toHaveText(String(count));
});

Then('the cart should be empty', async ({ ui }) => {
  await expect(ui.catalog.cartBadge).toHaveCount(0);
});

When('I sort products by price from low to high', async ({ ui }) => {
  await ui.catalog.sort.selectOption('lohi');
});

When('I sort products by price from high to low', async ({ ui }) => {
  await ui.catalog.sort.selectOption('hilo');
});

When('I sort products by name from Z to A', async ({ ui }) => {
  await ui.catalog.sort.selectOption('za');
});

Then('products should be ordered from lowest to highest price', async ({ ui }) => {
  const prices = (await ui.catalog.itemPrices.allTextContents()).map(toPrice);
  expect(prices).toHaveLength(6);
  expect(prices).toEqual([...prices].sort((a, b) => a - b));
});

Then('products should be ordered from highest to lowest price', async ({ ui }) => {
  const prices = (await ui.catalog.itemPrices.allTextContents()).map(toPrice);
  expect(prices).toHaveLength(6);
  expect(prices).toEqual([...prices].sort((a, b) => b - a));
});

Then('products should be ordered by name from Z to A', async ({ ui }) => {
  const names = await ui.catalog.itemNames.allTextContents();
  expect(names).toHaveLength(6);
  expect(names).toEqual([...names].sort((a, b) => b.localeCompare(a)));
});
