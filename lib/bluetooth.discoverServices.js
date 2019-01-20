/**
 * Based on Noble nodejs library.
 * Uses Noble peripherals, services, characteristics to communicate with BLE devices.
 */
module.exports = function (device) {
  return new Promise((resolve, reject) => {
    console.log('Peripheral ' + device.peripheral.address + ' found and ' + device.peripheral.state);

    device.peripheral.discoverServices(['fff0'], (error, services) => {
      if (error) {
        device.peripheral.disconnect();
        return reject(error);
      } else {
        device.services = services;
        return resolve(device);
      }
    });
  });
};
