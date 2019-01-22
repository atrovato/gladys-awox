const Promise = require('bluebird');

/**
 * Based on Noble nodejs library.
 * Uses Noble peripherals, services, characteristics to communicate with BLE devices.
 */
module.exports = function (device) {
  if (!device.characteristics || device.characteristics.length === 0) {
    device.peripheral.disconnect();
    return Promise.reject('AwoX module: No characteristics available for ' + device.peripheral.address);
  } else {
    const connectTimeout = setTimeout(timeout, 5000, Promise.reject, device.peripheral);
    return Promise.map(device.characteristics, (characteristic) => {
      if (!characteristic.properties.includes('read')) {
        device.peripheral.disconnect();
        return Promise.reject('AwoX module: Characteristic ' + characteristic.uuid + ' not readable for ' + device.peripheral.address);
      } else {
        return new Promise((resolve, reject) => {
          characteristic.read((error, data) => {
            if (error) {
              return reject('AwoX module: Error occured reading : ' + error);
            } else {
              return resolve({ uuid: characteristic.uuid, value: data });
            }
          });
        });
      }
    }, { concurrency: 1 }).then((values) => {
      connectTimeout.unref();
      device.values = {};
      values.forEach((data) => {
        device.values[data.uuid] = data.value;
      });
      return Promise.resolve(device);
    });
  }
};


function timeout(reject, peripheral) {
  peripheral.disconnect();
  return reject('AwoX module: read characteristics timeout for ' + peripheral.address);
}
