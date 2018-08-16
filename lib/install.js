const shared = require('./shared.js');
const awoxScan = require('./bluetooth.scan.js');

module.exports = function() {
    sails.log.info('Setup Awox devices');

    var managePeripheral = function (peripheral) {
        return new Promise((resolve, reject) => {
            sails.log.debug('Looking for ' + peripheral.address + ' capabilities...');

            if (!peripheral.advertisement.localName) {
                reject('Peripheral ' + peripheral.address + ' have no name');
            } else {
                var device = {
                    name: peripheral.advertisement.localName,
                    protocol: 'bluetooth',
                    service: 'awox',
                    identifier: peripheral.address
                };

                var types = [{
                    type : 'binary',
                    name : 'switch',
                    identifier : 'binary',
                    sensor : false,
                    category : 'light',
                    min : 0,
                    max : 1
                }];

                if (device.name.startsWith('SML')) {
                    types.push({
                        type : 'brightness',
                        name : 'luminosity',
                        identifier : 'brightness',
                        sensor : false,
                        category : 'light',
                        min : shared.values.brightness.display.min,
                        max : shared.values.brightness.display.max,
                        unit : shared.values.brightness.display.unit
                    });

                    if (device.name.startsWith('SML-c')) {
                        types.push({
                            type : 'color',
                            name : 'color',
                            identifier : 'color',
                            sensor : false,
                            category : 'light',
                            min : shared.values.color.min,
                            max : shared.values.color.max
                        });
                    }

                    sails.log.debug('Creating gladys device with ' + peripheral.address);
                    return gladys.device.create({
                        device: device,
                        types: types
                    }).then((result) => { 
                        resolve(result);
                    }).catch((result) => { 
                        resolve(result);
                    });
                } else {
                    reject('Device ' + device.name + ' not recognized as Awox Light');
                }
            }
        });
    };

    return awoxScan().then((peripherals) => {
        console.log('Starting ' + peripherals.length + ' Awox device(s) configuration...');

        var queue = Promise.resolve();
        peripherals.forEach(function(value) {
            queue.then((result) => {
                return managePeripheral(value);
            }).catch((error) => { 
                sails.log.warn(error);
                return managePeripheral(value)
            });
        });

        return queue.then((result) => {
            console.log('Awox configuration done');
            return Promise.resolve();
        });
    });
};
