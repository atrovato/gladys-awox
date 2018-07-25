/**
 * Based on Noble nodejs library.
 * Uses Noble peripherals, services, characteristics to communicate with BLE devices.
 */
module.exports = function(peripheral) {
    return new Promise((resolve, reject) => {
        console.log('Peripheral ' + peripheral.address + ' found and connected');

        peripheral.discoverServices('[fff0]', (error, services) => {
            if (error) {
                reject(error);
            } else {
                resolve([ peripheral, services ]);
            }
        });
    });
};
