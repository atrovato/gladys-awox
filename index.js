const noble = require('noble');
const shared = require('./lib/shared.js');
const scanner = require('./lib/scanner.js');

module.exports = function(sails) {
    var exec = require('./lib/exec.js');
    var install = require('./lib/install.js');

    gladys.on('ready', function() {
        noble.on('stateChange', function (state) {
            if (state === 'poweredOn') {
                shared.bluetoothOn = true;
                sails.log.info('Bluetooth device available');

                gladys.device.getByService({ service : 'awox' }).then(function(devices) {
                    if (devices && devices.length > 0) {
                        var tmpPeripherals = [];
                        devices.forEach(function(device) {
                            sails.log.info('Awox device found ' + device.identifier);
                            tmpPeripherals[device.identifier] = device;
                        });
                        sails.log.info('Missing peripherals ' + Object.keys(tmpPeripherals).length);

                        var peripheralDiscovered = function(peripheral) {
                            var pAddr = peripheral.address;
                            sails.log.info('Missing peripherals ' + Object.keys(tmpPeripherals).length);
                            if (tmpPeripherals[pAddr]) {
                                sails.log.info('Awox initializing ' + pAddr);
                                shared.peripherals[pAddr] = peripheral;
                                delete tmpPeripherals[pAddr];
                            }

                            if (Object.keys(tmpPeripherals).length == 0) {
                                noble.stopScanning();
                            }
                        };

                        var nobleSteps = {
                            peripheralDiscovered: peripheralDiscovered,
                            peripherals: tmpPeripherals
                        };

                        scanner(nobleSteps);
                    }
                });
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
        exec: exec,
        setup: install
    };
};
