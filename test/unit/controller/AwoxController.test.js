const chai = require('chai');
const assert = chai.assert;
const Promise = require('bluebird');
const proxyquire = require('proxyquire');

let checkInstall = false;
let installResult = undefined;
let checkDetermineCredentials = false;
let expectedCredentialsObj = undefined;
let checkPair = false;
let expectedPair = undefined;

const mockInstall = function () {
  checkInstall = true;
  if (installResult) {
    return Promise.resolve(installResult);
  } else {
    return Promise.reject('Install fail');
  }
};

const mockDetermineCredentials = function (device, remoteInfo, auth) {
  checkDetermineCredentials = true;
  const argObj = {
    device: device,
    remoteInfo: remoteInfo,
    auth: auth,
    key: '0100'
  };
  assert.deepEqual(argObj, expectedCredentialsObj, 'Invalid credential arguments');
  return Promise.resolve(expectedCredentialsObj);
};

const mockPair = function (device, remoteInfo, name, pass) {
  checkPair = true;
  const argObj = {
    device: device,
    remoteInfo: remoteInfo,
    auth: { name: name, pass: pass }
  };
  assert.deepEqual(argObj, expectedPair, 'Invalid credential arguments');
  return Promise.resolve(expectedPair);
};

const AwoxController = proxyquire('../../../controller/AwoxController.js', {
  '../lib/install.js': mockInstall,
  '../lib/mesh/determineCredentials.js': mockDetermineCredentials,
  '../lib/mesh/pair.js': mockPair
});

describe('AwoX GUI controller', function () {

  let checkGetByService = false;
  let gladysDevices = [];

  
  beforeEach(() => {
    checkGetByService = false;
    installResult = undefined;
    checkDetermineCredentials = false;
    expectedCredentialsObj = undefined;
    checkPair = false;
    expectedPair = undefined;
    checkInstall = false;

    gladysDevices = [
      {
        device: 'expected',
        protocol: 'bluetooth-remote'
      },
      {
        device: 'not-expected',
        protocol: 'bluetooth-mesh'
      },
      {
        device: 'expected',
        protocol: 'bluetooth-remote'
      },
      {
        device: 'not-expected',
        protocol: 'bluetooth'
      },
      {
        device: 'expected',
        protocol: 'bluetooth-remote'
      }
    ];

    gladys = {
      device: {
        getByService: () => {
          checkGetByService = true;
          return Promise.resolve(gladysDevices);
        },
        create: () => {
          return Promise.resolve('Device created');
        }
      },
      module: {
        get: () => {
          return Promise.resolve([{ slug: 'notAwox', id: 456 }, { slug: 'awox', id: 123 }]);
        }
      }
    };
  });

  it('Test GET remote', (done) => {
    const req = undefined;
    const res = {
      json: function (remotes) {
        assert.isOk(checkGetByService, 'Should have call checkGetByService');
        assert.equal(remotes.length, 3, 'Not expected remote size');
        remotes.forEach(remote => {
          assert.equal(remote.device, 'expected', 'Not expected remote device');
          assert.equal(remote.protocol, 'bluetooth-remote', 'Not expected remote protocol');
        });

        assert.isNotOk(checkInstall, 'Should not be passed by install');
        assert.isNotOk(checkPair, 'Should not be passed by pair');
        assert.isNotOk(checkDetermineCredentials, 'Should not be passed by DetermineCredentials');
        done();
      }
    };
    const next = undefined;

    AwoxController.getRemotes(req, res, next);
  });

  it('Test start scan', (done) => {
    installResult = 'Success';
    let nbCall = 0;

    gladys.socket = {
      emit: (event, data) => {
        nbCall++;

        assert.isNotOk(checkDetermineCredentials, 'Should not be passed by DetermineCredentials');
        assert.isNotOk(checkPair, 'Should not be passed by pair');
        assert.isOk(checkInstall, 'Should be passed by install');
        switch (nbCall) {
        case 1:
          assert.equal(event, 'awoxDiscover', 'Invalid event emitted');
          assert.equal(data, installResult, 'Invalid data emitted');
          break;
        case 2:
          assert.equal(event, 'awoxStatus', 'Invalid event emitted');
          assert.deepEqual(data, { install: false, pairing: false, bluetoothOn: false, scanning: false }, 'Invalid data emitted');
          done();
          break;
        }
      }
    };

    const req = undefined;
    const res = {
      json: function (remotes) {
        assert.isNotOk(checkGetByService, 'Should not have call checkGetByService');
      }
    };
    const next = undefined;

    AwoxController.scan(req, res, next);
  });

  it('Test scan failed', (done) => {
    let nbCall = 0;

    gladys.socket = {
      emit: (event, data) => {
        nbCall++;

        assert.isNotOk(checkDetermineCredentials, 'Should not be passed by DetermineCredentials');
        assert.isNotOk(checkPair, 'Should not be passed by pair');
        assert.isOk(checkInstall, 'Should be passed by install');
        switch (nbCall) {
        case 1:
          assert.equal(event, 'awoxError', 'Invalid event emitted');
          assert.equal(data, 'Install fail', 'Invalid data emitted');
          break;
        case 2:
          assert.equal(event, 'awoxStatus', 'Invalid event emitted');
          assert.deepEqual(data, { install: false, pairing: false, bluetoothOn: false, scanning: false }, 'Invalid data emitted');
          done();
          break;
        }
      }
    };

    const req = undefined;
    const res = {
      json: function (data) {
        assert.isNotOk(checkGetByService, 'Should not have call checkGetByService');
        assert.isNotOk(checkDetermineCredentials, 'Should not be passed by DetermineCredentials');
        assert.deepEqual(data, { install: true, pairing: false, bluetoothOn: false, scanning: false }, 'Invalid status');
      }
    };
    const next = undefined;

    AwoxController.scan(req, res, next);
  });

  it('Test setup', (done) => {
    const req = undefined;
    const res = {
      json: function (data) {
        assert.isNotOk(checkPair, 'Should not be passed by pair');
        assert.isNotOk(checkGetByService, 'Should not have call checkGetByService');
        assert.isNotOk(checkDetermineCredentials, 'Should not be passed by DetermineCredentials');
        assert.deepEqual(data, { install: false, pairing: false, bluetoothOn: false, scanning: false }, 'Invalid status');
        done();
      }
    };
    const next = undefined;

    AwoxController.setup(req, res, next);
  });

  it('Test createMeshDevice not linked to remote not user/pass', (done) => {
    expectedCredentialsObj = {
      device: { identifier: '11:22:33' },
      remoteInfo: { remoteId: undefined },
      auth: { pass: '', name: '' },
      key: '0100'
    };
    expectedPair = {
      device: '11:22:33',
      remoteInfo: { remoteId: undefined, credentials: expectedCredentialsObj },
      auth: { pass: '', name: '' }
    };

    const req = {
      body: {
        device: {
          identifier: '11:22:33'
        }
      }
    };

    let nbParam = 0;
    let nbCall = 0;
    gladys.socket = {
      emit: (event, data) => {
        nbCall++;

        switch (nbCall) {
        case 1:
          assert.equal(event, 'awoxPair', 'Invalid event emitted');
          assert.equal(data, req.body, 'Invalid data emitted');
          break;
        case 2:
          assert.isNotOk(checkInstall, 'Should not be passed by install');
          assert.isOk(checkDetermineCredentials, 'Should be passed by DetermineCredentials');
          assert.isOk(checkPair, 'Should be passed by pair');
          assert.equal(nbParam, 3, 'Not right param number');
          assert.equal(event, 'awoxStatus', 'Invalid event emitted');
          assert.deepEqual(data, { install: false, pairing: false, bluetoothOn: false, scanning: false }, 'Invalid data emitted');
          done();
          break;
        }
      }
    };

    gladys.param = {
      setValue: (param) => {
        nbParam++;
        let expectedParam;

        switch (nbParam) {
        case 1:
          expectedParam = {
            name: 'AWOX_USER_11_22_33',
            value: '',
            module: 123,
            description: 'AwoX Mesh user'
          };
          assert.deepEqual(param, expectedParam, 'Invalid USER param');
          break;
        case 2:
          expectedParam = {
            name: 'AWOX_PASS_11_22_33',
            value: '',
            module: 123,
            description: 'AwoX Mesh password'
          };
          assert.deepEqual(param, expectedParam, 'Invalid PASS param');
          break;
        case 3:
          expectedParam = {
            name: 'AWOX_KEY_11_22_33',
            value: '0100',
            module: 123,
            description: 'AwoX Mesh key'
          };
          assert.deepEqual(param, expectedParam, 'Invalid KEY param');
          break;
        }

        return Promise.resolve(param);
      }
    };

    const res = {
      json: function (data) {
        assert.deepEqual(data, { install: false, pairing: true, bluetoothOn: false, scanning: false }, 'Invalid status');
      }
    };
    const next = undefined;

    AwoxController.createMeshDevice(req, res, next);
  });

  it('Test createMeshDevice not linked to remote', (done) => {
    expectedCredentialsObj = {
      device: { identifier: '11:22:33' },
      remoteInfo: { remoteId: undefined },
      auth: { name: 'name', pass: 'pass' },
      key: '0100'
    };
    expectedPair = {
      device: '11:22:33',
      remoteInfo: { remoteId: undefined, credentials: expectedCredentialsObj },
      auth: { name: 'name', pass: 'pass' }
    };

    const req = {
      body: {
        device: {
          identifier: '11:22:33'
        },
        auth: {
          name: 'name',
          pass: 'pass'
        }
      }
    };

    let nbParam = 0;
    let nbCall = 0;
    gladys.socket = {
      emit: (event, data) => {
        nbCall++;

        switch (nbCall) {
        case 1:
          assert.equal(event, 'awoxPair', 'Invalid event emitted');
          assert.equal(data, req.body, 'Invalid data emitted');
          break;
        case 2:
          assert.isNotOk(checkInstall, 'Should not be passed by install');
          assert.isOk(checkDetermineCredentials, 'Should be passed by DetermineCredentials');
          assert.isOk(checkPair, 'Should be passed by pair');
          assert.equal(nbParam, 3, 'Not right param number');
          assert.equal(event, 'awoxStatus', 'Invalid event emitted');
          assert.deepEqual(data, { install: false, pairing: false, bluetoothOn: false, scanning: false }, 'Invalid data emitted');
          done();
          break;
        }
      }
    };

    gladys.param = {
      setValue: (param) => {
        nbParam++;
        let expectedParam;

        switch (nbParam) {
        case 1:
          expectedParam = {
            name: 'AWOX_USER_11_22_33',
            value: 'name',
            module: 123,
            description: 'AwoX Mesh user'
          };
          assert.deepEqual(param, expectedParam, 'Invalid USER param');
          break;
        case 2:
          expectedParam = {
            name: 'AWOX_PASS_11_22_33',
            value: 'pass',
            module: 123,
            description: 'AwoX Mesh password'
          };
          assert.deepEqual(param, expectedParam, 'Invalid PASS param');
          break;
        case 3:
          expectedParam = {
            name: 'AWOX_KEY_11_22_33',
            value: '0100',
            module: 123,
            description: 'AwoX Mesh key'
          };
          assert.deepEqual(param, expectedParam, 'Invalid KEY param');
          break;
        }

        return Promise.resolve(param);
      }
    };

    const res = {
      json: function (data) {
        assert.deepEqual(data, { install: false, pairing: true, bluetoothOn: false, scanning: false }, 'Invalid status');
      }
    };
    const next = undefined;

    AwoxController.createMeshDevice(req, res, next);
  });

  it('Test createMeshDevice failed', (done) => {
    expectedCredentialsObj = {
      device: { identifier: '11:22:33' },
      remoteInfo: { remoteId: undefined },
      auth: { name: 'name', pass: 'pass' },
      key: '0100'
    };
    expectedPair = {
      device: '11:22:33',
      remoteInfo: { remoteId: undefined, credentials: expectedCredentialsObj },
      auth: { name: 'name', pass: 'pass' }
    };

    const req = {
      body: {
        device: {
          identifier: '11:22:33'
        },
        auth: {
          name: 'name',
          pass: 'pass'
        }
      }
    };

    let nbCall = 0;
    gladys.socket = {
      emit: (event, data) => {
        nbCall++;

        switch (nbCall) {
        case 1:
          assert.equal(event, 'awoxError', 'Invalid event emitted');
          assert.equal(data, 'Error', 'Invalid data emitted');
          break;
        case 2:
          assert.isNotOk(checkInstall, 'Should not be passed by install');
          assert.isOk(checkDetermineCredentials, 'Should be passed by DetermineCredentials');
          assert.isOk(checkPair, 'Should be passed by pair');
          assert.equal(event, 'awoxStatus', 'Invalid event emitted');
          assert.deepEqual(data, { install: false, pairing: false, bluetoothOn: false, scanning: false }, 'Invalid data emitted');
          done();
          break;
        }
      }
    };

    gladys.param = {
      setValue: (param) => {
        return Promise.reject('Error');
      }
    };

    const res = {
      json: function (data) {
        assert.deepEqual(data, { install: false, pairing: true, bluetoothOn: false, scanning: false }, 'Invalid status');
      }
    };
    const next = undefined;

    AwoxController.createMeshDevice(req, res, next);
  });
});