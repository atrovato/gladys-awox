const Promise = require('bluebird');
const shared = require('./shared.js');
const meshUtils = require('./commandUtils.js');

module.exports = function (device, remoteInformation, auth) {
  const remoteLinked = remoteInformation.remoteId && remoteInformation.remoteId != '';
  const paramAddress = device.identifier.replace(/:/gi, '_');

  const requests = [];

  requests.push({
    param: shared.paramPass + paramAddress,
    default: '1234',
    apply: function (val) {
      result.pass = val;
    }
  });

  if (remoteLinked) {
    const remoteAddress = remoteInformation.remoteId.replace(/:/gi, '_');
    requests.push({
      param: shared.paramUser + paramAddress,
      default: 'R-' + remoteInformation.remoteId.split(':').slice(3).join('').toUpperCase(),
      apply: function (val) {
        result.user = val;
      }
    });
    requests.push({
      param: shared.paramKey + remoteAddress,
      default: meshUtils.generateRandomBytes(16).toString('hex'),
      apply: function (val) {
        result.key = Buffer.from(val, 'hex');
      }
    });
    requests.push({
      param: shared.paramUser + remoteAddress,
      default: auth.name,
      apply: function (val) {
        auth.name = val;
      }
    });
    requests.push({
      param: shared.paramPass + remoteAddress,
      default: auth.pass,
      apply: function (val) {
        auth.pass = val;
      }
    });
  } else {
    requests.push({
      param: shared.paramUser + paramAddress,
      default: device.protocol === 'bluetooth-remote' ? 'R-' + device.identifier.split(':').slice(3).join('').toUpperCase() : 'unpaired',
      apply: function (val) {
        result.user = val;
      }
    });
    requests.push({
      param: shared.paramKey + paramAddress,
      default: meshUtils.generateRandomBytes(16),
      apply: function (val) {
        result.key = val;
      }
    });
  }

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
};