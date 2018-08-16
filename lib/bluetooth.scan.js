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
                });
            }

            if (macAddresses) {
                console.log('Looking for devices : ', macAddresses);
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
        console.log('Awox scanning stopped with ' + peripherals.length + ' peripheral(s) detected');
        noble.removeListener('scanStop', scanStopped);
        noble.removeAllListeners('discover');
        resolve(peripherals);
    }

    noble.on('discover', function (peripheral) {
        if (macAddresses) {
            if (peripheral.address in macAddresses) {
                console.log('Detected asked peripheral ' + peripheral.address);
                peripherals.set(peripheral.address, peripheral);
                delete macAddresses[peripheral.address];

                if (Object.keys(macAddresses).length === 0) {
                    console.log('All asked peripherals have been found');
                    stop();
                }
            }
        } else {
            console.log('Detected peripheral ' + peripheral.address);
            peripherals.set(peripheral.address, peripheral);
        }
    });

    noble.on('scanStop', scanStopped);
};

function stop() {
    if (shared.scanning) {
        noble.stopScanning();
    }
    if (shared.scanTimer) {
        shared.scanTimer.unref();
    }
};
