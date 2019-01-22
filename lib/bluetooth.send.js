const shared = require('./shared.js');
const Promise = require('bluebird');

/**
 * Based on Noble nodejs library.
 * Uses Noble peripherals, services, characteristics to communicate with BLE devices.
 */
module.exports = function (device, command) {
  return new Promise((resolve, reject) => {
    if (!device.characteristics || device.characteristics.length === 0) {
      device.peripheral.disconnect();
      return reject('No characteristics available for ' + device.peripheral.address);
    } else if (!device.characteristics[0].properties.includes('write')) {
      device.peripheral.disconnect();
      return Promise.reject('Characteristic ' + characteristic.uuid + ' not writable for ' + device.peripheral.address);
    } else {
      const connectTimeout = setTimeout(timeout, shared.sendTimeout, reject, device.peripheral);
      device.characteristics[0].write(new Buffer(command), false, (error) => {
        connectTimeout.unref();
        device.peripheral.disconnect();

        if (error) {
          return reject('Error occured sending command : ' + error);
        } else {
          return resolve(device);
        }
      });
    }
  });
};


function timeout(reject, peripheral) {
  peripheral.disconnect();
  return reject('Send data to characteristic timeout for ' + peripheral.address);
}