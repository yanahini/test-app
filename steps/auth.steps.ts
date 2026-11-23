import { createBdd } from 'playwright-bdd';
import { expect, test } from '../fixtures/test';
import { users } from '../test-data/users';

const { Given, When, Then } = createBdd(test);

Given('I am on the Sauce Demo login page', async ({ page }) => {
  await page.goto('/');
});

When('I sign in as the standard user', async ({ signIn }) => {
  await signIn(users.standard);
});

When('I sign in as the locked out user', async ({ signIn }) => {
  await signIn(users.lockedOut);
});

When('I sign in with username {string} and password {string}', async ({ signIn }, username: string, password: string) => {
  await signIn({ username, password });
});

Then('I should see the product catalog', async ({ page, ui }) => {
  await expect(page).toHaveURL(/\/inventory\.html$/);
  await expect(ui.catalog.title).toBeVisible();
});

Then('I should see the login error {string}', async ({ page, ui }, message: string) => {
  await expect(ui.auth.error).toHaveText(message);
  await expect(page).not.toHaveURL(/\/inventory\.html$/);
});

Given('I am signed in as the standard user', async ({ page, ui, signIn }) => {
  await page.goto('/');
  await signIn(users.standard);
  await expect(ui.catalog.title).toBeVisible();
});

Then('I should be on the login page', async ({ page, ui }) => {
  await expect(page).toHaveURL(/saucedemo\.com\/$/);
  await expect(ui.auth.login).toBeVisible();
});

When('I open the inventory page without signing in', async ({ page }) => {
  await page.goto('/inventory.html');
});
