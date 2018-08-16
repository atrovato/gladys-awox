const proxyquire = require('proxyquire');
const chai = require('chai');
const assert = chai.assert;
const sinon = require('sinon');

var nbCreation = 0;
var clock;
var shared = {
    scanTimeout: 15,
    bluetoothOn: true,
    scanTimer : null
};

var scanMock = function() {
    return Promise.resolve(foundPeripherals);
};

var install = proxyquire('../../../lib/install.js', { 
    './shared.js': shared,
    './bluetooth.scan.js' : scanMock
});

describe('Gladys device install', function() {

    beforeEach(function() {
        clock = sinon.useFakeTimers();
        foundPeripherals = undefined;
        nbCreation = 0;
        gladys = {
            device : {
                create : function() {
                    nbCreation++;
                    return Promise.resolve();
                }
            }
        };
    });

    afterEach(function() {
        clock.restore();
    });

    it('No device found', function(done) {
        foundPeripherals = new Map();

        install().then((result) => {
            assert.equal(nbCreation, 0, 'No device creation expected');
            done();
        }).catch((result) => {
            done('Should not have fail : ' + result);
        });
    });

    it('No advertisement device found', function(done) {
        foundPeripherals = new Map();
        foundPeripherals.set('Peripheral 1', { address : 'Peripheral 1' });

        install().then((result) => {
            assert.equal(nbCreation, 0, 'No device creation expected');
            done();
        }).catch((result) => {
            done('Should not have fail : ' + result);
        });
    });

    it('No name device found', function(done) {
        foundPeripherals = new Map();
        foundPeripherals.set('Peripheral 1', { address : 'Peripheral 1' , advertisement : {} });

        install().then((result) => {
            assert.equal(nbCreation, 0, 'No device creation expected');
            done();
        }).catch((result) => {
            done('Should not have fail : ' + result);
        });
    });

    it('No SML device found', function(done) {
        foundPeripherals = new Map();
        foundPeripherals.set('Peripheral 1', { address : 'Peripheral 1' , advertisement : { localName : 'name' } });

        install().then((result) => {
            assert.equal(nbCreation, 0, 'No device creation expected');
            done();
        }).catch((result) => {
            done('Should not have fail : ' + result);
        });
    });

    it('SML-c device found', function(done) {
        foundPeripherals = new Map();
        foundPeripherals.set('Peripheral 1', { address : 'Peripheral 1' , advertisement : { localName : 'SML-cEFZEJRFZM' } });

        install().then((result) => {
            assert.equal(nbCreation, 1, 'No device creation expected');
            done();
        }).catch((result) => {
            done('Should not have fail : ' + result);
        });
    });

    it('SML-w device found', function(done) {
        foundPeripherals = new Map();
        foundPeripherals.set('Peripheral 1', { address : 'Peripheral 1' , advertisement : { localName : 'SML-wEFZEJRFZM' } });

        install().then((result) => {
            assert.equal(nbCreation, 1, 'No device creation expected');
            done();
        }).catch((result) => {
            done('Should not have fail : ' + result);
        });
    });
});