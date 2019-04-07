const shared = require('../shared.js');
const noble = require('noble');
const Promise = require('bluebird');

module.exports = function (macAddresses) {
  return new Promise((resolve, reject) => {
    if (!shared.bluetoothOn) {
      reject('Bluetooth device is not available');
    } else {
      var peripherals = new Map();
      var filtered = false;

      if (macAddresses && macAddresses.size > 0) {
        filtered = true;

        var nbAddr = macAddresses.size;
        var iterator = macAddresses.keys();
        var i = 0;
        do {
          i += 1;
          const macAddr = iterator.next().value;
          const _peripheral = noble._peripherals[macAddr.replace(/:/gi, '')];
          if (_peripheral) {
            peripherals.set(macAddr, _peripheral);
            macAddresses.delete(macAddr);
          }
        } while (i < nbAddr);
      }

      if (filtered && macAddresses.size === 0) {
        return resolve(peripherals);
      } else {
        addListeners(resolve, peripherals, macAddresses);

        if (!shared.scanning) {
          noble.startScanning([], false, function () {
            console.log('AwoX module: Scanning bluetooth devices');
            shared.scanning = true;
          });
        }

        if (macAddresses && macAddresses.size !== 0) {
          shared.scanForNb += macAddresses.size;
        }

        if (shared.scanTimer) {
          clearTimeout(shared.scanTimer);
        }

        shared.scanTimer = setTimeout(stop, shared.scanTimeout);
      }
    }
  });
};

function addListeners(resolve, peripherals, macAddresses) {
  var scanStopped = function () {
    noble.removeListener('scanStop', scanStopped);
    noble.removeListener('discover', discover);
    return resolve(peripherals);
  };

  var discover = function (peripheral) {
    if (macAddresses && macAddresses.size !== 0) {
      if (macAddresses.has(peripheral.address)) {
        console.log('AwoX module: Detected asked peripheral ' + peripheral.address);
        peripherals.set(peripheral.address, peripheral);
        macAddresses.delete(peripheral.address);
        shared.scanForNb--;

        if (shared.scanForNb === 0) {
          console.log('AwoX module: All asked peripherals have been found');
          stop();
        } else if (macAddresses.size === 0) {
          scanStopped();
        }
      }
    } else {
      console.log('AwoX module: Detected peripheral ' + peripheral.address);
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
    clearTimeout(shared.scanTimer);
    shared.scanTimer = undefined;
  }
  shared.scanning = false;
  shared.scanForNb = 0;
};
