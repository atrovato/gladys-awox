var awoxScan = require('../lib/bluetooth.scan.js');
var shared = require('../lib/shared.js');

describe('Scan bluetooth peripherals', function() {

    var noblieOriginal = 

    beforeEach(function() {
        nobleOriginal = require.cache[ require.resolve('noble') ].exports;
        require.cache[ require.resolve('noble') ].exports = function() {
            return {
                startScanning : function(service, duplicate, callback) {
                    callback();
                }
            };
        };

        shared.bluetoothOn = true;
    });

    afterEach(function() {
        shared.bluetoothOn = true;

        require.cache[ require.resolve('noble') ].exports = nobleOriginal;
    });

    it('Bluetooth is disabled', function (done) {
        shared.bluetoothOn = false;

        awoxScan().then((result) => {
            done('Should have fail');
        }).catch((result) => {
            done();
        });
  });
});