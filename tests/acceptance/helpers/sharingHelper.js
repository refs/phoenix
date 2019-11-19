const { client } = require('nightwatch-api')
const httpHelper = require('./httpHelper')
const fetch = require('node-fetch')
const assert = require('assert')

module.exports = {
  SHARE_TYPES: Object.freeze({
    user: 0,
    group: 1,
    public_link: 3,
    federated_cloud_share: 6
  }),
  PERMISSION_TYPES: Object.freeze({
    read: 1,
    update: 2,
    create: 4,
    delete: 8,
    share: 16,
    all: 31
  }),
  /**
   *
   * @param permissionsString string of permissions separated by comma. For valid permissions see this.PERMISSION_TYPES
   * @returns {number} a number the OCS sharing API understands see https://doc.owncloud.com/server/developer_manual/core/apis/ocs-share-api.html
   */
  humanReadablePermissionsToBitmask: function (permissionsString) {
    let permissionBitMask = 0
    let humanReadablePermissions = permissionsString.split(',')
    humanReadablePermissions = humanReadablePermissions.map(function (s) {
      return String.prototype.trim.apply(s)
    })
    for (var i = 0; i < humanReadablePermissions.length; i++) {
      if (humanReadablePermissions[i] in this.PERMISSION_TYPES) {
        permissionBitMask = permissionBitMask + this.PERMISSION_TYPES[humanReadablePermissions[i]]
      } else {
        throw Error('Invalid permission: ' + humanReadablePermissions[i])
      }
    }
    return permissionBitMask
  },
  /**
   * converts the human readable share-type string to the API number as defined in https://doc.owncloud.com/server/10.0/developer_manual/core/ocs-share-api.html#create-a-new-share
   * @param {string} shareTypeString
   * @returns {number}
   */
  humanReadableShareTypeToNumber: function (shareTypeString) {
    shareTypeString = shareTypeString.trim()
    if (!(shareTypeString in this.SHARE_TYPES)) {
      throw Error('Invalid share type: ' + shareTypeString)
    }
    return this.SHARE_TYPES[shareTypeString]
  },
  /**
   *
   * @param {string } user
   * @param {string } expectedDetailsTable
   * @param {boolean} sharedWithThisUser if `true` check shares that were shared with the given user (adding 'shared_with_me=true' to the API call)
   * @returns {Promise<unknown>}
   */
  assertUserHasShareWithDetails: function (user, expectedDetailsTable, sharedWithThisUser = false) {
    const headers = httpHelper.createAuthHeader(user)
    const sharingHelper = this
    let apiURL = client.globals.backend_url + '/ocs/v2.php/apps/files_sharing/api/v1/shares?format=json'
    if (sharedWithThisUser === true) {
      apiURL = apiURL + '&shared_with_me=true'
    }
    return fetch(apiURL, { method: 'GET', headers: headers })
      .then(res => res.json())
      .then(function (sharesResult) {
        if (sharesResult.ocs.meta.statuscode === 200) {
          const shares = sharesResult.ocs.data
          let found
          for (var shareI = 0; shareI < shares.length; shareI++) {
            const share = shares[shareI]
            found = true
            for (var expectedDetailsI = 0; expectedDetailsI < expectedDetailsTable.hashes().length; expectedDetailsI++) {
              const expectedDetail = expectedDetailsTable.hashes()[expectedDetailsI]
              if (expectedDetail.field === 'permissions') {
                expectedDetail.value = sharingHelper.humanReadablePermissionsToBitmask(expectedDetail.value).toString()
              } else if (expectedDetail.field === 'share_type') {
                expectedDetail.value = sharingHelper.humanReadableShareTypeToNumber(expectedDetail.value).toString()
              }
              if (!(expectedDetail.field in share) || share[expectedDetail.field].toString() !== expectedDetail.value) {
                found = false
                break
              }
            }
            if (found === true) {
              break
            }
          }
          assert.strictEqual(
            found, true, 'could not find expected share in "' + JSON.stringify(sharesResult, null, 2) + '"'
          )
          return this
        } else {
          throw Error('Could not get shares. Message: ' + sharesResult.ocs.meta.message)
        }
      })
  },

  /**
   * Asynchronously fetches the last public link created by the given link creator
   *
   * @async
   * @param {string[]} linkCreator link creator
   * @return {Promise<Object>} last share token
   */
  fetchLastPublicLinkShare: async function (linkCreator) {
    const self = this
    const headers = httpHelper.createAuthHeader(linkCreator)
    const apiURL = client.globals.backend_url + '/ocs/v2.php/apps/files_sharing/api/v1/shares?format=json'
    let lastShare
    await fetch(apiURL, { method: 'GET', headers: headers })
      .then(res => res.json())
      .then(function (sharesResult) {
        if (sharesResult.ocs.meta.statuscode === 200) {
          const shares = sharesResult.ocs.data
          let lastFoundShareId = 0
          for (var shareI = 0; shareI < shares.length; shareI++) {
            const share = shares[shareI]
            if (share.share_type === self.SHARE_TYPES.public_link && share.id >= lastFoundShareId) {
              lastFoundShareId = share.id
              lastShare = share
            }
          }
          if (lastShare === null) {
            throw Error('Could not find public shares. All shares: ' + JSON.stringify(shares, null, 2))
          }
        } else {
          throw Error('Could not get shares. Message: ' + sharesResult.ocs.meta.message)
        }
      })

    return lastShare
  },
  getAllShares: function (user) {
    const headers = httpHelper.createAuthHeader(user)
    const apiURL = client.globals.backend_url + '/ocs/v2.php/apps/files_sharing/api/v1/shares?shared_with_me=true&format=json&state=all'
    return fetch(apiURL,
      {
        method: 'GET',
        headers: headers
      })
      .then(res => {
        httpHelper.checkStatus(res, 'The response status is not the expected value')
        return res.json()
      })
      .then(res => {
        return res.ocs.data
      })
  },
  declineShare: async function (filename, user, sharer) {
    const allShares = await this.getAllShares(user)
    for (const element of allShares) {
      if (element.state === 1 && element.path.replace(/^\/|\/$/g, '') === filename && element.uid_owner === sharer) {
        const shareID = element.id
        const headers = httpHelper.createAuthHeader(user)
        const apiURL = client.globals.backend_url + '/ocs/v2.php/apps/files_sharing//api/v1/shares/pending/' + shareID + '?format=json'
        return fetch(apiURL,
          {
            method: 'DELETE',
            headers: headers
          })
          .then(res => {
            httpHelper.checkStatus(res, 'The response status is not the expected value')
          })
      }
    }
  }
}
