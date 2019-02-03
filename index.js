const noble = require('noble');
const shared = require('./lib/shared.js');
const exec = require('./lib/exec.js');
const install = require('./lib/install.js');

module.exports = function (sails) {
  gladys.on('ready', function () {
    noble.on('stateChange', function (state) {
      if (state === 'poweredOn') {
        shared.bluetoothOn = true;
        sails.log.info('AwoX module: Bluetooth device available');
      } else if (state === 'poweredOff') {
        shared.bluetoothOn = false;
        sails.log.warn('AwoX module: Bluetooth device not available');
        noble.stopScanning();
      }
    });
  });

  return {
    exec: exec,
    setup: install
  };
};
