const proxyquire = require('proxyquire');
const chai = require('chai');
const assert = chai.assert;
const EventEmitter = require("events");
const sinon = require('sinon');

var clock;

var shared = {
    scanTimeout: 15,
    bluetoothOn: true,
    scanTimer : null
};
var nobleMock = new EventEmitter();
nobleMock.startScanning = function (service, duplicate, callback) {
    assert.deepEqual(service, ['fff0'], 'Invalid service to scan');
    shared.scanning = true;
    callback();
};
nobleMock.stopScanning = function() {
    console.log('Blutetooth stops scanning');
    this.emit('scanStop');
    shared.scanning = false;
};

var awoxScan = proxyquire('../lib/bluetooth.scan.js', { 
    'noble': nobleMock,
    '../lib/shared.js': shared
});

describe('Scan bluetooth peripherals', function() {

    beforeEach(function() {
        clock = sinon.useFakeTimers();
        shared.bluetoothOn = true;
        shared.scanTimer = null;
    });

    afterEach(function() {
        shared.bluetoothOn = true;
        shared.scanTimer = null;
        clock.restore();
    });

    it('Bluetooth is disabled', function (done) {
        shared.bluetoothOn = false;

        awoxScan().then((result) => {
            done('Should have fail');
        }).catch((result) => {
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
            done();
        }).catch((result) => {
            done('Should not have fail : ' + result);
        });

        nobleMock.emit('discover', { address : 'Peripheral 1' });
        nobleMock.emit('discover', { address : 'Peripheral 2' });
        clock.tick(shared.scanTimeout);
        nobleMock.emit('discover', { address : 'Peripheral 3' });
    });

    it('Bluetooth looks for 1 wanted device', function (done) {
        awoxScan({ 'Peripheral 4' : { address: 'Peripheral 4' } }).then((result) => {
            assert.isOk(shared.bluetoothOn, 'Bluetooth should stay ON');
            assert.equal(nobleMock.listenerCount('stopScan'), 0, 'No listeners for stopScan should left');
            assert.equal(nobleMock.listenerCount('discover'), 0, 'No listeners for discover should left');
            assert.isNotOk(shared.scanning, 'Scanner timeout should have be cleared');

            var expectedResult = new Map();;
            expectedResult.set('Peripheral 4', { address: 'Peripheral 4' });
            assert.deepEqual(result, expectedResult, 'Not expected devices found');
            done();
        }).catch((result) => {
            done('Should not have fail : ' + result);
        });

        nobleMock.emit('discover', { address : 'Peripheral 4' });
        nobleMock.emit('discover', { address : 'Peripheral 5' });
        clock.tick(shared.scanTimeout);
        nobleMock.emit('discover', { address : 'Peripheral 6' });
    });

    it('Bluetooth looks for 2 wanted devices, only one found', function (done) {
        awoxScan({ 'Peripheral 8' : { address: 'Peripheral 8' }, 'Peripheral 9' : { address: 'Peripheral 9' } }).then((result) => {
            assert.isOk(shared.bluetoothOn, 'Bluetooth should stay ON');
            assert.equal(nobleMock.listenerCount('stopScan'), 0, 'No listeners for stopScan should left');
            assert.equal(nobleMock.listenerCount('discover'), 0, 'No listeners for discover should left');
            assert.isNotOk(shared.scanning, 'Scanner timeout should have be cleared');

            var expectedResult = new Map();;
            expectedResult.set('Peripheral 8', { address: 'Peripheral 8' });
            assert.deepEqual(result, expectedResult, 'Not expected devices found');
            done();
        }).catch((result) => {
            done('Should not have fail : ' + result);
        });

        nobleMock.emit('discover', { address : 'Peripheral 7' });
        nobleMock.emit('discover', { address : 'Peripheral 8' });
        clock.tick(shared.scanTimeout);
        nobleMock.emit('discover', { address : 'Peripheral 9' });
    });

    it('Bluetooth looks for 2 wanted devices separately', function (done) {
        var promiseRun1 = new Promise((resolve, reject) => {
            awoxScan({ 'Peripheral 10' : { address: 'Peripheral 10' } }).then((result) => {
                assert.isOk(shared.bluetoothOn, 'Bluetooth should stay ON');
                assert.equal(nobleMock.listenerCount('stopScan'), 0, 'No listeners for stopScan should left');
                assert.equal(nobleMock.listenerCount('discover'), 1, 'No listeners for discover should left');
                assert.isOk(shared.scanning, 'Scanner timeout should have be cleared');

                var expectedResult = new Map();;
                expectedResult.set('Peripheral 10', { address: 'Peripheral 10' });
                assert.deepEqual(result, expectedResult, 'Not expected devices found');
                resolve();
            }).catch((result) => {
                reject('Should not have fail : ' + result);
            });
        });

        var emitPromise1 = new Promise((resolve, reject) => {
            clock.tick(shared.scanTimeout - 3);
            nobleMock.emit('discover', { address : 'Peripheral 10' });
            resolve();
        });
        var emitPromise2 = new Promise((resolve, reject) => {
            clock.tick(shared.scanTimeout + 3);
            nobleMock.emit('discover', { address : 'Peripheral 11' });
            resolve();
        });
        var timedoutPromise = new Promise((resolve, reject) => {
            clock.tick(shared.scanTimeout * 3);
            nobleMock.emit('discover', { address : 'Peripheral 12' });
            resolve();
        });

        var promiseRun2 = new Promise((resolve, reject) => {
            awoxScan({ 'Peripheral 11' : { address: 'Peripheral 11' } }).then((result) => {
                assert.isOk(shared.bluetoothOn, 'Bluetooth should stay ON');
                assert.equal(nobleMock.listenerCount('stopScan'), 0, 'No listeners for stopScan should left');
                assert.equal(nobleMock.listenerCount('discover'), 0, 'No listeners for discover should left');
                assert.isNotOk(shared.scanning, 'Scanner timeout should have be cleared');

                var expectedResult = new Map();;
                expectedResult.set('Peripheral 11', { address: 'Peripheral 11' });
                assert.sameDeepMembers(result, expectedResult, 'Not expected devices found');
                done();
            }).catch((result) => {
                done('Should not have fail : ' + result);
            });
        });

        Promise.all([ promiseRun1, emitPromise1, promiseRun2, emitPromise2, timedoutPromise ]).then(done()).catch((result) => done(result));
    });
});