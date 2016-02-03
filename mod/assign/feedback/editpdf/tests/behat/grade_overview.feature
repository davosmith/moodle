@mod @mod_assign @assignfeedback @assignfeedback_editpdf @_file_upload @javascript
Feature: In an assignment, a teacher can annotate PDF files from the grading overview
  In order to provide visual report on a graded PDF
  As a teacher
  I need to use the PDF editor

  Background:
    Given ghostscript is installed
    And the following "courses" exist:
      | fullname | shortname | category | groupmode |
      | Course 1 | C1        | 0        | 1         |
    And the following "users" exist:
      | username | firstname | lastname | email                |
      | teacher1 | Teacher   | 1        | teacher1@example.com |
      | student1 | Student   | 1        | student1@example.com |
      | student2 | Student   | 2        | student2@example.com |
      | student3 | Student   | 3        | student3@example.com |
    And the following "course enrolments" exist:
      | user     | course | role           |
      | teacher1 | C1     | editingteacher |
      | student1 | C1     | student        |
      | student2 | C1     | student        |
      | student3 | C1     | student        |
    And the following "groups" exist:
      | course | idnumber | name    |
      | C1     | group1   | Group 1 |
      | C1     | group2   | Group 2 |
    And the following "group members" exist:
      | group  | user     |
      | group1 | student1 |
      | group1 | student2 |
      | group2 | student3 |
    And I log in as "teacher1"
    And I follow "Course 1"
    And I turn editing mode on
    And I add a "Assignment" to section "1"
    And I set the following fields to these values:
      | Assignment name | Test assignment name |
      | Description     | Submit your PDF file |

  Scenario: A standard user submission
    Given I press "Save and return to course"
    And I log out
    And I log in as "student1"
    And I follow "Course 1"
    And I follow "Test assignment name"
    And I press "Add submission"
    And I upload "mod/assign/feedback/editpdf/tests/fixtures/submission.pdf" file to "File submissions" filemanager
    And I press "Save changes"
    And I log out
    When I log in as "teacher1"
    And I follow "Course 1"
    And I follow "Test assignment name"
    And I follow "View/grade all submissions"
    And I set the field "Quick grading" to "1"
    And I click on "Launch PDF editor..." "link" in the "Student 1" "table_row"
    Then I should see "Annotate PDF"
    And I should see "Page 1 of 2"

  Scenario: Blind marking submission
    Given I set the field "Blind marking" to "Yes"
    And I press "Save and return to course"
    And I log out
    And I log in as "student1"
    And I follow "Course 1"
    And I follow "Test assignment name"
    And I press "Add submission"
    And I upload "mod/assign/feedback/editpdf/tests/fixtures/submission.pdf" file to "File submissions" filemanager
    And I press "Save changes"
    And I log out
    When I log in as "teacher1"
    And I follow "Course 1"
    And I follow "Test assignment name"
    And I follow "View/grade all submissions"
    And I set the field "Quick grading" to "1"
    And I click on "Launch PDF editor..." "link"
    Then I should see "Annotate PDF"
    And I should see "Page 1 of 2"

  Scenario: Team submission
    Given I set the field "Students submit in groups" to "Yes"
    And I press "Save and return to course"
    And I log out
    And I log in as "student1"
    And I follow "Course 1"
    And I follow "Test assignment name"
    And I press "Add submission"
    And I upload "mod/assign/feedback/editpdf/tests/fixtures/submission.pdf" file to "File submissions" filemanager
    And I press "Save changes"
    And I log out
    When I log in as "teacher1"
    And I follow "Course 1"
    And I follow "Test assignment name"
    And I follow "View/grade all submissions"
    And I set the field "Quick grading" to "1"
    And I click on "Launch PDF editor..." "link" in the "Student 1" "table_row"
    Then I should see "Annotate PDF"
    And I should see "Page 1 of 2"
    And I click on "Launch PDF editor..." "link" in the "Student 2" "table_row"
    And I should see "Annotate PDF"
    And I should see "Page 1 of 2"
    And I should not see "Launch PDF editor..." in the "Student 3" "table_row"

  Scenario: Resubmission allowed
    Given I set the field "Attempts reopened" to "Manually"
    And I press "Save and return to course"
    And I log out
    And I log in as "student1"
    And I follow "Course 1"
    And I follow "Test assignment name"
    And I press "Add submission"
    And I upload "mod/assign/feedback/editpdf/tests/fixtures/submission.pdf" file to "File submissions" filemanager
    And I press "Save changes"
    And I log out
    And I log in as "teacher1"
    And I follow "Course 1"
    And I follow "Test assignment name"
    And I follow "View/grade all submissions"
    And I click on "Grade Student 1" "link" in the "Student 1" "table_row"
    And I set the following fields to these values:
      | Grade out of 100      | 5   |
      | Allow another attempt | Yes |
    And I press "Save changes"
    And I log out
    And I log in as "student1"
    And I follow "Course 1"
    And I follow "Test assignment name"
    # Click on the second 'Add a new attempt' button (the first includes the original files).
    And I click on "Add a new attempt" "button" in the ".submissionstatustable .submissionaction + .submissionaction" "css_element"
    And I upload "mod/assign/feedback/editpdf/tests/fixtures/testgs.pdf" file to "File submissions" filemanager
    And I press "Save changes"
    And I log out
    When I log in as "teacher1"
    And I follow "Course 1"
    And I follow "Test assignment name"
    And I follow "View/grade all submissions"
    And I set the field "Quick grading" to "1"
    And I click on "Launch PDF editor..." "link" in the "Student 1" "table_row"
    Then I should see "Annotate PDF"
    And I should see "Page 1 of 1"
