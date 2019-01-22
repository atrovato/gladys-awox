const Promise = require('bluebird');

/**
 * Based on Noble nodejs library.
 * Uses Noble peripherals, services, characteristics to communicate with BLE devices.
 */
module.exports = function (device) {
  return new Promise((resolve, reject) => {
    if (!device.characteristics || device.characteristics.length === 0) {
      console.error('AwoX module: No characteristics found for ' + device.peripheral.address);
      device.peripheral.disconnect();
      return reject('AwoX module: No characteristics found for ' + device.peripheral.address);
    } else {
      device.characteristics[0].write(new Buffer(device.command), false, (error) => {
        device.peripheral.disconnect();

        if (error) {
          console.error('AwoX module: Error occured sending command : ' + error);
          return reject('AwoX module: Error occured sending command : ' + error);
        } else {
          console.log('AwoX module: Command sent:' + device.command);
          return resolve(device);
        }
      });
    }
  });
};