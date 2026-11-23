import { expect } from '@playwright/test';
import { test as base } from 'playwright-bdd';
import { authSelectors } from '../selectors/auth.selectors';
import { catalogSelectors } from '../selectors/catalog.selectors';
import { cartSelectors } from '../selectors/cart.selectors';
import { checkoutSelectors } from '../selectors/checkout.selectors';
import type { User } from '../test-data/users';

type Ui = {
  auth: ReturnType<typeof authSelectors>;
  catalog: ReturnType<typeof catalogSelectors>;
  cart: ReturnType<typeof cartSelectors>;
  checkout: ReturnType<typeof checkoutSelectors>;
};

export const test = base.extend<{
  ui: Ui;
  signIn: (user: User) => Promise<void>;
}>({
  ui: async ({ page }, use) => {
    await use({
      auth: authSelectors(page),
      catalog: catalogSelectors(page),
      cart: cartSelectors(page),
      checkout: checkoutSelectors(page),
    });
  },
  signIn: async ({ ui }, use) => {
    await use(async ({ username, password }) => {
      await ui.auth.username.fill(username);
      await ui.auth.password.fill(password);
      await ui.auth.login.click();
    });
  },
});

export { expect };
