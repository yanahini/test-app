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
