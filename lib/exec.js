const noble = require('noble');
const shared = require('./shared.js');
const scanner = require('./scanner.js');

module.exports = exec;

function exec(deviceInfo) {
    return new Promise((resolve, reject) => {
        var macAddr = deviceInfo.deviceType.identifier;
        var type = deviceInfo.deviceType.type;
        var value = deviceInfo.state.value;
        var command;

        sails.log.info('Prepare command for Awox ' + macAddr + ' (' + type + '=' + value +')');

        var checksum = function(data, maxPos) {
            return ((data.slice(1, maxPos).reduce(function(a, b) { return (a + b); }) + 85) & 0xFF);
        }

        if (type === 'binary') {
            if (value === 1) {
                command = shared.commands.on;
            } else if (value === 0) {
                command = shared.commands.off;
            }
        } else if (type === 'brightness') {
            command = shared.commands.brightness;
            
            var realValue = Math.round((value * (shared.values.brightness.real.max - shared.values.brightness.real.min) / shared.values.brightness.display.max) + shared.values.brightness.real.min);
            // value
            command[8] = Math.floor(realValue / 256);
            command[9] = realValue % 256;
            // checksum
            command[10] = checksum(command, 10);
        } else if (type === 'color') {
            command = shared.commands.color;
            // RGB values
            command[9] = Math.floor(value / 65536) % 256;
            command[10] = Math.floor(value / 256) % 256;
            command[11] = value % 256;
            // random
            command[14] = Math.floor(Math.random() * 0xFF) >>> 0;
            // checksum
            command[15] = checksum(command, 15);
        } else if (type === 'manual') {
            command = value;
        } else {
            reject('Unknown command');
        }

        sails.log.info('Built command for Awox ' + macAddr + ' (' + command +')');

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

        if (shared.peripherals[macAddr]) {
            var peripheral = shared.peripherals[macAddr];
            
            if (peripheral.state.startsWith('connect')) {
                setTimeout(exec, shared.scanTimeout)
            } else {
                peripheral.connect((error) => {
                    peripheralConnected(peripheral, error, command);
                });
            }
        } else {
            reject('Peripheral ' + macAddr + ' not stored')
        }
    });
};
