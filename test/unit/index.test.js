const proxyquire = require('proxyquire');
const EventEmitter = require('events');
const chai = require('chai');
const assert = chai.assert;

var shared = {
  bluetoothOn: false
};
var nobleMock = new EventEmitter();
nobleMock.stopScanning = function () { };

var index = proxyquire('../../index.js', {
  'noble': nobleMock,
  './lib/shared.js': shared
});

var state = null;
var sails;
var gladysSokcetEvent = false;

describe('Gladys device index', function () {

  beforeEach(function () {
    state = null;
    gladysSokcetEvent = false;
    gladys = {
      on: function (event, callback) {
        callback(state);
      },
      socket: {
        emit: function () {
          gladysSokcetEvent = true;
        }
      }
    };
    sails = {
      log: {
        info: function (text) {
          console.log(text);
        },
        warn: function (text) {
          console.warn(text);
        }
      }
    };

    shared.bluetoothOn = false;
  });

  it('Index is complete', function (done) {
    var result = index(sails);
    assert.equal(Object.keys(result).length, 2, 'Not expected size');
    assert.isOk(result.exec, 'Exec is expected');
    assert.isNotOk(shared.bluetoothOn, 'Not expected bluetooth state');
    assert.isNotOk(gladysSokcetEvent, 'No socket event expected');
    done();
  });

  it('Bluetooth changes to ON', function (done) {
    var result = index(sails);
    nobleMock.emit('stateChange', 'poweredOn');
    assert.equal(Object.keys(result).length, 2, 'Not expected size');
    assert.isOk(result.exec, 'Exec is expected');
    assert.isOk(shared.bluetoothOn, 'Not expected bluetooth state');
    assert.isOk(gladysSokcetEvent, 'Socket event expected');
    done();
  });

  it('Bluetooth changes to OFF', function (done) {
    shared.bluetoothOn = true;

    var result = index(sails);
    nobleMock.emit('stateChange', 'poweredOff');
    assert.equal(Object.keys(result).length, 2, 'Not expected size');
    assert.isOk(result.exec, 'Exec is expected');
    assert.isNotOk(shared.bluetoothOn, 'Not expected bluetooth state');
    assert.isOk(gladysSokcetEvent, 'Socket event expected');
    done();
  });

  it('Bluetooth is ON and unknown state changes', function (done) {
    shared.bluetoothOn = true;

    var result = index(sails);
    nobleMock.emit('stateChange', 'unknown');
    assert.equal(Object.keys(result).length, 2, 'Not expected size');
    assert.isOk(result.exec, 'Exec is expected');
    assert.isOk(shared.bluetoothOn, 'Not expected bluetooth state');
    assert.isOk(gladysSokcetEvent, 'Socket event expected');
    done();
  });

  it('Bluetooth is OFF and unknown state changes', function (done) {
    shared.bluetoothOn = false;

    var result = index(sails);
    nobleMock.emit('stateChange', 'unknown');
    assert.equal(Object.keys(result).length, 2, 'Not expected size');
    assert.isOk(result.exec, 'Exec is expected');
    assert.isNotOk(shared.bluetoothOn, 'Not expected bluetooth state');
    assert.isOk(gladysSokcetEvent, 'Socket event expected');
    done();
  });

});