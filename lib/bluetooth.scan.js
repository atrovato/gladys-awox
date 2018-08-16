const noble = require('noble');
const shared = require('./shared.js');

module.exports = function(macAddresses) {
    return new Promise((resolve, reject) => {
        if (!shared.bluetoothOn) {
            reject('Bluetooth device is not available')
        } else {
            var peripherals = new Map();
            addListeners(resolve, peripherals, macAddresses);

            if (!shared.scanning) {
                noble.startScanning(['fff0'], false, function() {
                    console.log('Scanning only devices with [fff0] services');
                    shared.scanning = true;
                });
            }

            if (macAddresses) {
                console.log('Looking for devices : ', macAddresses);
                shared.scanForNb += macAddresses.size;
            }

            if (shared.scanTimer) {
                shared.scanTimer.unref();
                shared.scanTimer.ref();
            } else {
                shared.scanTimer = setTimeout(stop, shared.scanTimeout);
            }
        }
    });
};

function addListeners(resolve, peripherals, macAddresses) {
    var scanStopped = function() {
        noble.removeListener('scanStop', scanStopped);
        noble.removeListener('discover', discover);
        resolve(peripherals);
    }

    var discover = function (peripheral) {
        if (macAddresses) {
            if (macAddresses.has(peripheral.address)) {
                console.log('Detected asked peripheral ' + peripheral.address);
                peripherals.set(peripheral.address, peripheral);
                macAddresses.delete(peripheral.address)
                shared.scanForNb--;

                if (shared.scanForNb === 0) {
                    console.log('All asked peripherals have been found');
                    stop();
                } else if (macAddresses.size === 0) {
                    scanStopped();
                }
            }
        } else {
            console.log('Detected peripheral ' + peripheral.address);
            peripherals.set(peripheral.address, peripheral);
        }
    };

    noble.on('discover', discover);
    noble.on('scanStop', scanStopped);
};

function stop() {
    if (shared.scanning) {
        noble.stopScanning();
    }
    if (shared.scanTimer) {
        shared.scanTimer.unref();
    }
    shared.scanning = false;
    shared.scanForNb = 0;
};
