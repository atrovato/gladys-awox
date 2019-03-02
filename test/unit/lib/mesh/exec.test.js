const proxyquire = require('proxyquire');
const chai = require('chai');
const assert = chai.assert;
const Promise = require('bluebird');

const meshShared = require('../../../../lib/mesh/shared.js');

var sendStep = false;
var generateStep = false;
var authStep = false;
var packetStep = false;
var failAtStep;

var sendMock = function () {
  sendStep = true;

  if (failAtStep == 'send') {
    return Promise.reject();
  } else {
    return Promise.resolve(1);
  }
};

var generateMock = function () {
  generateStep = true;

  if (failAtStep == 'generate') {
    return Promise.reject();
  } else {
    return Promise.resolve({ key: 'key', data: 'data' });
  }
};

var authMock = function () {
  authStep = true;

  if (failAtStep == 'auth') {
    return Promise.reject();
  } else {
    return Promise.resolve(1);
  }
};

var packetMock = {
  generateCommandPacket: function () {
    packetStep = true;

    if (failAtStep == 'packet') {
      return Promise.reject();
    } else {
      const charMap = new Map();
      charMap.set(meshShared.characteristics.status, { on: function () { } });
      return Promise.resolve(charMap);
    }
  }
};

const executor = proxyquire('../../../../lib/mesh/exec.js', {
  '../bluetooth/send.js': sendMock,
  './generateCommand.js': generateMock,
  './commandUtils.js': packetMock,
  './authenticate.js': authMock
});

describe('Gladys mesh device exec', function () {

  var peripheral;
  var characteristics;

  beforeEach(function () {
    peripheral = {
      address: 'MAC address'
    };
    characteristics = new Map();

    failAtStep = undefined;

    authStep = false;
    generateStep = false;
    sendStep = false;
    packetStep = false;

    gladys = {
      param: {
        getValue: function () {
          return Promise.resolve();
        },
        delete: function () {
          return Promise.resolve();
        }
      }
    };
  });

  it('Fail at auth step', function (done) {
    failAtStep = 'auth';

    executor.exec(peripheral, characteristics)
      .then(() => {
        done('Should have fail');
      }).catch(() => {
        assert.isOk(authStep, 'Should be passed by auth step');
        assert.isNotOk(generateStep, 'Should not be passed by scan step');
        assert.isNotOk(packetStep, 'Should not be passed by packet step');
        assert.isNotOk(sendStep, 'Should not be passed by send step');
        done();
      });
  });

  it('Fail at generate step', function (done) {
    failAtStep = 'generate';

    executor.exec(peripheral, characteristics)
      .then(() => {
        done('Should have fail');
      }).catch(() => {
        assert.isOk(authStep, 'Should be passed by auth step');
        assert.isOk(generateStep, 'Should be passed by scan step');
        assert.isNotOk(packetStep, 'Should not be passed by packet step');
        assert.isNotOk(sendStep, 'Should not be passed by send step');
        done();
      });
  });

  it('Fail at packet step', function (done) {
    failAtStep = 'packet';

    executor.exec(peripheral, characteristics)
      .then(() => {
        done('Should have fail');
      }).catch(() => {
        assert.isOk(authStep, 'Should be passed by auth step');
        assert.isOk(generateStep, 'Should be passed by scan step');
        assert.isOk(packetStep, 'Should be passed by packet step');
        assert.isNotOk(sendStep, 'Should not be passed by send step');
        done();
      });
  });

  it('Fail at send step', function (done) {
    failAtStep = 'send';

    executor.exec(peripheral, characteristics)
      .then(() => {
        done('Should have fail');
      }).catch(() => {
        assert.isOk(authStep, 'Should be passed by auth step');
        assert.isOk(generateStep, 'Should be passed by scan step');
        assert.isOk(packetStep, 'Should be passed by packet step');
        assert.isOk(sendStep, 'Should be passed by send step');
        done();
      });
  });


  it('Exec success', function (done) {
    executor.exec(peripheral, characteristics)
      .then(() => {
        assert.isOk(authStep, 'Should be passed by auth step');
        assert.isOk(generateStep, 'Should be passed by scan step');
        assert.isOk(packetStep, 'Should be passed by packet step');
        assert.isOk(sendStep, 'Should be passed by send step');
        done();
      }).catch(() => {
        done('Should not have fail');
      });
  });


  it('Exec reset success', function (done) {
    executor.exec(peripheral, characteristics, 'reset', 'value')
      .then(() => {
        assert.isOk(authStep, 'Should be passed by auth step');
        assert.isOk(generateStep, 'Should be passed by scan step');
        assert.isOk(packetStep, 'Should be passed by packet step');
        assert.isOk(sendStep, 'Should be passed by send step');
        done();
      }).catch(() => {
        done('Should not have fail');
      });
  });

});