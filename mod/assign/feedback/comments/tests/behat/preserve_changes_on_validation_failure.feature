@mod @mod_assign @assignfeedback @assignfeedback_comments
Feature: Check that any changes to assignment feedback comments are not lost
  if the grading form validation fails due to an invalid grade.
  In order to ensure that the feedback changes are not lost
  As a teacher
  I need to grade a student and ensure that all feedback changes are preserved

  @javascript
  Scenario: Update the grade and feedback for an assignment
    Given the following "courses" exist:
      | fullname | shortname | category | groupmode |
      | Course 1 | C1 | 0 | 1 |
    And the following "users" exist:
      | username | firstname | lastname | email |
      | teacher1 | Teacher | 1 | teacher1@example.com |
      | student1 | Student | 1 | student1@example.com |
    And the following "course enrolments" exist:
      | user | course | role |
      | teacher1 | C1 | editingteacher |
      | student1 | C1 | student |
    And the following "groups" exist:
      | name | course | idnumber |
      | Group 1 | C1 | G1 |
    And I log in as "teacher1"
    And I am on "Course 1" course homepage with editing mode on
    And I add a "Assignment" to section "1" and I fill the form with:
      | Assignment name | Test assignment name |
      | Description | Test assignment description |
      | Use marking workflow | Yes |
    When I follow "Test assignment name"
    Then I navigate to "View all submissions" in current page administration
    And I click on "Grade" "link" in the "Student 1" "table_row"
    And I set the field "Grade out of 100" to "101"
    And I set the field "Feedback comments" to "Feedback from teacher."
    And I press "Save changes"
    And I should see "Grade must be less than or equal to 100."
    And I should see "Feedback from teacher."
