const awoxConnect = require('./bluetooth.connect.js');
const awoxDiscoverServices = require('./bluetooth.discoverServices.js');
const awoxDiscoverCharacteristics = require('./bluetooth.discoverCharacteristics.js');
const awoxSend = require('./bluetooth.send.js');
const awoxScan = require('./bluetooth.scan.js');
const generateCommand = require('./generateCommand.js');
const Promise = require('bluebird');

const serviceUUIDs = ['fff0', '000102030405060708090a0b0c0d1910'];
const characteristicUUIDs = ['fff1', '000102030405060708090a0b0c0d1912'];

module.exports = function (deviceInfo) {
  var macAddr = deviceInfo.deviceType.identifier;
  var type = deviceInfo.deviceType.deviceTypeIdentifier;
  var value = deviceInfo.state.value;

  return generateCommand(macAddr, type, value).then((command) => {
    var tmpPeripheral = new Map();
    tmpPeripheral.set(macAddr, deviceInfo);

    return awoxScan(tmpPeripheral).then((peripherals) => {
      if (peripherals && peripherals.has(macAddr)) {
        return peripherals.get(macAddr);
      } else {
        return Promise.reject(macAddr + ' not found');
      }
    }).then((peripheral) => {
      return awoxConnect(peripheral).then((peripheral) => {
        return awoxDiscoverServices(peripheral, serviceUUIDs);
      }).then((services) => {
        const characteristicsMap = new Map();
        return Promise.map(services, serviceEntry => {
          return awoxDiscoverCharacteristics(peripheral, serviceEntry[1], characteristicUUIDs).then((characteristics) => {
            characteristics.forEach((value, key) => {
              characteristicsMap.set(key, value);
            });
          });
        }, { concurrency: 1 }).then(() => {
          return Promise.resolve(characteristicsMap);
        });
      }).then((characteristics) => {
        return Promise.map(characteristics, characteristicEntry => {
          return awoxSend(peripheral, characteristicEntry[1], command);
        }, { concurrency: 1 });
      }).then(() => {
        console.log('AwoX module: command well done');
        return Promise.resolve(value);
      }).finally(() => {
        peripheral.disconnect();
      });
    });
  }).catch((e) => {
    console.error('Awox module:', e);
    return Promise.reject(e);
  });
};
