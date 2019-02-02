const chai = require('chai');
const assert = chai.assert;
const shared = require('../../../lib/shared.js');

var gladysDeviceCreated = false;

const managePeripheral = require('../../../lib/managePeripheral.js');

describe('Gladys peripheral as device manager', function () {

  var peripheral;
  var valueMap;
  var genericValidTest;
  var generateDevice;

  beforeEach(function () {
    gladysDeviceCreated = false;
    peripheral = { address: 'MAC address' };
    valueMap = new Map();

    genericValidTest = function (done, constructorName, deviceName, expectedCreatedDevice) {
      valueMap.set('2a29', constructorName);
      valueMap.set('2a24', deviceName);

      managePeripheral(peripheral, valueMap)
        .then((result) => {
          assert.isOk(gladysDeviceCreated, 'Gladys should not have creted a device');
          assert.deepEqual(result, expectedCreatedDevice, 'Not expected device created');
          done();
        }).catch((result) => {
          done('Should have fail ' + result);
        });
    };

    gladys = {
      device: {
        create: function (device) {
          gladysDeviceCreated = true;
          return Promise.resolve(device);
        }
      }
    };

    generateDevice = function (originalDeviceName, mesh, colorDevice) {
      var deviceName = originalDeviceName.toString('utf-8').replace('\u0000', '');
      var result = {
        device: {
          name: deviceName,
          identifier: peripheral.address,
          service: 'awox',
          protocol: mesh ? 'bluetooth-mesh' : 'bluetooth'
        },
        types: [
          {
            type: 'binary',
            name: deviceName,
            identifier: 'switch',
            sensor: false,
            category: 'light',
            min: 0,
            max: 1,
            display: !mesh
          },
          {
            type: 'push',
            name: deviceName + ' - white reset',
            identifier: 'white_reset',
            sensor: false,
            category: 'light',
            min: 0,
            max: 1,
            display: !mesh
          }, {
            type: 'brightness',
            name: deviceName + ' - brightness',
            identifier: 'brightness',
            sensor: false,
            category: 'light',
            min: shared.values.brightness.display.min,
            max: shared.values.brightness.display.max,
            unit: shared.values.brightness.display.unit,
            display: !mesh
          }
        ]
      };

      if (colorDevice) {
        result.types.push({
          type: 'color',
          name: deviceName + ' - color',
          identifier: 'color',
          sensor: false,
          category: 'light',
          min: shared.values.color.min,
          max: shared.values.color.max,
          display: !mesh
        });

        result.types.push({
          type: 'push',
          name: deviceName + ' - color reset',
          identifier: 'color_reset',
          sensor: false,
          category: 'light',
          min: 0,
          max: 1,
          display: !mesh
        });
      }

      return result;
    };
  });

  it('No constructor name (2a29)', function (done) {
    managePeripheral(peripheral, valueMap)
      .then(() => {
        done('Should have fail');
      }).catch((result) => {
        assert.equal(peripheral.address + ' is not an AwoX device', result, 'Invalid error');
        assert.isNotOk(gladysDeviceCreated, 'Gladys should not have creted a device');
        done();
      });
  });

  it('Invalid constructor name (2a29)', function (done) {
    valueMap.set('2a29', 'notAwoX'.toString(16));

    managePeripheral(peripheral, valueMap)
      .then(() => {
        done('Should have fail');
      }).catch((result) => {
        assert.equal(peripheral.address + ' is not an AwoX device', result, 'Invalid error');
        assert.isNotOk(gladysDeviceCreated, 'Gladys should not have creted a device');
        done();
      });
  });

  it('Invalid constructor name (2a29)', function (done) {
    valueMap.set('2a29', 'notAwoX');

    managePeripheral(peripheral, valueMap)
      .then(() => {
        done('Should have fail');
      }).catch((result) => {
        assert.equal(peripheral.address + ' is not an AwoX device', result, 'Invalid error');
        assert.isNotOk(gladysDeviceCreated, 'Gladys should not have creted a device');
        done();
      });
  });

  it('No device name (2a24)', function (done) {
    valueMap.set('2a29', 'awox');

    managePeripheral(peripheral, valueMap)
      .then(() => {
        done('Should have fail');
      }).catch((result) => {
        assert.equal('Device <> is not managed by the current version of the module', result, 'Invalid error');
        assert.isNotOk(gladysDeviceCreated, 'Gladys should not have creted a device');
        done();
      });
  });

  it('Invalid device name (2a24)', function (done) {
    valueMap.set('2a29', 'awox');
    valueMap.set('2a24', 'INVALID_1234');

    managePeripheral(peripheral, valueMap)
      .then(() => {
        done('Should have fail');
      }).catch((result) => {
        assert.equal('Device <INVALID_1234> is not managed by the current version of the module', result, 'Invalid error');
        assert.isNotOk(gladysDeviceCreated, 'Gladys should not have creted a device');
        done();
      });
  });

  it('Invalid short device name (2a24)', function (done) {
    valueMap.set('2a29', 'awox');
    valueMap.set('2a24', 'UN-1234');

    managePeripheral(peripheral, valueMap)
      .then(() => {
        done('Should have fail');
      }).catch((result) => {
        assert.equal('Device <UN-1234> is not managed by the current version of the module', result, 'Invalid error');
        assert.isNotOk(gladysDeviceCreated, 'Gladys should not have creted a device');
        done();
      });
  });

  /** Valid tests */

  it('Valid test [AWOX\\u0000 ; SmL-PFEZFK\\u0000] (hex)', function (done) {
    var constructorName = 'AWOX\u0000'.toString(16);
    var deviceName = 'SmL-PFEZFK\u0000'.toString(16);
    var expectedCreatedDevice = generateDevice(deviceName);
    genericValidTest(done, constructorName, deviceName, expectedCreatedDevice);
  });

  it('Valid test [AWOX\\u0000 ; SmL-PFEZFK\\u0000] (utf-8)', function (done) {
    var constructorName = 'AWOX\u0000';
    var deviceName = 'SmL-PFEZFK\u0000';
    var expectedCreatedDevice = generateDevice(deviceName);
    genericValidTest(done, constructorName, deviceName, expectedCreatedDevice);
  });

  it('Valid test [AWOX\\u0000 ; not device name] (utf-8)', function (done) {
    var constructorName = 'AWOX\u0000';
    var deviceName = 'SML';
    var expectedCreatedDevice = generateDevice(deviceName);
    genericValidTest(done, constructorName, deviceName, expectedCreatedDevice);
  });

  it('Valid test [AWOX\\u0000 ; not mesh device] (utf-8)', function (done) {
    var constructorName = 'AWOX\u0000';
    var deviceName = 'SMLq';
    var expectedCreatedDevice = generateDevice(deviceName, false);
    genericValidTest(done, constructorName, deviceName, expectedCreatedDevice);
  });

  it('Valid test [AWOX\\u0000 ; mesh device] (utf-8)', function (done) {
    var constructorName = 'AWOX\u0000';
    var deviceName = 'SMLm';
    var expectedCreatedDevice = generateDevice(deviceName, true);
    genericValidTest(done, constructorName, deviceName, expectedCreatedDevice);
  });

  it('Valid test [AWOX\\u0000 ; color device (lower)] (utf-8)', function (done) {
    var constructorName = 'AWOX\u0000';
    var deviceName = 'sml-cLDZAFE';
    var expectedCreatedDevice = generateDevice(deviceName, false, true);
    genericValidTest(done, constructorName, deviceName, expectedCreatedDevice);
  });

  it('Valid test [AWOX\\u0000 ; color device (upper)] (utf-8)', function (done) {
    var constructorName = 'AWOX\u0000';
    var deviceName = 'SML-CKDHKFH';
    var expectedCreatedDevice = generateDevice(deviceName, false, true);
    genericValidTest(done, constructorName, deviceName, expectedCreatedDevice);
  });

  it('Valid test [AWOX\\u0000 ; mesh color device (lower)] (utf-8)', function (done) {
    var constructorName = 'AWOX\u0000';
    var deviceName = 'smlm-cLDZAFE';
    var expectedCreatedDevice = generateDevice(deviceName, true, true);
    genericValidTest(done, constructorName, deviceName, expectedCreatedDevice);
  });

  it('Valid test [AWOX\\u0000 ; mesh color device (upper)] (utf-8)', function (done) {
    var constructorName = 'AWOX\u0000';
    var deviceName = 'SMLM-CKDHKFH';
    var expectedCreatedDevice = generateDevice(deviceName, true, true);
    genericValidTest(done, constructorName, deviceName, expectedCreatedDevice);
  });

});