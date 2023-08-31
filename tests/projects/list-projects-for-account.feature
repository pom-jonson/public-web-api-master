Feature: List projects for account

  Scenario: List projects happy path
    Given that my account id is "founders-editonthespot-com"
    When I send a request to list my projects
    Then I receive 1 or more projects
    And every project has id
    And every clip in every project have file path
