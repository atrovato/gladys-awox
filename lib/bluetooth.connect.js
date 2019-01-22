const Promise = require('bluebird');

/**
 * Based on Noble nodejs library.
 * Uses Noble peripherals, services, characteristics to communicate with BLE devices.
 */
module.exports = function (peripheral) {
  return new Promise((resolve, reject) => {
    if (peripheral.connectable && peripheral.addressType == 'public') {
      const connectTimeout = setTimeout(timeout, 5000, reject, peripheral);
      peripheral.connect((error) => {
        connectTimeout.unref();
        if (error) {
          return reject('AwoX module: ' + error);
        } else {
          return resolve({ peripheral: peripheral });
        }
      });
    } else {
      return reject('AwoX module: Peripheral ' + peripheral.address + ' not connectable or not public');
    }
  });
};

function timeout(reject, peripheral) {
  peripheral.disconnect();
  return reject('AwoX module: connection timeout for ' + peripheral.address);
}