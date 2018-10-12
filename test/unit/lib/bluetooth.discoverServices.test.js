const awoxDiscoverServices = require('../../../lib/bluetooth.discoverServices.js');
const chai = require('chai');
const assert = chai.assert;

describe('Discover bluetooth services', function() {

  var peripheral;
  var throwError;

  beforeEach(function() {
    throwError = false;

    peripheral = {
      discovered: false,
      discoverServices: function(service, callback) {
        assert.strictEqual(service, '[fff0]', 'Expected requested service is not valid');
        this.discovered = true;

        if (throwError) {
          callback('Error', null);
        } else {
          callback(null, 'service');
        }
      }
    };
  });

  it('Discover peripheral services with success', function (done) {
    throwError = false;

    awoxDiscoverServices(peripheral).then((result) => {
      var expectedResult = [ peripheral, 'service' ];
      assert.deepEqual(result, expectedResult, 'Not expected result');
      assert.isOk(peripheral.discovered, 'Discovered tag should be true');
      done();
    }).catch((result) => {
      done('Should not have fail : ' + result);
    });
  });

  it('Discover peripheral services with error', function (done) {
    throwError = true;

    awoxDiscoverServices(peripheral).then((result) => {
      done('Should have fail');
    }).catch((result) => {
      assert.isOk(peripheral.discovered, 'Discovered   tag should be true');
      done();
    });
  });
});