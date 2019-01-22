const Promise = require('bluebird');

/**
 * Based on Noble nodejs library.
 * Uses Noble peripherals, services, characteristics to communicate with BLE devices.
 */
module.exports = function (uuids, device) {
  return new Promise((resolve, reject) => {
    if (!device.services || device.services.length === 0) {
      device.peripheral.disconnect();
      return reject('AwoX module: No services available for ' + device.peripheral.address);
    } else {
      const connectTimeout = setTimeout(timeout, 5000, reject, device.peripheral);
      device.services[0].discoverCharacteristics(uuids, (error, characteristics) => {
        connectTimeout.unref();
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

function timeout(reject, peripheral) {
  peripheral.disconnect();
  return reject('AwoX module: discover characteristics timeout for ' + peripheral.address);
}
