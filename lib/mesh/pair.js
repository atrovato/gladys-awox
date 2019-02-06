const awoxScan = require('../bluetooth/scan.js');
const awoxConnect = require('../bluetooth/connect.js');
const awoxDiscoverServices = require('../bluetooth/discoverServices.js');
const awoxDiscoverCharacteristics = require('../bluetooth/discoverCharacteristics.js');

const meshAuthenticate = require('./authenticate.js');
const meshChangeAuthentication = require('./changeAuthentication.js');
const meshShared = require('../shared.js');

const Promise = require('bluebird');

module.exports = function (macAddresses, meshName, meshPassword) {
  const addressesMap = new Map();

  let tmpAddresses;
  if (Array.isArray(macAddresses)) {
    tmpAddresses = macAddresses;
  } else if (typeof macAddresses == String) {
    tmpAddresses = [];
    tmpAddresses.push(macAddresses);
  } else {
    return Promise.reject('Not able to pair non readable MAC addresses');
  }

  tmpAddresses.forEach(macAddr => {
    addressesMap.set(macAddr, {});
  });

  let serviceUUIDs = [meshShared.services.exec];
  let characteristicUUIDs = [meshShared.characteristics.pair, meshShared.characteristics.status, meshShared.characteristics.command];

  return awoxScan(addressesMap).then((peripheralMap) => {
    return Promise.each(peripheralMap, (peripheralEntry) => {
      const peripheral = peripheralEntry[1];
      return awoxConnect(peripheral).then((peripheral) => {
        return awoxDiscoverServices(peripheral, serviceUUIDs).then((services) => {
          return awoxDiscoverCharacteristics(peripheral, services.get(serviceUUIDs[0]), characteristicUUIDs);
        }).then((characteristics) => {
          return meshAuthenticate(peripheral, characteristics).then((session) => {
            return meshChangeAuthentication(peripheral, characteristics, meshName, meshPassword, session);
          });
        });
      }).catch((e) => {
        console.error('Awox module: not able to pair Mesh device ' + peripheral.address + ' due to:', e);
      }).finally(() => {
        peripheralEntry[1].disconnect();
      });
    });
  });
};
