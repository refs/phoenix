Feature: Filter files/folders

  As a user
  I would like to filter files/folders
  So that I can make the file/folder list more clear

  Background:
    Given these users have been created with default attributes:
      | username |
      | user1    |
    And user "user1" has created file ".simpleHiddenFile"
    And user "user1" has created file ".hiddenTestFile"
    And user "user1" has created file "simpleFile"
    And user "user1" has created folder ".simpleHiddenFolder"
    And user "user1" has created folder ".hiddenTestFolder"
    And user "user1" has favorited element ".simpleHiddenFile"
    And user "user1" has favorited element "lorem.txt"
    And user "user1" has favorited element ".hiddenTestFile"
    And user "user1" has favorited element "simpleFile"
    And user "user1" has favorited element ".simpleHiddenFolder"
    And user "user1" has favorited element "folder with space"
    And user "user1" has favorited element ".hiddenTestFolder"
    And user "user1" has favorited element "simple-folder"
    And user "user1" has logged in using the webUI
    And the user has browsed to the favorites page using the webUI

  Scenario: user filters files and folders using keyword when the files filter, folders filter, and hidden filter are enabled
    When the user enables file filter using the webUI
    And the user enables folder filter using the webUI
    And the user enables the setting to view hidden files on the webUI
    And the user filters the file list by "simple" on the webUI
    Then all files and folders containing pattern "simple" in their name should be listed in the favourites list on the webUI

  Scenario: user filters files and folders using keyword when the hidden filter is disabled
    When the user enables file filter using the webUI
    And the user enables folder filter using the webUI
    And the user filters the file list by "simple" on the webUI
    Then all files and folders containing pattern "simple" in their name should be listed in the favourites list on the webUI except of hidden elements

  Scenario: user filters files using keyword when the hidden filter and the folder filter are disabled
    When the user enables file filter using the webUI
    And the user disables folder filter using the webUI
    And the user filters the file list by "simple" on the webUI
    Then only files containing pattern "simple" in their name should be listed in the favourites list on the webUI except of hidden elements

  Scenario: user filters folders using keyword when the hidden filter and the file filter are disabled
    When the user disables file filter using the webUI
    And the user enables folder filter using the webUI
    And the user filters the file list by "simple" on the webUI
    Then only folders containing pattern "simple" in their name should be listed in the favourites list on the webUI except of hidden elements

  Scenario: user filters folders using keyword when the hidden filter and the folder filter are enabled
    When the user disables file filter using the webUI
    And the user enables folder filter using the webUI
    And the user enables the setting to view hidden folders on the webUI
    And the user filters the file list by "simple" on the webUI
    Then only folders containing pattern "simple" in their name should be listed in the favourites list on the webUI

  Scenario: user filters files using keyword when the hidden filter and the file filter are enabled
    When the user disables folder filter using the webUI
    And the user enables file filter using the webUI
    And the user enables the setting to view hidden folders on the webUI
    And the user filters the file list by "simple" on the webUI
    Then only files containing pattern "simple" in their name should be listed in the favourites list on the webUI

  Scenario: user filters files using keyword when the folder filter and file filter are disabled and hidden filter is enabled
    When the user disables folder filter using the webUI
    And the user disables file filter using the webUI
    And the user enables the setting to view hidden folders on the webUI
    And the user filters the file list by "simple" on the webUI
    Then there should be no files/folders listed on the webUI

  Scenario: user filters files using keyword when the folder filter, file filter and hidden filter are disabled
    When the user disables folder filter using the webUI
    And the user disables file filter using the webUI
    And the user filters the file list by "simple" on the webUI
    Then there should be no files/folders listed on the webUI
