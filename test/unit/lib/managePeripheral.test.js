const chai = require('chai');
const assert = chai.assert;

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
          assert.isOk(gladysDeviceGet, 'Gladys should not have created a device');
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
        getByIdentifier: function () {
          gladysDeviceGet = true;
          return Promise.reject();
        }
      }
    };

    generateDevice = function (originalDeviceName, meshDevice = false, colorDevice = false, remoteDevice = false) {
      var deviceName = (originalDeviceName || '').toString('utf-8').replace('\u0000', '');
      const types = [{
        type: 'binary',
        nameSuffix: '',
        identifier: 'switch',
        sensor: false,
        category: 'light',
        min: 0,
        max: 1,
        display: true
      }];

      if (colorDevice) {
        types.push({
          type: 'color',
          nameSuffix: ' - color',
          identifier: 'color',
          sensor: false,
          category: 'light',
          min: 0,
          max: 16777215,
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
        } else {
          types.push({
            type: 'color_brightness',
            nameSuffix: ' - color brightness',
            identifier: 'color_brightness',
            sensor: false,
            category: 'light',
            min: 0,
            max: 100,
            unit: '%',
            display: true
          });
        }
      }

      if (meshDevice) {
        types.push({
          type: 'mode',
          nameSuffix: ' - mode',
          identifier: 'mode',
          sensor: true,
          category: 'light',
          min: 1,
          max: 3,
          display: false
        });

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

        types.push({
          type: 'white_brightness',
          nameSuffix: ' - white brightness',
          identifier: 'white_brightness',
          sensor: false,
          category: 'light',
          min: 0,
          max: 100,
          unit: '%',
          display: true
        });

        types.push({
          type: 'white_temperature',
          nameSuffix: ' - white temperature',
          identifier: 'white_temperature',
          sensor: false,
          category: 'light',
          min: 0,
          max: 100,
          unit: '%',
          display: true
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

        types.push({
          type: 'brightness',
          nameSuffix: ' - brightness',
          identifier: 'brightness',
          sensor: false,
          category: 'light',
          min: 0,
          max: 100,
          unit: '%',
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

  it('Valid test [AWOX\\u0000 ; mesh device #2] (utf-8)', function (done) {
    var constructorName = 'AWOX\u0000';
    var deviceName = 'ESMLm';
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

  it('Valid test [AWOX\\u0000 ; remote device] no name (utf-8)', function (done) {
    var constructorName = 'AWOX\u0000';
    var deviceName = undefined;
    var expectedCreatedDevice = generateDevice(undefined, false, false, false);
    genericValidTest(done, constructorName, deviceName, expectedCreatedDevice);
  });

  it('Valid test existing device', function (done) {
    var constructorName = 'AWOX\u0000';
    var deviceName = 'RCUm-CKDHKFH';
    var expectedCreatedDevice = generateDevice(deviceName, true, true, true);
    expectedCreatedDevice.alreadyExists = true;
    expectedCreatedDevice.device.id = undefined;
    expectedCreatedDevice.device.room = undefined;
    expectedCreatedDevice.device.user = undefined;
    expectedCreatedDevice.device.machine = undefined;

    gladys.device.getByIdentifier = function (device) {
      gladysDeviceGet = true;
      return Promise.resolve(device);
    };

    genericValidTest(done, constructorName, deviceName, expectedCreatedDevice);
  });

});