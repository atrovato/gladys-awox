const Promise = require('bluebird');

/**
 * Based on Noble nodejs library.
 * Uses Noble peripherals, services, characteristics to communicate with BLE devices.
 */
module.exports = function (device) {
  return new Promise((resolve, reject) => {
    if (!device.characteristics || device.characteristics.length === 0) {
      device.peripheral.disconnect();
      return reject('AwoX module: No characteristics available for ' + device.peripheral.address);
    } else {
      const connectTimeout = setTimeout(timeout, 5000, reject, device.peripheral);
      device.characteristics[0].write(new Buffer(device.command), false, (error) => {
        connectTimeout.unref();
        device.peripheral.disconnect();

        if (error) {
          return reject('AwoX module: Error occured sending command : ' + error);
        } else {
          return resolve(device);
        }
      });
    }
  });
};


function timeout(reject, peripheral) {
  peripheral.disconnect();
  return reject('AwoX module: send data to characteristic timeout for ' + peripheral.address);
}