import type { Page } from '@playwright/test';

export const checkoutSelectors = (page: Page) => ({
  firstName: page.getByRole('textbox', { name: 'First Name' }),
  lastName: page.getByRole('textbox', { name: 'Last Name' }),
  postalCode: page.getByRole('textbox', { name: 'Zip/Postal Code' }),
  continue: page.getByRole('button', { name: 'Continue' }),
  finish: page.getByRole('button', { name: 'Finish' }),
  confirmation: page.getByRole('heading', { name: 'Thank you for your order!' }),
  backHome: page.getByRole('button', { name: 'Back Home' }),
  overview: page.getByText('Checkout: Overview', { exact: true }),
  summary: page.getByText('Checkout: Your Information', { exact: true }),
  error: page.locator('[data-test="error"]'),
  itemTotal: page.locator('.summary_subtotal_label'),
  tax: page.locator('.summary_tax_label'),
  total: page.locator('.summary_total_label'),
});
