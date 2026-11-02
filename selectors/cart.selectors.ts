import type { Page } from '@playwright/test';

export const cartSelectors = (page: Page) => ({
  heading: page.getByText('Your Cart', { exact: true }),
  checkout: page.getByRole('button', { name: 'Checkout' }),
  continueShopping: page.getByRole('button', { name: 'Continue Shopping' }),
  item: (name: string) => page.getByText(name, { exact: true }),
  removeBackpack: page.locator('[data-test="remove-sauce-labs-backpack"]'),
  quantity: page.locator('.cart_quantity'),
});
