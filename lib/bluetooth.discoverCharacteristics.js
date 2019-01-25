const shared = require('./shared.js');
const Promise = require('bluebird');

/**
 * Based on Noble nodejs library.
 * Uses Noble peripherals, services, characteristics to communicate with BLE devices.
 */
module.exports = function (uuids, device) {
  if (!device.services || device.services.length === 0) {
    device.peripheral.disconnect();
    return Promise.reject('No services available for ' + device.peripheral.address);
  } else {
    return Promise.map(device.services, (service) => {
      return new Promise((resolve, reject) => {
        const connectTimeout = setTimeout(timeout, shared.characteristicTimeout, reject, device.peripheral);
        service.discoverCharacteristics(uuids, (error, characteristics) => {
          connectTimeout.unref();
          if (error) {
            device.peripheral.disconnect();
            return reject(error);
          } else {
            return resolve(characteristics);
          }
        });
      });
    }, { concurrency: 1 }).then((data) => {
      device.characteristics = [];

      data.forEach(characteristics => {
        characteristics.forEach(characteristic => {
          device.characteristics.push(characteristic);
        });
      });

      return Promise.resolve(device);
    }).catch((e) => {
      device.peripheral.disconnect();
      return Promise.reject(e);
    });
  }
};

function timeout(reject, peripheral) {
  peripheral.disconnect();
  return reject('Discover characteristics timeout for ' + peripheral.address);
}
