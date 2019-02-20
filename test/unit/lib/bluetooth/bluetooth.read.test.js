const awoxRead = require('../../../../lib/bluetooth/read.js');
const chai = require('chai');
const assert = chai.assert;
const sinon = require('sinon');

var clock;

describe('Reading bluetooth packets', function () {

  var peripheral;
  var characteristic;
  var characteristicProps;
  var throwTimeout;
  var throwError;

  beforeEach(function () {
    clock = sinon.useFakeTimers();
    throwTimeout = false;
    throwError = false;
    expectedValues = 'value';
    characteristicProps = ['read'];

    peripheral = { uuid: 'MAC Address' };

    characteristic = {
      read: false,
      uuid: 'uuid',
      properties: characteristicProps,
      read: function (callback) {
        this.read = true;

        if (throwTimeout) {
          clock.tick(100000);
        } else if (throwError) {
          callback('Error');
        } else {
          callback(false, 'value');
        }
      }
    };
  });

  afterEach(function () {
    clock.restore();
  });

  it('Read packet with success', function (done) {
    throwError = false;

    awoxRead(peripheral, characteristic).then((result) => {
      assert.deepEqual(result, expectedValues, 'Not expected result');
      assert.isOk(characteristic.read, 'Discovered tag should be true');
      done();
    }).catch((result) => {
      done('Should not have fail : ' + result);
    });
  });

  it('Read packet with timeout', function (done) {
    throwTimeout = true;

    awoxRead(peripheral, characteristic).then(() => {
      done('Should have fail');
    }).catch(() => {
      assert.isOk(characteristic.read, 'Discovered tag should be true');
      done();
    });
  });

  it('Read packet with error', function (done) {
    throwError = true;

    awoxRead(peripheral, characteristic).then(() => {
      done('Should have fail');
    }).catch(() => {
      assert.isOk(characteristic.read, 'Discovered tag should be true');
      done();
    });
  });

  it('Read packet on non readable characteristics', function (done) {
    characteristic.properties = [];

    awoxRead(peripheral, characteristic).then(() => {
      done('Should have fail');
    }).catch(() => {
      done();
    });
  });

  it('Read packet on non existing uuid characteristics', function (done) {
    characteristic.properties = [];

    awoxRead(peripheral, characteristic, 'oo').then(() => {
      done('Should have fail');
    }).catch(() => {
      done();
    });
  });
});