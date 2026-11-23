import { createBdd, type DataTable } from 'playwright-bdd';
import { expect, test } from '../fixtures/test';

const { Given, When, Then } = createBdd(test);

const toPrice = (text: string) => Number.parseFloat(text.replace(/[^0-9.]/g, ''));

type Product = { name: string; price: number };
const sortOrders: Record<string, (a: Product, b: Product) => number> = {
  'Name (A to Z)': (a, b) => a.name.localeCompare(b.name),
  'Name (Z to A)': (a, b) => b.name.localeCompare(a.name),
  'Price (low to high)': (a, b) => a.price - b.price,
  'Price (high to low)': (a, b) => b.price - a.price,
};

Then('the catalog should list these products:', async ({ ui }, table: DataTable) => {
  const names = await ui.catalog.itemNames.allTextContents();
  const prices = await ui.catalog.itemPrices.allTextContents();
  expect(names.map((name, index) => ({ name, price: prices[index] }))).toEqual(table.hashes());
});

Given('I add {string} to my cart', async ({ ui }, name: string) => {
  await ui.catalog.addProduct(name).click();
  await expect(ui.catalog.removeProduct(name)).toBeVisible();
});

When('I remove {string} from my cart', async ({ ui }, name: string) => {
  // Product cards share the same markup on the catalog and cart pages.
  await ui.catalog.removeProduct(name).click();
  await expect(ui.catalog.removeProduct(name)).toHaveCount(0);
});

Then('{string} should be marked as in my cart', async ({ ui }, name: string) => {
  await expect(ui.catalog.removeProduct(name)).toBeVisible();
});

Then(/^the cart should show (\d+) items?$/, async ({ ui }, count: number) => {
  await expect(ui.catalog.cartBadge).toHaveText(String(count));
});

Then('the cart should be empty', async ({ ui }) => {
  await expect(ui.catalog.cartBadge).toHaveCount(0);
});

When('I sort products by {string}', async ({ ui }, order: string) => {
  await ui.catalog.sort.selectOption({ label: order });
});

Then('the products should be sorted by {string}', async ({ ui }, order: string) => {
  const compare = sortOrders[order];
  if (!compare) throw new Error(`Unknown sort order "${order}"`);

  await expect(ui.catalog.activeSort).toHaveText(order);
  const names = await ui.catalog.itemNames.allTextContents();
  const prices = (await ui.catalog.itemPrices.allTextContents()).map(toPrice);
  const products = names.map((name, index) => ({ name, price: prices[index] }));

  expect(products).toHaveLength(6);
  expect(products).toEqual([...products].sort(compare));
});
