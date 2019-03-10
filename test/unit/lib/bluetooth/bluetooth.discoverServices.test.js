const awoxDiscoverServices = require('../../../../lib/bluetooth/discoverServices.js');
const chai = require('chai');
const assert = chai.assert;
const sinon = require('sinon');

var clock;

describe('Discover bluetooth services', function () {

  var peripheral;
  var service;
  var services;
  var throwTimeout;
  var throwError;

  beforeEach(function () {
    clock = sinon.useFakeTimers();
    throwTimeout = false;
    throwError = false;

    service = { uuid: 'service1' };
    services = [service];

    peripheral = {
      discovered: false,
      address: 'MAC address',
      discoverServices: function (uuids, callback) {
        assert.deepEqual(uuids, ['fff0'], 'Expected requested service is not valid');
        this.discovered = true;

        if (throwTimeout) {
          clock.tick(100000);
        } else if (throwError) {
          callback('Error', null);
        } else {
          callback(null, services);
        }
      }
    };
  });

  afterEach(function () {
    clock.restore();
  });

  it('Discover peripheral services with success', function (done) {
    throwError = false;

    awoxDiscoverServices(peripheral, ['fff0']).then((result) => {
      var expectedResult = new Map();
      expectedResult.set(service.uuid, service);
      assert.deepEqual(result, expectedResult, 'Not expected result');
      assert.isOk(peripheral.discovered, 'Discovered tag should be true');
      done();
    }).catch((result) => {
      done('Should not have fail : ' + result);
    });
  });

  it('Discover peripheral services with timeout', function (done) {
    throwTimeout = true;

    awoxDiscoverServices(peripheral, ['fff0']).then(() => {
      done('Should have fail');
    }).catch((result) => {
      assert.equal('Discover services timeout for ' + peripheral.address, result, 'Invalid error');
      assert.isOk(peripheral.discovered, 'Discovered tag should be true');
      done();
    });
  });

  it('Discover peripheral services with error', function (done) {
    throwError = true;

    awoxDiscoverServices(peripheral, ['fff0']).then(() => {
      done('Should have fail');
    }).catch((result) => {
      assert.equal('Error', result, 'Invalid error');
      assert.isOk(peripheral.discovered, 'Discovered tag should be true');
      done();
    });
  });

  it('Discover peripheral services with error (none found)', function (done) {
    services = [];

    awoxDiscoverServices(peripheral, ['fff0']).then(() => {
      done('Should have fail');
    }).catch((result) => {
      assert.equal('No services found for ' + peripheral.address, result, 'Invalid error');
      assert.isOk(peripheral.discovered, 'Discovered tag should be true');
      done();
    });
  });

  it('Discover service all already discovered', function (done) {
    const tmpServices = [{uuid: 'fff2'}];
    peripheral.services = tmpServices;
    const expected = new Map();
    expected.set('fff2', tmpServices[0]);

    awoxDiscoverServices(peripheral, ['fff2']).then((result) => {
      assert.deepEqual(result, expected, 'Result should be same a input');
      assert.isNotOk(peripheral.discovered, 'Discovered tag should be true');
      done();
    }).catch((e) => {
      done('Should not have fail ' + e);
    });
  });

  it('Discover service half already discovered', function (done) {
    const tmpServices = [{uuid: 'fff2'}];
    peripheral.services = tmpServices;
    const expected = new Map();
    expected.set('fff2', tmpServices[0]);
    expected.set(service.uuid, service);

    awoxDiscoverServices(peripheral, ['fff0', 'fff2']).then((result) => {
      assert.deepEqual(result, expected, 'Result should be same a input');
      assert.isOk(peripheral.discovered, 'Discovered tag should be true');
      done();
    }).catch((e) => {
      done('Should not have fail ' + e);
    });
  });
});