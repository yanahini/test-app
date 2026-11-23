import { expect } from '@playwright/test';
import { test as base } from 'playwright-bdd';
import { authSelectors } from '../selectors/auth.selectors';
import { catalogSelectors } from '../selectors/catalog.selectors';
import { cartSelectors } from '../selectors/cart.selectors';
import { checkoutSelectors } from '../selectors/checkout.selectors';
import { menuSelectors } from '../selectors/menu.selectors';
import { productSelectors } from '../selectors/product.selectors';
import type { User } from '../test-data/users';

type Ui = {
  auth: ReturnType<typeof authSelectors>;
  menu: ReturnType<typeof menuSelectors>;
  catalog: ReturnType<typeof catalogSelectors>;
  product: ReturnType<typeof productSelectors>;
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
      menu: menuSelectors(page),
      catalog: catalogSelectors(page),
      product: productSelectors(page),
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
