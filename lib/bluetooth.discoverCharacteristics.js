/**
 * Based on Noble nodejs library.
 * Uses Noble peripherals, services, characteristics to communicate with BLE devices.
 */
module.exports = function (device) {
  return new Promise((resolve, reject) => {
    if (!device.services || device.services.length === 0) {
      console.error('No service found for ' + device.peripheral.address);
      device.peripheral.disconnect();
      return reject('No service found for ' + device.peripheral.address);
    } else {
      device.services[0].discoverCharacteristics('[fff1]', (error, characteristics) => {
        if (error) {
          return reject(error);
        } else {
          device.characteristics = characteristics;
          return resolve(device);
        }
      });
    }
  });
};
