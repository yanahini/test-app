import { createBdd, type DataTable } from 'playwright-bdd';
import { expect, test } from '../fixtures/test';
import { checkoutInfo } from '../test-data/checkout';

const { When, Then } = createBdd(test);

const toAmount = (text: string | null) => Number.parseFloat((text ?? '').replace(/[^0-9.]/g, ''));

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
});

When('I cancel checkout', async ({ ui }) => {
  await ui.checkout.cancel.click();
});

Then('the order overview should list:', async ({ ui }, table: DataTable) => {
  const names = await ui.checkout.itemNames.allTextContents();
  const prices = await ui.checkout.itemPrices.allTextContents();
  expect(names.map((name, index) => ({ name, price: prices[index] }))).toEqual(table.hashes());
});

Then('the item total should be {string}', async ({ ui }, amount: string) => {
  await expect(ui.checkout.itemTotal).toHaveText(`Item total: ${amount}`);
});

Then('the tax should be 8% of the item total', async ({ ui }) => {
  const itemTotal = toAmount(await ui.checkout.itemTotal.textContent());
  const tax = toAmount(await ui.checkout.tax.textContent());
  expect(tax).toBeCloseTo(itemTotal * 0.08, 2);
});

Then('the order total should equal the item total plus tax', async ({ ui }) => {
  const itemTotal = toAmount(await ui.checkout.itemTotal.textContent());
  const tax = toAmount(await ui.checkout.tax.textContent());
  const total = toAmount(await ui.checkout.total.textContent());

  expect(itemTotal).toBeGreaterThan(0);
  expect(total).toBeCloseTo(itemTotal + tax, 2);
});

Then('the payment information should be {string}', async ({ ui }, value: string) => {
  await expect(ui.checkout.paymentInfo).toHaveText(value);
});

Then('the shipping information should be {string}', async ({ ui }, value: string) => {
  await expect(ui.checkout.shippingInfo).toHaveText(value);
});

When('I finish the order', async ({ ui }) => {
  await ui.checkout.finish.click();
});

When('I go back home', async ({ ui }) => {
  await ui.checkout.backHome.click();
});

Then('I should see the order confirmation', async ({ page, ui }) => {
  await expect(page).toHaveURL(/\/checkout-complete\.html$/);
  await expect(ui.checkout.confirmation).toBeVisible();
});

Then('I should see the checkout error {string}', async ({ page, ui }, message: string) => {
  await expect(ui.checkout.error).toHaveText(message);
  await expect(page).toHaveURL(/\/checkout-step-one\.html$/);
});
