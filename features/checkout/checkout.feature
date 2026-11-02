Feature: Checkout

  Scenario: Complete checkout with one product
    Given I am signed in as the standard user
    And I have the backpack in my cart
    When I enter valid checkout information
    And I review and finish the order
    Then I should see the order confirmation
