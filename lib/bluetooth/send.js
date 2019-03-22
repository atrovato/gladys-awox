const shared = require('../shared.js');
const Promise = require('bluebird');

/**
 * Based on Noble nodejs library.
 * Uses Noble peripherals, services, characteristics to communicate with BLE devices.
 */
module.exports = function (peripheral, characteristic, command, writeWithoutResponse = false) {
  if (!characteristic.properties.includes('write')) {
    return Promise.reject('Characteristic ' + characteristic.uuid + ' not writable for ' + peripheral.address);
  } else {
    return new Promise((resolve, reject) => {
      const connectTimeout = setTimeout(timeout, shared.sendTimeout, reject, peripheral);
      const commandBuffer = Buffer.isBuffer(command) ? command : new Buffer(command);
      characteristic.write(commandBuffer, writeWithoutResponse, (error) => {
        clearTimeout(connectTimeout);

        if (error) {
          return reject('Error occured sending command : ' + error);
        } else {
          return resolve(command);
        }
      });
    });
  }
};


function timeout(reject, peripheral) {
  return reject('Send data to characteristic timeout for ' + peripheral.address);
}