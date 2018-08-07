const awoxDiscoverServices = require('./awox.discoverServices.js');

/**
 * Based on Noble nodejs library.
 * Uses Noble peripherals, services, characteristics to communicate with BLE devices.
 */
module.exports = function(peripheral) {
    return new Promise((resolve, reject) => {
        peripheral.connect((error) => {
            if (error) {
                reject(error);
            } else {
        