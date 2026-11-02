import { expect, test } from '@playwright/test';
import { authSelectors } from '../selectors/auth.selectors';
import { catalogSelectors } from '../selectors/catalog.selectors';
import { cartSelectors } from '../selectors/cart.selectors';
import { checkoutSelectors } from '../selectors/checkout.selectors';
import { users } from '../test-data/users';
import { checkoutInfo } from '../test-data/checkout';

function buildUi(page: any) {
  return {
    auth: authSelectors(page),
    catalog: catalogSelectors(page),
    cart: cartSelectors(page),
    checkout: checkoutSelectors(page),
  };
}

async function login(page: any, user = users.standard) {
  const ui = buildUi(page);
  await page.goto('/');
  await ui.auth.username.fill(user.username);
  await ui.auth.password.fill(user.password);
  await ui.auth.login.click();
  await expect(ui.catalog.title).toBeVisible();
  return ui;
}

test.describe('Sauce Demo behavior', () => {
  test('A standard user signs in', async ({ page }) => {
    const ui = buildUi(page);

    await page.goto('/');
    await ui.auth.username.fill(users.standard.username);
    await ui.auth.password.fill(users.standard.password);
    await ui.auth.login.click();

    await expect(ui.catalog.title).toBeVisible();
  });

  test('A locked out user cannot sign in', async ({ page }) => {
    const ui = buildUi(page);

    await page.goto('/');
    await ui.auth.username.fill(users.lockedOut.username);
    await ui.auth.password.fill(users.lockedOut.password);
    await ui.auth.login.click();

    await expect(ui.auth.error).toContainText('Epic sadface');
  });

  test('Add a product to the cart', async ({ page }) => {
    const ui = await login(page);

    await ui.catalog.addProduct('sauce-labs-backpack').click();

    await expect(ui.catalog.cartBadge).toHaveText('1');
  });

  test('Sort products by price from low to high', async ({ page }) => {
    const ui = await login(page);

    await ui.catalog.sort.selectOption('lohi');

    const prices = await page.locator('.inventory_item_price').allTextContents();
    const values = prices.map((price: string) => Number.parseFloat(price.replace(/[^0-9.]/g, '')));
    expect(values.every((value: number, index: number, list: number[]) => index === 0 || list[index - 1] <= value)).toBeTruthy();
    await expect(page.locator('.inventory_item_price').first()).toHaveText('$7.99');
    await expect(page.locator('.inventory_item_price').last()).toHaveText('$49.99');
  });

  test('Complete checkout with one product', async ({ page }) => {
    const ui = await login(page);

    await ui.catalog.addProduct('sauce-labs-backpack').click();
    await ui.catalog.cart.click();
    await expect(ui.cart.heading).toBeVisible();
    await expect(ui.cart.item('Sauce Labs Backpack')).toBeVisible();

    await ui.cart.checkout.click();
    await expect(ui.checkout.summary).toBeVisible();
    await ui.checkout.firstName.fill(checkoutInfo.firstName);
    await ui.checkout.lastName.fill(checkoutInfo.lastName);
    await ui.checkout.postalCode.fill(checkoutInfo.postalCode);
    await ui.checkout.continue.click();
    await expect(ui.checkout.overview).toBeVisible();
    await ui.checkout.finish.click();

    await expect(ui.checkout.confirmation).toBeVisible();
  });
});
