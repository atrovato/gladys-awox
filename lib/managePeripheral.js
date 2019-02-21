const shared = require('./shared.js');
const Promise = require('bluebird');

/**
 * Checks for current device if AwoX compatible, and add it as new device in Gladys.
 */
module.exports = function (peripheral, valueMap) {
  const macAddress = peripheral.address;
  const constructorName = (valueMap.get('2a29') || '').toString('utf-8').replace('\u0000', '').toLowerCase();

  if ('awox' != constructorName) {
    return Promise.reject(macAddress + ' is not an AwoX device');
  } else {
    return generateDevice(macAddress, valueMap.get('2a24')).then((deviceGrp) => {
      return gladys.device.getByIdentifier(deviceGrp.device).then((storedDevice) => {
        deviceGrp.alreadyExists = true;
        deviceGrp.device.id = storedDevice.id;
        deviceGrp.device.name = storedDevice.name;
        deviceGrp.device.room = storedDevice.room;
        deviceGrp.device.user = storedDevice.user;
        deviceGrp.device.machine = storedDevice.machine;
        return Promise.resolve(deviceGrp);
      }).catch(() => {
        return Promise.resolve(deviceGrp);
      });
    });
  }
};

function generateDevice(macAddress, deviceValue) {
  const deviceName = (deviceValue || '').toString('utf-8').replace('\u0000', '');
  const lowerDeviceNameSplit = deviceName.toLowerCase().split(/[-_]/);
  const deviceModel = (lowerDeviceNameSplit[0] || '');

  const remoteDevice = deviceModel.startsWith('rcu');
  const deviceType = (lowerDeviceNameSplit[1] || '');
  const meshDevice = deviceModel.endsWith('m');
  const colorDevice = deviceType.startsWith('c');

  const gladysDevice = {
    name: deviceName,
    identifier: macAddress,
    service: 'awox',
    protocol: remoteDevice ? 'bluetooth-remote' : meshDevice ? 'bluetooth-mesh' : 'bluetooth'
  };

  return Promise.resolve({
    device: gladysDevice,
    remote: remoteDevice,
    types: remoteDevice ? [] : generateDeviceTypes(deviceName, colorDevice, meshDevice)
  });
}

function generateDeviceTypes(deviceName, colorDevice, meshDevice) {
  const types = [{
    type: 'binary',
    nameSuffix: '',
    identifier: 'switch',
    sensor: false,
    category: 'light',
    min: 0,
    max: 1,
    display: true
  },
  {
    type: 'brightness',
    nameSuffix: ' - brightness',
    identifier: 'brightness',
    sensor: false,
    category: 'light',
    min: shared.values.brightness.display.min,
    max: shared.values.brightness.display.max,
    unit: shared.values.brightness.display.unit,
    display: true
  }];

  if (colorDevice) {
    types.push({
      type: 'color',
      nameSuffix: ' - color',
      identifier: 'color',
      sensor: false,
      category: 'light',
      min: shared.values.color.min,
      max: shared.values.color.max,
      display: true
    });

    if (!meshDevice) {
      types.push({
        type: 'push',
        nameSuffix: ' - color reset',
        identifier: 'color_reset',
        sensor: false,
        category: 'light',
        min: 0,
        max: 1,
        display: true
      });
    }
  }

  if (meshDevice) {
    types.push({
      type: 'preset',
      nameSuffix: ' - color sequence',
      identifier: 'preset',
      sensor: false,
      category: 'light',
      min: 0,
      max: 6,
      display: true
    });

    types.push({
      type: 'push',
      nameSuffix: ' - pair reset',
      identifier: 'reset',
      sensor: false,
      category: 'light',
      min: 0,
      max: 1,
      display: false
    });
  } else {
    types.push({
      type: 'push',
      nameSuffix: ' - white reset',
      identifier: 'white_reset',
      sensor: false,
      category: 'light',
      min: 0,
      max: 1,
      display: true
    });
  }

  return types;
}