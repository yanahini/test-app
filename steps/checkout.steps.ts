import { createBdd } from 'playwright-bdd';
import { expect, test } from '../fixtures/test';
import { checkoutInfo } from '../test-data/checkout';

const { Given, When, Then } = createBdd(test);

Given('I have the backpack in my cart', async ({ page, ui }) => {
  await page.goto('/inventory.html');
  await ui.catalog.addProduct('sauce-labs-backpack').click();
  await ui.catalog.cart.click();
  await expect(ui.cart.heading).toBeVisible();
  await expect(ui.cart.item('Sauce Labs Backpack')).toBeVisible();
});

When('I enter valid checkout information', async ({ page, ui }) => {
  await page.goto('/cart.html');
  await ui.cart.checkout.click();
  await expect(ui.checkout.summary).toBeVisible();
  await ui.checkout.firstName.fill(checkoutInfo.firstName);
  await ui.checkout.lastName.fill(checkoutInfo.lastName);
  await ui.checkout.postalCode.fill(checkoutInfo.postalCode);
  await ui.checkout.continue.click();
  await expect(ui.checkout.overview).toBeVisible();
});

When('I review and finish the order', async ({ ui }) => {
  await ui.checkout.finish.click();
});

Then('I should see the order confirmation', async ({ ui }) => {
  await expect(ui.checkout.confirmation).toBeVisible();
});
