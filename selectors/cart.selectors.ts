import type { Page } from '@playwright/test';

export const cartSelectors = (page: Page) => ({
  heading: page.getByText('Your Cart', { exact: true }),
  checkout: page.getByRole('button', { name: 'Checkout' }),
  continueShopping: page.getByRole('button', { name: 'Continue Shopping' }),
  item: (name: string) => page.getByText(name, { exact: true }),
  items: page.locator('[data-test="inventory-item"]'),
  itemNames: page.locator('[data-test="inventory-item-name"]'),
  itemQuantities: page.locator('[data-test="item-quantity"]'),
  itemPrices: page.locator('[data-test="inventory-item-price"]'),
});
