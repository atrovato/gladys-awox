const Promise = require('bluebird');

const awoxSend = require('../bluetooth/send.js');
const awoxRead = require('../bluetooth/read.js');
const meshUtils = require('./commandUtils.js');
const meshShared = require('./shared.js');

module.exports = function (peripheral, characteristics, meshName, meshPassword, meshKey, session) {
  const commands = [];
  commands.push({ key: [0x04], value: meshName });
  commands.push({ key: [0x05], value: meshPassword });
  commands.push({ key: [0x06], value: meshKey });

  return Promise.each(commands, commandObj => {
    const command = Buffer.concat([Buffer.from(commandObj.key), meshUtils.encrypt(session, commandObj.value)]);
    return awoxSend(peripheral, characteristics.get(meshShared.characteristics.pair), command, true);
  }).delay(meshShared.pairDelay).then(() => {
    return awoxRead(peripheral, characteristics.get(meshShared.characteristics.pair));
  }).then((value) => {
    switch (value[0]) {
    case 0x07:
      return Promise.resolve(peripheral);
    default:
      return Promise.reject('Unable to change authentication for ' + peripheral.address);
    }
  });
};
