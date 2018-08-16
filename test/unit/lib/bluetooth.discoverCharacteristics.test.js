const awoxDiscoverCharacteristics = require('../../../lib/bluetooth.discoverCharacteristics.js');
const chai = require('chai');
const assert = chai.assert;

describe('Discover bluetooth characteristics', function() {

    var peripheral;
    var service;
    var throwError;

    beforeEach(function() {
        throwError = false;

        peripheral = {
            connected: true,
            disconnect: function() {
                this.connected = false;
            }
        };

        service = {
            discovered: false,
            discoverCharacteristics: function(characteristic, callback) {
                assert.strictEqual(characteristic, '[fff1]', 'Expected requested characteristic is not valid');
                this.discovered = true;

                if (throwError) {
                    callback('Error', null);
                } else {
                    callback(null, 'characteristic');
                }
            }
        };
    });

    it('Discover service characteristics with success', function (done) {
        throwError = false;

        awoxDiscoverCharacteristics(peripheral, [ service ]).then((result) => {
            var expectedResult = [ peripheral, 'characteristic' ];
            assert.deepEqual(result, expectedResult, 'Not expected result');
            assert.isOk(service.discovered, 'Discovered tag should be true');
            assert.isOk(peripheral.connected, 'Peripheral should be disconnected');
            done();
        }).catch((result) => {
            done('Should not have fail : ' + result);
        });
    });

    it('Discover service characteristics with error', function (done) {
        throwError = true;

        awoxDiscoverCharacteristics(peripheral, [ service ]).then((result) => {
            done('Should have fail');
        }).catch((result) => {
            assert.isOk(service.discovered, 'Discovered tag should be true');
            assert.isOk(peripheral.connected, 'Peripheral should be disconnected');
            done();
        });
    });

    it('Discover service characteristics without services (undefined)', function (done) {
        awoxDiscoverCharacteristics(peripheral, undefined).then((result) => {
            done('Should have fail');
        }).catch((result) => {
            assert.isNotOk(peripheral.connected, 'Peripheral should be disconnected');
            done();
        });
    });

    it('Discover service characteristics without services (null)', function (done) {
        awoxDiscoverCharacteristics(peripheral, null).then((result) => {
            done('Should have fail');
        }).catch((result) => {
            assert.isNotOk(peripheral.connected, 'Peripheral should be disconnected');
            done();
        });
    });

    it('Discover service characteristics without services (empty)', function (done) {
        awoxDiscoverCharacteristics(peripheral, []).then((result) => {
            done('Should have fail');
        }).catch((result) => {
            assert.isNotOk(peripheral.connected, 'Peripheral should be disconnected');
            done();
        });
    });
});