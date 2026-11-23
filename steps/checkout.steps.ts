import { createBdd } from 'playwright-bdd';
import { expect, test } from '../fixtures/test';
import { checkoutInfo, products } from '../test-data/checkout';

const { Given, When, Then } = createBdd(test);

const toAmount = (text: string | null) => Number.parseFloat((text ?? '').replace(/[^0-9.]/g, ''));

Given('I have the backpack in my cart', async ({ ui }) => {
  await ui.catalog.addProduct(products.backpack.slug).click();
  await ui.catalog.cart.click();
  await expect(ui.cart.heading).toBeVisible();
  await expect(ui.cart.items).toHaveCount(1);
  await expect(ui.cart.item(products.backpack.name)).toBeVisible();
});

When('I start checkout', async ({ ui }) => {
  await ui.cart.checkout.click();
  await expect(ui.checkout.summary).toBeVisible();
});

When(
  'I continue with first name {string}, last name {string} and postal code {string}',
  async ({ ui }, firstName: string, lastName: string, postalCode: string) => {
    await ui.checkout.firstName.fill(firstName);
    await ui.checkout.lastName.fill(lastName);
    await ui.checkout.postalCode.fill(postalCode);
    await ui.checkout.continue.click();
  },
);

When('I enter valid checkout information', async ({ ui }) => {
  await ui.cart.checkout.click();
  await expect(ui.checkout.summary).toBeVisible();
  await ui.checkout.firstName.fill(checkoutInfo.firstName);
  await ui.checkout.lastName.fill(checkoutInfo.lastName);
  await ui.checkout.postalCode.fill(checkoutInfo.postalCode);
  await ui.checkout.continue.click();
  await expect(ui.checkout.overview).toBeVisible();
  await expect(ui.cart.item(products.backpack.name)).toBeVisible();
});

Then('the order total should equal the item total plus tax', async ({ ui }) => {
  const itemTotal = toAmount(await ui.checkout.itemTotal.textContent());
  const tax = toAmount(await ui.checkout.tax.textContent());
  const total = toAmount(await ui.checkout.total.textContent());

  expect(itemTotal).toBeGreaterThan(0);
  expect(total).toBeCloseTo(itemTotal + tax, 2);
});

When('I finish the order', async ({ ui }) => {
  await ui.checkout.finish.click();
});

Then('I should see the order confirmation', async ({ page, ui }) => {
  await expect(page).toHaveURL(/\/checkout-complete\.html$/);
  await expect(ui.checkout.confirmation).toBeVisible();
});

Then('I should see the checkout error {string}', async ({ page, ui }, message: string) => {
  await expect(ui.checkout.error).toHaveText(message);
  await expect(page).toHaveURL(/\/checkout-step-one\.html$/);
});
