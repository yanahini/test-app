Feature: Product catalog

  Background:
    Given I am signed in as the standard user

  Scenario: Add a product to the cart
    When I add the backpack to my cart
    Then the cart should show 1 item

  Scenario: Sort products by price from low to high
    When I sort products by price from low to high
    Then products should be ordered from lowest to highest price
