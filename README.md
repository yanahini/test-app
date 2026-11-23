# Sauce Demo: Playwright + Gherkin Test Documentation

**Application:** [Sauce Demo](https://www.saucedemo.com/) (Swag Labs)  
**Purpose:** Reference for building a small end-to-end test suite with Playwright, Gherkin, and `playwright-bdd`.  
**Scope covered:** Login and logout, product catalog and sorting, product details, cart, checkout and order confirmation, and the navigation menu.

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

## 2. Project structure

```text
project/
├── playwright.config.ts
├── features/
│   ├── auth/login.feature
│   ├── catalog/catalog.feature
│   ├── product/product-details.feature
│   ├── cart/cart.feature
│   ├── checkout/checkout.feature
│   └── navigation/menu.feature
├── steps/
│   ├── auth.steps.ts
│   ├── menu.steps.ts
│   ├── catalog.steps.ts
│   ├── product.steps.ts
│   ├── cart.steps.ts
│   └── checkout.steps.ts
├── fixtures/
│   └── test.ts
├── selectors/
│   ├── auth.selectors.ts
│   ├── menu.selectors.ts
│   ├── catalog.selectors.ts
│   ├── product.selectors.ts
│   ├── cart.selectors.ts
│   └── checkout.selectors.ts
├── test-data/
│   ├── users.ts
│   └── checkout.ts
└── package.json
```

Keep Gherkin focused on business behavior. Keep locators in `selectors/`, reusable Playwright setup in `fixtures/`, and non-secret scenario data in `test-data/`. Product names and prices that a scenario checks live in the feature file itself (step arguments and data tables), so the expected behavior is readable in one place.

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
```

## 4. Selector catalog

Prefer accessible roles and labels, then `data-test` attributes. Keep selectors centralized so changes are easy to update; steps use these selectors rather than writing locators inline.

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
// selectors/menu.selectors.ts
import type { Page } from '@playwright/test';

export const menuSelectors = (page: Page) => ({
  open: page.getByRole('button', { name: 'Open Menu' }),
  close: page.getByRole('button', { name: 'Close Menu' }),
  item: (label: string) => page.getByRole('navigation').getByText(label, { exact: true }),
});
```

```ts
// selectors/catalog.selectors.ts
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
```

```ts
// selectors/product.selectors.ts
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
```

```ts
// selectors/cart.selectors.ts
import type { Page } from '@playwright/test';

export const cartSelectors = (page: Page) => ({
  heading: page.getByText('Your Cart', { exact: true }),
  checkout: page.getByRole('button', { name: 'Checkout' }),
  continueShopping: page.getByRole('button', { name: 'Continue Shopping' }),
  item: (name: string) => page.getByText(name, { exact: true }),
  items: page.locator('[data-test="inventory-item"]'),
  itemNames: page.locator('[data-test="inventory-item-name"]'),
  itemQuantities: page.locator('[data-test="item-quantity"]'),
  itemPrices: page.locator('[data-test="inventory-item-price"]'),
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
```

Product buttons are found through the product card that contains the product's name (`productCard`), so steps take any product name without hand-built `data-test` slugs. The catalog and cart pages render product cards with the same markup, so the same locator removes a product from either page.

## 5. Gherkin scenarios

The suite covers 35 scenarios across login, the catalog, product details, the cart, checkout, and the navigation menu. Validation and sorting cases use `Scenario Outline` tables, expected products and prices are written as data tables, and shared setup lives in each feature's `Background`.

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

  Scenario: A logged out user cannot return to the catalog
    Given I am signed in as the standard user
    And I log out
    When I open the inventory page without signing in
    Then I should see the login error "Epic sadface: You can only access '/inventory.html' when you are logged in."

  Scenario: Protected pages require sign in
    When I open the inventory page without signing in
    Then I should see the login error "Epic sadface: You can only access '/inventory.html' when you are logged in."
```

```gherkin
# features/catalog/catalog.feature
Feature: Product catalog

  Background:
    Given I am signed in as the standard user

  Scenario: The catalog lists every product with its price
    Then the catalog should list these products:
      | name                              | price  |
      | Sauce Labs Backpack               | $29.99 |
      | Sauce Labs Bike Light             | $9.99  |
      | Sauce Labs Bolt T-Shirt           | $15.99 |
      | Sauce Labs Fleece Jacket          | $49.99 |
      | Sauce Labs Onesie                 | $7.99  |
      | Test.allTheThings() T-Shirt (Red) | $15.99 |

  Scenario: Products are sorted by name from A to Z by default
    Then the products should be sorted by "Name (A to Z)"

  Scenario Outline: Sort products
    When I sort products by "<order>"
    Then the products should be sorted by "<order>"

    Examples:
      | order               |
      | Name (Z to A)       |
      | Price (low to high) |
      | Price (high to low) |

  Scenario: Add a product to the cart
    When I add "Sauce Labs Backpack" to my cart
    Then the cart should show 1 item

  Scenario: Add several products to the cart
    When I add "Sauce Labs Backpack" to my cart
    And I add "Sauce Labs Bike Light" to my cart
    Then the cart should show 2 items

  Scenario: Remove a product from the catalog
    Given I add "Sauce Labs Backpack" to my cart
    When I remove "Sauce Labs Backpack" from my cart
    Then the cart should be empty
```

```gherkin
# features/product/product-details.feature
Feature: Product details

  Background:
    Given I am signed in as the standard user

  Scenario: Product details match the catalog
    When I open the details of "Sauce Labs Bolt T-Shirt"
    Then I should see the details of "Sauce Labs Bolt T-Shirt" priced "$15.99"

  Scenario: Add a product from its details page
    Given I open the details of "Sauce Labs Fleece Jacket"
    When I add the product to my cart from its details page
    Then the cart should show 1 item
    When I go back to the products
    Then "Sauce Labs Fleece Jacket" should be marked as in my cart

  Scenario: Remove a product from its details page
    Given I add "Sauce Labs Onesie" to my cart
    And I open the details of "Sauce Labs Onesie"
    When I remove the product from my cart on its details page
    Then the cart should be empty

  Scenario: An unknown product shows a not found page
    When I open the product page with id 99
    Then I should see the product not found page
```

```gherkin
# features/cart/cart.feature
Feature: Cart

  Background:
    Given I am signed in as the standard user
    And I add "Sauce Labs Backpack" to my cart
    And I add "Sauce Labs Onesie" to my cart
    And I open my cart

  Scenario: The cart lists each product with its quantity and price
    Then my cart should contain:
      | name                | quantity | price  |
      | Sauce Labs Backpack | 1        | $29.99 |
      | Sauce Labs Onesie   | 1        | $7.99  |

  Scenario: Remove a product from the cart page
    When I remove "Sauce Labs Onesie" from my cart
    Then my cart should contain:
      | name                | quantity | price  |
      | Sauce Labs Backpack | 1        | $29.99 |
    And the cart should show 1 item

  Scenario: Continue shopping keeps the cart
    When I continue shopping
    Then I should see the product catalog
    And the cart should show 2 items
    And "Sauce Labs Onesie" should be marked as in my cart

  Scenario: The cart is kept after reloading the page
    When I reload the page
    Then the cart should show 2 items
    And my cart should contain:
      | name                | quantity | price  |
      | Sauce Labs Backpack | 1        | $29.99 |
      | Sauce Labs Onesie   | 1        | $7.99  |
```

```gherkin
# features/checkout/checkout.feature
Feature: Checkout

  Background:
    Given I am signed in as the standard user
    And I add "Sauce Labs Backpack" to my cart

  Scenario: Complete checkout with one product
    Given I open my cart
    When I enter valid checkout information
    Then the order total should equal the item total plus tax
    When I finish the order
    Then I should see the order confirmation
    And the cart should be empty

  Scenario: The overview summarises a multi-product order
    Given I add "Sauce Labs Bike Light" to my cart
    And I open my cart
    When I enter valid checkout information
    Then the order overview should list:
      | name                  | price  |
      | Sauce Labs Backpack   | $29.99 |
      | Sauce Labs Bike Light | $9.99  |
    And the item total should be "$39.98"
    And the tax should be 8% of the item total
    And the order total should equal the item total plus tax
    And the payment information should be "SauceCard #31337"
    And the shipping information should be "Free Pony Express Delivery!"

  Scenario: Back Home returns to the catalog after an order
    Given I open my cart
    And I enter valid checkout information
    And I finish the order
    When I go back home
    Then I should see the product catalog
    And the cart should be empty

  Scenario: Cancelling on the information step returns to the cart
    Given I open my cart
    And I start checkout
    When I cancel checkout
    Then I should see my cart
    And my cart should contain:
      | name                | quantity | price  |
      | Sauce Labs Backpack | 1        | $29.99 |

  Scenario: Cancelling on the overview returns to the catalog and keeps the cart
    Given I open my cart
    And I enter valid checkout information
    When I cancel checkout
    Then I should see the product catalog
    And the cart should show 1 item

  Scenario Outline: Checkout requires customer information
    Given I open my cart
    When I start checkout
    And I continue with first name "<firstName>", last name "<lastName>" and postal code "<postalCode>"
    Then I should see the checkout error "<error>"

    Examples:
      | firstName | lastName | postalCode | error                          |
      |           | User     | 75001      | Error: First Name is required  |
      | Test      |          | 75001      | Error: Last Name is required   |
      | Test      | User     |            | Error: Postal Code is required |
```

```gherkin
# features/navigation/menu.feature
Feature: Navigation menu

  Background:
    Given I am signed in as the standard user

  Scenario: All Items returns to the catalog
    Given I add "Sauce Labs Backpack" to my cart
    And I open my cart
    When I choose "All Items" from the menu
    Then I should see the product catalog
    And the cart should show 1 item

  Scenario: Reset App State empties the cart
    Given I add "Sauce Labs Backpack" to my cart
    And I add "Sauce Labs Bike Light" to my cart
    When I reset the app state
    Then the cart should be empty
    When I open my cart
    Then my cart should have no items

  Scenario: The About link points to Sauce Labs
    When I open the menu
    Then the "About" menu link should point to "https://saucelabs.com/"
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
import { menuSelectors } from '../selectors/menu.selectors';
import { productSelectors } from '../selectors/product.selectors';
import type { User } from '../test-data/users';

type Ui = {
  auth: ReturnType<typeof authSelectors>;
  menu: ReturnType<typeof menuSelectors>;
  catalog: ReturnType<typeof catalogSelectors>;
  product: ReturnType<typeof productSelectors>;
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
      menu: menuSelectors(page),
      catalog: catalogSelectors(page),
      product: productSelectors(page),
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

Then('I should be on the login page', async ({ page, ui }) => {
  await expect(page).toHaveURL(/saucedemo\.com\/$/);
  await expect(ui.auth.login).toBeVisible();
});

When('I open the inventory page without signing in', async ({ page }) => {
  await page.goto('/inventory.html');
});
```

```ts
// steps/menu.steps.ts
import { createBdd } from 'playwright-bdd';
import { expect, test } from '../fixtures/test';

const { When, Then } = createBdd(test);

When('I open the menu', async ({ ui }) => {
  await ui.menu.open.click();
  await expect(ui.menu.item('All Items')).toBeVisible();
});

When('I choose {string} from the menu', async ({ ui }, label: string) => {
  await ui.menu.open.click();
  await ui.menu.item(label).click();
});

When('I log out', async ({ ui }) => {
  await ui.menu.open.click();
  await ui.menu.item('Logout').click();
});

When('I reset the app state', async ({ ui }) => {
  await ui.menu.open.click();
  await ui.menu.item('Reset App State').click();
  await ui.menu.close.click();
});

Then('the {string} menu link should point to {string}', async ({ ui }, label: string, url: string) => {
  await expect(ui.menu.item(label)).toHaveAttribute('href', url);
});
```

```ts
// steps/catalog.steps.ts
import { createBdd, type DataTable } from 'playwright-bdd';
import { expect, test } from '../fixtures/test';

const { Given, When, Then } = createBdd(test);

const toPrice = (text: string) => Number.parseFloat(text.replace(/[^0-9.]/g, ''));

type Product = { name: string; price: number };
const sortOrders: Record<string, (a: Product, b: Product) => number> = {
  'Name (A to Z)': (a, b) => a.name.localeCompare(b.name),
  'Name (Z to A)': (a, b) => b.name.localeCompare(a.name),
  'Price (low to high)': (a, b) => a.price - b.price,
  'Price (high to low)': (a, b) => b.price - a.price,
};

Then('the catalog should list these products:', async ({ ui }, table: DataTable) => {
  const names = await ui.catalog.itemNames.allTextContents();
  const prices = await ui.catalog.itemPrices.allTextContents();
  expect(names.map((name, index) => ({ name, price: prices[index] }))).toEqual(table.hashes());
});

Given('I add {string} to my cart', async ({ ui }, name: string) => {
  await ui.catalog.addProduct(name).click();
  await expect(ui.catalog.removeProduct(name)).toBeVisible();
});

When('I remove {string} from my cart', async ({ ui }, name: string) => {
  // Product cards share the same markup on the catalog and cart pages.
  await ui.catalog.removeProduct(name).click();
  await expect(ui.catalog.removeProduct(name)).toHaveCount(0);
});

Then('{string} should be marked as in my cart', async ({ ui }, name: string) => {
  await expect(ui.catalog.removeProduct(name)).toBeVisible();
});

Then(/^the cart should show (\d+) items?$/, async ({ ui }, count: number) => {
  await expect(ui.catalog.cartBadge).toHaveText(String(count));
});

Then('the cart should be empty', async ({ ui }) => {
  await expect(ui.catalog.cartBadge).toHaveCount(0);
});

When('I sort products by {string}', async ({ ui }, order: string) => {
  await ui.catalog.sort.selectOption({ label: order });
});

Then('the products should be sorted by {string}', async ({ ui }, order: string) => {
  const compare = sortOrders[order];
  if (!compare) throw new Error(`Unknown sort order "${order}"`);

  await expect(ui.catalog.activeSort).toHaveText(order);
  const names = await ui.catalog.itemNames.allTextContents();
  const prices = (await ui.catalog.itemPrices.allTextContents()).map(toPrice);
  const products = names.map((name, index) => ({ name, price: prices[index] }));

  expect(products).toHaveLength(6);
  expect(products).toEqual([...products].sort(compare));
});
```

```ts
// steps/product.steps.ts
import { createBdd } from 'playwright-bdd';
import { expect, test } from '../fixtures/test';

const { Given, When, Then } = createBdd(test);

Given('I open the details of {string}', async ({ page, ui }, name: string) => {
  await ui.catalog.product(name).click();
  await expect(page).toHaveURL(/\/inventory-item\.html\?id=\d+$/);
  // The URL changes before the details page renders, so wait for a details-only element.
  await expect(ui.product.backToProducts).toBeVisible();
  await expect(ui.product.name).toHaveText(name);
});

Then('I should see the details of {string} priced {string}', async ({ ui }, name: string, price: string) => {
  await expect(ui.product.name).toHaveText(name);
  await expect(ui.product.price).toHaveText(price);
  await expect(ui.product.description).not.toBeEmpty();
  await expect(ui.product.image).toBeVisible();
  await expect(ui.product.addToCart).toBeVisible();
});

When('I add the product to my cart from its details page', async ({ ui }) => {
  await ui.product.addToCart.click();
  await expect(ui.product.remove).toBeVisible();
});

When('I remove the product from my cart on its details page', async ({ ui }) => {
  await ui.product.remove.click();
  await expect(ui.product.addToCart).toBeVisible();
});

When('I go back to the products', async ({ ui }) => {
  await ui.product.backToProducts.click();
  await expect(ui.catalog.title).toBeVisible();
});

When('I open the product page with id {int}', async ({ page, ui }, id: number) => {
  await page.goto(`/inventory-item.html?id=${id}`);
  await expect(ui.product.backToProducts).toBeVisible();
});

Then('I should see the product not found page', async ({ ui }) => {
  await expect(ui.product.name).toHaveText('ITEM NOT FOUND');
});
```

```ts
// steps/cart.steps.ts
import { createBdd, type DataTable } from 'playwright-bdd';
import { expect, test } from '../fixtures/test';

const { Given, When, Then } = createBdd(test);

Given('I open my cart', async ({ ui }) => {
  await ui.catalog.cart.click();
  await expect(ui.cart.heading).toBeVisible();
});

Then('I should see my cart', async ({ page, ui }) => {
  await expect(page).toHaveURL(/\/cart\.html$/);
  await expect(ui.cart.heading).toBeVisible();
});

Then('my cart should contain:', async ({ ui }, table: DataTable) => {
  await expect(ui.cart.items).toHaveCount(table.hashes().length);
  const names = await ui.cart.itemNames.allTextContents();
  const quantities = await ui.cart.itemQuantities.allTextContents();
  const prices = await ui.cart.itemPrices.allTextContents();
  const rows = names.map((name, index) => ({ name, quantity: quantities[index], price: prices[index] }));
  expect(rows).toEqual(table.hashes());
});

Then('my cart should have no items', async ({ ui }) => {
  await expect(ui.cart.items).toHaveCount(0);
});

When('I continue shopping', async ({ ui }) => {
  await ui.cart.continueShopping.click();
});

When('I reload the page', async ({ page }) => {
  await page.reload();
});
```

```ts
// steps/checkout.steps.ts
import { createBdd, type DataTable } from 'playwright-bdd';
import { expect, test } from '../fixtures/test';
import { checkoutInfo } from '../test-data/checkout';

const { When, Then } = createBdd(test);

const toAmount = (text: string | null) => Number.parseFloat((text ?? '').replace(/[^0-9.]/g, ''));

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
});

When('I cancel checkout', async ({ ui }) => {
  await ui.checkout.cancel.click();
});

Then('the order overview should list:', async ({ ui }, table: DataTable) => {
  const names = await ui.checkout.itemNames.allTextContents();
  const prices = await ui.checkout.itemPrices.allTextContents();
  expect(names.map((name, index) => ({ name, price: prices[index] }))).toEqual(table.hashes());
});

Then('the item total should be {string}', async ({ ui }, amount: string) => {
  await expect(ui.checkout.itemTotal).toHaveText(`Item total: ${amount}`);
});

Then('the tax should be 8% of the item total', async ({ ui }) => {
  const itemTotal = toAmount(await ui.checkout.itemTotal.textContent());
  const tax = toAmount(await ui.checkout.tax.textContent());
  expect(tax).toBeCloseTo(itemTotal * 0.08, 2);
});

Then('the order total should equal the item total plus tax', async ({ ui }) => {
  const itemTotal = toAmount(await ui.checkout.itemTotal.textContent());
  const tax = toAmount(await ui.checkout.tax.textContent());
  const total = toAmount(await ui.checkout.total.textContent());

  expect(itemTotal).toBeGreaterThan(0);
  expect(total).toBeCloseTo(itemTotal + tax, 2);
});

Then('the payment information should be {string}', async ({ ui }, value: string) => {
  await expect(ui.checkout.paymentInfo).toHaveText(value);
});

Then('the shipping information should be {string}', async ({ ui }, value: string) => {
  await expect(ui.checkout.shippingInfo).toHaveText(value);
});

When('I finish the order', async ({ ui }) => {
  await ui.checkout.finish.click();
});

When('I go back home', async ({ ui }) => {
  await ui.checkout.backHome.click();
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

Keep steps focused; avoid a single generic step that performs the entire scenario invisibly. Steps that change state (adding or removing a product, opening a page) wait for the visible result, and assertions compare exact text, URLs, and full lists so a failure shows what actually differed.

Two Sauce Demo behaviors to keep in mind:

- Opening a product changes the URL before the details page renders, so the step waits for a details-only element (**Back to products**) before reading the product name.
- **Reset App State** clears the cart badge but can leave **Remove** buttons on screen until the page re-renders, so the scenario checks the badge and the cart page rather than the catalog buttons.

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

The `Publish test history` workflow collects each completed run with a Playwright report and publishes a QA quality dashboard (`scripts/dashboard.html`). It can be filtered by branch and by the last 10, last 30, or all runs, and shows:

- **Key metrics:** green-run rate, test pass rate, flaky rate, median suite duration, suite size, and mean time to restore a red build, each compared with the previous window of the same size.
- **Trends:** scenario outcomes (passed, flaky, failed, skipped), pass rate, and suite duration per run.
- **Feature health:** pass rate, failures, flaky runs, and average scenario time for each feature, with a Healthy / Watch / At risk status.
- **Scenario risks:** the scenarios failing most often, flaky scenarios, the slowest scenarios (average and p95), and the most common failure messages.
- **Run history:** every run with its branch, commit, result, counts, and duration.

Scenario-level detail is stored in `history.json` for each run from this version onward; earlier runs only have suite totals. To enable it, open the repository's **Settings → Pages**, set the build and deployment source to **GitHub Actions**, and ensure Actions has permission to write repository contents. The history is stored on the `test-metrics-history` branch and includes push and pull-request runs. After its first successful deployment, open the workflow run or **Settings → Pages** to find the dashboard URL.

To run the same checks locally:

```sh
npm ci
npx playwright install chromium
npm test
```
