const awoxScan = require('./bluetooth.scan.js');
const awoxConnect = require('./bluetooth.connect.js');
const awoxDiscoverServices = require('./bluetooth.discoverServices.js');
const awoxDiscoverCharacteristics = require('./bluetooth.discoverCharacteristics.js');
const awoxRead = require('./bluetooth.read.js');
const managePeripheral = require('./managePeripheral.js');

const Promise = require('bluebird');

module.exports = function () {
  console.log('AwoX module: Setup devices');

  return awoxScan().then((peripheralMap) => {
    return Promise.each(peripheralMap, (peripheralEntry) => {
      return awoxConnect(peripheralEntry[1]).then((device) => {
        return awoxDiscoverServices(['180a'], device);
      }).then((device) => {
        return awoxDiscoverCharacteristics(['2a29', '2a24'], device);
      }).then((device) => {
        return awoxRead(device);
      }).then((device) => {
        peripheralEntry[1].disconnect();
        return managePeripheral(device);
      }).catch((e) => {
        console.error('AwoX module:', e);
        peripheralEntry[1].disconnect();
      });
    });
  }).then(() => {
    console.log('AwoX module: configuration done');
    return Promise.resolve();
  }).catch((e) => {
    console.error('AwoX module:', e);
    return Promise.reject(e);
  });
};
