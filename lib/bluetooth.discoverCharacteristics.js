/**
 * Based on Noble nodejs library.
 * Uses Noble peripherals, services, characteristics to communicate with BLE devices.
 */
module.exports = function(peripheral, services) {
    return new Promise((resolve, reject) => {
        if(!services || services.length === 0){
            console.error('No service found for ' + peripheral.address);
            peripheral.disconnect();
            reject('No service found for ' + peripheral.address);
        } else {
            services[0].discoverCharacteristics('[fff1]', (error, characteristics) => {
                if (error) {
                    reject(error);
                } else {
                    resolve([ peripheral, characteristics ]);
                }
            });
        }
    });
};
