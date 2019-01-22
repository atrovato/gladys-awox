const awoxDiscoverServices = require('../../../lib/bluetooth.discoverServices.js');
const chai = require('chai');
const assert = chai.assert;
const sinon = require('sinon');

var clock;

describe('Discover bluetooth services', function () {

  var peripheral;
  var throwTimeout;
  var throwError;

  beforeEach(function () {
    clock = sinon.useFakeTimers();
    throwTimeout = false;
    throwError = false;

    peripheral = {
      discovered: false,
      discoverServices: function (service, callback) {
        assert.deepEqual(service, ['fff0'], 'Expected requested service is not valid');
        this.discovered = true;

        if (throwTimeout) {
          clock.tick(10000);
        } else if (throwError) {
          callback('Error', null);
        } else {
          callback(null, 'service');
        }
      }
    };
  });

  afterEach(function () {
    clock.restore();
  });

  it('Discover peripheral services with success', function (done) {
    throwError = false;

    awoxDiscoverServices(['fff0'], { peripheral: peripheral }).then((result) => {
      var expectedResult = { peripheral: peripheral, services: 'service' };
      assert.deepEqual(result, expectedResult, 'Not expected result');
      assert.isOk(peripheral.discovered, 'Discovered tag should be true');
      done();
    }).catch((result) => {
      done('Should not have fail : ' + result);
    });
  });

  it('Discover peripheral services with timeout', function (done) {
    throwTimeout = true;

    awoxDiscoverServices(['fff0'], { peripheral: peripheral }).then(() => {
      done('Should have fail');
    }).catch(() => {
      assert.isOk(peripheral.discovered, 'Discovered tag should be true');
      done();
    });
  });

  it('Discover peripheral services with error', function (done) {
    throwError = true;

    awoxDiscoverServices(['fff0'], { peripheral: peripheral }).then(() => {
      done('Should have fail');
    }).catch(() => {
      assert.isOk(peripheral.discovered, 'Discovered tag should be true');
      done();
    });
  });
});