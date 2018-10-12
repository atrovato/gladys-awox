/**
 * Based on Noble nodejs library.
 * Uses Noble peripherals, services, characteristics to communicate with BLE devices.
 */
module.exports = function(peripheral) {
  return new Promise((resolve, reject) => {
    peripheral.connect((error) => {
      if (error) {
        return reject(error);
      } else {
        return resolve(peripheral);
      }
    });
  });
};