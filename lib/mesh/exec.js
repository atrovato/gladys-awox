const awoxSend = require('../bluetooth/send.js');
const generateCommand = require('./generateCommand.js');
const meshShared = require('./shared.js');
const meshAuthenticate = require('./authenticate.js');
const meshUtils = require('./commandUtils.js');
const meshFeedback = require('./stateFeedback.js');
const Promise = require('bluebird');

module.exports = {
  scan: {
    serviceUUIDs: [meshShared.services.exec],
    characteristicUUIDs: [meshShared.characteristics.pair, meshShared.characteristics.status, meshShared.characteristics.command]
  },
  exec: function (peripheral, characteristics, type, value, deviceInfo) {
    const paramAddress = peripheral.address.replace(/:/gi, '_');
    return Promise.resolve(peripheral.meshSessionKey).then((sessionKey) => {
      if (!sessionKey) {
        return gladys.param.getValue('AWOX_USER_' + paramAddress).then((user) => {
          return gladys.param.getValue('AWOX_PASS_' + paramAddress).then((password) => {
            return meshAuthenticate(peripheral, characteristics, user, password);
          });
        });
      } else {
        return Promise.resolve(sessionKey);
      }
    }).then((sessionKey) => {
      peripheral.meshSessionKey = sessionKey;
      return generateCommand(type, value).then((command) => {
        return meshUtils.generateCommandPacket(sessionKey, peripheral.address, command.key, command.data);
      }).then((command) => {
        if (characteristics.get(meshShared.characteristics.status)) {
          characteristics.get(meshShared.characteristics.status).on('data', function (data) {
            return meshFeedback(peripheral, sessionKey, data, deviceInfo);
          });
        }

        return awoxSend(peripheral, characteristics.get(meshShared.characteristics.command), command, false);
      });
    }).then(() => {
      switch (type) {
      case 'reset':
        return gladys.param.delete({ name: 'AWOX_USER_' + paramAddress }).then(() => {
          return gladys.param.delete({ name: 'AWOX_PASS_' + paramAddress });
        }).then(() => {
          return gladys.param.delete({ name: 'AWOX_KEY_' + paramAddress });
        });
      default:
        return Promise.resolve(type);
      }
    });
  }
};
