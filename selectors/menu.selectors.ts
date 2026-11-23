import type { Page } from '@playwright/test';

export const menuSelectors = (page: Page) => ({
  open: page.getByRole('button', { name: 'Open Menu' }),
  close: page.getByRole('button', { name: 'Close Menu' }),
  item: (label: string) => page.getByRole('navigation').getByText(label, { exact: true }),
});
