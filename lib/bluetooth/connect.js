const shared = require('../shared.js');
const Promise = require('bluebird');

/**
 * Based on Noble nodejs library.
 * Uses Noble peripherals, services, characteristics to communicate with BLE devices.
 */
module.exports = function (peripheral) {
  return new Promise((resolve, reject) => {
    if (peripheral.state === 'connected') {
      return resolve(peripheral);
    } else if (peripheral.connectable && peripheral.addressType === 'public') {
      const connectTimeout = setTimeout(timeout, shared.connectTimeout, reject, peripheral);
      peripheral.connect((error) => {
        clearTimeout(connectTimeout);
        if (error) {
          return reject(error);
        } else {
          delete peripheral.meshSessionKey;
          peripheral.services = null;
          return resolve(peripheral);
        }
      });
    } else {
      return reject('Peripheral ' + peripheral.address + ' not connectable or not public');
    }
  });
};

function timeout(reject, peripheral) {
  return reject('Connection timeout for ' + peripheral.address);
}