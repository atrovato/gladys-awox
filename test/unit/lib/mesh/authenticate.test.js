const proxyquire = require('proxyquire');
const chai = require('chai');
const assert = chai.assert;
const Promise = require('bluebird');

const shared = require('../../../../lib/mesh/shared.js');

const randomBytesMock = [0x01, 0x02];
const pairCommand = Buffer.from([0x03, 0x04]);
const sessionKey = Buffer.from([0x05, 0x06]);

const defaultPeripheral = { address: 'MAC address' };
const characteristics = new Map();
characteristics.set(shared.characteristics.pair, { uuid: shared.characteristics.pair });
characteristics.set(shared.characteristics.status, { uuid: shared.characteristics.status });

const meshUtilsMock = {
  generateRandomBytes: function () {
    return randomBytesMock;
  },
  generatePairCommand: function () {
    return pairCommand;
  },
  generateSessionKey: function () {
    return sessionKey;
  }
};

const expectedSendCharacteristic = [shared.characteristics.pair, shared.characteristics.status];
const expectedReadCharacteristic = [shared.characteristics.pair];
const expectedCommands = [pairCommand, [0x01, 0x00]];

let awoxSend = 0;
const awoxSendMock = function (peripheral, characteristic, command, writeWithoutResponse) {
  assert.deepEqual(peripheral, defaultPeripheral, 'Send: Peripheral is not the expected one');
  assert.deepEqual(characteristic, characteristics.get(expectedSendCharacteristic[awoxSend]), 'Send: Characteric is not the expected one');
  assert.deepEqual(command, expectedCommands[awoxSend], 'Send: Characteric is not the expected one');

  awoxSend++;
  return Promise.resolve();
};

let returnCode;
let awoxRead = 0;
const awoxReadMock = function (peripheral, characteristic) {
  assert.deepEqual(peripheral, defaultPeripheral, 'Read: Peripheral is not the expected one');
  assert.deepEqual(characteristic, characteristics.get(expectedReadCharacteristic[awoxRead]), 'Read: Characteric is not the expected one');

  awoxRead++;
  return Promise.resolve(returnCode);
};

const authenticate = proxyquire('../../../../lib/mesh/authenticate.js', {
  './commandUtils.js': meshUtilsMock,
  '../bluetooth/send.js': awoxSendMock,
  '../bluetooth/read.js': awoxReadMock
});

describe('Gladys authenticate AwoX Mesh network', function () {

  beforeEach(() => {
    awoxSend = 0;
    awoxRead = 0;
    returnCode = [0x0d];
  });

  it('Authenticate with success', function (done) {
    authenticate(defaultPeripheral, characteristics).then((result) => {
      assert.equal(awoxSend, 2, 'Not expected send times');
      assert.equal(awoxRead, 1, 'Not expected read times');
      assert.deepEqual(result, sessionKey, 'Not expected session key');
      done();
    }).catch((result) => {
      done('Should not have fail ' + result);
    });
  });

  it('Authenticate with bad credentials', function (done) {
    returnCode = [0x0e];

    authenticate(defaultPeripheral, characteristics).then((result) => {
      done('Should have fail ' + result);
    }).catch((result) => {
      assert.equal(awoxSend, 2, 'Not expected send times');
      assert.equal(awoxRead, 1, 'Not expected read times');
      assert.deepEqual(result, 'Bad authentication for ' + defaultPeripheral.address + ', check name and password', 'Not expected error');
      done();
    });
  });

  it('Authenticate with unkown error code', function (done) {
    returnCode = [0x0b];

    authenticate(defaultPeripheral, characteristics).then((result) => {
      done('Should have fail ' + result);
    }).catch((result) => {
      assert.equal(awoxSend, 2, 'Not expected send times');
      assert.equal(awoxRead, 1, 'Not expected read times');
      assert.deepEqual(result, 'Unable to authenticate to ' + defaultPeripheral.address, 'Not expected error');
      done();
    });
  });
});