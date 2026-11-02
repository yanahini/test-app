import type { Page } from '@playwright/test';

export const authSelectors = (page: Page) => ({
  username: page.getByRole('textbox', { name: 'Username' }),
  password: page.getByRole('textbox', { name: 'Password' }),
  login: page.getByRole('button', { name: 'Login' }),
  error: page.locator('[data-test="error"]'),
});
