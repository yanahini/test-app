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
