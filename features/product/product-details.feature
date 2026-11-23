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
