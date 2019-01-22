const Promise = require('bluebird');

/**
 * Based on Noble nodejs library.
 * Uses Noble peripherals, services, characteristics to communicate with BLE devices.
 */
module.exports = function (uuids, device) {
  return new Promise((resolve, reject) => {
    if (!device.services || device.services.length === 0) {
      console.error('AwoX module: No service found for ' + device.peripheral.address);
      device.peripheral.disconnect();
      return reject('AwoX module: No service found for ' + device.peripheral.address);
    } else {
      device.services[0].discoverCharacteristics(uuids, (error, characteristics) => {
        if (error) {
          device.peripheral.disconnect();
          return reject('AwoX module: ' + error);
        } else {
          device.characteristics = characteristics;
          return resolve(device);
        }
      });
    }
  });
};
