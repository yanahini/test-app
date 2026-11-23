import { createBdd } from 'playwright-bdd';
import { expect, test } from '../fixtures/test';

const { Given, When, Then } = createBdd(test);

Given('I open the details of {string}', async ({ page, ui }, name: string) => {
  await ui.catalog.product(name).click();
  await expect(page).toHaveURL(/\/inventory-item\.html\?id=\d+$/);
  // The URL changes before the details page renders, so wait for a details-only element.
  await expect(ui.product.backToProducts).toBeVisible();
  await expect(ui.product.name).toHaveText(name);
});

Then('I should see the details of {string} priced {string}', async ({ ui }, name: string, price: string) => {
  await expect(ui.product.name).toHaveText(name);
  await expect(ui.product.price).toHaveText(price);
  await expect(ui.product.description).not.toBeEmpty();
  await expect(ui.product.image).toBeVisible();
  await expect(ui.product.addToCart).toBeVisible();
});

When('I add the product to my cart from its details page', async ({ ui }) => {
  await ui.product.addToCart.click();
  await expect(ui.product.remove).toBeVisible();
});

When('I remove the product from my cart on its details page', async ({ ui }) => {
  await ui.product.remove.click();
  await expect(ui.product.addToCart).toBeVisible();
});

When('I go back to the products', async ({ ui }) => {
  await ui.product.backToProducts.click();
  await expect(ui.catalog.title).toBeVisible();
});

When('I open the product page with id {int}', async ({ page, ui }, id: number) => {
  await page.goto(`/inventory-item.html?id=${id}`);
  await expect(ui.product.backToProducts).toBeVisible();
});

Then('I should see the product not found page', async ({ ui }) => {
  await expect(ui.product.name).toHaveText('ITEM NOT FOUND');
});
