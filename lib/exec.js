const noble = require('noble');
const shared = require('./shared.js');
const awoxConnect = require('./bluetooth.connect.js');
const awoxDiscoverServices = require('./bluetooth.discoverServices.js');
const awoxDiscoverCharacteristics = require('./bluetooth.discoverCharacteristics.js');
const awoxSend = require('./bluetooth.send.js');

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

        if (shared.peripherals[macAddr]) {
            var peripheral = shared.peripherals[macAddr];

            if (peripheral.state.startsWith('connect')) {
                setTimeout(exec, shared.scanTimeout)
            } else {
                return awoxConnect(peripheral).then((peripheral) => {
                    return awoxDiscoverServices(peripheral);
                }).then((response) => {
                    return awoxDiscoverCharacteristics(response[0], response[1]);
                }).then((response) => {
                    return awoxSend(response[0], response[1], command);
                }).then((command) => {
                    sails.log.info('Awox command well done');
                    resolve(value);
                });
            }
        } else {
            reject('Peripheral ' + macAddr + ' not stored')
        }
    });
};
