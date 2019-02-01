const awoxDiscoverCharacteristics = require('../../../lib/bluetooth.discoverCharacteristics.js');
const chai = require('chai');
const assert = chai.assert;
const sinon = require('sinon');

var clock;

describe('Discover bluetooth characteristics', function () {

  var peripheral;
  var service;
  var characteristc;
  var characteristcs;
  var throwTimeout;
  var throwError;

  beforeEach(function () {
    clock = sinon.useFakeTimers();
    throwTimeout = false;
    throwError = false;

    peripheral = { address: 'MAC adress' };
    characteristc = { uuid: 'uuid' };
    characteristcs = [characteristc];

    service = {
      uuid: 'serviceUUID',
      discovered: false,
      discoverCharacteristics: function (characteristic, callback) {
        assert.deepEqual(characteristic, ['fff1'], 'Expected requested characteristic is not valid');
        this.discovered = true;

        if (throwTimeout) {
          clock.tick(100000);
        } else if (throwError) {
          callback('Error', null);
        } else {
          callback(null, characteristcs);
        }
      }
    };
  });

  afterEach(function () {
    clock.restore();
  });

  it('Discover service characteristics with success', function (done) {
    throwError = false;

    awoxDiscoverCharacteristics(peripheral, service, ['fff1']).then((result) => {
      var expectedResult = new Map();
      expectedResult.set(characteristc.uuid, characteristc);
      assert.deepEqual(result, expectedResult, 'Not expected result');
      assert.isOk(service.discovered, 'Discovered tag should be true');
      done();
    }).catch((result) => {
      done('Should not have fail : ' + result);
    });
  });

  it('Discover service characteristics with timeout', function (done) {
    throwTimeout = true;

    awoxDiscoverCharacteristics(peripheral, service, ['fff1']).then(() => {
      done('Should have fail');
    }).catch((result) => {
      assert.equal('Discover characteristics timeout for ' + peripheral.address, result, 'Invalid error');
      assert.isOk(service.discovered, 'Discovered tag should be true');
      done();
    });
  });

  it('Discover service characteristics with error', function (done) {
    throwError = true;

    awoxDiscoverCharacteristics(peripheral, service, ['fff1']).then(() => {
      done('Should have fail');
    }).catch((result) => {
      assert.equal('Error', result, 'Invalid error');
      assert.isOk(service.discovered, 'Discovered tag should be true');
      done();
    });
  });

  it('Discover service characteristics with error (none found)', function (done) {
    characteristcs = [];

    awoxDiscoverCharacteristics(peripheral, service, ['fff1']).then(() => {
      done('Should have fail');
    }).catch((result) => {
      assert.equal('No characteristics found for service ' + service.uuid + ' on ' + peripheral.address, result, 'Invalid error');
      assert.isOk(service.discovered, 'Discovered tag should be true');
      done();
    });
  });
});