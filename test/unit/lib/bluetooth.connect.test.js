const awoxConnect = require('../../../lib/bluetooth.connect.js');
const chai = require('chai');
const assert = chai.assert;

describe('Connect bluetooth peripherals', function() {

    var peripheral;
    var throwError;

    beforeEach(function() {
        throwError = false;

        peripheral = {
            connected: false,
            connect: function(callback) {
                this.connected = true;

                if (throwError) {
                    callback('Error');
                } else {
                    callback();
                }
            }
        };
    });

    it('Connect to peripheral with success', function (done) {
        throwError = false;

        awoxConnect(peripheral).then((result) => {
            assert.strictEqual(result, peripheral, 'Expected peripheral should same as input');
            assert.isOk(peripheral.connected, 'Connected tag should be true');
            done();
        }).catch((result) => {
            done('Should not have fail : ' + result);
        });
    });

    it('Connect to peripheral with error', function (done) {
        throwError = true;

        awoxConnect(peripheral).then((result) => {
            done('Should have fail');
        }).catch((result) => {
            assert.isOk(peripheral.connected, 'Connected tag should be true');
            done();
        });
    });
});