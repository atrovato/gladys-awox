const proxyquire = require('proxyquire');
const chai = require('chai');
const assert = chai.assert;
const Promise = require('bluebird');

var disconnected = false;
var failAtStep;

var generateCommandStep = false;
var scanStep = false;
var connectStep = false;
var servicesStep = false;
var characteristicsStep = false;
var sendStep = false;
var meshExecStep = false;

var shared = {
  scanTimeout: 15,
  bluetoothOn: true,
  scanTimer: null
};

var generateCommandMock = function () {
  generateCommandStep = true;

  if (failAtStep == 'generateCommand') {
    return Promise.reject();
  } else {
    return Promise.resolve('command');
  }
};

var connectMock = function (peripheral) {
  connectStep = true;

  if (failAtStep == 'connect') {
    return Promise.reject();
  } else {
    return Promise.resolve(peripheral);
  }
};

var discoverServicesMock = function (uuids, device) {
  servicesStep = true;

  if (failAtStep == 'services') {
    return Promise.reject();
  } else {
    const serviceMap = new Map();
    serviceMap.set('s1', { uuid: 's1' });
    serviceMap.set('s2', { uuid: 's2' });
    return Promise.resolve(serviceMap);
  }
};

var discoverCharacteristicsMock = function (uuids, device) {
  characteristicsStep = true;

  if (failAtStep == 'characteristics') {
    return Promise.reject();
  } else {
    const characteristicMap = new Map();
    characteristicMap.set('c1', { uuid: 'c1' });
    characteristicMap.set('c2', { uuid: 'c2' });
    return Promise.resolve(characteristicMap);
  }
};

var sendMock = function (peripheral, characteristic, command) {
  sendStep = true;
  assert.equal(command, 'command', 'Not expected command sent');

  if (failAtStep == 'send') {
    return Promise.reject();
  } else {
    return Promise.resolve(command);
  }
};

var scanMock = function (deviceInfo) {
  scanStep = true;

  if (failAtStep == 'scan') {
    return Promise.reject();
  } else if (foundPeripherals !== undefined) {
    if (foundPeripherals) {
      foundPeripherals.forEach(element => {
        element.disconnect = function () {
          disconnected = true;
        };
      });
    }
    return Promise.resolve(foundPeripherals);
  } else {
    const peripherals = new Map();
    peripherals.set('Peripheral 1', {
      disconnect: function () {
        disconnected = true;
      }
    });
    return Promise.resolve(peripherals);
  }
};

var meshMock = function () {
  meshExecStep = true;
  return Promise.resolve(1);
};

var exec = proxyquire('../../../lib/exec.js', {
  './shared.js': shared,
  './default/generateCommand.js': generateCommandMock,
  './bluetooth/connect.js': connectMock,
  './bluetooth/discoverServices.js': discoverServicesMock,
  './bluetooth/discoverCharacteristics.js': discoverCharacteristicsMock,
  './bluetooth/send.js': sendMock,
  './bluetooth/scan.js': scanMock,
  './mesh/exec.js': meshMock
});

describe('Gladys device exec', function () {

  var deviceInfo;

  beforeEach(function () {
    deviceInfo = {
      deviceType: {
        identifier: 'Peripheral 1',
        deviceTypeIdentifier: 'unknown'
      },
      state: {
        value: 3
      }
    };

    foundPeripherals = undefined;
    disconnected = false;
    failAtStep = undefined;

    generateCommandStep = false;
    scanStep = false;
    connectStep = false;
    servicesStep = false;
    characteristicsStep = false;
    sendStep = false;
    disconnected = false;
    meshExecStep = false;
  });

  it('Fail at command generation', function (done) {
    failAtStep = 'generateCommand';

    exec(deviceInfo)
      .then(() => {
        done('Should have fail');
      }).catch(() => {
        assert.isOk(scanStep, 'Should not be passed by scan step');
        assert.isOk(connectStep, 'Should not be passed by connection step');
        assert.isOk(servicesStep, 'Should not be passed by services step');
        assert.isOk(characteristicsStep, 'Should not be passed by characteristics step');
        assert.isOk(generateCommandStep, 'Should be passed by command generation step');
        assert.isNotOk(sendStep, 'Should not be passed by send step');
        assert.isNotOk(meshExecStep, 'Should not be passed by mesh step');
        assert.isOk(disconnected, 'Should not be passed by disconnect');
        done();
      });
  });

  it('Fail at scan step', function (done) {
    failAtStep = 'scan';

    exec(deviceInfo)
      .then(() => {
        done('Should have fail');
      }).catch(() => {
        assert.isOk(scanStep, 'Should be passed by scan step');
        assert.isNotOk(connectStep, 'Should not be passed by connection step');
        assert.isNotOk(servicesStep, 'Should not be passed by services step');
        assert.isNotOk(characteristicsStep, 'Should not be passed by characteristics step');
        assert.isNotOk(generateCommandStep, 'Should be passed by command generation step');
        assert.isNotOk(meshExecStep, 'Should not be passed by mesh step');
        assert.isNotOk(sendStep, 'Should not be passed by send step');
        assert.isNotOk(disconnected, 'Should not be passed by disconnect');
        done();
      });
  });

  it('No peripherals found', function (done) {
    foundPeripherals = false;

    exec(deviceInfo)
      .then(() => {
        done('Should have fail');
      }).catch(() => {
        assert.isOk(scanStep, 'Should be passed by scan step');
        assert.isNotOk(connectStep, 'Should not be passed by connection step');
        assert.isNotOk(servicesStep, 'Should not be passed by services step');
        assert.isNotOk(characteristicsStep, 'Should not be passed by characteristics step');
        assert.isNotOk(generateCommandStep, 'Should be passed by command generation step');
        assert.isNotOk(meshExecStep, 'Should not be passed by mesh step');
        assert.isNotOk(sendStep, 'Should not be passed by send step');
        assert.isNotOk(disconnected, 'Should not be passed by disconnect');
        done();
      });
  });

  it('Expected peripheral not found', function (done) {
    foundPeripherals = new Map();
    foundPeripherals.set('not found', {});

    exec(deviceInfo)
      .then(() => {
        done('Should have fail');
      }).catch(() => {
        assert.isOk(scanStep, 'Should be passed by scan step');
        assert.isNotOk(connectStep, 'Should not be passed by connection step');
        assert.isNotOk(servicesStep, 'Should not be passed by services step');
        assert.isNotOk(characteristicsStep, 'Should not be passed by characteristics step');
        assert.isNotOk(generateCommandStep, 'Should be passed by command generation step');
        assert.isNotOk(meshExecStep, 'Should not be passed by mesh step');
        assert.isNotOk(sendStep, 'Should not be passed by send step');
        assert.isNotOk(disconnected, 'Should not be passed by disconnect');
        done();
      });
  });

  it('Fail at connection step', function (done) {
    failAtStep = 'connect';

    exec(deviceInfo)
      .then(() => {
        done('Should have fail');
      }).catch(() => {
        assert.isOk(scanStep, 'Should be passed by scan step');
        assert.isOk(connectStep, 'Should be passed by connection step');
        assert.isNotOk(servicesStep, 'Should not be passed by services step');
        assert.isNotOk(characteristicsStep, 'Should not be passed by characteristics step');
        assert.isNotOk(generateCommandStep, 'Should be passed by command generation step');
        assert.isNotOk(meshExecStep, 'Should not be passed by mesh step');
        assert.isNotOk(sendStep, 'Should not be passed by send step');
        assert.isOk(disconnected, 'Should be passed by disconnect');
        done();
      });
  });

  it('Fail at services step', function (done) {
    failAtStep = 'services';

    exec(deviceInfo)
      .then(() => {
        done('Should have fail');
      }).catch(() => {
        assert.isOk(scanStep, 'Should be passed by scan step');
        assert.isOk(connectStep, 'Should be passed by connection step');
        assert.isOk(servicesStep, 'Should be passed by services step');
        assert.isNotOk(characteristicsStep, 'Should not be passed by characteristics step');
        assert.isNotOk(generateCommandStep, 'Should be passed by command generation step');
        assert.isNotOk(meshExecStep, 'Should not be passed by mesh step');
        assert.isNotOk(sendStep, 'Should not be passed by send step');
        assert.isOk(disconnected, 'Should be passed by disconnect');
        done();
      });
  });

  it('Fail at characteristics step', function (done) {
    failAtStep = 'characteristics';

    exec(deviceInfo)
      .then(() => {
        done('Should have fail');
      }).catch(() => {
        assert.isOk(scanStep, 'Should be passed by scan step');
        assert.isOk(connectStep, 'Should be passed by connection step');
        assert.isOk(servicesStep, 'Should be passed by services step');
        assert.isOk(characteristicsStep, 'Should be passed by characteristics step');
        assert.isNotOk(generateCommandStep, 'Should be passed by command generation step');
        assert.isNotOk(meshExecStep, 'Should not be passed by mesh step');
        assert.isNotOk(sendStep, 'Should not be passed by send step');
        assert.isOk(disconnected, 'Should be passed by disconnect');
        done();
      });
  });

  it('Fail at send step', function (done) {
    failAtStep = 'send';

    exec(deviceInfo)
      .then(() => {
        done('Should have fail');
      }).catch(() => {
        assert.isOk(scanStep, 'Should be passed by scan step');
        assert.isOk(connectStep, 'Should be passed by connection step');
        assert.isOk(servicesStep, 'Should be passed by services step');
        assert.isOk(characteristicsStep, 'Should be passed by characteristics step');
        assert.isOk(generateCommandStep, 'Should be passed by command generation step');
        assert.isNotOk(meshExecStep, 'Should not be passed by mesh step');
        assert.isOk(sendStep, 'Should be passed by send step');
        assert.isOk(disconnected, 'Should be passed by disconnect');
        done();
      });
  });

  it('Exec with success', function (done) {
    exec(deviceInfo)
      .then(() => {
        assert.isOk(scanStep, 'Should be passed by scan step');
        assert.isOk(connectStep, 'Should be passed by connection step');
        assert.isOk(servicesStep, 'Should be passed by services step');
        assert.isOk(characteristicsStep, 'Should be passed by characteristics step');
        assert.isOk(generateCommandStep, 'Should be passed by command generation step');
        assert.isNotOk(meshExecStep, 'Should not be passed by mesh step');
        assert.isOk(sendStep, 'Should be passed by send step');
        assert.isOk(disconnected, 'Should be passed by disconnect');
        done();
      }).catch((result) => {
        done('Should not have fail ' + result);
      });
  });

  it('Exec Mesh with success', function (done) {
    deviceInfo.deviceType.protocol = 'bluetooth-mesh';

    exec(deviceInfo)
      .then(() => {
        assert.isOk(scanStep, 'Should be passed by scan step');
        assert.isOk(connectStep, 'Should be passed by connection step');
        assert.isOk(servicesStep, 'Should be passed by services step');
        assert.isOk(characteristicsStep, 'Should be passed by characteristics step');
        assert.isNotOk(generateCommandStep, 'Should not be passed by command generation step');
        assert.isOk(meshExecStep, 'Should be passed by mesh step');
        assert.isNotOk(sendStep, 'Should net be passed by send step');
        assert.isOk(disconnected, 'Should be passed by disconnect');
        done();
      }).catch((result) => {
        done('Should not have fail ' + result);
      });
  });

});