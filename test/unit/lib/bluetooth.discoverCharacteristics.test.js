const awoxDiscoverCharacteristics = require('../../../lib/bluetooth.discoverCharacteristics.js');
const chai = require('chai');
const assert = chai.assert;

describe('Discover bluetooth characteristics', function () {

  var peripheral;
  var service;
  var throwError;

  beforeEach(function () {
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

        if (throwError) {
          callback('Error', null);
        } else {
          callback(null, 'characteristic');
        }
      }
    };
  });

  it('Discover service characteristics with success', function (done) {
    throwError = false;

    awoxDiscoverCharacteristics({ peripheral: peripheral, services: [service] }).then((result) => {
      var expectedResult = { peripheral: peripheral, services: [service], characteristics: 'characteristic' };
      assert.deepEqual(result, expectedResult, 'Not expected result');
      assert.isOk(service.discovered, 'Discovered tag should be true');
      assert.isOk(peripheral.connected, 'Peripheral should be disconnected');
      done();
    }).catch((result) => {
      done('Should not have fail : ' + result);
    });
  });

  it('Discover service characteristics with error', function (done) {
    throwError = true;

    awoxDiscoverCharacteristics({ peripheral: peripheral, services: [service] }).then(() => {
      done('Should have fail');
    }).catch(() => {
      assert.isOk(service.discovered, 'Discovered tag should be true');
      assert.isNotOk(peripheral.connected, 'Peripheral should be disconnected');
      done();
    });
  });

  it('Discover service characteristics without services (undefined)', function (done) {
    awoxDiscoverCharacteristics({ peripheral: peripheral, services: undefined }).then(() => {
      done('Should have fail');
    }).catch(() => {
      assert.isNotOk(peripheral.connected, 'Peripheral should be disconnected');
      done();
    });
  });

  it('Discover service characteristics without services (null)', function (done) {
    awoxDiscoverCharacteristics({ peripheral: peripheral, services: null }).then(() => {
      done('Should have fail');
    }).catch(() => {
      assert.isNotOk(peripheral.connected, 'Peripheral should be disconnected');
      done();
    });
  });

  it('Discover service characteristics without services (empty)', function (done) {
    awoxDiscoverCharacteristics({ peripheral: peripheral, services: [] }).then(() => {
      done('Should have fail');
    }).catch(() => {
      assert.isNotOk(peripheral.connected, 'Peripheral should be disconnected');
      done();
    });
  });
});