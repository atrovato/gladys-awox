const Promise = require('bluebird');

/**
 * Based on Noble nodejs library.
 * Uses Noble peripherals, services, characteristics to communicate with BLE devices.
 */
module.exports = function (uuids, device) {
  return new Promise((resolve, reject) => {
    device.peripheral.discoverServices(uuids, (error, services) => {
      if (error) {
        device.peripheral.disconnect();
        return reject('AwoX module: ' + error);
      } else {
        device.services = services;
        return resolve(device);
      }
    });
  });
};
