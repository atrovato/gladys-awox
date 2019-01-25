const shared = require('./shared.js');
const Promise = require('bluebird');

/**
 * Based on Noble nodejs library.
 * Uses Noble peripherals, services, characteristics to communicate with BLE devices.
 */
module.exports = function (device, uuid) {
  if (!device.characteristics || device.characteristics.length === 0) {
    device.peripheral.disconnect();
    return Promise.reject('No characteristics available for ' + device.peripheral.address);
  } else {
    let characteristics = device.characteristics.slice(0);
    if (uuid) {
      characteristics = characteristics.filter((c) => {
        return c.uuid == uuid;
      });
    }

    if (!characteristics || characteristics.length === 0) {
      device.peripheral.disconnect();
      return Promise.reject('No ' + uuid + ' characteristics available for ' + device.peripheral.address);
    } else {
      return Promise.map(characteristics, (characteristic) => {
        if (!characteristic.properties.includes('read')) {
          device.peripheral.disconnect();
          return Promise.reject('Characteristic ' + characteristic.uuid + ' not readable for ' + device.peripheral.address);
        } else {
          return new Promise((resolve, reject) => {
            const connectTimeout = setTimeout(timeout, shared.readTimeout, reject, device.peripheral);
            characteristic.read((error, data) => {
              connectTimeout.unref();
              if (error) {
                return reject('Error occured reading : ' + error);
              } else {
                return resolve({ uuid: characteristic.uuid, value: data });
              }
            });
          });
        }
      }, { concurrency: 1 }).then((values) => {
        if (!device.hasOwnProperty('values')) {
          device.values = {};
        }
        values.forEach((data) => {
          device.values[data.uuid] = data.value;
        });
        return Promise.resolve(device);
      }).catch((e) => {
        device.peripheral.disconnect();
        return Promise.reject(e);
      });
    }
  }
};


function timeout(reject, peripheral) {
  peripheral.disconnect();
  return reject('Read characteristics timeout for ' + peripheral.address);
}
