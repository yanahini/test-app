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
