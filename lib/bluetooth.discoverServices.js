const shared = require('./shared.js');
const Promise = require('bluebird');

/**
 * Based on Noble nodejs library.
 * Uses Noble peripherals, services, characteristics to communicate with BLE devices.
 */
module.exports = function (peripheral, uuids) {
  return new Promise((resolve, reject) => {
    const connectTimeout = setTimeout(timeout, shared.serviceTimeout, reject, peripheral);
    peripheral.discoverServices(uuids, (error, services) => {
      clearTimeout(connectTimeout);

      if (error) {
        return reject(error);
      } else if (services.length === 0) {
        return reject('No services found for ' + peripheral.address);
      } else {
        const serviceMap = new Map();
        services.forEach(service => {
          serviceMap.set(service.uuid, service);
        });
        return resolve(serviceMap);
      }
    });
  });
};

function timeout(reject, peripheral) {
  return reject('Discover services timeout for ' + peripheral.address);
}