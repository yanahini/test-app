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

export type User = (typeof users)[keyof typeof users];
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
  backpack: { name: 'Sauce Labs Backpack', slug: 'sauce-labs-backpack' },
  bikeLight: { name: 'Sauce Labs Bike Light', slug: 'sauce-labs-bike-light' },
};
```

Each product keeps its display name and the slug used in its add/remove `data-test` IDs together, so steps never hardcode either.

## 4. Selector catalog

Prefer accessible roles and labels. IDs below were visible in the application during inspection; keep selectors centralized so changes are easy to update. Steps should use these selectors rather than writing locators inline.

```ts
// selectors/auth.selectors.ts
import type { Page } from '@playwright/test';

export const authSelectors = (page: Page) => ({
  username: page.getByRole('textbox', { name: 'Username' }),
  password: page.getByRole('textbox', { name: 'Password' }),
  login: page.getByRole('button', { name: 'Login' }),
  error: page.locator('[data-test="error"]'),
  menu: page.getByRole('button', { name: 'Open Menu' }),
  logout: page.locator('[data-test="logout-sidebar-link"]'),
});
```

```ts
// selectors/catalog.selectors.ts
import type { Page } from '@playwright/test';

export const catalogSelectors = (page: Page) => ({
  title: page.getByText('Products', { exact: true }),
  sort: page.locator('[data-test="product-sort-container"]'),
  cart: page.locator('.shopping_cart_link'),
  cartBadge: page.locator('.shopping_cart_badge'),
  product: (name: string) => page.getByText(name, { exact: true }),
  addProduct: (slug: string) => page.locator(`[data-test="add-to-cart-${slug}"]`),
  removeProduct: (slug: string) => page.locator(`[data-test="remove-${slug}"]`),
  items: page.locator('.inventory_item'),
  itemPrices: page.locator('.inventory_item_price'),
  itemNames: page.locator('.inventory_item_name'),
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
  items: page.locator('.cart_item'),
  removeBackpack: page.locator('[data-test="remove-sauce-labs-backpack"]'),
  quantity: page.locator('.cart_quantity'),
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
  overview: page.getByText('Checkout: Overview', { exact: true }),
  summary: page.getByText('Checkout: Your Information', { exact: true }),
  error: page.locator('[data-test="error"]'),
  itemTotal: page.locator('.summary_subtotal_label'),
  tax: page.locator('.summary_tax_label'),
  total: page.locator('.summary_total_label'),
});
```

Product add/remove IDs use the product's slug as shown in the DOM. For other products, derive and verify the ID from the live page before using it. If a semantic locator is ambiguous, scope it to the product card (for example, a container filtered by product name) instead of relying on element order.

## 5. Gherkin scenarios

The suite covers 18 scenarios. Validation cases use `Scenario Outline` tables so each error message is checked exactly, and checkout scenarios share their setup through a `Background`.

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
    Then I should see the login error "Epic sadface: Sorry, this user has been locked out."

  Scenario Outline: Sign in is rejected for invalid credentials
    Given I am on the Sauce Demo login page
    When I sign in with username "<username>" and password "<password>"
    Then I should see the login error "<error>"

    Examples:
      | username      | password       | error                                                                     |
      | standard_user | wrong_password | Epic sadface: Username and password do not match any user in this service |
      |               | secret_sauce   | Epic sadface: Username is required                                        |
      | standard_user |                | Epic sadface: Password is required                                        |

  Scenario: A signed in user can log out
    Given I am signed in as the standard user
    When I log out
    Then I should be on the login page

  Scenario: Protected pages require sign in
    When I open the inventory page without signing in
    Then I should see the login error "Epic sadface: You can only access '/inventory.html' when you are logged in."
```

```gherkin
# features/catalog/catalog.feature
Feature: Product catalog

  Background:
    Given I am signed in as the standard user

  Scenario: The catalog lists all products
    Then I should see 6 products

  Scenario: Add a product to the cart
    When I add the backpack to my cart
    Then the cart should show 1 item

  Scenario: Add several products to the cart
    When I add the backpack to my cart
    And I add the bike light to my cart
    Then the cart should show 2 items

  Scenario: Remove a product from the cart
    Given I add the backpack to my cart
    When I remove the backpack from my cart
    Then the cart should be empty

  Scenario: Sort products by price from low to high
    When I sort products by price from low to high
    Then products should be ordered from lowest to highest price

  Scenario: Sort products by price from high to low
    When I sort products by price from high to low
    Then products should be ordered from highest to lowest price

  Scenario: Sort products by name from Z to A
    When I sort products by name from Z to A
    Then products should be ordered by name from Z to A
```

```gherkin
# features/checkout/checkout.feature
Feature: Checkout

  Background:
    Given I am signed in as the standard user
    And I have the backpack in my cart

  Scenario: Complete checkout with one product
    When I enter valid checkout information
    Then the order total should equal the item total plus tax
    When I finish the order
    Then I should see the order confirmation
    And the cart should be empty

  Scenario Outline: Checkout requires customer information
    When I start checkout
    And I continue with first name "<firstName>", last name "<lastName>" and postal code "<postalCode>"
    Then I should see the checkout error "<error>"

    Examples:
      | firstName | lastName | postalCode | error                          |
      |           | User     | 75001      | Error: First Name is required  |
      | Test      |          | 75001      | Error: Last Name is required   |
      | Test      | User     |            | Error: Postal Code is required |
```

## 6. Playwright fixtures

The `ui` fixture exposes every selector group, and the `signIn` fixture fills and submits the login form so no step repeats that sequence.

```ts
// fixtures/test.ts
import { expect } from '@playwright/test';
import { test as base } from 'playwright-bdd';
import { authSelectors } from '../selectors/auth.selectors';
import { catalogSelectors } from '../selectors/catalog.selectors';
import { cartSelectors } from '../selectors/cart.selectors';
import { checkoutSelectors } from '../selectors/checkout.selectors';
import type { User } from '../test-data/users';

type Ui = {
  auth: ReturnType<typeof authSelectors>;
  catalog: ReturnType<typeof catalogSelectors>;
  cart: ReturnType<typeof cartSelectors>;
  checkout: ReturnType<typeof checkoutSelectors>;
};

export const test = base.extend<{
  ui: Ui;
  signIn: (user: User) => Promise<void>;
}>({
  ui: async ({ page }, use) => {
    await use({
      auth: authSelectors(page),
      catalog: catalogSelectors(page),
      cart: cartSelectors(page),
      checkout: checkoutSelectors(page),
    });
  },
  signIn: async ({ ui }, use) => {
    await use(async ({ username, password }) => {
      await ui.auth.username.fill(username);
      await ui.auth.password.fill(password);
      await ui.auth.login.click();
    });
  },
});

export { expect };
```

## 7. Step definitions

```ts
// steps/auth.steps.ts
import { createBdd } from 'playwright-bdd';
import { expect, test } from '../fixtures/test';
import { users } from '../test-data/users';

const { Given, When, Then } = createBdd(test);

Given('I am on the Sauce Demo login page', async ({ page }) => {
  await page.goto('/');
});

When('I sign in as the standard user', async ({ signIn }) => {
  await signIn(users.standard);
});

When('I sign in as the locked out user', async ({ signIn }) => {
  await signIn(users.lockedOut);
});

When('I sign in with username {string} and password {string}', async ({ signIn }, username: string, password: string) => {
  await signIn({ username, password });
});

Then('I should see the product catalog', async ({ page, ui }) => {
  await expect(page).toHaveURL(/\/inventory\.html$/);
  await expect(ui.catalog.title).toBeVisible();
});

Then('I should see the login error {string}', async ({ page, ui }, message: string) => {
  await expect(ui.auth.error).toHaveText(message);
  await expect(page).not.toHaveURL(/\/inventory\.html$/);
});

Given('I am signed in as the standard user', async ({ page, ui, signIn }) => {
  await page.goto('/');
  await signIn(users.standard);
  await expect(ui.catalog.title).toBeVisible();
});

When('I log out', async ({ ui }) => {
  await ui.auth.menu.click();
  await ui.auth.logout.click();
});

Then('I should be on the login page', async ({ page, ui }) => {
  await expect(page).toHaveURL(/saucedemo\.com\/$/);
  await expect(ui.auth.login).toBeVisible();
});

When('I open the inventory page without signing in', async ({ page }) => {
  await page.goto('/inventory.html');
});
```

```ts
// steps/catalog.steps.ts
import { createBdd } from 'playwright-bdd';
import { expect, test } from '../fixtures/test';
import { products } from '../test-data/checkout';

const { When, Then } = createBdd(test);

const toPrice = (text: string) => Number.parseFloat(text.replace(/[^0-9.]/g, ''));

Then('I should see {int} products', async ({ ui }, count: number) => {
  await expect(ui.catalog.items).toHaveCount(count);
});

When('I add the backpack to my cart', async ({ ui }) => {
  await ui.catalog.addProduct(products.backpack.slug).click();
  await expect(ui.catalog.removeProduct(products.backpack.slug)).toBeVisible();
});

When('I add the bike light to my cart', async ({ ui }) => {
  await ui.catalog.addProduct(products.bikeLight.slug).click();
  await expect(ui.catalog.removeProduct(products.bikeLight.slug)).toBeVisible();
});

When('I remove the backpack from my cart', async ({ ui }) => {
  await ui.catalog.removeProduct(products.backpack.slug).click();
  await expect(ui.catalog.addProduct(products.backpack.slug)).toBeVisible();
});

Then(/^the cart should show (\d+) items?$/, async ({ ui }, count: number) => {
  await expect(ui.catalog.cartBadge).toHaveText(String(count));
});

Then('the cart should be empty', async ({ ui }) => {
  await expect(ui.catalog.cartBadge).toHaveCount(0);
});

When('I sort products by price from low to high', async ({ ui }) => {
  await ui.catalog.sort.selectOption('lohi');
});

When('I sort products by price from high to low', async ({ ui }) => {
  await ui.catalog.sort.selectOption('hilo');
});

When('I sort products by name from Z to A', async ({ ui }) => {
  await ui.catalog.sort.selectOption('za');
});

Then('products should be ordered from lowest to highest price', async ({ ui }) => {
  const prices = (await ui.catalog.itemPrices.allTextContents()).map(toPrice);
  expect(prices).toHaveLength(6);
  expect(prices).toEqual([...prices].sort((a, b) => a - b));
});

Then('products should be ordered from highest to lowest price', async ({ ui }) => {
  const prices = (await ui.catalog.itemPrices.allTextContents()).map(toPrice);
  expect(prices).toHaveLength(6);
  expect(prices).toEqual([...prices].sort((a, b) => b - a));
});

Then('products should be ordered by name from Z to A', async ({ ui }) => {
  const names = await ui.catalog.itemNames.allTextContents();
  expect(names).toHaveLength(6);
  expect(names).toEqual([...names].sort((a, b) => b.localeCompare(a)));
});
```

```ts
// steps/checkout.steps.ts
import { createBdd } from 'playwright-bdd';
import { expect, test } from '../fixtures/test';
import { checkoutInfo, products } from '../test-data/checkout';

const { Given, When, Then } = createBdd(test);

const toAmount = (text: string | null) => Number.parseFloat((text ?? '').replace(/[^0-9.]/g, ''));

Given('I have the backpack in my cart', async ({ ui }) => {
  await ui.catalog.addProduct(products.backpack.slug).click();
  await ui.catalog.cart.click();
  await expect(ui.cart.heading).toBeVisible();
  await expect(ui.cart.items).toHaveCount(1);
  await expect(ui.cart.item(products.backpack.name)).toBeVisible();
});

When('I start checkout', async ({ ui }) => {
  await ui.cart.checkout.click();
  await expect(ui.checkout.summary).toBeVisible();
});

When(
  'I continue with first name {string}, last name {string} and postal code {string}',
  async ({ ui }, firstName: string, lastName: string, postalCode: string) => {
    await ui.checkout.firstName.fill(firstName);
    await ui.checkout.lastName.fill(lastName);
    await ui.checkout.postalCode.fill(postalCode);
    await ui.checkout.continue.click();
  },
);

When('I enter valid checkout information', async ({ ui }) => {
  await ui.cart.checkout.click();
  await expect(ui.checkout.summary).toBeVisible();
  await ui.checkout.firstName.fill(checkoutInfo.firstName);
  await ui.checkout.lastName.fill(checkoutInfo.lastName);
  await ui.checkout.postalCode.fill(checkoutInfo.postalCode);
  await ui.checkout.continue.click();
  await expect(ui.checkout.overview).toBeVisible();
  await expect(ui.cart.item(products.backpack.name)).toBeVisible();
});

Then('the order total should equal the item total plus tax', async ({ ui }) => {
  const itemTotal = toAmount(await ui.checkout.itemTotal.textContent());
  const tax = toAmount(await ui.checkout.tax.textContent());
  const total = toAmount(await ui.checkout.total.textContent());

  expect(itemTotal).toBeGreaterThan(0);
  expect(total).toBeCloseTo(itemTotal + tax, 2);
});

When('I finish the order', async ({ ui }) => {
  await ui.checkout.finish.click();
});

Then('I should see the order confirmation', async ({ page, ui }) => {
  await expect(page).toHaveURL(/\/checkout-complete\.html$/);
  await expect(ui.checkout.confirmation).toBeVisible();
});

Then('I should see the checkout error {string}', async ({ page, ui }, message: string) => {
  await expect(ui.checkout.error).toHaveText(message);
  await expect(page).toHaveURL(/\/checkout-step-one\.html$/);
});
```

Keep steps focused; avoid a single generic step that performs the entire scenario invisibly. Steps that change state (adding or removing a product, opening a page) wait for the visible result, and assertions compare exact text, URLs, and full sort orders so a failure shows what actually differed.

## 8. Playwright BDD configuration

Install `@playwright/test` and `playwright-bdd` using the versions appropriate for the project. `playwright-bdd` generates Playwright tests from `.feature` files; `npm test` runs `bddgen` and then `playwright test`.

```ts
// playwright.config.ts
import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const testDir = defineBddConfig({
  features: 'features/**/*.feature',
  steps: ['steps/**/*.ts', 'fixtures/**/*.ts'],
});

export default defineConfig({
  testDir,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'test-results/results.json' }],
  ],
  reportSlowTests: null,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
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
```

On CI, each failed test is retried once so `trace: 'on-first-retry'` captures a trace, and `forbidOnly` fails the run if a `test.only` was committed by mistake.

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
