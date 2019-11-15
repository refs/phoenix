const { client } = require('nightwatch-api')
const { When } = require('cucumber')
const webdav = require('../helpers/webdavHelper')

When('the user copies the private link of the file/folder {string} using the webUI', function (resource) {
  return client.page.FilesPageElement
    .filesList()
    .waitForElementVisible('@filesTableContainer')
    .clickRow(resource)
    .copyPrivateLink()
})

When('the user navigates to the copied private link using the webUI', function () {
  return client.getClipBoardContent(function (url) {
    // If the redirect happens immediately we receive an error
    // Cannot read property 'parentNode' of null
    setTimeout(function () {
      client.url(url)
    }, 0)
  })
})

When('the user navigates to the private link created by user {string} for file/folder {string}', async function (user, resource) {
  const item = await webdav.getProperties(resource, user, ['oc:privatelink'])
  return client
    .url(item['oc:privatelink'])
    .page.phoenixPage().waitForElementVisible('@phoenixContainer')
})
