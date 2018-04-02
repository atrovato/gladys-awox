const noble = require('noble');
const shared = require('./shared.js');
const scanner = require('./scanner.js');

module.exports = function() {
    sails.log.info('Setup Awox devices');

    var managePeripheral = function (peripheral) {
        return new Promise((resolve, reject) => {
            sails.log.debug('Looking for ' + peripheral.address + ' capabilities...')

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

                    gladys.device.create({
                        device: device,
                        types: types
                    }).then(function() {
                        sails.log.info('Device ' + device.name + ' created');
                        shared.peripherals[device.identifier] = peripheral;
                        resolve(device);
                    }).catch(function(error) {
                        reject('Device ' + device.name + ' not created : ' + error);
                    });
                } else {
                    reject('Device ' + device.name + ' not recognized as Awox Light');
                }
            }
        });
    };

    var peripheralDiscovered = function (peripheral) {
        sails.log.info('Detected peripheral ' + peripheral.address);
        shared.tmpPeripherals.push(peripheral);
    };

    var scanStopped = function(resolve, reject) {
        shared.tmpPeripherals.reduce((promiseChain, currentTask) =>  {
                return promiseChain.then(function() {
                    return managePeripheral(currentTask);
                }).catch(function(error) {
                    sails.log.warn(error);
                    return managePeripheral(currentTask);
                });
            }, new Promise((resolve, reject) => {
                sails.log.info('Starting Awox device configuration...');
                resolve();
            })
        ).then(function() {
            sails.log.info('Awox configuration done');
            resolve('Awox scan timeout');
        }).catch(function() {
            sails.log.info('Awox configuration done');
            resolve('Awox scan timeout');
        });
    };

    var nobleSteps = {
        peripheralDiscovered: peripheralDiscovered,
        scanStopped: scanStopped
    };

    return scanner(nobleSteps);
};
