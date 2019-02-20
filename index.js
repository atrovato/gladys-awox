const noble = require('noble');
const shared = require('./lib/shared.js');
const exec = require('./lib/exec.js');
const install = require('./lib/install.js');
const AwoxController = require('./controller/AwoxController.js');
const AwoxControllerUtils = require('./controller/AwoxControllerUtils.js');

module.exports = function (sails) {
  gladys.on('ready', function () {
    noble.on('stateChange', function (state) {
      if (state === 'poweredOn') {
        shared.bluetoothOn = true;
        sails.log.info('AwoX module: Bluetooth device available');

      } else if (state === 'poweredOff') {
        shared.bluetoothOn = false;
        shared.scanning = false;
        if (shared.scanTimer) {
          shared.scanTimer.unref();
        }
        sails.log.warn('AwoX module: Bluetooth device not available');
        noble.stopScanning();
      }
      gladys.socket.emit('awoxStatus', AwoxControllerUtils.generateStatus());
    });
  });

  return {
    exec: exec,
    routes: {
      before: {
        'post /awox/scan': (req, res, next) => sails.hooks.policies.middleware.checktoken(req, res, next),
        'get /awox/setup': (req, res, next) => sails.hooks.policies.middleware.checktoken(req, res, next),
        'post /awox/create': (req, res, next) => sails.hooks.policies.middleware.checktoken(req, res, next),
        'get /awox/remotes': (req, res, next) => sails.hooks.policies.middleware.checktoken(req, res, next)
      },
      after: {
        'post /awox/scan': AwoxController.scan,
        'get /awox/setup': AwoxController.setup,
        'post /awox/create': AwoxController.createMeshDevice,
        'get /awox/remotes': AwoxController.getRemotes
      }
    }
  };
};
