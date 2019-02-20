const proxyquire = require('proxyquire');
const chai = require('chai');
const assert = chai.assert;
const Promise = require('bluebird');

const shared = require('../../../../lib/mesh/shared.js');
shared.pairDelay = 0;

const randomBytesMock = [0x01, 0x02];
const pairCommand = Buffer.from([0x03, 0x04]);

const defaultMeshName = 'MESH-NAME';
const defaultMeshPassword = 'MESH-PASS';
const defaultMeshKey = 'MESH-KEY';
const defaultSession = Buffer.from([0x05, 0x06]);

const defaultPeripheral = { address: 'MAC address' };
const characteristics = new Map();
characteristics.set(shared.characteristics.pair, { uuid: shared.characteristics.pair });

const meshUtilsMock = {
  generateRandomBytes: function () {
    return randomBytesMock;
  },
  generatePairCommand: function () {
    return pairCommand;
  },
  generateSessionKey: function () {
    return defaultSession;
  },
  encrypt: function (key, value) {
    assert.deepEqual(key, defaultSession, 'Not expected session key for encrypt ' + value);
    return defaultSession;
  }
};

const expectedCommands = [
  Buffer.concat([Buffer.from([0x04]), defaultSession]), 
  Buffer.concat([Buffer.from([0x05]), defaultSession]), 
  Buffer.concat([Buffer.from([0x06]), defaultSession])];

let awoxSend = 0;
const awoxSendMock = function (peripheral, characteristic, command, writeWithoutResponse) {
  assert.deepEqual(peripheral, defaultPeripheral, 'Send: Peripheral is not the expected one');
  assert.deepEqual(characteristic, characteristics.get(shared.characteristics.pair), 'Send: Characteric is not the expected one');
  assert.deepEqual(command, expectedCommands[awoxSend], 'Send: Characteric is not the expected one');
  assert.isOk(writeWithoutResponse, 'Send: Ivalid write without satus value');

  awoxSend++;
  return Promise.resolve();
};

let returnCode;
let awoxRead = 0;
const awoxReadMock = function (peripheral, characteristic) {
  assert.deepEqual(peripheral, defaultPeripheral, 'Read: Peripheral is not the expected one');
  assert.deepEqual(characteristic, characteristics.get(shared.characteristics.pair), 'Read: Characteric is not the expected one');

  awoxRead++;
  return Promise.resolve(returnCode);
};

const changeAuthentication = proxyquire('../../../../lib/mesh/changeAuthentication.js', {
  './commandUtils.js': meshUtilsMock,
  '../bluetooth/send.js': awoxSendMock,
  '../bluetooth/read.js': awoxReadMock
});

describe('Gladys authenticate AwoX Mesh network', function () {

  beforeEach(() => {
    awoxSend = 0;
    awoxRead = 0;
    returnCode = [0x07];
  });

  it('Change authenticate with success', function (done) {
    changeAuthentication(defaultPeripheral, characteristics, defaultMeshName, defaultMeshPassword, defaultMeshKey, defaultSession).then((result) => {
      assert.equal(awoxSend, 3, 'Not expected send times');
      assert.equal(awoxRead, 1, 'Not expected read times');
      assert.deepEqual(result, defaultPeripheral, 'Not expected result');
      done();
    }).catch((result) => {
      done('Should not have fail ' + result);
    });
  });

  it('Change authenticate with bad credentials', function (done) {
    returnCode = [0x0e];

    changeAuthentication(defaultPeripheral, characteristics, defaultMeshName, defaultMeshPassword, defaultMeshKey, defaultSession).then((result) => {
      done('Should have fail ' + result);
    }).catch((result) => {
      assert.equal(awoxSend, 3, 'Not expected send times');
      assert.equal(awoxRead, 1, 'Not expected read times');
      assert.deepEqual(result, 'Unable to change authentication for ' + defaultPeripheral.address, 'Not expected error');
      done();
    });
  });

});