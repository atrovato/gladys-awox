const noble = require('noble');
const shared = require('./shared.js');

module.exports = function(macAddresses) {
    return new Promise((resolve, reject) => {
        var peripherals = [];
        addListeners(resolve, peripherals, macAddresses);

        if (!shared.bluetoothOn) {
            reject('Bluetooth device is not available')
        } else {
            if (!shared.scanning) {
                noble.startScanning(['fff0'], false, function() {
                    sails.log.info('Scanning only devices with [fff0] services');
                });
            }

            if (shared.scanTimer) {
                clearTimeout(shared.scanTimer);
            }

            shared.scanTimer = setTimeout(stop, shared.scanTimeout);
        }
    });
};

function addListeners(resolve, peripherals, macAddresses) {
    var scanStopped = function() {
        console.log('Awox scanning stopped with ' + peripherals.length + ' peripheral(s) detected');
        noble.removeListener('scanStop', scanStopped);
        resolve(peripherals);
    }

    noble.on('discover', function (peripheral) {
        if (macAddresses) {
            if (peripheral.address in macAddresses) {
                console.log('Detected asked peripheral ' + peripheral.address);
                peripherals[peripheral.address] = peripheral;
                delete macAddresses[peripheral.address];

                if (Object.keys(macAddresses).length === 0) {
                    stop();
                }
            }
        } else {
            console.log('Detected peripheral ' + peripheral.address);
            peripherals.push(peripheral);
        }
    });

    noble.on('scanStop', scanStopped);
};

function stop() {
    if (shared.scanning) {
        noble.stopScanning();
    }
};
