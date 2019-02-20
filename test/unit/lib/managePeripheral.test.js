const chai = require('chai');
const assert = chai.assert;
const shared = require('../../../lib/shared.js');

var gladysDeviceGet = false;

const managePeripheral = require('../../../lib/managePeripheral.js');

describe('Gladys peripheral as device manager', function () {

  var peripheral;
  var valueMap;
  var genericValidTest;
  var generateDevice;

  beforeEach(function () {
    gladysDeviceGet = false;
    peripheral = { address: 'MAC address' };
    valueMap = new Map();

    genericValidTest = function (done, constructorName, deviceName, expectedCreatedDevice) {
      valueMap.set('2a29', constructorName);
      valueMap.set('2a24', deviceName);

      managePeripheral(peripheral, valueMap)
        .then((result) => {
          assert.isOk(gladysDeviceGet, 'Gladys should not have creted a device');
          assert.deepEqual(result.device, expectedCreatedDevice.device, 'Not expected device created');
          assert.deepEqual(result.remote, expectedCreatedDevice.remote, 'Not expected remote created');
          assert.deepEqual(result.alreadyExists, expectedCreatedDevice.alreadyExists, 'Not expected alreadyExists created');
          assert.deepEqual(result.types, expectedCreatedDevice.types, 'Not expected types created');
          done();
        }).catch((result) => {
          done('Should have fail ' + result);
        });
    };

    gladys = {
      device: {
        get: function () {
          gladysDeviceGet = true;
          return Promise.resolve([]);
        }
      }
    };

    generateDevice = function (originalDeviceName, meshDevice = false, colorDevice = false, remoteDevice = false) {
      var deviceName = originalDeviceName.toString('utf-8').replace('\u0000', '');
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

      var result = {
        device: {
          name: deviceName,
          identifier: peripheral.address,
          service: 'awox',
          protocol: remoteDevice ? 'bluetooth-remote' : meshDevice ? 'bluetooth-mesh' : 'bluetooth'
        },
        remote: remoteDevice,
        alreadyExists: false,
        types: remoteDevice ? [] : types
      };

      return result;
    };
  });

  it('No constructor name (2a29)', function (done) {
    managePeripheral(peripheral, valueMap)
      .then(() => {
        done('Should have fail');
      }).catch((result) => {
        assert.equal(peripheral.address + ' is not an AwoX device', result, 'Invalid error');
        assert.isNotOk(gladysDeviceGet, 'Gladys should not have creted a device');
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
        assert.isNotOk(gladysDeviceGet, 'Gladys should not have creted a device');
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
        assert.isNotOk(gladysDeviceGet, 'Gladys should not have creted a device');
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
    var expectedCreatedDevice = generateDevice(deviceName, false, false);
    genericValidTest(done, constructorName, deviceName, expectedCreatedDevice);
  });

  it('Valid test [AWOX\\u0000 ; mesh device] (utf-8)', function (done) {
    var constructorName = 'AWOX\u0000';
    var deviceName = 'SMLm';
    var expectedCreatedDevice = generateDevice(deviceName, true, false);
    genericValidTest(done, constructorName, deviceName, expectedCreatedDevice);
  });

  it('Valid test [AWOX\\u0000 ; color device (lower)] (utf-8)', function (done) {
    var constructorName = 'AWOX\u0000';
    var deviceName = 'sml-cLDZAFE';
    var expectedCreatedDevice = generateDevice(deviceName, false, true, false);
    genericValidTest(done, constructorName, deviceName, expectedCreatedDevice);
  });

  it('Valid test [AWOX\\u0000 ; color device (upper)] (utf-8)', function (done) {
    var constructorName = 'AWOX\u0000';
    var deviceName = 'SML-CKDHKFH';
    var expectedCreatedDevice = generateDevice(deviceName, false, true, false);
    genericValidTest(done, constructorName, deviceName, expectedCreatedDevice);
  });

  it('Valid test [AWOX\\u0000 ; mesh color device (lower)] (utf-8)', function (done) {
    var constructorName = 'AWOX\u0000';
    var deviceName = 'smlm-cLDZAFE';
    var expectedCreatedDevice = generateDevice(deviceName, true, true, false);
    genericValidTest(done, constructorName, deviceName, expectedCreatedDevice);
  });

  it('Valid test [AWOX\\u0000 ; mesh color device (upper)] (utf-8)', function (done) {
    var constructorName = 'AWOX\u0000';
    var deviceName = 'SMLM-CKDHKFH';
    var expectedCreatedDevice = generateDevice(deviceName, true, true, false);
    genericValidTest(done, constructorName, deviceName, expectedCreatedDevice);
  });

  it('Valid test [AWOX\\u0000 ; remote device] (utf-8)', function (done) {
    var constructorName = 'AWOX\u0000';
    var deviceName = 'RCUm-CKDHKFH';
    var expectedCreatedDevice = generateDevice(deviceName, true, true, true);
    genericValidTest(done, constructorName, deviceName, expectedCreatedDevice);
  });

});