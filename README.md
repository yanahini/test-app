# Sauce Demo: Playwright + Gherkin Test Documentation

**Application:** [Sauce Demo](https://www.saucedemo.com/) (Swag Labs)  
**Purpose:** Reference for building a small end-to-end test suite with Playwright, Gherkin, and `playwright-bdd`.  
**Scope observed:** Login, product catalog, product details, cart, checkout, and order confirmation.

> Sauce Demo is a public training application. Its UI and demo data can change. Keep tests isolated, avoid real personal information, and treat a successful demo checkout as a simulated flow.

## 1. Main user journey

1. Open the login page.
2. Sign in with a demo user.
3. Browse and sort the six products.
4. Add one or more products to the cart.
5. Review or remove cart items.
6. Enter checkout information.
7. Review the order summary and finish checkout.
8. Verify the confirmation page.

Observed routes include `/`, `/inventory.html`, `/inventory-item.html?id=...`, `/cart.html`, `/checkout-step-one.html`, `/checkout-step-two.html`, and `/checkout-complete.html`.

## 2. Suggested project structure

```text
project/
├── playwright.config.ts
├── features/
│   ├── auth/login.feature
│   ├── catalog/catalog.feature
│   └── checkout/checkout.feature
├── steps/
│   ├── auth.steps.ts
│   ├── catalog.steps.ts
│   └── checkout.steps.ts
├── fixtures/
│   └── test.ts
├── selectors/
│   ├── auth.selectors.ts
│   ├── catalog.selectors.ts
│   ├── cart.selectors.ts
│   └── checkout.selectors.ts
├── test-data/
│   ├── users.ts
│   └── checkout.ts
└── package.json
```

Keep Gherkin focused on business behavior. Keep locators in `selectors/`, reusable Playwright setup in `fixtures/`, and non-secret scenario data in `test-data/`.

## 3. Demo data

The login page lists these accepted usernames: `standard_user`, `locked_out_user`, `problem_user`, `performance_glitch_user`, `error_user`, and `visual_user`. It displays the shared demo password `secret_sauce`.

```ts
// test-data/users.ts
export const users = {
  standard: { username: 'standard_user', password: 'secret_sauce' },
  lockedOut: { username: 'locked_out_user', password: 'secret_sauce' },
};
```

Use `standard_user` for the baseline happy path. Use the other accounts only for targeted behavior checks; account behavior can be intentionally unusual. These are public demo credentials, not credentials for a personal account.

```ts
// test-data/checkout.ts
export const checkoutInfo = {
  firstName: 'Test',
  lastName: 'User',
  postalCode: '75001',
};

export const products = {
  backpack: 'Sauce Labs Backpack',
  bikeLight: 'Sauce Labs Bike Light',
};
```

## 4. Selector catalog

Prefer accessible roles and labels. IDs below were visible in the application during inspection; keep selectors centralized so changes are easy to update.

```ts
// selectors/auth.selectors.ts
import type { Page } from '@playwright/test';

export const authSelectors = (page: Page) => ({
  username: page.getByRole('textbox', { name: 'Username' }),
  password: page.getByRole('textbox', { name: 'Password' }),
  login: page.getByRole('button', { name: 'Login' }),
  error: page.locator('[data-test="error"]'),
});
```

```ts
// selectors/catalog.selectors.ts
import type { Page } from '@playwright/test';

export const catalogSelectors = (page: Page) => ({
  title: page.getByText('Products', { exact: true }),
  sort: page.getByRole('combobox', { name: 'Sort' }),
  cart: page.getByRole('button', { name: /cart/i }),
  product: (name: string) => page.getByText(name, { exact: true }),
  addProduct: (slug: string) => page.locator(`[data-test="add-to-cart-${slug}"]`),
});
```

```ts
// selectors/cart.selectors.ts
import type { Page } from '@playwright/test';

export const cartSelectors = (page: Page) => ({
  heading: page.getByText('Your Cart', { exact: true }),
  checkout: page.getByRole('button', { name: 'Checkout' }),
  continueShopping: page.getByRole('button', { name: 'Continue Shopping' }),
  item: (name: string) => page.getByText(name, { exact: true }),
  removeBackpack: page.locator('[data-test="remove-sauce-labs-backpack"]'),
});
```

```ts
// selectors/checkout.selectors.ts
import type { Page } from '@playwright/test';

export const checkoutSelectors = (page: Page) => ({
  firstName: page.getByRole('textbox', { name: 'First Name' }),
  lastName: page.getByRole('textbox', { name: 'Last Name' }),
  postalCode: page.getByRole('textbox', { name: 'Zip/Postal Code' }),
  continue: page.getByRole('button', { name: 'Continue' }),
  finish: page.getByRole('button', { name: 'Finish' }),
  confirmation: page.getByRole('heading', { name: 'Thank you for your order!' }),
  backHome: page.getByRole('button', { name: 'Back Home' }),
});
```

Product add/remove IDs use the product's slug as shown in the DOM. For other products, derive and verify the ID from the live page before using it. If a semantic locator is ambiguous, scope it to the product card (for example, a container filtered by product name) instead of relying on element order.

## 5. Gherkin scenarios

```gherkin
# features/auth/login.feature
Feature: Login

  Scenario: A standard user signs in
    Given I am on the Sauce Demo login page
    When I sign in as the standard user
    Then I should see the product catalog

  Scenario: A locked out user cannot sign in
    Given I am on the Sauce Demo login page
    When I sign in as the locked out user
    Then I should see a login error
```

```gherkin
# features/catalog/catalog.feature
Feature: Product catalog

  Background:
    Given I am signed in as the standard user

  Scenario: Add a product to the cart
    When I add the backpack to my cart
    Then the cart should show 1 item

  Scenario: Sort products by price from low to high
    When I sort products by price from low to high
    Then products should be ordered from lowest to highest price
```

```gherkin
# features/checkout/checkout.feature
Feature: Checkout

  Scenario: Complete checkout with one product
    Given I am signed in as the standard user
    And I have the backpack in my cart
    When I enter valid checkout information
    And I review and finish the order
    Then I should see the order confirmation
```

## 6. Playwright fixtures

```ts
// fixtures/test.ts
import { test as base, expect } from '@playwright/test';
import { authSelectors } from '../selectors/auth.selectors';
import { catalogSelectors } from '../selectors/catalog.selectors';
import { cartSelectors } from '../selectors/cart.selectors';
import { checkoutSelectors } from '../selectors/checkout.selectors';

export const test = base.extend<{
  ui: {
    auth: ReturnType<typeof authSelectors>;
    catalog: ReturnType<typeof catalogSelectors>;
    cart: ReturnType<typeof cartSelectors>;
    checkout: ReturnType<typeof checkoutSelectors>;
  };
}>({
  ui: async ({ page }, use) => {
    await use({
      auth: authSelectors(page),
      catalog: catalogSelectors(page),
      cart: cartSelectors(page),
      checkout: checkoutSelectors(page),
    });
  },
});

export { expect };
```

## 7. Example step definitions

```ts
// steps/auth.steps.ts
import { createBdd } from 'playwright-bdd';
import { test, expect } from '../fixtures/test';
import { users } from '../test-data/users';

const { Given, When, Then } = createBdd(test);

Given('I am on the Sauce Demo login page', async ({ page }) => {
  await page.goto('/');
});

When('I sign in as the standard user', async ({ ui }) => {
  await ui.auth.username.fill(users.standard.username);
  await ui.auth.password.fill(users.standard.password);
  await ui.auth.login.click();
});

Given('I am signed in as the standard user', async ({ page, ui }) => {
  await page.goto('/');
  await ui.auth.username.fill(users.standard.username);
  await ui.auth.password.fill(users.standard.password);
  await ui.auth.login.click();
  await expect(ui.catalog.title).toBeVisible();
});

Then('I should see the product catalog', async ({ ui }) => {
  await expect(ui.catalog.title).toBeVisible();
});
```

Example checkout steps should add an item, open the cart, continue to checkout, fill the three fields, verify the overview, finish, and assert the confirmation heading. Keep these steps focused; avoid a single generic step that performs the entire scenario invisibly.

## 8. Playwright BDD configuration

Install `@playwright/test` and `playwright-bdd` using the versions appropriate for the project. `playwright-bdd` generates Playwright tests from `.feature` files; use its current official setup instructions when wiring the CLI scripts.

```ts
// playwright.config.ts
import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const testDir = defineBddConfig({
  features: 'features/**/*.feature',
  steps: 'steps/**/*.ts',
});

export default defineConfig({
  testDir,
  use: {
    baseURL: 'https://www.saucedemo.com',
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
  },
});
```

Consult the current `playwright-bdd` documentation for the matching `bddgen` scripts and run commands because its setup API and CLI may evolve.

## 9. Useful assertions and quality checks

- Login: catalog heading visible after valid login; an accessible error message appears for rejected login.
- Catalog: six product cards appear; selected sort order changes the visible product ordering.
- Cart: item count updates, selected product is present, and removing it empties the cart.
- Checkout: required-field validation appears when information is missing; overview has the expected item and totals.
- Completion: confirmation heading is visible and the cart is empty.
- Reliability: each scenario starts from a known state; do not depend on test order or fixed sleeps. Prefer Playwright's locator auto-waiting and assertions.
- Diagnostics: use descriptive scenario names and capture traces/screenshots on failure.

Use price assertions carefully: totals depend on the selected products and displayed tax calculation. For deterministic checks, select a known product and calculate the expected total from the displayed item subtotal and tax.

## 10. Reference links

- [Sauce Demo](https://www.saucedemo.com/)
- [Playwright BDD configuration](https://github.com/vitalets/playwright-bdd/blob/main/docs/configuration/index.md)
- [Playwright locators](https://playwright.dev/docs/locators)
- [Playwright assertions](https://playwright.dev/docs/test-assertions)

## 11. Run tests in GitHub Actions

The workflow in `.github/workflows/playwright.yml` runs the Playwright suite on pushes and pull requests. After each run, its GitHub Actions summary shows scenario pass/fail counts, pass rate, total run time, and each scenario's duration. The workflow also uploads the interactive HTML report and test results as a downloadable artifact (`playwright-report-and-results`).

The `Publish test history` workflow collects each completed run with a Playwright report and publishes a dashboard containing historical pass rates, scenario counts, and suite durations. To enable it, open the repository's **Settings → Pages**, set the build and deployment source to **GitHub Actions**, and ensure Actions has permission to write repository contents. The history is stored on the `test-metrics-history` branch and includes push and pull-request runs. After its first successful deployment, open the workflow run or **Settings → Pages** to find the dashboard URL.

To run the same checks locally:

```sh
npm ci
npx playwright install chromium
npm test
```
