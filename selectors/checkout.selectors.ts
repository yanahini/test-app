import type { Page } from '@playwright/test';

export const checkoutSelectors = (page: Page) => ({
  firstName: page.getByRole('textbox', { name: 'First Name' }),
  lastName: page.getByRole('textbox', { name: 'Last Name' }),
  postalCode: page.getByRole('textbox', { name: 'Zip/Postal Code' }),
  continue: page.getByRole('button', { name: 'Continue' }),
  cancel: page.getByRole('button', { name: 'Cancel' }),
  finish: page.getByRole('button', { name: 'Finish' }),
  confirmation: page.getByRole('heading', { name: 'Thank you for your order!' }),
  backHome: page.getByRole('button', { name: 'Back Home' }),
  overview: page.getByText('Checkout: Overview', { exact: true }),
  summary: page.getByText('Checkout: Your Information', { exact: true }),
  error: page.locator('[data-test="error"]'),
  itemNames: page.locator('[data-test="inventory-item-name"]'),
  itemPrices: page.locator('[data-test="inventory-item-price"]'),
  paymentInfo: page.locator('[data-test="payment-info-value"]'),
  shippingInfo: page.locator('[data-test="shipping-info-value"]'),
  itemTotal: page.locator('[data-test="subtotal-label"]'),
  tax: page.locator('[data-test="tax-label"]'),
  total: page.locator('[data-test="total-label"]'),
});
