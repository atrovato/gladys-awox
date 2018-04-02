const noble = require('noble');
const shared = require('./shared.js');

module.exports = function(nobleSteps) {
    return new Promise((resolve, reject) => {
        addListeners(resolve, reject, nobleSteps);

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

function addListeners(resolve, reject, nobleSteps) {
    var scanStopped = function() {
        noble.removeListener('discover', nobleSteps.peripheralDiscovered);
        noble.removeListener('scanStop', scanStopped);

        if (nobleSteps.scanStopped) {
            nobleSteps.scanStopped(resolve, reject);
        } else {
            resolve('Awox scan timeout');
        }
    }

    noble.on('discover', nobleSteps.peripheralDiscovered);
    noble.on('scanStop', scanStopped);
};

function stop() {
    if (shared.scanning) {
        noble.stopScanning();
    }
};
