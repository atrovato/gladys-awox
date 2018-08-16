const awoxSend = require('../lib/bluetooth.send.js');
const chai = require('chai');
const assert = chai.assert;

describe('Sending bluetooth packets', function() {

    var peripheral;
    var characteristic;
    var throwError;
    var command;

    beforeEach(function() {
        throwError = false;
        command = 'CommandToSend';

        peripheral = {
            connected: true,
            disconnect: function() {
                this.connected = false;
            }
        };

        characteristic = {
            sent: false,
            write: function(data, withoutResponse, callback) {
                var expectedCommand = new Buffer(command);
                assert.deepEqual(data, expectedCommand, 'Invalid command');
                assert.isNotOk(withoutResponse, 'No response expected');
                this.sent = true;

                if (throwError) {
                    callback('Error');
                } else {
                    callback();
                }
            }
        };
    });

    it('Send packet with success', function (done) {
        throwError = false;

        awoxSend(peripheral, [ characteristic ], command).then((result) => {
            assert.deepEqual(result, command, 'Not expected result');
            assert.isOk(characteristic.sent, 'Discovered tag should be true');
            assert.isNotOk(peripheral.connected, 'Peripheral should be disconnected');
            done();
        }).catch((result) => {
            done('Should not have fail : ' + result);
        });
    });

    it('Send packet with error', function (done) {
        throwError = true;

        awoxSend(peripheral, [ characteristic ], command).then((result) => {
            done('Should have fail');
        }).catch((result) => {
            assert.isOk(characteristic.sent, 'Discovered tag should be true');
            assert.isNotOk(peripheral.connected, 'Peripheral should be disconnected');
            done();
        });
    });

    it('Send packet without characteristics (undefined)', function (done) {
        awoxSend(peripheral, undefined, command).then((result) => {
            done('Should have fail');
        }).catch((result) => {
            assert.isNotOk(peripheral.connected, 'Peripheral should be disconnected');
            done();
        });
    });

    it('Send packet without characteristics (null)', function (done) {
        awoxSend(peripheral, null, command).then((result) => {
            done('Should have fail');
        }).catch((result) => {
            assert.isNotOk(peripheral.connected, 'Peripheral should be disconnected');
            done();
        });
    });

    it('Send packet without characteristics (empty)', function (done) {
        awoxSend(peripheral, [], command).then((result) => {
            done('Should have fail');
        }).catch((result) => {
            assert.isNotOk(peripheral.connected, 'Peripheral should be disconnected');
            done();
        });
    });
});