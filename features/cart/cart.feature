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
