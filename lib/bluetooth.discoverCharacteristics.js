const shared = require('./shared.js');
const Promise = require('bluebird');

/**
 * Based on Noble nodejs library.
 * Uses Noble peripherals, services, characteristics to communicate with BLE devices.
 */
module.exports = function (uuids, device) {
  return new Promise((resolve, reject) => {
    if (!device.services || device.services.length === 0) {
      device.peripheral.disconnect();
      return reject('No services available for ' + device.peripheral.address);
    } else {
      const connectTimeout = setTimeout(timeout, shared.characteristicTimeout, reject, device.peripheral);
      device.services[0].discoverCharacteristics(uuids, (error, characteristics) => {
        connectTimeout.unref();
        if (error) {
          device.peripheral.disconnect();
          return reject(error);
        } else {
          device.characteristics = characteristics;
          return resolve(device);
        }
      });
    }
  });
};

function timeout(reject, peripheral) {
  peripheral.disconnect();
  return reject('Discover characteristics timeout for ' + peripheral.address);
}
