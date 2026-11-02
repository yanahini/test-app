Feature: Login

  Scenario: A standard user signs in
    Given I am on the Sauce Demo login page
    When I sign in as the standard user
    Then I should see the product catalog

  Scenario: A locked out user cannot sign in
    Given I am on the Sauce Demo login page
    When I sign in as the locked out user
    Then I should see a login error
