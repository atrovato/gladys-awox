const awoxRead = require('../../../lib/bluetooth.read.js');
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
    expectedValues = { 'uuid': 'value' };
    characteristicProps = ['read'];

    peripheral = {
      connected: true,
      disconnect: function () {
        this.connected = false;
      }
    };

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

    awoxRead({ peripheral: peripheral, characteristics: [characteristic] }).then((result) => {
      assert.deepEqual(result.values, expectedValues, 'Not expected result');
      assert.isOk(characteristic.read, 'Discovered tag should be true');
      assert.isOk(peripheral.connected, 'Peripheral should be connected');
      done();
    }).catch((result) => {
      done('Should not have fail : ' + result);
    });
  });

  it('Read packet with timeout', function (done) {
    throwTimeout = true;

    awoxRead({ peripheral: peripheral, characteristics: [characteristic] }).then(() => {
      done('Should have fail');
    }).catch(() => {
      assert.isOk(characteristic.read, 'Discovered tag should be true');
      assert.isNotOk(peripheral.connected, 'Peripheral should be disconnected');
      done();
    });
  });

  it('Read packet with error', function (done) {
    throwError = true;

    awoxRead({ peripheral: peripheral, characteristics: [characteristic] }).then(() => {
      done('Should have fail');
    }).catch(() => {
      assert.isOk(characteristic.read, 'Discovered tag should be true');
      assert.isNotOk(peripheral.connected, 'Peripheral should be disconnected');
      done();
    });
  });

  it('Read packet without characteristics (undefined)', function (done) {
    awoxRead({ peripheral: peripheral, characteristics: undefined }).then(() => {
      done('Should have fail');
    }).catch(() => {
      assert.isNotOk(peripheral.connected, 'Peripheral should be disconnected');
      done();
    });
  });

  it('Read packet without characteristics (null)', function (done) {
    awoxRead({ peripheral: peripheral, characteristics: null }).then(() => {
      done('Should have fail');
    }).catch(() => {
      assert.isNotOk(peripheral.connected, 'Peripheral should be disconnected');
      done();
    });
  });

  it('Read packet without characteristics (empty)', function (done) {
    awoxRead({ peripheral: peripheral, characteristics: [] }).then(() => {
      done('Should have fail');
    }).catch(() => {
      assert.isNotOk(peripheral.connected, 'Peripheral should be disconnected');
      done();
    });
  });

  it('Read packet on non readable characteristics', function (done) {
    characteristic.properties = [];

    awoxRead({ peripheral: peripheral, characteristics: [characteristic] }).then(() => {
      done('Should have fail');
    }).catch(() => {
      assert.isNotOk(peripheral.connected, 'Peripheral should be disconnected');
      done();
    });
  });

  it('Read packet on non existing uuid characteristics', function (done) {
    characteristic.properties = [];

    awoxRead({ peripheral: peripheral, characteristics: [characteristic] }, 'oo').then(() => {
      done('Should have fail');
    }).catch(() => {
      assert.isNotOk(peripheral.connected, 'Peripheral should be disconnected');
      done();
    });
  });
});