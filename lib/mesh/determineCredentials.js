const Promise = require('bluebird');
const shared = require('./shared.js');
const meshUtils = require('./commandUtils.js');

module.exports = function (macAddress, remoteInformation) {
  if (remoteInformation.remoteId && remoteInformation.remoteId != '') {
    const paramAddress = remoteInformation.remoteId.replace(/:/gi, '_');

    return gladys.param.getValue(shared.paramKey + paramAddress).then((key) => {
      return Promise.resolve({
        user: 'R-' + remoteInformation.remoteId.split(':').slice(3).join('').toUpperCase(),
        pass: '1234',
        key: Buffer.from(key, 'hex')
      });
    });
  } else {
    const paramAddress = macAddress.replace(/:/gi, '_');

    const requests = [];
    requests.push({
      param: shared.paramUser + paramAddress,
      default: 'unpaired',
      apply: function (val) {
        result.user = val;
      }
    });
    requests.push({
      param: shared.paramPass + paramAddress,
      default: '1234',
      apply: function (val) {
        result.pass = val;
      }
    });
    requests.push({
      param: shared.paramKey + paramAddress,
      default: meshUtils.generateRandomBytes(16),
      apply: function (val) {
        result.key = val;
      }
    });

    const result = {};
    return Promise.map(requests, elem => {
      return gladys.param.getValue(elem.param).then((value) => {
        elem.apply(value);
      }).catch(() => {
        elem.apply(elem.default);
      });
    }).then(() => {
      return Promise.resolve(result);
    });
  }
};