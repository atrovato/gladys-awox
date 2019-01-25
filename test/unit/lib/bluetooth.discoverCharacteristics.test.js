const awoxDiscoverCharacteristics = require('../../../lib/bluetooth.discoverCharacteristics.js');
const chai = require('chai');
const assert = chai.assert;
const sinon = require('sinon');

var clock;

describe('Discover bluetooth characteristics', function () {

  var peripheral;
  var service;
  var throwTimeout;
  var throwError;

  beforeEach(function () {
    clock = sinon.useFakeTimers();
    throwTimeout = false;
    throwError = false;

    peripheral = {
      connected: true,
      disconnect: function () {
        this.connected = false;
      }
    };

    service = {
      discovered: false,
      discoverCharacteristics: function (characteristic, callback) {
        assert.deepEqual(characteristic, ['fff1'], 'Expected requested characteristic is not valid');
        this.discovered = true;

        if (throwTimeout) {
          clock.tick(100000);
        } else if (throwError) {
          callback('Error', null);
        } else {
          callback(null, ['characteristic']);
        }
      }
    };
  });

  afterEach(function () {
    clock.restore();
  });

  it('Discover service characteristics with success', function (done) {
    throwError = false;

    awoxDiscoverCharacteristics(['fff1'], { peripheral: peripheral, services: [service] }).then((result) => {
      var expectedResult = { peripheral: peripheral, services: [service], characteristics: ['characteristic'] };
      assert.deepEqual(result, expectedResult, 'Not expected result');
      assert.isOk(service.discovered, 'Discovered tag should be true');
      assert.isOk(peripheral.connected, 'Peripheral should be disconnected');
      done();
    }).catch((result) => {
      done('Should not have fail : ' + result);
    });
  });

  it('Discover service characteristics with timeout', function (done) {
    throwTimeout = true;

    awoxDiscoverCharacteristics(['fff1'], { peripheral: peripheral, services: [service] }).then(() => {
      done('Should have fail');
    }).catch(() => {
      assert.isOk(service.discovered, 'Discovered tag should be true');
      assert.isNotOk(peripheral.connected, 'Peripheral should be disconnected');
      done();
    });
  });

  it('Discover service characteristics with error', function (done) {
    throwError = true;

    awoxDiscoverCharacteristics(['fff1'], { peripheral: peripheral, services: [service] }).then(() => {
      done('Should have fail');
    }).catch(() => {
      assert.isOk(service.discovered, 'Discovered tag should be true');
      assert.isNotOk(peripheral.connected, 'Peripheral should be disconnected');
      done();
    });
  });

  it('Discover service characteristics without services (undefined)', function (done) {
    awoxDiscoverCharacteristics(['fff1'], { peripheral: peripheral, services: undefined }).then(() => {
      done('Should have fail');
    }).catch(() => {
      assert.isNotOk(peripheral.connected, 'Peripheral should be disconnected');
      done();
    });
  });

  it('Discover service characteristics without services (null)', function (done) {
    awoxDiscoverCharacteristics(['fff1'], { peripheral: peripheral, services: null }).then(() => {
      done('Should have fail');
    }).catch(() => {
      assert.isNotOk(peripheral.connected, 'Peripheral should be disconnected');
      done();
    });
  });

  it('Discover service characteristics without services (empty)', function (done) {
    awoxDiscoverCharacteristics(['fff1'], { peripheral: peripheral, services: [] }).then(() => {
      done('Should have fail');
    }).catch(() => {
      assert.isNotOk(peripheral.connected, 'Peripheral should be disconnected');
      done();
    });
  });
});