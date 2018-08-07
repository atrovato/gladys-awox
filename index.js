const noble = require('noble');
const shared = require('./lib/shared.js');

module.exports = function(sails) {
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

            if (shared.scanTimer) {
                clearTimeout(shared.scanTimer);
                shared.scanTimer = null;
            }
        });
    });

    return {
        exec: exec,
        setup: install
    };
};
