const awoxConnect = require('../../../../lib/bluetooth/connect.js');
const chai = require('chai');
const assert = chai.assert;
const sinon = require('sinon');

var clock;

describe('Connect bluetooth peripherals', function () {

  var peripheral;
  var throwTimeout;
  var throwError;

  beforeEach(function () {
    clock = sinon.useFakeTimers();
    throwTimeout = false;
    throwError = false;

    peripheral = {
      connected: false,
      connectable: true,
      addressType: 'public',
      connect: function (callback) {
        this.connected = true;

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

  it('Connect to peripheral with success', function (done) {
    throwError = false;

    awoxConnect(peripheral).then((result) => {
      assert.strictEqual(result, peripheral, 'Expected peripheral should same as input');
      assert.isOk(peripheral.connected, 'Connected tag should be true');
      done();
    }).catch((result) => {
      done('Should not have fail : ' + result);
    });
  });

  it('Connect to peripheral with timeout', function (done) {
    throwTimeout = true;

    awoxConnect(peripheral).then(() => {
      done('Should have fail');
    }).catch(() => {
      assert.isOk(peripheral.connected, 'Connected tag should be true');
      done();
    });
  });

  it('Connect to peripheral with error', function (done) {
    throwError = true;

    awoxConnect(peripheral).then(() => {
      done('Should have fail');
    }).catch(() => {
      assert.isOk(peripheral.connected, 'Connected tag should be true');
      done();
    });
  });

  it('Connect to peripheral with error (not connectable)', function (done) {
    peripheral.connectable = false;

    awoxConnect(peripheral).then(() => {
      done('Should have fail');
    }).catch(() => {
      assert.isNotOk(peripheral.connected, 'Connected tag should be true');
      done();
    });
  });

  it('Connect to peripheral with error (not public)', function (done) {
    peripheral.addressType = 'random';

    awoxConnect(peripheral).then(() => {
      done('Should have fail');
    }).catch(() => {
      assert.isNotOk(peripheral.connected, 'Connected tag should be true');
      done();
    });
  });

  
  it('Connect to peripheral already connected', function (done) {
    peripheral.state = 'connected';

    awoxConnect(peripheral).then((result) => {
      assert.equal(result, peripheral, 'Should be the same as input');
      assert.isNotOk(peripheral.connected, 'Connected tag not should be true');
      done();
    }).catch((e) => {
      done('Should not have fail ' + e);
    });
  });
});