const awoxConnect = require('./bluetooth.connect.js');
const awoxDiscoverServices = require('./bluetooth.discoverServices.js');
const awoxDiscoverCharacteristics = require('./bluetooth.discoverCharacteristics.js');
const awoxSend = require('./bluetooth.send.js');
const awoxScan = require('./bluetooth.scan.js');
const generateCommand = require('./generateCommand.js');

const serviceUUIDs = ['fff0', '000102030405060708090a0b0c0d1910'];
const characteristicUUIDs = ['fff1', '000102030405060708090a0b0c0d1912'];

module.exports = function (deviceInfo) {
  return new Promise((resolve, reject) => {
    var macAddr = deviceInfo.deviceType.identifier;
    var type = deviceInfo.deviceType.deviceTypeIdentifier;
    var value = deviceInfo.state.value;

    generateCommand(macAddr, type, value).then((command) => {
      var tmpPeripheral = new Map();
      tmpPeripheral.set(macAddr, deviceInfo);

      return awoxScan(tmpPeripheral).then((peripherals) => {
        if (peripherals && peripherals.has(macAddr)) {
          return peripherals.get(macAddr);
        } else {
          return reject(macAddr + ' not found');
        }
      }).then((peripheral) => {
        return awoxConnect(peripheral);
      }).then((device) => {
        return awoxDiscoverServices(serviceUUIDs, device);
      }).then((device) => {
        return awoxDiscoverCharacteristics(characteristicUUIDs, device);
      }).then((device) => {
        return awoxSend(device, command);
      }).then(() => {
        console.log('AwoX module: command well done');
        resolve(value);
      });
    }).catch((e) => {
      console.error('Awox module:', e);
      return reject(e);
    });
  });
};
