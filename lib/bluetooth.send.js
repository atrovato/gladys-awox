/**
 * Based on Noble nodejs library.
 * Uses Noble peripherals, services, characteristics to communicate with BLE devices.
 */
module.exports = function(peripheral, characteristics, command) {
  return new Promise((resolve, reject) => {
    if(!characteristics || characteristics.length === 0){
      console.error('No characteristics found for ' + peripheral.address);
      peripheral.disconnect();
      return reject('No characteristics found for ' + peripheral.address);
    } else {
      characteristics[0].write(new Buffer(command), false, (error) => {
        peripheral.disconnect();

        if(error) {
          console.error('Error occured sending command : ' + error);
          return reject('Error occured sending command : ' + error);
        } else {
          console.log('Command sent:' + command);
          return resolve(command);
        }
      });
    }
  });
};