const noble = require('noble');
const shared = require('./shared.js');

module.exports = function(deviceInfo) {
    return new Promise((resolve, reject) => {
        sails.log.info(deviceInfo);
                             
        var macAddr = deviceInfo.deviceType.identifier;
        var value = deviceInfo.state.value;
        var command;

        sails.log.info('Prepare command for Awox ' + macAddr + ' (' + value +')');

        if (value === 1) {
            command = shared.commands.on;
        } else if (value === 0) {
            command = shared.commands.off;
        }
        sails.log.info('Built command for Awox ' + macAddr + ' (' + command +')');

        var stop = function() {
            if (shared.scanning) {
                noble.stopScanning();
                reject('Awox scan timeout');
            }
        };

        var characteristicsDiscovered = function(peripheral, service, characteristics, command) {
            if(!characteristics || characteristics.length === 0){
                sails.log.error('No characteristics found for ' + peripheral.address);
                peripheral.disconnect();
                reject('No characteristics found for ' + peripheral.address);
            } else {
                characteristics[0].write(new Buffer(command), false, (error) => {
                    peripheral.disconnect();

                    if(error) {
                        sails.log.error('Error occured sending command : ' + error);
                        reject('Error occured sending command : ' + error);
                    } else {
                        sails.log.info('Command sent:' + command);
                        resolve(value);
                    }
                });
            }
        };

        var serviceDiscovered = function(peripheral, services, command) {
            if(!services || services.length === 0){
                sails.log.error('No service found for ' + peripheral.address);
                peripheral.disconnect();
                reject('No service found for ' + peripheral.address);
            } else {
                services[0].discoverCharacteristics('[fff1]', (error, characteristics) => {
                    characteristicsDiscovered(peripheral, services[0], characteristics, command);
                });
            }
        };

        var peripheralConnected = function(peripheral, error, command) {
            if (error) {
                sails.log.error('Error connecting ' + peripheral.address + ' : ' + error);
                peripheral.disconnect();
                reject('Error connecting ' + peripheral.address + ' : ' + error);
            } else {
                sails.log.info('Peripheral ' + peripheral.address + ' found and connected');

                peripheral.discoverServices('[fff0]', (error, services) => {
                    serviceDiscovered(peripheral, services, command);
                });
            }
        };

        noble.on('discover', function (peripheral) {
            sails.log.info('Peripheral discovered : ' + peripheral.address);
            if (peripheral.address === macAddr) {
                noble.stopScanning();
                clearTimeout(shared.scanTimer);

                peripheral.connect((error) => {
                    peripheralConnected(peripheral, error, command);
                });
            }
        });

        if (!shared.scanning) {
            noble.startScanning();
        }

        if (shared.scanTimeout) {
            clearTimeout(shared.scanTimer);
        }

        shared.scanTimer = setTimeout(stop, shared.scanTimeout);
    });
};
