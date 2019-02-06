const Promise = require('bluebird');

module.exports = function (type, value) {
  var commandKey;
  var commandData;

  switch (type) {
  case 'switch':
    commandKey = 0xd0;
    if (value === 1) {
      commandData = [0x01];
    } else if (value === 0) {
      commandData = [0x00];
    } else {
      return Promise.reject('Unknown command');
    }
    break;
  case 'reset':
    commandKey = 0xe3;
    commandData = [0x00];
    break;
  case 'color':
    commandKey = 0xe2;
    commandData = [0x04];
    commandData.push(Math.floor(value / 65536) % 256);
    commandData.push(Math.floor(value / 256) % 256);
    commandData.push(value % 256);
    break;
  case 'brightness':
    commandKey = 0xf2;
    commandData = [value];
    break;
  case 'preset':
    commandKey = 0xc8;
    commandData = [value];
    break;
  default:
    return Promise.reject('AwoX module: Unknown command');
  }

  return Promise.resolve({ key: commandKey, data: commandData });
};