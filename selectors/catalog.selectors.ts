import type { Page } from '@playwright/test';

export const catalogSelectors = (page: Page) => ({
  title: page.getByText('Products', { exact: true }),
  sort: page.locator('[data-test="product-sort-container"]'),
  cart: page.locator('.shopping_cart_link'),
  cartBadge: page.locator('.shopping_cart_badge'),
  product: (name: string) => page.getByText(name, { exact: true }),
  addProduct: (slug: string) => page.locator(`[data-test="add-to-cart-${slug}"]`),
  itemPrices: page.locator('.inventory_item_price'),
  itemNames: page.locator('.inventory_item_name'),
});
