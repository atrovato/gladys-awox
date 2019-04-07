const chai = require('chai');
const assert = chai.assert;

const generateCommand = require('../../../../lib/default/generateCommand.js');
const shared = require('../../../../lib/default/shared.js');

describe('Gladys generate AwoX command', function () {

  var expectedCommand;
  var sliceIndex;
  var macAddr = 'MAC address';

  beforeEach(function () {
    expectedCommand = null;
    sliceIndex = 0;
  });

  it('Device identifier is binary with not managed value', function (done) {
    var type = 'binary';
    var value = 3;

    generateCommand(macAddr, type, value)
      .then(() => {
        done('Should have fail');
      }).catch(() => {
        done();
      });
  });

  it('Device identifier is switch with value = 0', function (done) {
    expectedCommand = shared.commands.off.slice(0);
    sliceIndex = expectedCommand.length - 1;

    var type = 'switch';
    var value = 0;

    generateCommand(macAddr, type, value)
      .then((command) => {
        assert.deepEqual(command.slice(0, sliceIndex), expectedCommand.slice(0, sliceIndex), 'Not expected command sent');
        done();
      }).catch((result) => {
        done('Should not have fail : ' + result);
      });
  });

  it('Device identifier is switch with value = 1', function (done) {
    expectedCommand = shared.commands.on.slice(0);
    sliceIndex = expectedCommand.length - 1;

    var type = 'switch';
    var value = 1;

    generateCommand(macAddr, type, value)
      .then((command) => {
        assert.deepEqual(command.slice(0, sliceIndex), expectedCommand.slice(0, sliceIndex), 'Not expected command sent');
        done();
      }).catch((result) => {
        done('Should not have fail : ' + result);
      });
  });

  it('Device identifier is switch with invalid value = 2', function (done) {
    var type = 'switch';
    var value = 2;

    generateCommand(macAddr, type, value)
      .then(() => {
        done('Should have fail');
      }).catch((result) => {
        assert.equal('Unknown command', result, 'Error invalid');
        done();
      });
  });

  it('Device identifier is color with value = 0 (black / min)', function (done) {
    expectedCommand = shared.commands.color.slice(0);
    expectedCommand[10] = 0x00;
    expectedCommand[11] = 0x00;
    expectedCommand[12] = 0x00;
    sliceIndex = 14;

    var type = 'color';
    var value = 0;

    generateCommand(macAddr, type, value)
      .then((command) => {
        assert.deepEqual(command.slice(0, sliceIndex), expectedCommand.slice(0, sliceIndex), 'Not expected command sent');
        done();
      }).catch((result) => {
        done('Should not have fail : ' + result);
      });
  });

  it('Device identifier is color with value = 16.777.215 (white / max)', function (done) {
    expectedCommand = shared.commands.color.slice(0);
    expectedCommand[09] = 0xFF;
    expectedCommand[10] = 0xFF;
    expectedCommand[11] = 0xFF;

    var type = 'color';
    var value = 16777215;

    generateCommand(macAddr, type, value)
      .then((command) => {
        assert.deepEqual(command.slice(0, sliceIndex), expectedCommand.slice(0, sliceIndex), 'Not expected command sent');
        done();
      }).catch((result) => {
        done('Should not have fail : ' + result);
      });
  });

  it('Device identifier is color with value = 16711680 (red)', function (done) {
    expectedCommand = shared.commands.color.slice(0);
    expectedCommand[09] = 0xFF;
    expectedCommand[10] = 0x00;
    expectedCommand[11] = 0x00;
    sliceIndex = 14;

    var type = 'color';
    var value = 16711680;

    generateCommand(macAddr, type, value)
      .then((command) => {
        assert.deepEqual(command.slice(0, sliceIndex), expectedCommand.slice(0, sliceIndex), 'Not expected command sent');
        done();
      }).catch((result) => {
        done('Should not have fail : ' + result);
      });
  });

  it('Device identifier is color with value = 65280 (green)', function (done) {
    expectedCommand = shared.commands.color.slice(0);
    expectedCommand[09] = 0x00;
    expectedCommand[10] = 0xFF;
    expectedCommand[11] = 0x00;

    var type = 'color';
    var value = 65280;

    generateCommand(macAddr, type, value)
      .then((command) => {
        assert.deepEqual(command.slice(0, sliceIndex), expectedCommand.slice(0, sliceIndex), 'Not expected command sent');
        done();
      }).catch((result) => {
        done('Should not have fail : ' + result);
      });
  });

  it('Device identifier is color with value = 255 (blue)', function (done) {
    expectedCommand = shared.commands.color.slice(0);
    expectedCommand[09] = 0x00;
    expectedCommand[10] = 0x00;
    expectedCommand[11] = 0xFF;
    sliceIndex = 14;

    var type = 'color';
    var value = 255;

    generateCommand(macAddr, type, value)
      .then((command) => {
        assert.deepEqual(command.slice(0, sliceIndex), expectedCommand.slice(0, sliceIndex), 'Not expected command sent');
        done();
      }).catch((result) => {
        done('Should not have fail : ' + result);
      });
  });

  it('Device identifier is color with value = 16776960 (yellow)', function (done) {
    expectedCommand = shared.commands.color.slice(0);
    expectedCommand[09] = 0xFF;
    expectedCommand[10] = 0xFF;
    expectedCommand[11] = 0x00;

    var type = 'color';
    var value = 16776960;

    generateCommand(macAddr, type, value)
      .then((command) => {
        assert.deepEqual(command.slice(0, sliceIndex), expectedCommand.slice(0, sliceIndex), 'Not expected command sent');
        done();
      }).catch((result) => {
        done('Should not have fail : ' + result);
      });
  });

  it('Device identifier is color with value = 65535 (cyan)', function (done) {
    expectedCommand = shared.commands.color.slice(0);
    expectedCommand[09] = 0x00;
    expectedCommand[10] = 0xFF;
    expectedCommand[11] = 0xFF;
    sliceIndex = 14;

    var type = 'color';
    var value = 65535;

    generateCommand(macAddr, type, value)
      .then((command) => {
        assert.deepEqual(command.slice(0, sliceIndex), expectedCommand.slice(0, sliceIndex), 'Not expected command sent');
        done();
      }).catch((result) => {
        done('Should not have fail : ' + result);
      });
  });

  it('Device identifier is color with value = 16711935 (magenta)', function (done) {
    expectedCommand = shared.commands.color.slice(0);
    expectedCommand[09] = 0xFF;
    expectedCommand[10] = 0x00;
    expectedCommand[11] = 0xFF;
    sliceIndex = 14;

    var type = 'color';
    var value = 16711935;

    generateCommand(macAddr, type, value)
      .then((command) => {
        assert.deepEqual(command.slice(0, sliceIndex), expectedCommand.slice(0, sliceIndex), 'Not expected command sent');
        done();
      }).catch((result) => {
        done('Should not have fail : ' + result);
      });
  });

  it('Device identifier is color with value = 8355711 (grey)', function (done) {
    expectedCommand = shared.commands.color.slice(0);
    expectedCommand[09] = 0x7F;
    expectedCommand[10] = 0x7F;
    expectedCommand[11] = 0x7F;
    sliceIndex = 14;

    var type = 'color';
    var value = 8355711;

    generateCommand(macAddr, type, value)
      .then((command) => {
        assert.deepEqual(command.slice(0, sliceIndex), expectedCommand.slice(0, sliceIndex), 'Not expected command sent');
        done();
      }).catch((result) => {
        done('Should not have fail : ' + result);
      });
  });

  it('Device identifier is manual', function (done) {
    expectedCommand = 'MANUAL COMMAND';

    var type = 'manual';
    var value = 'MANUAL COMMAND';

    generateCommand(macAddr, type, value)
      .then((command) => {
        assert.deepEqual(command.slice(0, sliceIndex), expectedCommand.slice(0, sliceIndex), 'Not expected command sent');
        done();
      }).catch((result) => {
        done('Should not have fail : ' + result);
      });
  });

  it('Device identifier is brightness with level = 0% (min / 600)', function (done) {
    expectedCommand = shared.commands.brightness.slice(0);
    expectedCommand[8] = 0x02;
    expectedCommand[9] = 0x58;
    sliceIndex = 10;

    var type = 'brightness';
    var value = 0;

    generateCommand(macAddr, type, value)
      .then((command) => {
        assert.deepEqual(command.slice(0, sliceIndex), expectedCommand.slice(0, sliceIndex), 'Not expected command sent');
        done();
      }).catch((result) => {
        done('Should not have fail : ' + result);
      });
  });

  it('Device identifier is brightness with level = 25% (1213)', function (done) {
    expectedCommand = shared.commands.brightness.slice(0);
    expectedCommand[8] = 0x04;
    expectedCommand[9] = 0xBD;
    sliceIndex = 10;

    var type = 'brightness';
    var value = 25;

    generateCommand(macAddr, type, value)
      .then((command) => {
        assert.deepEqual(command.slice(0, sliceIndex), expectedCommand.slice(0, sliceIndex), 'Not expected command sent');
        done();
      }).catch((result) => {
        done('Should not have fail : ' + result);
      });
  });

  it('Device identifier is brightness with level = 50% (1825)', function (done) {
    expectedCommand = shared.commands.brightness.slice(0);
    expectedCommand[8] = 0x07;
    expectedCommand[9] = 0x21;
    sliceIndex = 10;

    var type = 'brightness';
    var value = 50;

    generateCommand(macAddr, type, value)
      .then((command) => {
        assert.deepEqual(command.slice(0, sliceIndex), expectedCommand.slice(0, sliceIndex), 'Not expected command sent');
        done();
      }).catch((result) => {
        done('Should not have fail : ' + result);
      });
  });

  it('Device identifier is brightness with level = 75% (2438)', function (done) {
    expectedCommand = shared.commands.brightness.slice(0);
    expectedCommand[8] = 0x09;
    expectedCommand[9] = 0x86;
    sliceIndex = 10;

    var type = 'brightness';
    var value = 75;

    generateCommand(macAddr, type, value)
      .then((command) => {
        assert.deepEqual(command.slice(0, sliceIndex), expectedCommand.slice(0, sliceIndex), 'Not expected command sent');
        done();
      }).catch((result) => {
        done('Should not have fail : ' + result);
      });
  });

  it('Device identifier is brightness with level = 100% (max / 3050)', function (done) {
    expectedCommand = shared.commands.brightness.slice(0);
    expectedCommand[8] = 0x0B;
    expectedCommand[9] = 0xEA;
    sliceIndex = 10;

    var type = 'brightness';
    var value = 100;

    generateCommand(macAddr, type, value)
      .then((command) => {
        assert.deepEqual(command.slice(0, sliceIndex), expectedCommand.slice(0, sliceIndex), 'Not expected command sent');
        done();
      }).catch((result) => {
        done('Should not have fail : ' + result);
      });
  });

  it('Device identifier is color reset', function (done) {
    expectedCommand = shared.commands.colorReset.slice(0);
    sliceIndex = 14;

    var type = 'color_reset';
    var value = undefined;

    generateCommand(macAddr, type, value)
      .then((command) => {
        assert.deepEqual(command.slice(0, sliceIndex), expectedCommand.slice(0, sliceIndex), 'Not expected command sent');
        done();
      }).catch((result) => {
        done('Should not have fail : ' + result);
      });
  });

  it('Device identifier is white reset', function (done) {
    expectedCommand = shared.commands.whiteReset.slice(0);
    sliceIndex = 14;

    var type = 'white_reset';
    var value = 100;

    generateCommand(macAddr, type, value)
      .then((command) => {
        assert.deepEqual(command.slice(0, sliceIndex), expectedCommand.slice(0, sliceIndex), 'Not expected command sent');
        done();
      }).catch((result) => {
        done('Should not have fail : ' + result);
      });
  });
});