import type { Page } from '@playwright/test';

export const productSelectors = (page: Page) => ({
  name: page.locator('[data-test="inventory-item-name"]'),
  description: page.locator('[data-test="inventory-item-desc"]'),
  price: page.locator('[data-test="inventory-item-price"]'),
  image: page.locator('.inventory_details_img'),
  addToCart: page.locator('[data-test="add-to-cart"]'),
  remove: page.locator('[data-test="remove"]'),
  backToProducts: page.locator('[data-test="back-to-products"]'),
});
