/**
 * Based on Noble nodejs library.
 * Uses Noble peripherals, services, characteristics to communicate with BLE devices.
 */
module.exports = function (device) {
  return new Promise((resolve, reject) => {
    console.log('Peripheral ' + device.peripheral.address + ' found and connected');

    device.peripheral.discoverServices('[fff0]', (error, services) => {
      if (error) {
        return reject(error);
      } else {
        device.services = services;
        return resolve(device);
      }
    });
  });
};
