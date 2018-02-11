const noble = require('noble');

module.exports = function(sails) {
    var shared = require('./lib/shared.js');
    var exec = require('./lib/exec.js');
    var install = require('./lib/install.js');

    gladys.on('ready', function() {
        noble.on('stateChange', function (state) {
            if (state === 'poweredOn') {
                shared.bluetoothOn = true;
                sails.log.info('Bluetooth device available');
            } else if (state === 'poweredOff') {
                shared.bluetoothOn = false;
                sails.log.warn('Bluetooth device not available');
                noble.stopScanning();
            }
        });

        noble.on('scanStart', function () {
            sails.log.info('Awox scan started');
            shared.scanning = true;
        });

        noble.on('scanStop', function () {
            sails.log.info('Awox scan stopped');
            shared.scanning = false;
            shared.scanTimer = null;
        });
    });

    return {
        exec: exec
    };
};