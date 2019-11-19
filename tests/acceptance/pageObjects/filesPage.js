const util = require('util')
const _ = require('lodash')
const navigationHelper = require('../helpers/navigationHelper')
const assert = require('assert')

module.exports = {
  url: function () {
    return this.api.launchUrl + ''
  },
  commands: {
    /**
     * like build-in navigate() but also waits till for the progressbar to appear and disappear
     * @param {string} folder - if given navigate to the folder without clicking the links
     * @returns {*}
     */
    navigateAndWaitTillLoaded: function (folder = '') {
      return navigationHelper.navigateAndWaitTillLoaded(
        this.api.launchUrl + '/#/files/list/' + folder,
        this.page.FilesPageElement.filesList().elements.filesListProgressBar
      )
    },
    /**
     *
     * @param {string} folder
     */
    navigateToFolder: function (folder) {
      return this.page.FilesPageElement.filesList().navigateToFolder(folder)
        .waitForElementVisible('@breadcrumb')
        .assert.containsText('@breadcrumb', folder)
    },
    /**
     * Create a folder with the given name
     *
     * @param {string} name to set or null to use default value from dialog
     * @param {boolean} expectToSucceed
     */
    createFolder: async function (name, expectToSucceed = true) {
      await this
        .waitForElementVisible('@newFileMenuButton', 500000)
        .click('@newFileMenuButton')
        .waitForElementVisible('@newFolderButton')
        .click('@newFolderButton')
        .waitForElementVisible('@newFolderInput')
      if (name !== null) {
        await this.clearValueWithEvent('@newFolderInput')
        await this.setValueBySingleKeys('@newFolderInput', name)
      }
      await this
        .click('@newFolderOkButton')
        .waitForElementNotPresent('@createFolderLoadingIndicator')
      if (expectToSucceed) {
        await this.waitForElementNotVisible('@newFolderDialog')
          .waitForAnimationToFinish()
      }
      return this
    },
    /**
     * Create a file with the given name
     *
     * @param {string} name to set or null to use default value from dialog
     * @param {boolean} expectToSucceed
     */
    createFile: function (name, expectToSucceed = true) {
      this
        .waitForElementVisible('@newFileMenuButton')
        .click('@newFileMenuButton')
        .waitForElementVisible('@newFileButton')
        .click('@newFileButton')
        .waitForElementVisible('@newFileInput')
      if (name !== null) {
        this.clearValueWithEvent('@newFileInput')
        this.setValue('@newFileInput', name)
      }
      this
        .click('@newFileOkButton')
        .waitForElementNotPresent('@createFileLoadingIndicator')
      if (expectToSucceed) {
        this.waitForElementNotVisible('@newFileDialog')
          .waitForAnimationToFinish()
      }
      return this
    },
    selectFileForUpload: function (filePath) {
      return this
        .waitForElementVisible('@newFileMenuButton')
        .click('@newFileMenuButton')
        .waitForElementVisible('@fileUploadButton')
        .setValue('@fileUploadInput', filePath)
    },
    /**
     *
     * @param {string} filePath
     */
    uploadFile: function (filePath) {
      return this
        .selectFileForUpload(filePath)
        .waitForElementVisible(
          '@fileUploadProgress',
          this.api.globals.waitForConditionTimeout,
          this.api.globals.waitForConditionPollInterval,
          false
        )
        .waitForElementNotVisible('@fileUploadProgress')
        .click('@newFileMenuButton')
    },
    /**
     * This uploads a folder that is inside the selenium host,
     * not from the server, phoenix or where the test runner is located.
     * So, the folder needs to be already there on the machine where the browser is running.
     *
     * @typedef {import('../customCommands/uploadRemote')} UploadRemote
     * We can extract the folder path from the callback of
     * [uploadRemote()]{@link UploadRemote.command}, which is similar to the following:
     * `/tmp/545cfb7e4b6e6603b2bbef4d69f82627/upload1734400381952243704file/new-lorem.txt`.
     * Extract `upload1734400381952243704file` and send it as arg here, otherwise, the whole
     * `/tmp/<sessionID>` folder will get uploaded
     *
     * @see below for working information
     *
     * @param {string} [folderName] - should be passed in as format "/upload<uniqueId>file" or "upload<uniqueId>file"
     */
    uploadSessionFolder: function (folderName = '') {
      /*
      files uploaded through selenium endpoints are saved in
      /tmp/<sessionId>/upload<uniqueId>file/<filename>.

      So, we are trying to upload the "/tmp/<sessionId>" (or, if the folderName is set, it's "/tmp/<sessionId>/<folderName>")
      folder through phoenix, by setting value on folder input field to that folder, and hopefully,
      phoenix gets the `onChange` event and uploads that folder.
       */
      const sessionId = this.api.sessionId
      folderName = _.trimStart(folderName, '/')
      folderName = `/tmp/${sessionId}/${folderName}`
      return this.uploadFolder(folderName)
    },

    /**
     * Upload folder which is inside selenium
     *
     * @param {string} folderName
     */
    uploadFolder: function (folderName) {
      return this.waitForElementVisible('@newFileMenuButton')
        .click('@newFileMenuButton')
        .waitForElementVisible('@fileUploadButton')
        .setValue('@folderUploadInput', folderName)
        .waitForElementVisible(
          '@fileUploadProgress',
          this.api.globals.waitForConditionTimeout,
          this.api.globals.waitForConditionPollInterval,
          false
        )
        .waitForElementNotVisible('@fileUploadProgress')
        .click('@newFileMenuButton')
    },
    /**
     * Returns whether files or folders can be created in the current page.
     *
     * @param {Function} callback callback with result
     */
    canCreateFiles: function (callback) {
      return this
        .waitForElementVisible('@newFileMenuButtonAnyState')
        .getAttribute('@newFileMenuButtonAnyState', 'disabled', (result) => {
          const isDisabled = result.value === 'true'
          callback(isDisabled)
        })
    },
    showHiddenFiles: function () {
      return this
        .waitForElementVisible('@filterListButton')
        .click('@filterListButton')
        .waitForElementVisible('@hiddenFilesLabel')
        .click('@hiddenFilesCheckbox')
    },
    /**
     *
     * @param {string} fileOrFolder
     * @param {string} enableOrDisable
     */
    toggleFilterFileOrFolder: function (fileOrFolder, enableOrDisable) {
      let labelSelector, checkboxId
      if (fileOrFolder === 'folder') {
        labelSelector = '@filterFolderLabel'
        checkboxId = this.elements.filterFolderCheckbox
      } else if (fileOrFolder === 'file') {
        labelSelector = '@filterFileLabel'
        checkboxId = this.elements.filterFileCheckbox
      } else {
        throw new Error(`Expected 'file' or 'folder', ${fileOrFolder} given`)
      }
      return this
        .waitForElementVisible('@filterListButton')
        .click('@filterListButton')
        .waitForElementVisible(labelSelector)
        .toggleCheckbox(enableOrDisable, checkboxId)
        .click('@filterListButton')
    },
    deleteAllCheckedFiles: function () {
      return this
        .waitForElementVisible('@deleteSelectedButton')
        .click('@deleteSelectedButton')
        .waitForElementVisible('@deleteFileConfirmationBtn')
        .waitForAnimationToFinish()
        .click('@deleteFileConfirmationBtn')
        .waitForElementNotVisible('@deleteFileConfirmationDialog')
        .waitForAnimationToFinish()
    },
    /**
     * return the complete xpath of the link to the specified tab in the side-bad
     * @param tab
     * @returns {string}
     */
    getXpathOfLinkToTabInSidePanel: function (tab) {
      return this.elements.sideBar.selector +
        util.format(this.elements.tabOfSideBar.selector, tab)
    },
    selectTabInSidePanel: function (tab) {
      return this
        .useXpath()
        .waitForElementVisible('@sideBar')
        .click(this.getXpathOfLinkToTabInSidePanel(tab))
        .useCss()
    },
    isSidebarVisible: function (callback) {
      return this
        .useXpath()
        .isVisible('@sideBar', (result) => {
          callback(result.value)
        })
        .useCss()
    },
    isPanelVisible: function (panelName, callback) {
      let selector = ''
      if (panelName === 'collaborators') {
        selector = this.page.FilesPageElement.sharingDialog().elements.sharingAutoComplete
      } else if (panelName === 'versions') {
        selector = this.elements.versionsPanel
      } else if (panelName === 'links') {
        selector = this.elements.linksPanel
      } else {
        throw new Error('invalid panel')
      }
      return this
        .isVisible(selector, (result) => {
          callback(result.value)
        })
    },
    copyPermalinkFromFilesAppBar: function () {
      return this
        .waitForElementVisible('@permalinkCopyButton')
        .click('@permalinkCopyButton')
    },
    checkSidebarItem: function (resourceName) {
      return this.getAttribute('@sidebarItemName', 'innerText', function (itemName) {
        this.assert.strictEqual(itemName.value, resourceName, `In sidebar is different item - ${itemName.value}`)
      })
    },
    confirmFileOverwrite: function () {
      return this.waitForElementVisible('@fileOverwriteConfirm')
        .api.moveToElement(this.elements.fileOverwriteDialog.selector, 0, 0)
        .mouseButtonClick(0)
        .waitForElementNotVisible(this.elements.newFolderButton.selector)
        .click(this.elements.fileOverwriteConfirm.selector)
        .waitForElementNotVisible(this.elements.fileOverwriteConfirm.selector)
        .waitForAjaxCallsToStartAndFinish()
    },
    createNewFile: function (newFileName) {
      return this
        .waitForElementVisible('@newFileMenuButton')
        .click('@newFileMenuButton')
        .waitForElementVisible('@newFileButton')
        .click('@newFileButton')
        .waitForElementVisible('@newFileInputField')
        .setValue('@newFileInputField', newFileName)
        .waitForElementVisible('@newFileOkButton')
        .click('@newFileOkButton')
    },
    triesToCreateExistingFile: function (fileName) {
      return this.waitForElementVisible('@newFileMenuButton')
        .click('@newFileMenuButton')
        .waitForElementVisible('@newFileButton')
        .click('@newFileButton')
        .waitForElementVisible('@newFileInputField')
        .setValue('@newFileInputField', fileName)
    },
    waitForErrorMessage: function (callback) {
      return this.waitForElementVisible('@fileAlreadyExistAlert')
        .getText('@fileAlreadyExistAlert', result => {
          return callback(result.value)
        })
    },
    checkForButtonDisabled: function () {
      return this.waitForElementVisible('@createFileOkButtonDisabled')
    },
    assertVersionsPresent: function (expectedNumber) {
      if (expectedNumber !== 0) {
        return this
          .waitForElementVisible('@versionsList')
          .api.elements('xpath', this.elements.versionsList.selector, function (result) {
            assert.strictEqual(expectedNumber, result.value.length)
          })
      } else {
        return this.waitForElementNotPresent('@versionsList')
      }
    },
    restoreToPreviousVersion: function () {
      return this
        .waitForElementVisible('@restorePreviousVersion')
        .click('@restorePreviousVersion')
    }
  },
  elements: {
    newFileMenuButtonAnyState: {
      selector: '#new-file-menu-btn'
    },
    newFileMenuButton: {
      selector: '#new-file-menu-btn:enabled'
    },
    deleteSelectedButton: {
      selector: '#delete-selected-btn'
    },
    newFolderButton: {
      selector: '#new-folder-btn'
    },
    newFileButton: {
      selector: '#new-file-btn'
    },
    newFolderDialog: {
      selector: '#new-folder-dialog'
    },
    newFileDialog: {
      selector: '#new-file-dialog'
    },
    newFolderInput: {
      selector: '#new-folder-input'
    },
    newFileInput: {
      selector: "//input[@placeholder='Create new file…']",
      locateStrategy: 'xpath'
    },
    newFolderOkButton: {
      selector: '#new-folder-ok'
    },
    newFileOkButton: {
      selector: "//div[@id='new-file-dialog']//span[contains(text(),'Ok')]",
      locateStrategy: 'xpath'
    },
    fileAlreadyExistAlert: {
      selector: "//div[@id='new-file-dialog']//div[contains(@class, 'alert-danger')]",
      locateStrategy: 'xpath'
    },
    permalinkCopyButton: {
      selector: '#files-permalink-copy'
    },
    breadcrumb: {
      selector: '#files-breadcrumb li:nth-of-type(2)'
    },
    filterListButton: {
      selector: '#oc-filter-list-btn'
    },
    hiddenFilesLabel: {
      selector: '#oc-filter-hidden-label'
    },
    hiddenFilesCheckbox: {
      selector: '#oc-filter-hidden-checkbox'
    },
    filterFolderLabel: {
      selector: '#oc-filter-folder-label'
    },
    filterFolderCheckbox: {
      selector: '#oc-filter-folder-checkbox'
    },
    filterFileLabel: {
      selector: '#oc-filter-file-label'
    },
    filterFileCheckbox: {
      selector: '#oc-filter-file-checkbox'
    },
    createFolderLoadingIndicator: {
      selector: '//div[@id="new-folder-dialog"]//div[@class="oc-loader"]',
      locateStrategy: 'xpath'
    },
    createFileLoadingIndicator: {
      selector: '//div[@id="new-file-dialog"]//div[@class="oc-loader"]',
      locateStrategy: 'xpath'
    },
    fileUploadButton: {
      selector: '#files-file-upload-button'
    },
    fileUploadInput: {
      selector: '#fileUploadInput'
    },
    folderUploadInput: {
      selector: '#folderUploadInput'
    },
    fileUploadProgress: {
      selector: '#files-upload-progress'
    },
    deleteFileConfirmationBtn: {
      selector: '#oc-dialog-delete-confirm'
    },
    deleteFileConfirmationDialog: {
      selector: '#delete-file-confirmation-dialog'
    },
    versionsPanel: {
      selector: '#oc-file-versions-sidebar'
    },
    linksPanel: {
      selector: '#oc-files-file-link'
    },
    sideBar: {
      selector: '//div[@class="sidebar-container"]',
      locateStrategy: 'xpath'
    },
    fileOverwriteConfirm: {
      selector: '#files-overwrite-confirm'
    },
    fileOverwriteDialog: {
      selector: '#overwrite-dialog'
    },
    /**
     * path from inside the side-bar
     */
    tabOfSideBar: {
      // the translate bit is to make it case-insensitive
      selector: '//a[contains(translate(.,\'ABCDEFGHJIKLMNOPQRSTUVWXYZ\',\'abcdefghjiklmnopqrstuvwxyz\'),\'%s\')]',
      locateStrategy: 'xpath'
    },
    sidebarItemName: {
      selector: '#files-sidebar-item-name'
    },
    newFileInputField: {
      selector: "//input[contains(@placeholder, 'Create')]",
      locateStrategy: 'xpath'
    },
    createFileOkButtonDisabled: {
      selector: "//div[@id='new-file-dialog']//button[@disabled='disabled']/span[contains(text(), 'Ok')]",
      locateStrategy: 'xpath'
    },
    versionsList: {
      selector: '//div[@id="oc-file-versions-sidebar"]//tr[@class="file-row"]',
      locateStrategy: 'xpath'
    },
    restorePreviousVersion: {
      selector: '(//div[contains(@id,"oc-file-versions")]//tbody/tr[@class="file-row"])[1]//button[1]',
      locateStrategy: 'xpath'
    }
  }
}
