const meshUtils = require('./commandUtils.js');
const Promise = require('bluebird');

module.exports = function (peripheral, sessionKey, data, deviceInfo) {
  return meshUtils.decryptPacket(Buffer.from(sessionKey), peripheral.address, data).then((packet) => {
    return meshUtils.decodePacket(packet);
  }).then((deviceStates) => {
    const device = {
      id: deviceInfo.deviceType.device
    };
    return gladys.deviceType.getByDevice(device).then((deviceTypes) => {
      const currentDeviceType = deviceInfo.deviceType.id;
      return Promise.map(deviceTypes, deviceType => {
        if (currentDeviceType != deviceType.id
          && deviceStates[deviceType.identifier]
          && deviceStates[deviceType.identifier] != deviceType.lastValue) {
            
          const deviceState = { devicetype: deviceType.id, value: deviceStates[deviceType.identifier] };
          return gladys.deviceState.create(deviceState);
        } else {
          return Promise.resolve();
        }
      });
    });
  }).catch((e) => {
    console.error('AwoX module: state feeback error:', e);
  });
};
