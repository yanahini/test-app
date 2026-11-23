Feature: Product catalog

  Background:
    Given I am signed in as the standard user

  @REQ-003 @RISK-005 @risk-medium
  Scenario: The catalog lists every product with its price
    Then the catalog should list these products:
      | name                              | price  |
      | Sauce Labs Backpack               | $29.99 |
      | Sauce Labs Bike Light             | $9.99  |
      | Sauce Labs Bolt T-Shirt           | $15.99 |
      | Sauce Labs Fleece Jacket          | $49.99 |
      | Sauce Labs Onesie                 | $7.99  |
      | Test.allTheThings() T-Shirt (Red) | $15.99 |

  @REQ-004 @risk-low
  Scenario: Products are sorted by name from A to Z by default
    Then the products should be sorted by "Name (A to Z)"

  @REQ-004 @risk-low
  Scenario Outline: Sort products
    When I sort products by "<order>"
    Then the products should be sorted by "<order>"

    Examples:
      | order               |
      | Name (Z to A)       |
      | Price (low to high) |
      | Price (high to low) |

  @REQ-005 @RISK-003 @risk-medium
  Scenario: Add a product to the cart
    When I add "Sauce Labs Backpack" to my cart
    Then the cart should show 1 item

  @REQ-005 @RISK-003 @risk-medium
  Scenario: Add several products to the cart
    When I add "Sauce Labs Backpack" to my cart
    And I add "Sauce Labs Bike Light" to my cart
    Then the cart should show 2 items

  @REQ-005 @RISK-003 @risk-medium
  Scenario: Remove a product from the catalog
    Given I add "Sauce Labs Backpack" to my cart
    When I remove "Sauce Labs Backpack" from my cart
    Then the cart should be empty
