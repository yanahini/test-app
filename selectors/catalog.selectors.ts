import type { Page } from '@playwright/test';

export const catalogSelectors = (page: Page) => {
  const productCard = (name: string) =>
    page.locator('[data-test="inventory-item"]').filter({ has: page.getByText(name, { exact: true }) });

  return {
    title: page.getByText('Products', { exact: true }),
    sort: page.locator('[data-test="product-sort-container"]'),
    activeSort: page.locator('[data-test="active-option"]'),
    cart: page.locator('[data-test="shopping-cart-link"]'),
    cartBadge: page.locator('[data-test="shopping-cart-badge"]'),
    product: (name: string) => page.locator('[data-test="inventory-item-name"]').getByText(name, { exact: true }),
    productCard,
    addProduct: (name: string) => productCard(name).getByRole('button', { name: 'Add to cart' }),
    removeProduct: (name: string) => productCard(name).getByRole('button', { name: 'Remove' }),
    items: page.locator('[data-test="inventory-item"]'),
    itemPrices: page.locator('[data-test="inventory-item-price"]'),
    itemNames: page.locator('[data-test="inventory-item-name"]'),
  };
};
