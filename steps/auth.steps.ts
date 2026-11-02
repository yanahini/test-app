import { createBdd } from 'playwright-bdd';
import { expect, test } from '../fixtures/test';
import { users } from '../test-data/users';

const { Given, When, Then } = createBdd(test);

Given('I am on the Sauce Demo login page', async ({ page }) => {
  await page.goto('/');
});

When('I sign in as the standard user', async ({ ui }) => {
  await ui.auth.username.fill(users.standard.username);
  await ui.auth.password.fill(users.standard.password);
  await ui.auth.login.click();
});

When('I sign in as the locked out user', async ({ ui }) => {
  await ui.auth.username.fill(users.lockedOut.username);
  await ui.auth.password.fill(users.lockedOut.password);
  await ui.auth.login.click();
});

Then('I should see the product catalog', async ({ ui }) => {
  await expect(ui.catalog.title).toBeVisible();
});

Then('I should see a login error', async ({ ui }) => {
  await expect(ui.auth.error).toContainText('Epic sadface');
});

Given('I am signed in as the standard user', async ({ page, ui }) => {
  await page.goto('/');
  await ui.auth.username.fill(users.standard.username);
  await ui.auth.password.fill(users.standard.password);
  await ui.auth.login.click();
  await expect(ui.catalog.title).toBeVisible();
});
