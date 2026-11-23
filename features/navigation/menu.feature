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
