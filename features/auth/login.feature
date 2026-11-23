Feature: Login

  Scenario: A standard user signs in
    Given I am on the Sauce Demo login page
    When I sign in as the standard user
    Then I should see the product catalog

  Scenario: A locked out user cannot sign in
    Given I am on the Sauce Demo login page
    When I sign in as the locked out user
    Then I should see the login error "Epic sadface: Sorry, this user has been locked out."

  Scenario Outline: Sign in is rejected for invalid credentials
    Given I am on the Sauce Demo login page
    When I sign in with username "<username>" and password "<password>"
    Then I should see the login error "<error>"

    Examples:
      | username      | password       | error                                                                     |
      | standard_user | wrong_password | Epic sadface: Username and password do not match any user in this service |
      |               | secret_sauce   | Epic sadface: Username is required                                        |
      | standard_user |                | Epic sadface: Password is required                                        |

  Scenario: A signed in user can log out
    Given I am signed in as the standard user
    When I log out
    Then I should be on the login page

  Scenario: A logged out user cannot return to the catalog
    Given I am signed in as the standard user
    And I log out
    When I open the inventory page without signing in
    Then I should see the login error "Epic sadface: You can only access '/inventory.html' when you are logged in."

  Scenario: Protected pages require sign in
    When I open the inventory page without signing in
    Then I should see the login error "Epic sadface: You can only access '/inventory.html' when you are logged in."
