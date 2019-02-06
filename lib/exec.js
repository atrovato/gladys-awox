const awoxConnect = require('./bluetooth/connect.js');
const awoxDiscoverServices = require('./bluetooth/discoverServices.js');
const awoxDiscoverCharacteristics = require('./bluetooth/discoverCharacteristics.js');
const awoxSend = require('./bluetooth/send.js');
const awoxScan = require('./bluetooth/scan.js');
const generateCommand = require('./default/generateCommand.js');

const meshExec = require('./mesh/exec.js');
const meshShared = require('./mesh/shared.js');

const Promise = require('bluebird');

module.exports = function (deviceInfo) {
  const macAddr = deviceInfo.deviceType.identifier;
  const type = deviceInfo.deviceType.deviceTypeIdentifier;
  const value = deviceInfo.state.value;
  const protocol = deviceInfo.deviceType.protocol;
  const meshNetwork = protocol == 'bluetooth-mesh';

  let serviceUUIDs;
  let characteristicUUIDs;
  if (meshNetwork) {
    serviceUUIDs = [meshShared.services.exec];
    characteristicUUIDs = [meshShared.characteristics.pair, meshShared.characteristics.status, meshShared.characteristics.command];
  } else {
    serviceUUIDs = ['fff0'];
    characteristicUUIDs = ['fff1'];
  }

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
      return awoxDiscoverCharacteristics(peripheral, services.get(serviceUUIDs[0]), characteristicUUIDs);
    }).then((characteristics) => {
      if (meshNetwork) {
        return meshExec(peripheral, characteristics, type, value);
      } else {
        return generateCommand(macAddr, type, value).then((command) => {
          return awoxSend(peripheral, characteristics.get(characteristicUUIDs[0]), command);
        });
      }
    }).then(() => {
      console.log('AwoX module: Command well done');
      return Promise.resolve(value);
    }).finally(() => {
      peripheral.disconnect();
    });
  }).catch((e) => {
    console.error('Awox module:', e);
    return Promise.reject(e);
  });
};
