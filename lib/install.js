const shared = require('./shared.js');
const awoxScan = require('./bluetooth.scan.js');

module.exports = function () {
  console.log('Setup Awox devices');

  var managePeripheral = function (peripheral) {
    return new Promise((resolve) => {
      console.debug('Looking for ' + peripheral.address + ' capabilities...');

      if (!peripheral.advertisement || !peripheral.advertisement.localName) {
        return resolve('Peripheral ' + peripheral.address + ' have no name');
      } else {
        var device = {
          name: peripheral.advertisement.localName,
          protocol: 'bluetooth',
          service: 'awox',
          identifier: peripheral.address
        };

        var types = [{
          type: 'binary',
          name: device.name,
          identifier: 'switch',
          sensor: false,
          category: 'light',
          min: 0,
          max: 1
        },
        {
          type: 'push',
          name: device.name + ' - white reset',
          identifier: 'white_reset',
          sensor: false,
          category: 'light',
          min: 0,
          max: 1
        }];

        if (device.name.startsWith('SML')) {
          types.push({
            type: 'brightness',
            name: device.name + ' - brightness',
            identifier: 'brightness',
            sensor: false,
            category: 'light',
            min: shared.values.brightness.display.min,
            max: shared.values.brightness.display.max,
            unit: shared.values.brightness.display.unit
          });

          if (device.name.startsWith('SML-c')) {
            types.push({
              type: 'color',
              name: device.name + ' - color',
              identifier: 'color',
              sensor: false,
              category: 'light',
              min: shared.values.color.min,
              max: shared.values.color.max
            });

            types.push({
              type: 'push',
              name: device.name + ' - color reset',
              identifier: 'color_reset',
              sensor: false,
              category: 'light',
              min: 0,
              max: 1
            });
          }

          console.debug('Creating gladys device with ' + peripheral.address);
          return gladys.device.create({
            device: device,
            types: types
          }).then((result) => {
            return (result);
          });
        } else {
          return resolve('Device ' + device.name + ' not recognized as Awox Light');
        }
      }
    });
  };

  return awoxScan().then((peripherals) => {
    console.log('Starting ' + peripherals.size + ' Awox device(s) configuration...');

    var queue = Promise.resolve();
    peripherals.forEach(function (value) {
      queue.then(() => {
        return managePeripheral(value);
      });
    });

    return queue.then(() => {
      console.log('Awox configuration done');
      return Promise.resolve();
    });
  });
};
