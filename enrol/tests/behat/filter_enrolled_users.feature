@core_enrol @core_group
Feature: Enrolled users can be filtered by group
  In order to filter the list of enrolled users
  As a teacher
  I need to visit the enrolled users page and select a group to filter by

  Background:
    Given the following "courses" exist:
      | fullname | shortname |
      | Course 1 | C1        |
      | Course 2 | C2        |
    And the following "users" exist:
      | username | firstname | lastname |
      | student1 | Student   | 1        |
      | student2 | Student   | 2        |
      | student3 | Student   | 3        |
      | teacher1 | Teacher   | 1        |
    And the following "course enrolments" exist:
      | user     | course | role           |
      | student1 | C1     | student        |
      | student2 | C1     | student        |
      | student3 | C1     | student        |
      | student1 | C2     | student        |
      | student2 | C2     | student        |
      | student3 | C2     | student        |
      | teacher1 | C1     | editingteacher |
      | teacher1 | C2     | editingteacher |
    And the following "groups" exist:
      | name    | course | idnumber |
      | Group 1 | C1     | G1       |
      | Group 2 | C1     | G2       |
      | Group 3 | C2     | G3       |
    And the following "group members" exist:
      | user     | group |
      | student2 | G1    |
      | student2 | G2    |
      | student3 | G2    |
      | student1 | G3    |
    And I log in as "teacher1"
    And I follow "Course 1"
    And I navigate to "Enrolled users" node in "Course administration > Users"

  Scenario: Viewing all participants
    When I set the field "Group" to "All participants"
    And I press "Filter"
    Then I should see "Student 1"
    And I should see "Student 2"
    And I should see "Student 3"

  Scenario: Viewing users with no group.
    When I set the field "Group" to "No group"
    And I press "Filter"
    Then I should see "Student 1"
    And I should not see "Student 2"
    And I should not see "Student 3"

  Scenario: Viewing users in Group 1.
    When I set the field "Group" to "Group 1"
    And I press "Filter"
    Then I should not see "Student 1"
    And I should see "Student 2"
    And I should not see "Student 3"

  Scenario: Viewing users in Group 2.
    When I set the field "Group" to "Group 2"
    And I press "Filter"
    Then I should not see "Student 1"
    And I should see "Student 2"
    And I should see "Student 3"
