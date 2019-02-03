const awoxScan = require('./bluetooth.scan.js');
const awoxConnect = require('./bluetooth.connect.js');
const awoxDiscoverServices = require('./bluetooth.discoverServices.js');
const awoxDiscoverCharacteristics = require('./bluetooth.discoverCharacteristics.js');
const awoxRead = require('./bluetooth.read.js');
const managePeripheral = require('./managePeripheral.js');

const Promise = require('bluebird');

module.exports = function () {
  console.log('AwoX module: Setting-up devices...');

  return awoxScan().then((peripheralMap) => {
    return Promise.each(peripheralMap, (peripheralEntry) => {
      const peripheral = peripheralEntry[1];
      return awoxConnect(peripheral).then((peripheral) => {
        return awoxDiscoverServices(peripheral, ['180a']);
      }).then((services) => {
        const characteristicsMap = new Map();
        return Promise.map(services, serviceEntry => {
          return awoxDiscoverCharacteristics(peripheral, serviceEntry[1], ['2a29', '2a24']).then((characteristics) => {
            characteristics.forEach((value, key) => {
              characteristicsMap.set(key, value);
            });
          });
        }, { concurrency: 1 }).then(() => {
          return Promise.resolve(characteristicsMap);
        });
      }).then((characteristics) => {
        const valueMap = new Map();
        return Promise.map(characteristics, characteristicEntry => {
          return awoxRead(peripheral, characteristicEntry[1]).then((value) => {
            valueMap.set(characteristicEntry[0], value);
            return Promise.resolve(value);
          }, { concurrency: 1 });
        }).then(() => {
          return Promise.resolve(valueMap);
        });
      }).then((values) => {
        peripheral.disconnect();
        return managePeripheral(peripheral, values);
      }).catch((e) => {
        console.error('AwoX module:', e);
        peripheral.disconnect();
      });
    });
  }).then(() => {
    console.log('AwoX module: Configuration done');
    return Promise.resolve();
  }).catch((e) => {
    console.error('AwoX module:', e);
    return Promise.reject(e);
  });
};
