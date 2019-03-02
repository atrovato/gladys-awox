const Promise = require('bluebird');

const awoxSend = require('../bluetooth/send.js');
const awoxRead = require('../bluetooth/read.js');
const meshUtils = require('./commandUtils.js');
const meshShared = require('./shared.js');

module.exports = function (peripheral, characteristics, meshName, meshPassword) {
  const sessionRandom = meshUtils.generateRandomBytes(8);
  const pairCommand = meshUtils.generatePairCommand(meshName, meshPassword, sessionRandom);
  return awoxSend(peripheral, characteristics.get(meshShared.characteristics.pair), pairCommand, true).then(() => {
    return awoxSend(peripheral, characteristics.get(meshShared.characteristics.status), [0x01, 0x00], true);
  }).then(() => {
    return awoxRead(peripheral, characteristics.get(meshShared.characteristics.pair));
  }).then((value) => {
    switch (value[0]) {
    case 0x0d:
      return Promise.resolve(meshUtils.generateSessionKey(meshName, meshPassword, sessionRandom, value));
    case 0x0e:
      return Promise.reject('Bad authentication for ' + peripheral.address + ', check name and password');
    default:
      return Promise.reject('Unable to authenticate to ' + peripheral.address);
    }
  });
};
