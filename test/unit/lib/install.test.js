const proxyquire = require('proxyquire');
const chai = require('chai');
const assert = chai.assert;
const Promise = require('bluebird');

var scanDone = false;
var connectDone = false;
var disconnectDone = false;
var servicesDone = false;
var characteristicsDone = false;
var readDone = false;
var managePeripheralDone = false;

var failAtStep = undefined;
var nbCreation = 0;

var foundPeripherals;

var shared = {
  scanTimeout: 15,
  bluetoothOn: true,
  scanTimer: null
};

var peripheral = {
  disconnect: function () {
    disconnectDone = true;
  }
};

var checkRejectionCondition = function (step) {
  if (failAtStep == step) {
    return Promise.reject('Error at ' + failAtStep);
  } else {
    return Promise.resolve('Success');
  }
};

var scanMock = function (peripherals) {
  scanDone = true;
  return checkRejectionCondition('scan').then(() => {
    return Promise.resolve(foundPeripherals);
  });
};

var connectMock = function () {
  connectDone = true;
  return checkRejectionCondition('connect').then(() => {
    return Promise.resolve(peripheral);
  });
};

var discoverServicesMock = function () {
  servicesDone = true;
  return checkRejectionCondition('services').then(() => {
    return Promise.resolve([{ uuid: 'service1' }, { uuid: 'service2' }]);
  });
};

var discoverCharacteristicsMock = function () {
  characteristicsDone = true;
  return checkRejectionCondition('characteristics').then(() => {
    return Promise.resolve([{ uuid: 'char1' }, { uuid: 'char2' }]);
  });
};

var readMock = function () {
  readDone = true;
  return checkRejectionCondition('read');
};

var managePeripheralMock = function () {
  managePeripheralDone = true;
  return checkRejectionCondition('managePeripheral').then(() => {
    nbCreation++;
    return Promise.resolve();
  });
};

var install = proxyquire('../../../lib/install.js', {
  './shared.js': shared,
  './bluetooth/scan.js': scanMock,
  './bluetooth/connect.js': connectMock,
  './bluetooth/discoverServices.js': discoverServicesMock,
  './bluetooth/discoverCharacteristics.js': discoverCharacteristicsMock,
  './bluetooth/read.js': readMock,
  './managePeripheral.js': managePeripheralMock
});

describe('Gladys device install', function () {

  beforeEach(function () {
    scanDone = false;
    connectDone = false;
    disconnectDone = false;
    servicesDone = false;
    characteristicsDone = false;
    readDone = false;
    managePeripheralDone = false;

    failAtStep = undefined;

    foundPeripherals = [];

    nbCreation = 0;
  });

  it('No device found', function (done) {
    foundPeripherals = new Map();

    install().then(() => {
      assert.equal(nbCreation, 0, 'No device creation expected');
      assert.isOk(scanDone, 'Scan should be OK');
      assert.isNotOk(connectDone, 'Connect should not be OK');
      assert.isNotOk(disconnectDone, 'Disconnect should not be OK');
      assert.isNotOk(servicesDone, 'Services should not be OK');
      assert.isNotOk(characteristicsDone, 'Characteristics should not be OK');
      assert.isNotOk(readDone, 'Read should not be OK');
      assert.isNotOk(managePeripheralDone, 'Manage peripheral should not be OK');
      done();
    }).catch((result) => {
      done('Should not have fail : ' + result);
    });
  });

  it('Fail at scan step', function (done) {
    failAtStep = 'scan';

    install().then(() => {
      done('Should have fail');
    }).catch(() => {
      assert.equal(nbCreation, 0, 'No device creation expected');
      assert.isOk(scanDone, 'Scan should be OK');
      assert.isNotOk(connectDone, 'Connect should not be OK');
      assert.isNotOk(disconnectDone, 'Disconnect should not be OK');
      assert.isNotOk(servicesDone, 'Services should not be OK');
      assert.isNotOk(characteristicsDone, 'Characteristics should not be OK');
      assert.isNotOk(readDone, 'Read should not be OK');
      assert.isNotOk(managePeripheralDone, 'Manage peripheral should not be OK');
      done();
    });
  });

  it('Fail at connection step', function (done) {
    foundPeripherals = new Map();
    foundPeripherals.set('Peripheral 1', peripheral);

    failAtStep = 'connect';

    install().then(() => {
      assert.equal(nbCreation, 0, 'No device creation expected');
      assert.isOk(scanDone, 'Scan should be OK');
      assert.isOk(connectDone, 'Connect should be OK');
      assert.isOk(disconnectDone, 'Disconnect should be OK');
      assert.isNotOk(servicesDone, 'Services should not be OK');
      assert.isNotOk(characteristicsDone, 'Characteristics should not be OK');
      assert.isNotOk(readDone, 'Read should not be OK');
      assert.isNotOk(managePeripheralDone, 'Manage peripheral should not be OK');
      done();
    }).catch(() => {
      done('Should not have fail');
    });
  });

  it('Fail at services step', function (done) {
    foundPeripherals = new Map();
    foundPeripherals.set('Peripheral 1', peripheral);

    failAtStep = 'services';

    install().then(() => {
      assert.equal(nbCreation, 0, 'No device creation expected');
      assert.isOk(scanDone, 'Scan should be OK');
      assert.isOk(connectDone, 'Connect should be OK');
      assert.isOk(disconnectDone, 'Disconnect should be OK');
      assert.isOk(servicesDone, 'Services should be OK');
      assert.isNotOk(characteristicsDone, 'Characteristics should not be OK');
      assert.isNotOk(readDone, 'Read should not be OK');
      assert.isNotOk(managePeripheralDone, 'Manage peripheral should not be OK');
      done();
    }).catch(() => {
      done('Should have fail');
    });
  });

  it('Fail at characteristics step', function (done) {
    foundPeripherals = new Map();
    foundPeripherals.set('Peripheral 1', peripheral);

    failAtStep = 'characteristics';

    install().then(() => {
      assert.equal(nbCreation, 0, 'No device creation expected');
      assert.isOk(scanDone, 'Scan should be OK');
      assert.isOk(connectDone, 'Connect should be OK');
      assert.isOk(disconnectDone, 'Disconnect should be OK');
      assert.isOk(servicesDone, 'Services should be OK');
      assert.isOk(characteristicsDone, 'Characteristics should be OK');
      assert.isNotOk(readDone, 'Read should not be OK');
      assert.isNotOk(managePeripheralDone, 'Manage peripheral should not be OK');
      done();
    }).catch(() => {
      done('Should have fail');
    });
  });

  it('Fail at read step', function (done) {
    foundPeripherals = new Map();
    foundPeripherals.set('Peripheral 1', peripheral);

    failAtStep = 'read';

    install().then(() => {
      assert.equal(nbCreation, 0, 'No device creation expected');
      assert.isOk(scanDone, 'Scan should be OK');
      assert.isOk(connectDone, 'Connect should be OK');
      assert.isOk(disconnectDone, 'Disconnect should be OK');
      assert.isOk(servicesDone, 'Services should be OK');
      assert.isOk(characteristicsDone, 'Characteristics should be OK');
      assert.isOk(readDone, 'Read should be OK');
      assert.isNotOk(managePeripheralDone, 'Manage peripheral should not be OK');
      done();
    }).catch(() => {
      done('Should have fail');
    });
  });

  it('Fail at manage peripheral step', function (done) {
    foundPeripherals = new Map();
    foundPeripherals.set('Peripheral 1', peripheral);

    failAtStep = 'managePeripheral';

    install().then(() => {
      assert.equal(nbCreation, 0, 'No device creation expected');
      assert.isOk(scanDone, 'Scan should be OK');
      assert.isOk(connectDone, 'Connect should be OK');
      assert.isOk(disconnectDone, 'Disconnect should be OK');
      assert.isOk(servicesDone, 'Services should be OK');
      assert.isOk(characteristicsDone, 'Characteristics should be OK');
      assert.isOk(readDone, 'Read should be OK');
      assert.isOk(managePeripheralDone, 'Manage peripheral should be OK');
      done();
    }).catch(() => {
      done('Should have fail');
    });
  });

  it('SML-c device found', function (done) {
    foundPeripherals = new Map();
    foundPeripherals.set('Peripheral 1', peripheral);

    install().then(() => {
      assert.equal(nbCreation, 1, 'No device creation expected');
      done();
    }).catch((result) => {
      done('Should not have fail : ' + result);
    });
  });

  it('SML-w device found', function (done) {
    foundPeripherals = new Map();
    foundPeripherals.set('Peripheral 1', peripheral);

    install().then(() => {
      assert.equal(nbCreation, 1, 'No device creation expected');
      done();
    }).catch((result) => {
      done('Should not have fail : ' + result);
    });
  });
});