const shared = require('./shared.js');

module.exports = function (macAddr, type, value) {
  return new Promise((resolve, reject) => {
    console.log('AwoX module: Prepare command for Awox ' + macAddr + ' (' + type + '=' + value + ')');
    var command;

    if (type === 'switch') {
      if (value === 1) {
        command = shared.commands.on;
      } else if (value === 0) {
        command = shared.commands.off;
      } else {
        return reject('AwoX module: Unknown command');
      }
    } else if (type === 'brightness') {
      command = shared.commands.brightness;

      var realValue = Math.round((value * (shared.values.brightness.real.max - shared.values.brightness.real.min) / shared.values.brightness.display.max) + shared.values.brightness.real.min);
      // value
      command[8] = Math.floor(realValue / 256);
      command[9] = realValue % 256;
      // checksum
      command[10] = checksum(command, 10);
    } else if (type === 'color') {
      command = shared.commands.color;
      // RGB values
      command[9] = Math.floor(value / 65536) % 256;
      command[10] = Math.floor(value / 256) % 256;
      command[11] = value % 256;
      // random
      command[14] = Math.floor(Math.random() * 0xFF) >>> 0;
      // checksum
      command[15] = checksum(command, 15);
    } else if (type === 'color_reset') {
      command = shared.commands.colorReset;
      // random
      command[14] = Math.floor(Math.random() * 0xFF) >>> 0;
      // checksum
      command[15] = checksum(command, 15);
    } else if (type === 'white_reset') {
      command = shared.commands.whiteReset;
      // random
      command[14] = Math.floor(Math.random() * 0xFF) >>> 0;
      // checksum
      command[15] = checksum(command, 15);
    } else if (type === 'manual') {
      command = value;
    } else {
      return reject('AwoX module: Unknown command');
    }

    console.log('AwoX module: Built command for Awox ' + macAddr + ' (' + command + ')');
    return resolve(command);
  });
};

function checksum(data, maxPos) {
  return ((data.slice(1, maxPos).reduce(function (a, b) {
    return (a + b);
  }) + 85) & 0xFF);
};