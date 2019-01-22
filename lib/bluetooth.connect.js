const Promise = require('bluebird');

/**
 * Based on Noble nodejs library.
 * Uses Noble peripherals, services, characteristics to communicate with BLE devices.
 */
module.exports = function (peripheral) {
  return new Promise((resolve, reject) => {
    if (peripheral.connectable && peripheral.addressType == 'public') {
      peripheral.connect((error) => {
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