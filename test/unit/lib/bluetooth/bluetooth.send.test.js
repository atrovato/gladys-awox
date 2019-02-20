const awoxSend = require('../../../../lib/bluetooth/send.js');
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

    peripheral = { address: 'MAC address' };

    characteristic = {
      sent: false,
      properties: ['write'],
      uuid: 'uuid',
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

  it('Send packet with success (array)', function (done) {
    throwError = false;

    awoxSend(peripheral, characteristic, command).then((result) => {
      assert.deepEqual(result, command, 'Not expected result');
      assert.isOk(characteristic.sent, 'Discovered tag should be true');
      done();
    }).catch((result) => {
      done('Should not have fail : ' + result);
    });
  });

  it('Send packet with success buffer', function (done) {
    throwError = false;

    awoxSend(peripheral, characteristic, Buffer.from(command)).then((result) => {
      assert.deepEqual(result, Buffer.from(command), 'Not expected result');
      assert.isOk(characteristic.sent, 'Discovered tag should be true');
      done();
    }).catch((result) => {
      done('Should not have fail : ' + result);
    });
  });

  it('Send packet with timeout', function (done) {
    throwTimeout = true;

    awoxSend(peripheral, characteristic, command).then(() => {
      done('Should have fail');
    }).catch(() => {
      assert.isOk(characteristic.sent, 'Discovered tag should be true');
      done();
    });
  });

  it('Send packet with error', function (done) {
    throwError = true;

    awoxSend(peripheral, characteristic, command).then(() => {
      done('Should have fail');
    }).catch(() => {
      assert.isOk(characteristic.sent, 'Discovered tag should be true');
      done();
    });
  });

  it('Send packet on non writable characteristics', function (done) {
    characteristic.properties = [];

    awoxSend(peripheral, characteristic).then(() => {
      done('Should have fail');
    }).catch(() => {
      done();
    });
  });

  it('Send packet on non existing uuid characteristics', function (done) {
    characteristic.properties = [];

    awoxSend(peripheral, characteristic, null, 'oo').then(() => {
      done('Should have fail');
    }).catch(() => {
      done();
    });
  });
});