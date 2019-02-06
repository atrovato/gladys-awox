const awoxSend = require('../bluetooth/send.js');
const generateCommand = require('./generateCommand.js');

module.exports = {
  scan: {
    serviceUUIDs: ['fff0'],
    characteristicUUIDs: ['fff1']
  },
  exec: function (peripheral, characteristics, type, value) {
    return generateCommand(peripheral.address, type, value).then((command) => {
      return awoxSend(peripheral, characteristics.get(this.scan.characteristicUUIDs[0]), command);
    });
  }
};
