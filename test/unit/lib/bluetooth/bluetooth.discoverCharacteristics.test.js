const awoxDiscoverCharacteristics = require('../../../../lib/bluetooth/discoverCharacteristics.js');
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

  it('Discover service characteristics all already discovered', function (done) {
    const tmpCharacteristcs = [{uuid: 'fff2'}];
    service.characteristics = tmpCharacteristcs;
    const expected = new Map();
    expected.set('fff2', tmpCharacteristcs[0]);

    awoxDiscoverCharacteristics(peripheral, service, ['fff2']).then((result) => {
      assert.deepEqual(result, expected, 'Result should be same a input');
      assert.isNotOk(service.discovered, 'Discovered tag should be true');
      done();
    }).catch((e) => {
      done('Should not have fail ' + e);
    });
  });

  it('Discover service characteristics half already discovered', function (done) {
    const tmpCharacteristcs = [{uuid: 'fff2'}];
    service.characteristics = tmpCharacteristcs;
    const expected = new Map();
    expected.set('fff2', tmpCharacteristcs[0]);
    expected.set(characteristc.uuid, characteristc);

    awoxDiscoverCharacteristics(peripheral, service, ['fff1', 'fff2']).then((result) => {
      assert.deepEqual(result, expected, 'Result should be same a input');
      assert.isOk(service.discovered, 'Discovered tag should be true');
      done();
    }).catch((e) => {
      done('Should not have fail ' + e);
    });
  });
});