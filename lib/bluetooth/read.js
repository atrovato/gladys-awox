const shared = require('../shared.js');
const Promise = require('bluebird');

/**
 * Based on Noble nodejs library.
 * Uses Noble peripherals, services, characteristics to communicate with BLE devices.
 */
module.exports = function (peripheral, characteristic) {
  if (!characteristic.properties.includes('read')) {
    return Promise.reject('Characteristic ' + characteristic.uuid + ' not readable for ' + peripheral.address);
  } else {
    return new Promise((resolve, reject) => {
      const connectTimeout = setTimeout(timeout, shared.readTimeout, reject, peripheral);
      characteristic.read((error, data) => {
        clearTimeout(connectTimeout);

        if (error) {
          return reject('Error occured reading : ' + error);
        } else {
          return resolve(data);
        }
      });
    });
  }
};


function timeout(reject, peripheral) {
  return reject('Read characteristics timeout for ' + peripheral.address);
}
