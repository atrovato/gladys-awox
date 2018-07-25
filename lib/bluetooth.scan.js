const noble = require('noble');
const shared = require('./shared.js');

module.exports = function() {
    return new Promise((resolve, reject) => {
        var peripherals = [];
        addListeners(resolve, reject, peripherals);

        if (!shared.bluetoothOn) {
            reject('Bluetooth device is not available')
        } else {
            if (!shared.scanning) {
                noble.startScanning(['fff0'], false, function() {
                    sails.log.info('Scanning only devices with [fff0] services');
                });
            }

            if (shared.scanTimeout) {
                clearTimeout(shared.scanTimer);
            }

            shared.scanTimer = setTimeout(stop, shared.scanTimeout);
        }
    });
};

function addListeners(resolve, reject, peripherals) {
    var scanStopped = function() {
        console.log('Awox scanning stopped');
        noble.removeListener('scanStop', scanStopped);

        resolve(peripherals);
    }

    noble.on('discover', function (peripheral) {
        console.log('Detected peripheral ' + peripheral.address);
        peripherals.push(peripheral);
    });
    noble.on('scanStop', scanStopped);
};

function stop() {
    if (shared.scanning) {
        noble.stopScanning();
    }
};
