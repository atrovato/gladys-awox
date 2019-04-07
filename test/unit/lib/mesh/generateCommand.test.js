const chai = require('chai');
const assert = chai.assert;

const generateCommand = require('../../../../lib/mesh/generateCommand.js');

describe('Gladys generate AwoX command', function () {

  it('Device identifier is binary with not managed value', function (done) {
    var type = 'binary';
    var value = 3;

    generateCommand(type, value)
      .then(() => {
        done('Should have fail');
      }).catch(() => {
        done();
      });
  });

  it('Device identifier is switch with value = 0', function (done) {
    var type = 'switch';
    var value = 0;

    generateCommand(type, value)
      .then((command) => {
        const expectedCommand = { key: 0xd0, data: [0x00] };
        assert.deepEqual(command, expectedCommand, 'Not expected command sent');
        done();
      }).catch((result) => {
        done('Should not have fail : ' + result);
      });
  });

  it('Device identifier is switch with value = 1', function (done) {
    var type = 'switch';
    var value = 1;

    generateCommand(type, value)
      .then((command) => {
        const expectedCommand = { key: 0xd0, data: [0x01] };
        assert.deepEqual(command, expectedCommand, 'Not expected command sent');
        done();
      }).catch((result) => {
        done('Should not have fail : ' + result);
      });
  });

  it('Device identifier is switch with invalid value = 2', function (done) {
    var type = 'switch';
    var value = 2;

    generateCommand(type, value)
      .then(() => {
        done('Should have fail');
      }).catch((result) => {
        assert.equal('Unknown command', result, 'Error invalid');
        done();
      });
  });

  it('Device identifier is color with value = 0 (black / min)', function (done) {
    var type = 'color';
    var value = 0;

    generateCommand(type, value)
      .then((command) => {
        const expectedCommand = { key: 0xe2, data: [0x04, 0x00, 0x00, 0x00] };
        assert.deepEqual(command, expectedCommand, 'Not expected command sent');
        done();
      }).catch((result) => {
        done('Should not have fail : ' + result);
      });
  });

  it('Device identifier is color with value = 16.777.215 (white / max)', function (done) {
    var type = 'color';
    var value = 16777215;

    generateCommand(type, value)
      .then((command) => {
        const expectedCommand = { key: 0xe2, data: [0x04, 0xFF, 0xFF, 0xFF] };
        assert.deepEqual(command, expectedCommand, 'Not expected command sent');
        done();
      }).catch((result) => {
        done('Should not have fail : ' + result);
      });
  });

  it('Device identifier is color with value = 16711680 (red)', function (done) {
    var type = 'color';
    var value = 16711680;

    generateCommand(type, value)
      .then((command) => {
        const expectedCommand = { key: 0xe2, data: [0x04, 0xFF, 0x00, 0x00] };
        assert.deepEqual(command, expectedCommand, 'Not expected command sent');
        done();
      }).catch((result) => {
        done('Should not have fail : ' + result);
      });
  });

  it('Device identifier is color with value = 65280 (green)', function (done) {
    var type = 'color';
    var value = 65280;

    generateCommand(type, value)
      .then((command) => {
        const expectedCommand = { key: 0xe2, data: [0x04, 0x00, 0xFF, 0x00] };
        assert.deepEqual(command, expectedCommand, 'Not expected command sent');
        done();
      }).catch((result) => {
        done('Should not have fail : ' + result);
      });
  });

  it('Device identifier is color with value = 255 (blue)', function (done) {
    var type = 'color';
    var value = 255;

    generateCommand(type, value)
      .then((command) => {
        const expectedCommand = { key: 0xe2, data: [0x04, 0x00, 0x00, 0xFF] };
        assert.deepEqual(command, expectedCommand, 'Not expected command sent');
        done();
      }).catch((result) => {
        done('Should not have fail : ' + result);
      });
  });

  it('Device identifier is color with value = 16776960 (yellow)', function (done) {
    var type = 'color';
    var value = 16776960;

    generateCommand(type, value)
      .then((command) => {
        const expectedCommand = { key: 0xe2, data: [0x04, 0xFF, 0xFF, 0x00] };
        assert.deepEqual(command, expectedCommand, 'Not expected command sent');
        done();
      }).catch((result) => {
        done('Should not have fail : ' + result);
      });
  });

  it('Device identifier is color with value = 65535 (cyan)', function (done) {
    var type = 'color';
    var value = 65535;

    generateCommand(type, value)
      .then((command) => {
        const expectedCommand = { key: 0xe2, data: [0x04, 0x00, 0xFF, 0xFF] };
        assert.deepEqual(command, expectedCommand, 'Not expected command sent');
        done();
      }).catch((result) => {
        done('Should not have fail : ' + result);
      });
  });

  it('Device identifier is color with value = 16711935 (magenta)', function (done) {
    var type = 'color';
    var value = 16711935;

    generateCommand(type, value)
      .then((command) => {
        const expectedCommand = { key: 0xe2, data: [0x04, 0xFF, 0x00, 0xFF] };
        assert.deepEqual(command, expectedCommand, 'Not expected command sent');
        done();
      }).catch((result) => {
        done('Should not have fail : ' + result);
      });
  });

  it('Device identifier is color with value = 8355711 (grey)', function (done) {
    var type = 'color';
    var value = 8355711;

    generateCommand(type, value)
      .then((command) => {
        const expectedCommand = { key: 0xe2, data: [0x04, 0x7F, 0x7F, 0x7F] };
        assert.deepEqual(command, expectedCommand, 'Not expected command sent');
        done();
      }).catch((result) => {
        done('Should not have fail : ' + result);
      });
  });

  it('Device identifier is manual', function (done) {
    var type = 'manual';
    var value = 'MANUAL COMMAND';

    generateCommand(type, value)
      .then(() => {
        done('Should have fail');
      }).catch(() => {
        done();
      });
  });

  it('Device identifier white temperature', function (done) {
    var type = 'white_temperature';
    var value = 100;

    generateCommand(type, value)
      .then((command) => {
        const expectedCommand = { key: 0xf0, data: [0x7F] };
        assert.deepEqual(command, expectedCommand, 'Not expected command sent');
        done();
      }).catch((result) => {
        done('Should not have fail ' + result);
      });
  });

  it('Device identifier white brightness', function (done) {
    var type = 'white_brightness';
    var value = 100;

    generateCommand(type, value)
      .then((command) => {
        const expectedCommand = { key: 0xf1, data: [0x7F] };
        assert.deepEqual(command, expectedCommand, 'Not expected command sent');
        done();
      }).catch((result) => {
        done('Should not have fail ' + result);
      });
  });

  it('Device identifier color brightness', function (done) {
    var type = 'color_brightness';
    var value = 100;

    generateCommand(type, value)
      .then((command) => {
        const expectedCommand = { key: 0xf2, data: [0x7F] };
        assert.deepEqual(command, expectedCommand, 'Not expected command sent');
        done();
      }).catch((result) => {
        done('Should not have fail ' + result);
      });
  });

  it('Device identifier reset', function (done) {
    var type = 'reset';
    var value = 100;

    generateCommand(type, value)
      .then((command) => {
        const expectedCommand = { key: 0xe3, data: [0x00] };
        assert.deepEqual(command, expectedCommand, 'Not expected command sent');
        done();
      }).catch((result) => {
        done('Should not have fail ' + result);
      });
  });

  it('Device identifier preset', function (done) {
    var type = 'preset';
    var value = 3;

    generateCommand(type, value)
      .then((command) => {
        const expectedCommand = { key: 0xc8, data: [0x03] };
        assert.deepEqual(command, expectedCommand, 'Not expected command sent');
        done();
      }).catch((result) => {
        done('Should not have fail ' + result);
      });
  });
});