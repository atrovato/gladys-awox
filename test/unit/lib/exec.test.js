const proxyquire = require('proxyquire');
const chai = require('chai');
const assert = chai.assert;

var expectedCommand = null;
var sliceIndex = 0;
var shared = {
  scanTimeout: 15,
  bluetoothOn: true,
  scanTimer: null
};

var connectMock = function (peripheral) {
  return Promise.resolve(peripheral);
};
var discoverServicesMock = function (peripheral) {
  return Promise.resolve([peripheral, peripheral]);
};
var discoverCharacteristicsMock = function (peripheral, service) {
  return Promise.resolve([peripheral, service]);
};
var sendMock = function (peripheral, characteristic, command) {
  assert.deepEqual(command.slice(0, sliceIndex), expectedCommand.slice(0, sliceIndex), 'Not expected command sent');
  return Promise.resolve(peripheral);
};
var scanMock = function (peripheral) {
  if (foundPeripherals !== undefined) {
    return Promise.resolve(foundPeripherals);
  } else {
    return Promise.resolve(peripheral);
  }
};

var exec = proxyquire('../../../lib/exec.js', {
  './shared.js': shared,
  './bluetooth.connect.js': connectMock,
  './bluetooth.discoverServices.js': discoverServicesMock,
  './bluetooth.discoverCharacteristics.js': discoverCharacteristicsMock,
  './bluetooth.send.js': sendMock,
  './bluetooth.scan.js': scanMock
});

describe('Gladys device exec', function () {

  beforeEach(function () {
    expectedCommand = null;
    sliceIndex = 0;
    foundPeripherals = undefined;
  });

  it('Device identifier not managed', function (done) {
    var deviceInfo = {
      deviceType: {
        identifier: 'Peripheral 1',
        deviceTypeIdentifier: 'unknown'
      },
      state: {
        value: 3
      }
    };

    exec(deviceInfo)
      .then(() => {
        done('Should have fail');
      }).catch(() => {
        done();
      });
  });

  it('Device identifier is binary with not managed value', function (done) {
    var deviceInfo = {
      deviceType: {
        identifier: 'Peripheral 1',
        deviceTypeIdentifier: 'binary'
      },
      state: {
        value: 3
      }
    };

    exec(deviceInfo)
      .then(() => {
        done('Should have fail');
      }).catch(() => {
        done();
      });
  });

  it('Device identifier is switch with value = 0', function (done) {
    expectedCommand = shared.commands.off.slice(0);
    sliceIndex = expectedCommand.length - 1;

    var deviceInfo = {
      deviceType: {
        identifier: 'Peripheral 1',
        deviceTypeIdentifier: 'switch'
      },
      state: {
        value: 0
      }
    };

    exec(deviceInfo)
      .then(() => {
        done();
      }).catch((result) => {
        done('Should not have fail : ' + result);
      });
  });

  it('Device identifier is switch with value = 1', function (done) {
    expectedCommand = shared.commands.on.slice(0);
    sliceIndex = expectedCommand.length - 1;

    var deviceInfo = {
      deviceType: {
        identifier: 'Peripheral 1',
        deviceTypeIdentifier: 'switch'
      },
      state: {
        value: 1
      }
    };

    exec(deviceInfo)
      .then(() => {
        done();
      }).catch((result) => {
        done('Should not have fail : ' + result);
      });
  });

  it('Device identifier is color with value = 0 (black / min)', function (done) {
    expectedCommand = shared.commands.color.slice(0);
    expectedCommand[10] = 0x00;
    expectedCommand[11] = 0x00;
    expectedCommand[12] = 0x00;
    sliceIndex = 14;

    var deviceInfo = {
      deviceType: {
        identifier: 'Peripheral 1',
        deviceTypeIdentifier: 'color'
      },
      state: {
        value: 0
      }
    };

    exec(deviceInfo)
      .then(() => {
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

    var deviceInfo = {
      deviceType: {
        identifier: 'Peripheral 1',
        deviceTypeIdentifier: 'color'
      },
      state: {
        value: 16777215
      }
    };

    exec(deviceInfo)
      .then(() => {
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

    var deviceInfo = {
      deviceType: {
        identifier: 'Peripheral 1',
        deviceTypeIdentifier: 'color'
      },
      state: {
        value: 16711680
      }
    };

    exec(deviceInfo)
      .then(() => {
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

    var deviceInfo = {
      deviceType: {
        identifier: 'Peripheral 1',
        deviceTypeIdentifier: 'color'
      },
      state: {
        value: 65280
      }
    };

    exec(deviceInfo)
      .then(() => {
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

    var deviceInfo = {
      deviceType: {
        identifier: 'Peripheral 1',
        deviceTypeIdentifier: 'color'
      },
      state: {
        value: 255
      }
    };

    exec(deviceInfo)
      .then(() => {
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

    var deviceInfo = {
      deviceType: {
        identifier: 'Peripheral 1',
        deviceTypeIdentifier: 'color'
      },
      state: {
        value: 16776960
      }
    };

    exec(deviceInfo)
      .then(() => {
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

    var deviceInfo = {
      deviceType: {
        identifier: 'Peripheral 1',
        deviceTypeIdentifier: 'color'
      },
      state: {
        value: 65535
      }
    };

    exec(deviceInfo)
      .then(() => {
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

    var deviceInfo = {
      deviceType: {
        identifier: 'Peripheral 1',
        deviceTypeIdentifier: 'color'
      },
      state: {
        value: 16711935
      }
    };

    exec(deviceInfo)
      .then(() => {
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

    var deviceInfo = {
      deviceType: {
        identifier: 'Peripheral 1',
        deviceTypeIdentifier: 'color'
      },
      state: {
        value: 8355711
      }
    };

    exec(deviceInfo)
      .then(() => {
        done();
      }).catch((result) => {
        done('Should not have fail : ' + result);
      });
  });

  it('Device identifier is manual', function (done) {
    expectedCommand = 'MANUAL COMMAND';

    var deviceInfo = {
      deviceType: {
        identifier: 'Peripheral 1',
        deviceTypeIdentifier: 'manual'
      },
      state: {
        value: 'MANUAL COMMAND'
      }
    };

    exec(deviceInfo)
      .then(() => {
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

    var deviceInfo = {
      deviceType: {
        identifier: 'Peripheral 1',
        deviceTypeIdentifier: 'brightness'
      },
      state: {
        value: 0
      }
    };

    exec(deviceInfo)
      .then(() => {
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

    var deviceInfo = {
      deviceType: {
        identifier: 'Peripheral 1',
        deviceTypeIdentifier: 'brightness'
      },
      state: {
        value: 25
      }
    };

    exec(deviceInfo)
      .then(() => {
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

    var deviceInfo = {
      deviceType: {
        identifier: 'Peripheral 1',
        deviceTypeIdentifier: 'brightness'
      },
      state: {
        value: 50
      }
    };

    exec(deviceInfo)
      .then(() => {
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

    var deviceInfo = {
      deviceType: {
        identifier: 'Peripheral 1',
        deviceTypeIdentifier: 'brightness'
      },
      state: {
        value: 75
      }
    };

    exec(deviceInfo)
      .then(() => {
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

    var deviceInfo = {
      deviceType: {
        identifier: 'Peripheral 1',
        deviceTypeIdentifier: 'brightness'
      },
      state: {
        value: 100
      }
    };

    exec(deviceInfo)
      .then(() => {
        done();
      }).catch((result) => {
        done('Should not have fail : ' + result);
      });
  });

  it('Device identifier is color reset', function (done) {
    expectedCommand = shared.commands.colorReset.slice(0);
    sliceIndex = 14;

    var deviceInfo = {
      deviceType: {
        identifier: 'Peripheral 1',
        deviceTypeIdentifier: 'color_reset'
      },
      state: {}
    };

    exec(deviceInfo)
      .then(() => {
        done();
      }).catch((result) => {
        done('Should not have fail : ' + result);
      });
  });

  it('Device identifier is white reset', function (done) {
    expectedCommand = shared.commands.whiteReset.slice(0);
    sliceIndex = 14;

    var deviceInfo = {
      deviceType: {
        identifier: 'Peripheral 1',
        deviceTypeIdentifier: 'white_reset'
      },
      state: {}
    };

    exec(deviceInfo)
      .then(() => {
        done();
      }).catch((result) => {
        done('Should not have fail : ' + result);
      });
  });

  it('No peripherals found', function (done) {
    expectedCommand = shared.commands.off.slice(0);
    sliceIndex = expectedCommand.length - 1;
    foundPeripherals = false;

    var deviceInfo = {
      deviceType: {
        identifier: 'Peripheral 1',
        deviceTypeIdentifier: 'switch'
      },
      state: {
        value: 0
      }
    };

    exec(deviceInfo)
      .then(() => {
        done('Should have fail');
      }).catch(() => {
        done();
      });
  });

  it('Expected peripheral not found', function (done) {
    expectedCommand = shared.commands.off.slice(0);
    sliceIndex = expectedCommand.length - 1;
    foundPeripherals = new Map();
    foundPeripherals.set('unknow', null);

    var deviceInfo = {
      deviceType: {
        identifier: 'Peripheral 1',
        deviceTypeIdentifier: 'switch'
      },
      state: {
        value: 0
      }
    };

    exec(deviceInfo)
      .then(() => {
        done('Should have fail');
      }).catch(() => {
        done();
      });
  });

});