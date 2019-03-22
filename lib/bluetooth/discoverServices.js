const shared = require('../shared.js');
const Promise = require('bluebird');

/**
 * Based on Noble nodejs library.
 * Uses Noble peripherals, services, characteristics to communicate with BLE devices.
 */
module.exports = function (peripheral, uuids) {
  return new Promise((resolve, reject) => {
    const serviceMap = new Map();
    let notMapped = uuids;

    if (uuids && uuids.length && peripheral.services) {
      notMapped = uuids.filter(uuid => {
        const found = peripheral.services.filter(service => {
          const filtered = service.uuid == uuid;
          if (filtered) {
            serviceMap.set(service.uuid, service);
          }
          return filtered;
        });

        return found.length === 0;
      });

      if (notMapped.length === 0) {
        return resolve(serviceMap);
      }
    }
    
    const connectTimeout = setTimeout(timeout, shared.serviceTimeout, reject, peripheral);
    peripheral.discoverServices(notMapped, (error, services) => {
      clearTimeout(connectTimeout);

      if (error) {
        return reject(error);
      } else if (services.length === 0) {
        return reject('No services found for ' + peripheral.address);
      } else {
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