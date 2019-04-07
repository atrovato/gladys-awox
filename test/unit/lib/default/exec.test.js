const proxyquire = require('proxyquire');
const chai = require('chai');
const assert = chai.assert;
const Promise = require('bluebird');

var disconnected = false;

var sendStep = false;
var generateStep = false;
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
    return Promise.resolve(1);
  }
};

const executor = proxyquire('../../../../lib/default/exec.js', {
  '../bluetooth/send.js': sendMock,
  './generateCommand.js': generateMock
});

describe('Gladys default device exec', function () {

  var peripheral;
  var characteristics;

  beforeEach(function () {
    peripheral = {
      address: 'MAC address',
      disconnect: function () {
        disconnected = true;
      }
    };
    characteristics = new Map();

    failAtStep = undefined;
    disconnected = false;

    generateStep = false;
    sendStep = false;
  });

  it('Fail at generate step', function (done) {
    failAtStep = 'generate';

    executor.exec(peripheral, characteristics)
      .then(() => {
        done('Should have fail');
      }).catch(() => {
        assert.isOk(generateStep, 'Should be passed by scan step');
        assert.isNotOk(sendStep, 'Should not be passed by send step');
        assert.isNotOk(disconnected, 'Should not be passed by disconnect');
        done();
      });
  });

  it('Fail at send step', function (done) {
    failAtStep = 'send';

    executor.exec(peripheral, characteristics)
      .then(() => {
        done('Should have fail');
      }).catch(() => {
        assert.isOk(generateStep, 'Should be passed by scan step');
        assert.isOk(sendStep, 'Should be passed by send step');
        assert.isNotOk(disconnected, 'Should not be passed by disconnect');
        done();
      });
  });

  it('Exec success', function (done) {
    executor.exec(peripheral, characteristics)
      .then(() => {
        assert.isOk(generateStep, 'Should be passed by scan step');
        assert.isOk(sendStep, 'Should be passed by send step');
        assert.isNotOk(disconnected, 'Should not be passed by disconnect');
        done();
      }).catch(() => {
        done('Should not have fail');
      });
  });

});