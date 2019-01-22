const shared = require('./shared.js');
const Promise = require('bluebird');

/**
 * Based on Noble nodejs library.
 * Uses Noble peripherals, services, characteristics to communicate with BLE devices.
 */
module.exports = function (uuids, device) {
  return new Promise((resolve, reject) => {
    const connectTimeout = setTimeout(timeout, shared.serviceTimeout, reject, device.peripheral);
    device.peripheral.discoverServices(uuids, (error, services) => {
      connectTimeout.unref();
      if (error) {
        device.peripheral.disconnect();
        return reject(error);
      } else {
        device.services = services;
        return resolve(device);
      }
    });
  });
};

function timeout(reject, peripheral) {
  peripheral.disconnect();
  return reject('Discover services timeout for ' + peripheral.address);
}