import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  reportSlowTests: null,
  use: {
    baseURL: 'https://www.saucedemo.com',
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
    video: 'retain-on-failure',
  },
  timeout: 30000,
  expect: {
    timeout: 10000,
  },
});
