const Promise = require('bluebird');
const meshUtils = require('./commandUtils.js');

module.exports = function (peripheral, sessionKey, type, value) {
  return new Promise((resolve, reject) => {
    var commandKey;
    var commandData;

    if (type === 'switch') {
      commandKey = 0xd0;
      if (value === 1) {
        commandData = [0x01];
      } else if (value === 0) {
        commandData = [0x00];
      } else {
        return reject('Unknown command');
      }
    } else {
      return reject('AwoX module: Unknown command');
    }

    return resolve(meshUtils.generateCommandPacket(sessionKey, peripheral.address, commandKey, commandData));
  });
};