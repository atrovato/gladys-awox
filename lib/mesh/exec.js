const awoxSend = require('../bluetooth/send.js');
const generateCommand = require('./generateCommand.js');
const meshShared = require('./shared.js');
const meshAuthenticate = require('./authenticate.js');
const meshUtils = require('./commandUtils.js');

module.exports = {
  scan: {
    serviceUUIDs: [meshShared.services.exec],
    characteristicUUIDs: [meshShared.characteristics.pair, meshShared.characteristics.status, meshShared.characteristics.command]
  },
  exec: function (peripheral, characteristics, type, value) {
    const paramAddress = peripheral.address.replace(/:/gi, '_');
    return gladys.param.getValue('AWOX_USER_' + paramAddress).then((user) => {
      return gladys.param.getValue('AWOX_PASS_' + paramAddress).then((password) => {
        return meshAuthenticate(peripheral, characteristics, user, password).then((sessionKey) => {
          return generateCommand(type, value).then((command) => {
            return meshUtils.generateCommandPacket(sessionKey, peripheral.address, command.key, command.data);
          });
        }).then((command) => {
          return awoxSend(peripheral, characteristics.get(meshShared.characteristics.command), command);
        });
      });
    });
  }
};
