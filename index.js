const noble = require('noble');

module.exports = function(sails) {
    var shared = require('./lib/shared.js');
    var exec = require('./lib/exec.js');
    var lightOn = require('./lib/lightOn.js');
    var lightOff = require('./lib/lightOff.js');
    var install = require('./lib/install.js');

    function characteristicsDiscovered(peripheral, service, characteristics, command) {
        if(!characteristics || characteristics.length === 0){
            sails.log.error('No characteristics found for ' + peripheral.address);
            peripheral.disconnect();
        } else {
            characteristics[0].write(new Buffer(command), false, (error) => {
                if(error) {
                    sails.log.error('Error occured sending command : ' + error);
                } else {
                    sails.log.info('Command sent:' + command);
                }

                peripheral.disconnect();
            });
        }
    }

    function serviceDiscovered(peripheral, services, command) {
        if(!services || services.length === 0){
            sails.log.error('No service found for ' + peripheral.address);
            peripheral.disconnect();
        } else {
            services[0].discoverCharacteristics('[fff1]', (error, characteristics) => {
                characteristicsDiscovered(peripheral, services[0], characteristics, command);
            });
        }
    }

    function peripheralConnected(peripheral, error, command) {
        if (error) {
            sails.log.error('Error connecting ' + peripheral.address + ' : ' + error);
            peripheral.disconnect();
        } else {
            sails.log.info('Peripheral ' + peripheral.address + ' found and connected');

            peripheral.discoverServices('[fff0]', (error, services) => {
                serviceDiscovered(peripheral, services, command);
            });
        }
    }

    function peripheralDiscovered(peripheral, command) {
        peripheral.connect((error) => {
            peripheralConnected(peripheral, error, command);
        });
    }

    gladys.on('ready', function() {
        noble.on('scanStart', function () {
            console.log('Awox scan started');
            shared.scanning = true;
        });

        noble.on('scanStop', function () {
            console.log('Awox scan stopped');
            shared.scanning = false;
            shared.scanTimer = null;
            noble.removeAllListeners('discover');
        });
    });

    return {
        lightOn: lightOn,
        lightOff: lightOff,
        exec: exec
    };
};