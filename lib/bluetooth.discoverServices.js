const Promise = require('bluebird');

/**
 * Based on Noble nodejs library.
 * Uses Noble peripherals, services, characteristics to communicate with BLE devices.
 */
module.exports = function (uuids, device) {
  return new Promise((resolve, reject) => {
    const connectTimeout = setTimeout(timeout, 5000, reject, device.peripheral);
    device.peripheral.discoverServices(uuids, (error, services) => {
      connectTimeout.unref();
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

function timeout(reject, peripheral) {
  peripheral.disconnect();
  return reject('AwoX module: discover services timeout for ' + peripheral.address);
}