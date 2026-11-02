import { expect } from '@playwright/test';
import { test as base } from 'playwright-bdd';
import { authSelectors } from '../selectors/auth.selectors';
import { catalogSelectors } from '../selectors/catalog.selectors';
import { cartSelectors } from '../selectors/cart.selectors';
import { checkoutSelectors } from '../selectors/checkout.selectors';

export const test = base.extend<{
  ui: {
    auth: ReturnType<typeof authSelectors>;
    catalog: ReturnType<typeof catalogSelectors>;
    cart: ReturnType<typeof cartSelectors>;
    checkout: ReturnType<typeof checkoutSelectors>;
  };
}>({
  ui: async ({ page }, use) => {
    await use({
      auth: authSelectors(page),
      catalog: catalogSelectors(page),
      cart: cartSelectors(page),
      checkout: checkoutSelectors(page),
    });
  },
});

export { expect };
