const awoxSend = require('../bluetooth/send.js');
const generateCommand = require('./generateCommand.js');
const meshShared = require('./shared.js');
const meshAuthenticate = require('./authenticate.js');

module.exports = {
  scan: {
    serviceUUIDs: [meshShared.services.exec],
    characteristicUUIDs: [meshShared.characteristics.pair, meshShared.characteristics.status, meshShared.characteristics.command]
  },
  exec: function (peripheral, characteristics, type, value) {
    return meshAuthenticate(peripheral, characteristics, 'R-64F5A4', '1234').then((sessionKey) => {
      return generateCommand(peripheral, sessionKey, type, value);
    }).then((command) => {
      return awoxSend(peripheral, characteristics.get(meshShared.characteristics.command), command);
    });
  }
};
