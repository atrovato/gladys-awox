const awoxConnect = require('../lib/bluetooth.connect.js');
const chai = require('chai');
const assert = chai.assert;

describe('Connect bluetooth peripherals', function() {

    it('Connect to peripheral with success', function (done) {
        var peripheral = {
            connected: false,
            connect: function(callback) {
                this.connected = true;
                callback();
            }
        };

        awoxConnect(peripheral).then((result) => {
            assert.strictEqual(result, peripheral, 'Expected peripheral should same as input');
            assert.isOk(peripheral.connected, 'Connected tag should be true');
            done();
        }).catch((result) => {
            done('Should not have fail : ' + result);
        });
    });

    it('Connect to peripheral with error', function (done) {
        var peripheral = {
            connected: false,
            connect: function(callback) {
                this.connected = true;
                callback('Error');
            }
        };

        awoxConnect(peripheral).then((result) => {
            done('Should have fail');
        }).catch((result) => {
            assert.isOk(peripheral.connected, 'Connected tag should be true');
            done();
        });
    });
});