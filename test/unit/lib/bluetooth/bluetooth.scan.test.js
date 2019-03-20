const proxyquire = require('proxyquire');
const chai = require('chai');
const assert = chai.assert;
const EventEmitter = require('events');
const sinon = require('sinon');

var clock;

var shared = {
  scanTimeout: 15,
  bluetoothOn: true,
  scanTimer: null
};
var nobleMock = new EventEmitter();
nobleMock.startScanning = function (service, duplicate, callback) {
  assert.deepEqual(service, [], 'Invalid service to scan');
  callback();
};
nobleMock.stopScanning = function () {
  console.log('Blutetooth stops scanning');
  this.emit('scanStop');
};

var awoxScan = proxyquire('../../../../lib/bluetooth/scan.js', {
  'noble': nobleMock,
  '../shared.js': shared
});

describe('Scan bluetooth peripherals', function () {

  beforeEach(function () {
    clock = sinon.useFakeTimers();
    shared.bluetoothOn = true;
    shared.scanTimer = null;
    shared.scanForNb = 0;
  });

  afterEach(function () {
    shared.bluetoothOn = true;
    shared.scanTimer = null;
    shared.scanForNb = 0;
    clock.restore();
  });

  it('Bluetooth is disabled', function (done) {
    shared.bluetoothOn = false;

    awoxScan().then(() => {
      done('Should have fail');
    }).catch(() => {
      assert.isNull(shared.scanTimer, 'Scanner timeout should not have been initialized');
      done();
    });
  });

  it('Bluetooth scans no devices', function (done) {
    awoxScan().then((result) => {
      assert.isOk(shared.bluetoothOn, 'Bluetooth should stay ON');
      assert.equal(nobleMock.listenerCount('stopScan'), 0, 'No listeners for stopScan should left');
      assert.equal(nobleMock.listenerCount('discover'), 0, 'No listeners for discover should left');
      assert.deepEqual(result, new Map(), 'Not expected devices found');
      assert.isNotOk(shared.scanning, 'Scanner timeout should have be cleared');
      assert.equal(0, shared.scanForNb, 'No other peripheral waited anymore');
      done();
    }).catch((result) => {
      done('Should not have fail : ' + result);
    });

    clock.tick(shared.scanTimeout);
  });

  it('Bluetooth scans 2 devices', function (done) {
    awoxScan().then((result) => {
      assert.isOk(shared.bluetoothOn, 'Bluetooth should stay ON');
      assert.equal(nobleMock.listenerCount('stopScan'), 0, 'No listeners for stopScan should left');
      assert.equal(nobleMock.listenerCount('discover'), 0, 'No listeners for discover should left');

      var expectedResult = new Map();
      expectedResult.set('Peripheral 1', { address: 'Peripheral 1' });
      expectedResult.set('Peripheral 2', { address: 'Peripheral 2' });
      assert.deepEqual(result, expectedResult, 'Not expected devices found');

      assert.isNotOk(shared.scanning, 'Scanner timeout should have be cleared');
      assert.equal(0, shared.scanForNb, 'No other peripheral waited anymore');
      done();
    }).catch((result) => {
      done('Should not have fail : ' + result);
    });

    nobleMock.emit('discover', { address: 'Peripheral 1' });
    nobleMock.emit('discover', { address: 'Peripheral 2' });
    clock.tick(shared.scanTimeout);
    nobleMock.emit('discover', { address: 'Peripheral 3' });
  });

  it('Bluetooth looks for 1 wanted device', function (done) {
    var requestPeripherals = new Map();
    requestPeripherals.set('Peripheral 4', { address: 'Peripheral 4' });

    awoxScan(requestPeripherals).then((result) => {
      assert.isOk(shared.bluetoothOn, 'Bluetooth should stay ON');
      assert.equal(nobleMock.listenerCount('stopScan'), 0, 'No listeners for stopScan should left');
      assert.equal(nobleMock.listenerCount('discover'), 0, 'No listeners for discover should left');
      assert.isNotOk(shared.scanning, 'Scanner timeout should have be cleared');
      assert.equal(0, shared.scanForNb, 'No other peripheral waited anymore');

      var expectedResult = new Map();
      expectedResult.set('Peripheral 4', { address: 'Peripheral 4' });
      assert.deepEqual(result, expectedResult, 'Not expected devices found');
      done();
    }).catch((result) => {
      done('Should not have fail : ' + result);
    });

    nobleMock.emit('discover', { address: 'Peripheral 4' });
    nobleMock.emit('discover', { address: 'Peripheral 5' });
    clock.tick(shared.scanTimeout);
    nobleMock.emit('discover', { address: 'Peripheral 6' });
  });

  it('Bluetooth looks for 1 wanted device, timer disabled', function (done) {
    var requestPeripherals = new Map();
    requestPeripherals.set('Peripheral 4', { address: 'Peripheral 4' });

    awoxScan(requestPeripherals).then((result) => {
      assert.isOk(shared.bluetoothOn, 'Bluetooth should stay ON');
      assert.equal(nobleMock.listenerCount('stopScan'), 0, 'No listeners for stopScan should left');
      assert.equal(nobleMock.listenerCount('discover'), 0, 'No listeners for discover should left');
      assert.isNotOk(shared.scanning, 'Scanner timeout should have be cleared');
      assert.equal(0, shared.scanForNb, 'No other peripheral waited anymore');

      var expectedResult = new Map();
      expectedResult.set('Peripheral 4', { address: 'Peripheral 4' });
      assert.deepEqual(result, expectedResult, 'Not expected devices found');
      done();
    }).catch((result) => {
      done('Should not have fail : ' + result);
    });

    shared.scanTimer = null;
    nobleMock.emit('discover', { address: 'Peripheral 4' });
    nobleMock.emit('discover', { address: 'Peripheral 5' });
    clock.tick(shared.scanTimeout);
    nobleMock.emit('discover', { address: 'Peripheral 6' });
  });

  it('Bluetooth looks for 2 wanted devices, only one found', function (done) {
    var requestPeripherals = new Map();;
    requestPeripherals.set('Peripheral 8', { address: 'Peripheral 8' });
    requestPeripherals.set('Peripheral 9', { address: 'Peripheral 9' });

    awoxScan(requestPeripherals).then((result) => {
      assert.isOk(shared.bluetoothOn, 'Bluetooth should stay ON');
      assert.equal(nobleMock.listenerCount('stopScan'), 0, 'No listeners for stopScan should left');
      assert.equal(nobleMock.listenerCount('discover'), 0, 'No listeners for discover should left');
      assert.isNotOk(shared.scanning, 'Scanner timeout should have be cleared');
      assert.equal(0, shared.scanForNb, 'No other peripheral waited anymore');

      var expectedResult = new Map();
      expectedResult.set('Peripheral 8', { address: 'Peripheral 8' });
      assert.deepEqual(result, expectedResult, 'Not expected devices found');
      done();
    }).catch((result) => {
      done('Should not have fail : ' + result);
    });

    nobleMock.emit('discover', { address: 'Peripheral 7' });
    nobleMock.emit('discover', { address: 'Peripheral 8' });
    clock.tick(shared.scanTimeout);
    nobleMock.emit('discover', { address: 'Peripheral 9' });
  });

  it('Bluetooth looks for 2 wanted devices separately', function (done) {
    var promiseRun1 = new Promise((resolve, reject) => {
      var requestPeripherals = new Map();
      requestPeripherals.set('Peripheral 10', { address: 'Peripheral 10' });

      return awoxScan(requestPeripherals).then((result) => {
        assert.isOk(shared.bluetoothOn, 'Bluetooth should stay ON');

        var expectedResult = new Map();
        expectedResult.set('Peripheral 10', { address: 'Peripheral 10' });
        assert.deepEqual(result, expectedResult, 'Not expected devices found');
        resolve();
      }).catch((result) => {
        reject('Should not have fail : ' + result);
      });
    });

    var promiseRun2 = new Promise((resolve, reject) => {
      var requestPeripherals = new Map();
      requestPeripherals.set('Peripheral 11', { address: 'Peripheral 11' });

      return awoxScan(requestPeripherals).then((result) => {
        assert.isOk(shared.bluetoothOn, 'Bluetooth should stay ON');

        var expectedResult = new Map();
        expectedResult.set('Peripheral 11', { address: 'Peripheral 11' });
        assert.deepEqual(result, expectedResult, 'Not expected devices found');
        resolve();
      }).catch((result) => {
        reject('Should not have fail : ' + result);
      });
    });

    Promise.all([promiseRun1, promiseRun2])
      .then(() => {
        assert.equal(nobleMock.listenerCount('stopScan'), 0, 'No listeners for stopScan should left');
        assert.equal(nobleMock.listenerCount('discover'), 0, 'No listeners for discover should left');
        assert.isNotOk(shared.scanning, 'Scanner timeout should have be cleared');
        assert.equal(0, shared.scanForNb, 'No other peripheral waited anymore');
        done();
      }).catch((result) => {
        done(result);
      });

    nobleMock.emit('discover', { address: 'Peripheral 10' });
    clock.tick(10);
    nobleMock.emit('discover', { address: 'Peripheral 11' });
    clock.tick(50);
    nobleMock.emit('discover', { address: 'Peripheral 12' });
  });

  it('Bluetooth looks for 1 wanted device, already in cache', function (done) {
    var requestPeripherals = new Map();
    requestPeripherals.set('Peripheral 4', { address: 'Peripheral 4' });
    nobleMock._peripherals = [];
    nobleMock._peripherals['Peripheral 4'] = { address: 'Peripheral 4' };

    awoxScan(requestPeripherals).then((result) => {
      assert.isOk(shared.bluetoothOn, 'Bluetooth should stay ON');
      assert.equal(nobleMock.listenerCount('stopScan'), 0, 'No listeners for stopScan should left');
      assert.equal(nobleMock.listenerCount('discover'), 0, 'No listeners for discover should left');
      assert.isNotOk(shared.scanning, 'Scanner timeout should have be cleared');
      assert.equal(0, shared.scanForNb, 'No other peripheral waited anymore');

      var expectedResult = new Map();
      expectedResult.set('Peripheral 4', { address: 'Peripheral 4' });
      assert.deepEqual(result, expectedResult, 'Not expected devices found');
      done();
    }).catch((result) => {
      done('Should not have fail : ' + result);
    });
  });

  it('Bluetooth looks for 2 wanted devices, only one in cache', function (done) {
    var requestPeripherals = new Map();;
    requestPeripherals.set('Peripheral 8', { address: 'Peripheral 8' });
    requestPeripherals.set('Peripheral 9', { address: 'Peripheral 9' });
    nobleMock._peripherals = [];
    nobleMock._peripherals['Peripheral 9'] = { address: 'Peripheral 9' };

    awoxScan(requestPeripherals).then((result) => {
      assert.isOk(shared.bluetoothOn, 'Bluetooth should stay ON');
      assert.equal(nobleMock.listenerCount('stopScan'), 0, 'No listeners for stopScan should left');
      assert.equal(nobleMock.listenerCount('discover'), 0, 'No listeners for discover should left');
      assert.isNotOk(shared.scanning, 'Scanner timeout should have be cleared');
      assert.equal(0, shared.scanForNb, 'No other peripheral waited anymore');

      var expectedResult = new Map();
      expectedResult.set('Peripheral 8', { address: 'Peripheral 8' });
      expectedResult.set('Peripheral 9', { address: 'Peripheral 9' });
      assert.deepEqual(result, expectedResult, 'Not expected devices found');
      done();
    }).catch((result) => {
      done('Should not have fail : ' + result);
    });

    nobleMock.emit('discover', { address: 'Peripheral 7' });
    nobleMock.emit('discover', { address: 'Peripheral 8' });
    clock.tick(shared.scanTimeout);
  });
});