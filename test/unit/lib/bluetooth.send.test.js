const awoxSend = require('../../../lib/bluetooth.send.js');
const chai = require('chai');
const assert = chai.assert;
const sinon = require('sinon');

var clock;

describe('Sending bluetooth packets', function () {

  var peripheral;
  var characteristic;
  var throwTimeout;
  var throwError;
  var command;

  beforeEach(function () {
    clock = sinon.useFakeTimers();
    throwTimeout = false;
    throwError = false;
    command = 'CommandToSend';

    peripheral = {
      connected: true,
      disconnect: function () {
        this.connected = false;
      }
    };

    characteristic = {
      sent: false,
      properties: ['write'],
      write: function (data, withoutResponse, callback) {
        var expectedCommand = new Buffer(command);
        assert.deepEqual(data, expectedCommand, 'Invalid command');
        assert.isNotOk(withoutResponse, 'No response expected');
        this.sent = true;

        if (throwTimeout) {
          clock.tick(100000);
        } else if (throwError) {
          callback('Error');
        } else {
          callback();
        }
      }
    };
  });

  afterEach(function () {
    clock.restore();
  });

  it('Send packet with success', function (done) {
    throwError = false;

    awoxSend({ peripheral: peripheral, characteristics: [characteristic], command: command }).then((result) => {
      assert.deepEqual(result.command, command, 'Not expected result');
      assert.isOk(characteristic.sent, 'Discovered tag should be true');
      assert.isNotOk(peripheral.connected, 'Peripheral should be disconnected');
      done();
    }).catch((result) => {
      done('Should not have fail : ' + result);
    });
  });

  it('Send packet with timeout', function (done) {
    throwTimeout = true;

    awoxSend({ peripheral: peripheral, characteristics: [characteristic], command: command }).then(() => {
      done('Should have fail');
    }).catch(() => {
      assert.isOk(characteristic.sent, 'Discovered tag should be true');
      assert.isNotOk(peripheral.connected, 'Peripheral should be disconnected');
      done();
    });
  });

  it('Send packet with error', function (done) {
    throwError = true;

    awoxSend({ peripheral: peripheral, characteristics: [characteristic], command: command }).then(() => {
      done('Should have fail');
    }).catch(() => {
      assert.isOk(characteristic.sent, 'Discovered tag should be true');
      assert.isNotOk(peripheral.connected, 'Peripheral should be disconnected');
      done();
    });
  });

  it('Send packet without characteristics (undefined)', function (done) {
    awoxSend({ peripheral: peripheral, characteristics: undefined, command: command }).then(() => {
      done('Should have fail');
    }).catch(() => {
      assert.isNotOk(peripheral.connected, 'Peripheral should be disconnected');
      done();
    });
  });

  it('Send packet without characteristics (null)', function (done) {
    awoxSend({ peripheral: peripheral, characteristics: null, command: command }).then(() => {
      done('Should have fail');
    }).catch(() => {
      assert.isNotOk(peripheral.connected, 'Peripheral should be disconnected');
      done();
    });
  });

  it('Send packet without characteristics (empty)', function (done) {
    awoxSend({ peripheral: peripheral, characteristics: [], command: command }).then(() => {
      done('Should have fail');
    }).catch(() => {
      assert.isNotOk(peripheral.connected, 'Peripheral should be disconnected');
      done();
    });
  });

  it('Send packet on non writable characteristics', function (done) {
    characteristic.properties = [];

    awoxSend({ peripheral: peripheral, characteristics: [characteristic] }).then(() => {
      done('Should have fail');
    }).catch(() => {
      assert.isNotOk(peripheral.connected, 'Peripheral should be disconnected');
      done();
    });
  });
});