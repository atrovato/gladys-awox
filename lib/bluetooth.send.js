const shared = require('./shared.js');
const Promise = require('bluebird');

/**
 * Based on Noble nodejs library.
 * Uses Noble peripherals, services, characteristics to communicate with BLE devices.
 */
module.exports = function (device, command, uuid, writeWithoutResponse = false) {
  if (!device.characteristics || device.characteristics.length === 0) {
    device.peripheral.disconnect();
    return Promise.reject('No characteristics available for ' + device.peripheral.address);
  } else if (!uuid && device.characteristics.length > 1) {
    device.peripheral.disconnect();
    return Promise.reject('UUID filter is mandatory when more than 1 characteristic is available for ' + device.peripheral.address);
  } else {
    let characteristics;
    if (uuid) {
      characteristics = device.characteristics.filter((c) => {
        return c.uuid == uuid;
      });
    } else {
      characteristics = device.characteristics.slice(0);
    }

    if (!characteristics || characteristics.length === 0) {
      device.peripheral.disconnect();
      return Promise.reject('No ' + uuid + ' characteristics available for ' + device.peripheral.address);
    } else {
      return Promise.each(characteristics, (characteristic) => {
        return new Promise((resolve, reject) => {
          if (!characteristic.properties.includes('write')) {
            device.peripheral.disconnect();
            return reject('Characteristic ' + characteristic.uuid + ' not writable for ' + device.peripheral.address);
          } else {
            const connectTimeout = setTimeout(timeout, shared.sendTimeout, reject, device.peripheral);
            characteristic.write(new Buffer(command), writeWithoutResponse, (error) => {
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
      }).then(() => {
        return Promise.resolve(device);
      });
    }
  }
};


function timeout(reject, peripheral) {
  peripheral.disconnect();
  return reject('Send data to characteristic timeout for ' + peripheral.address);
}