const Promise = require('bluebird');

/**
 * Based on Noble nodejs library.
 * Uses Noble peripherals, services, characteristics to communicate with BLE devices.
 */
module.exports = function (device) {
  if (!device.characteristics || device.characteristics.length === 0) {
    console.error('AwoX module: No characteristics found for ' + device.peripheral.address);
    device.peripheral.disconnect();
    return Promise.reject('AwoX module: No characteristics found for ' + device.peripheral.address);
  } else {
    return Promise.map(device.characteristics, (characteristic) => {
      if (!characteristic.properties.includes('read')) {
        console.error('AwoX module: Characteristic ' + characteristic.uuid + ' not readable for ' + device.peripheral.address);
        device.peripheral.disconnect();
        return Promise.reject('AwoX module: Characteristic ' + characteristic.uuid + ' not readable for ' + device.peripheral.address);
      } else {
        return new Promise((resolve, reject) => {
          characteristic.read((error, data) => {
            if (error) {
              console.error('AwoX module: Error occured reading : ' + error);
              return reject('AwoX module: Error occured reading : ' + error);
            } else {
              return resolve({ uuid: characteristic.uuid, value: data});
            }
          });
        });
      }
    }, { concurrency: 1 });
  }
};