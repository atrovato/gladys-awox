const Promise = require('bluebird');
const shared = require('./shared.js');

const managedDeviceNamePrefix = ['sml'];

/**
 * Checks for current device if AwoX compatible, and add it as new device in Gladys.
 */
module.exports = function (peripheral, valueMap) {
  const macAddress = peripheral.address;
  const constructorName = (valueMap.get('2a29') || '').toString('utf-8').replace('\u0000', '').toLowerCase();

  if ('awox' != constructorName) {
    return Promise.reject(macAddress + ' is not an AwoX device');
  } else {
    return generateDevice(macAddress, valueMap.get('2a24')).then((gladysDevice) => {
      // TODO Activer cette partie lors de la publication du module
      return gladys.device.create(gladysDevice);
      //console.log('AwoX module: ' + macAddress + ' should be created as Awox device ', gladysDevice);
      //return Promise.resolve(macAddress);
    });
  }
};

function generateDevice(macAddress, deviceValue) {
  const deviceName = (deviceValue || '').toString('utf-8').replace('\u0000', '');
  const lowerDeviceNameSplit = deviceName.toLowerCase().split(/[-_]/);
  const deviceModel = (lowerDeviceNameSplit[0] || '');

  if (!managedDeviceNamePrefix.includes(deviceModel.substring(0, 3))) {
    return Promise.reject(deviceName + ' is not managed by the current version of the module');
  } else {
    const deviceType = (lowerDeviceNameSplit[1] || '');
    const meshDevice = deviceModel.startsWith('smlm') || deviceModel.startsWith('rcum');
    const colorDevice = deviceType.startsWith('c');

    const gladysDevice = {
      name: deviceName,
      identifier: macAddress,
      service: 'awox',
      protocol: meshDevice ? 'bluetooth-mesh' : 'bluetooth'
    };

    return Promise.resolve({
      device: gladysDevice,
      types: generateDeviceTypes(deviceName, colorDevice, !meshDevice)
    });
  }
}


function generateDeviceTypes(deviceName, colorDevice, display) {
  const types = [{
    type: 'binary',
    name: deviceName,
    identifier: 'switch',
    sensor: false,
    category: 'light',
    min: 0,
    max: 1,
    display: display
  },
  {
    type: 'push',
    name: deviceName + ' - white reset',
    identifier: 'white_reset',
    sensor: false,
    category: 'light',
    min: 0,
    max: 1,
    display: display
  }, {
    type: 'brightness',
    name: deviceName + ' - brightness',
    identifier: 'brightness',
    sensor: false,
    category: 'light',
    min: shared.values.brightness.display.min,
    max: shared.values.brightness.display.max,
    unit: shared.values.brightness.display.unit,
    display: display
  }];

  if (colorDevice) {
    types.push({
      type: 'color',
      name: deviceName + ' - color',
      identifier: 'color',
      sensor: false,
      category: 'light',
      min: shared.values.color.min,
      max: shared.values.color.max,
      display: display
    });

    types.push({
      type: 'push',
      name: deviceName + ' - color reset',
      identifier: 'color_reset',
      sensor: false,
      category: 'light',
      min: 0,
      max: 1,
      display: display
    });
  }

  return types;
}