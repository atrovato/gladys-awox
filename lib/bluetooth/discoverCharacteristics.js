const shared = require('../shared.js');
const Promise = require('bluebird');

/**
 * Based on Noble nodejs library.
 * Uses Noble peripherals, services, characteristics to communicate with BLE devices.
 */
module.exports = function (peripheral, service, uuids) {
  return new Promise((resolve, reject) => {
    const characteristicMap = new Map();

    let notMapped = uuids;
    if (uuids && uuids.length && service.characteristics) {
      notMapped = uuids.filter(uuid => {
        const found = service.characteristics.filter(characteristic => {
          const filtered = characteristic.uuid == uuid;
          if (filtered) {
            characteristicMap.set(characteristic.uuid, characteristic);
          }
          return filtered;
        });

        return found.length === 0;
      });

      if (notMapped.length === 0) {
        return resolve(characteristicMap);
      }
    }

    const connectTimeout = setTimeout(timeout, shared.characteristicTimeout, reject, peripheral);
    service.discoverCharacteristics(notMapped, (error, characteristics) => {
      clearTimeout(connectTimeout);

      if (error) {
        return reject(error);
      } else if (characteristics.length === 0) {
        return reject('No characteristics found for service ' + service.uuid + ' on ' + peripheral.address);
      } else {
        characteristics.forEach(characteristic => {
          characteristicMap.set(characteristic.uuid, characteristic);
        });
        return resolve(characteristicMap);
      }
    });
  });
};

function timeout(reject, peripheral) {
  return reject('Discover characteristics timeout for ' + peripheral.address);
}
