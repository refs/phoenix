const fetch = require('node-fetch')
const httpHelper = require('../helpers/httpHelper')
const backendHelper = require('../helpers/backendHelper')

/**
 * Run occ command using the testing API
 *
 * @param {Array} args
 */
exports.runOcc = function (args) {
  const headers = httpHelper.createAuthHeader('admin')
  const params = new URLSearchParams()
  params.append('command', args.join(' '))
  return fetch(backendHelper.getCurrentBackendUrl() + '/ocs/v2.php/apps/testing/api/v1/occ?format=json', {
    headers,
    body: params,
    method: 'POST'
  }).then(res => {
    httpHelper.checkStatus(res, 'Failed while executing occ command')
    return res.json()
  }).then(res => {
    httpHelper.checkOCSStatus(res, 'Failed while executing occ command')
    return res
  })
}
