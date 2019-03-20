const chai = require('chai');
const assert = chai.assert;

describe('Gladys AwoX Mesh utilities', function () {

  let commandUtils;

  beforeEach(() => {
    delete require.cache[require.resolve('../../../../lib/mesh/commandUtils.js')];
    commandUtils = require('../../../../lib/mesh/commandUtils.js');
  });

  it('Generate random bytes: check random', function (done) {
    const rand41 = commandUtils.generateRandomBytes(4);
    const rand42 = commandUtils.generateRandomBytes(4);

    assert.equal(4, rand41.length, 'Incorrect expected size');
    assert.equal(4, rand42.length, 'Incorrect expected size');
    assert.deepEqual(rand42, Buffer.from(rand42.toString('hex'), 'hex'), 'Incorrect expected value');
    assert.notDeepEqual(rand41, rand42, 'Random bytes should not be the same');
    done();
  });

  it('Generate random bytes: check length', function (done) {
    const rand2 = commandUtils.generateRandomBytes(2);
    const rand8 = commandUtils.generateRandomBytes(8);

    assert.equal(2, rand2.length, 'Incorrect expected size');
    assert.equal(8, rand8.length, 'Incorrect expected size');
    done();
  });

  it('Generate pair command', function (done) {
    const defaultMeshName = 'meshName';
    const defaultMeshPassword = 'meshPassword';
    const defaultSessionRandom = [0xAA, 0xBB];

    commandUtils.encrypt = function (sessionRandom, namePassByteArray) {
      assert.equal(sessionRandom, defaultSessionRandom, 'Invalid sessionRandom argument');
      assert.deepEqual(namePassByteArray, [0x99], 'Invalid namePassByteArray');
      return [0xF1, 0xF2, 0xF3, 0xF4, 0xF5, 0xF6, 0xF7, 0xF8, 0xF9, 0xFF];
    };
    commandUtils.nameAndPasswordEncrypt = function (meshName, meshPassword) {
      assert.equal(meshName, defaultMeshName, 'Invalid first argument of nameAndPasswordEncrypt');
      assert.equal(meshPassword, defaultMeshPassword, 'Invalid second argument of nameAndPasswordEncrypt');
      return [0x99];
    };

    const result = commandUtils.generatePairCommand(defaultMeshName, defaultMeshPassword, defaultSessionRandom);
    const expected = [0x0C, 0xAA, 0xBB, 0xF1, 0xF2, 0xF3, 0xF4, 0xF5, 0xF6, 0xF7, 0xF8];
    assert.deepEqual(result, expected, 'Invalid pair command');
    done();
  });

  it('Generate session key', function (done) {
    const defaultMeshName = 'meshName';
    const defaultMeshPassword = 'meshPassword';
    const defaultSessionRandom = Buffer.from([0x9f, 0x10, 0xb9, 0xf2, 0x6c, 0xe3, 0xcd, 0xf9]);
    const defaultSessionResponse = Buffer.from([0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x10, 0x11, 0x12, 0x13, 0x14, 0x15, 0x16]);
    const sessionKey = commandUtils.generateSessionKey(defaultMeshName, defaultMeshPassword, defaultSessionRandom, defaultSessionResponse);

    const expected = [0x7b, 0x81, 0x0d, 0x63, 0xbc, 0x65, 0xd4, 0x13, 0x2a, 0xf6, 0xa2, 0x7d, 0x33, 0xa8, 0xf3, 0x87];
    assert.deepEqual(Array.from(sessionKey), expected, 'Invalid encryption');
    done();
  });

  it('Encrypt from string', function (done) {
    const key = [0x0C, 0xAA, 0xBB, 0xF1, 0xF2, 0xF3, 0xF4, 0xF5, 0xF6, 0xF7, 0xF8];
    const toBeEncrypted = '12345678';
    const encryption = commandUtils.encrypt(key, toBeEncrypted);

    const expected = [0x87, 0xce, 0x21, 0x9a, 0xfa, 0x98, 0x0f, 0xae, 0x30, 0x0d, 0xcd, 0xea, 0xf5, 0xc1, 0x23, 0xf0];
    assert.deepEqual(Array.from(encryption), expected, 'Invalid encryption');
    done();
  });

  it('Encrypt from array', function (done) {
    const key = [0x0C, 0xAA, 0xBB, 0xF1, 0xF2, 0xF3, 0xF4, 0xF5, 0xF6, 0xF7, 0xF8];
    const toBeEncrypted = [0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08];
    const encryption = commandUtils.encrypt(key, toBeEncrypted);

    const expected = [0x9f, 0x10, 0xb9, 0xf2, 0x6c, 0xe3, 0xcd, 0xf9, 0x7d, 0xfb, 0x65, 0xf4, 0xe3, 0x24, 0xe4, 0x9a];
    assert.deepEqual(Array.from(encryption), expected, 'Invalid encryption');
    done();
  });

  it('Encrypt from array 2nd try', function (done) {
    const key = [0x23, 0x84, 0xf9, 0x0f, 0x68, 0xb9, 0xed, 0x5e, 0x11, 0x99, 0x3d, 0x2a, 0xaa, 0x0f, 0xa2, 0x80];
    const toBeEncrypted = [0xa5, 0x93, 0x07, 0x6f, 0x00, 0x42, 0xe6, 0x08, 0x2c, 0xdd, 0x21, 0xe3, 0x79, 0xf8, 0x3e, 0x4b];
    const encryption = commandUtils.encrypt(key, toBeEncrypted);

    const expected = [0xd0, 0xb0, 0x87, 0x5d, 0x85, 0x51, 0x5b, 0xdc, 0xc5, 0xa4, 0x63, 0xba, 0x4d, 0xcb, 0x10, 0x7b];
    assert.deepEqual(Array.from(encryption), expected, 'Invalid encryption');
    done();
  });

  it('Encrypt from buffer', function (done) {
    const key = [0x0C, 0xAA, 0xBB, 0xF1, 0xF2, 0xF3, 0xF4, 0xF5, 0xF6, 0xF7, 0xF8];
    const toBeEncrypted = Buffer.from([0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x10, 0x11, 0x12, 0x13, 0x14, 0x15, 0x16]);
    const encryption = commandUtils.encrypt(key, toBeEncrypted);

    const expected = [0xdd, 0x4d, 0x28, 0xd5, 0x72, 0x4a, 0xc1, 0x9d, 0x69, 0x33, 0xb3, 0x93, 0xde, 0x4f, 0xf0, 0xfc];
    assert.deepEqual(Array.from(encryption), expected, 'Invalid encryption');
    done();
  });

  it('Encrypt from buffer 2nd try', function (done) {
    const key = [0x23, 0x84, 0xf9, 0x0f, 0x68, 0xb9, 0xed, 0x5e, 0x11, 0x99, 0x3d, 0x2a, 0xaa, 0x0f, 0xa2, 0x80];
    const toBeEncrypted = [0xa5, 0x93, 0x07, 0x6f, 0x00, 0x42, 0xe6, 0x08, 0x2c, 0xdd, 0x21, 0xe3, 0x79, 0xf8, 0x3e, 0x4b];
    const encryption = commandUtils.encrypt(Buffer.from(key), Buffer.from(toBeEncrypted));

    const expected = [0xd0, 0xb0, 0x87, 0x5d, 0x85, 0x51, 0x5b, 0xdc, 0xc5, 0xa4, 0x63, 0xba, 0x4d, 0xcb, 0x10, 0x7b];
    assert.deepEqual(Array.from(encryption), expected, 'Invalid encryption');
    done();
  });

  it('Encrypt from buffer 3rd try', function (done) {
    const key = [0x8d, 0x85, 0x66, 0x3c, 0x51, 0x98, 0x21, 0x87, 0x0d, 0x28, 0xb9, 0x0f, 0x43, 0x2b, 0x03, 0xf7];
    const toBeEncrypted = [0x85, 0xfd, 0x61, 0x6c, 0x78, 0xde, 0xce, 0x08, 0x52, 0x78, 0x76, 0x4c, 0xab, 0x4a, 0xd3, 0xd8];
    const encryption = commandUtils.encrypt(Buffer.from(key), Buffer.from(toBeEncrypted));

    const expected = [0xf5, 0xed, 0x1e, 0xc5, 0xa7, 0x42, 0x3b, 0x3e, 0xfc, 0x7f, 0x86, 0x5c, 0x8d, 0x92, 0x5e, 0x0b];
    assert.deepEqual(Array.from(encryption), expected, 'Invalid encryption');
    done();
  });

  it('Encrypt name and password', function (done) {
    const defaultMeshName = 'veryBigName';
    const defaultMeshPassword = 'andMorelessLongPassword';
    const nameAndPasswordEncrypted = commandUtils.nameAndPasswordEncrypt(defaultMeshName, defaultMeshPassword);

    const expected = [0x17, 0x0b, 0x16, 0x34, 0x2d, 0x1b, 0x02, 0x22, 0x04, 0x1e, 0x16, 0x00, 0x00, 0x00, 0x00, 0x00];
    assert.deepEqual(nameAndPasswordEncrypted, expected, 'Invalid nameAndPasswordEncrypted');
    done();
  });

  it('Generate command', function (done) {
    const sessionKey = [0x45, 0x96, 0xf2, 0xb9, 0xa6, 0x31, 0x52, 0x74, 0x4f, 0xae, 0x9b, 0xd, 0xe7, 0x34, 0xca, 0x48];
    const address = 'a4:c1:38:04:59:d6';
    const command = 0xd0;
    const data = [0x01];

    commandUtils.generateRandomBytes = function () {
      return Buffer.from([0xe7, 0Xc7, 0xf9]);
    };

    const commandPacket = commandUtils.generateCommandPacket(sessionKey, address, command, data);

    const expected = Buffer.from([0xe7, 0xc7, 0xf9, 0xeb, 0x24, 0xed, 0x4e, 0x2e, 0xcc, 0xdb, 0xf2, 0x6b, 0xc9, 0xa3, 0x31, 0x58, 0xd, 0x12, 0x5e, 0x59]);
    assert.deepEqual(commandPacket, expected, 'Invalid generateCommandPacket');
    done();
  });

  it('Generate color command', function (done) {
    const sessionKey = [0x74, 0xdc, 0xcf, 0xb6, 0x1f, 0x1e, 0xe8, 0x38, 0x25, 0x2c, 0x11, 0x25, 0x97, 0x01, 0xf4, 0xb9];
    const address = 'a4:c1:38:04:59:d6';
    const command = 0xe2;
    const data = [0x04, 0xff, 0x00, 0xff];

    commandUtils.generateRandomBytes = function () {
      return Buffer.from([0x65, 0x2a, 0x87]);
    };

    const commandPacket = commandUtils.generateCommandPacket(sessionKey, address, command, data);

    const expected = Buffer.from([0x65, 0x2a, 0x87, 0x82, 0x1e, 0x6e, 0xe3, 0xb9, 0x84, 0xf5, 0xab, 0x92, 0x78, 0xd5, 0xa6, 0xc8, 0x2c, 0xd6, 0x8a, 0xb5]);
    assert.deepEqual(commandPacket, expected, 'Invalid generateCommandPacket');
    done();
  });

  it('Checksum', function (done) {
    const key = [0x4d, 0x86, 0xd0, 0x0c, 0x24, 0x73, 0x40, 0x55, 0x2a, 0x3f, 0x44, 0x42, 0x60, 0x52, 0x7f, 0xb8];
    const nonce = [0xd6, 0x59, 0x04, 0x80, 0x60, 0xa6, 0x00, 0x00];
    const payload = [0xdc, 0x60, 0x01, 0xd6, 0x4d, 0x03, 0x7f, 0x7f, 0x64, 0xff, 0x00, 0xff, 0x00];

    const commandPacket = commandUtils.checksum(key, nonce, payload);

    const expected = Buffer.from([0xfe, 0x9b, 0xc9, 0x9d, 0xc9, 0x94, 0xe9, 0x75, 0x40, 0xb8, 0x2f, 0x1c, 0x0d, 0x33, 0xe1, 0x49]);
    assert.deepEqual(commandPacket, expected, 'Invalid checksum');
    done();
  });

  it('Crypt Payload', function (done) {
    const key = [0xdd, 0x89, 0x83, 0xd7, 0xa0, 0x36, 0x94, 0x25, 0x79, 0x77, 0x37, 0xba, 0x44, 0xd4, 0x22, 0x54];
    const nonce = [0xd6, 0x59, 0x04, 0x38, 0x01, 0xf0, 0x64, 0xd3];
    const payload = [0x00, 0x00, 0xe2, 0x60, 0x01, 0x04, 0xff, 0x00, 0xff, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00];

    const commandPacket = commandUtils.cryptPayload(key, nonce, payload);

    const expected = Buffer.from([0xac, 0x55, 0xb0, 0xfe, 0x01, 0xe4, 0x63, 0x0a, 0x5f, 0x48, 0x99, 0x4f, 0x0c, 0xf6, 0x7e]);
    assert.deepEqual(commandPacket, expected, 'Invalid checksum');
    done();
  });

  it('Decrypt packet', function (done) {
    const sessionKey = [0x45, 0x96, 0xf2, 0xb9, 0xa6, 0x31, 0x52, 0x74, 0x4f, 0xae, 0x9b, 0xd, 0xe7, 0x34, 0xca, 0x48];
    const address = 'a4:c1:38:04:59:d6';

    const commandPacket = [0x00, 0x01, 0x02, 0x03, 0x04, 0xAA, 0x07];
    commandUtils.checksum = function () {
      return Buffer.from([0xAA]);
    };

    commandUtils.decryptPacket(sessionKey, address, Buffer.from(commandPacket)).then((decryptedPacket) => {
      assert.deepEqual(decryptedPacket, Buffer.from(commandPacket), 'Invalid decryptPacket');
      done();
    }).catch((e) => {
      done('Should not have fail ' + e);
    });
  });

  it('Decrypt invalid packet', function (done) {
    const sessionKey = [0x45, 0x96, 0xf2, 0xb9, 0xa6, 0x31, 0x52, 0x74, 0x4f, 0xae, 0x9b, 0xd, 0xe7, 0x34, 0xca, 0x48];
    const address = 'a4:c1:38:04:59:d6';

    const commandPacket = [0x00, 0x01, 0x02, 0x03, 0x04, 0xAA, 0x07];
    commandUtils.checksum = function () {
      return Buffer.from([0xFF]);
    };

    commandUtils.decryptPacket(sessionKey, address, Buffer.from(commandPacket)).then(() => {
      done('Should have fail');
    }).catch((e) => {
      assert.equal('Invalid checksum from received data', e, 'Invalid error message');
      done();
    });
  });

  it('Decode invalid packet', function (done) {
    const packet = new Array(18).fill(0x00);
    commandUtils.decodePacket(Buffer.from(packet)).then(() => {
      done('Should have fail');
    }).catch((e) => {
      assert.equal('Invalid message type from received data 0', e, 'Invalid error message');
      done();
    });
  });

  it('Decode packet', function (done) {
    const packet = new Array(18).fill(0x00);
    packet[7] = 0xDC;
    packet[12] = 0x01;
    packet[14] = 0x32;
    packet[13] = 0x4B;
    packet[16] = 0x2F;
    packet[17] = 0x32;
    packet[18] = 0x9F;
    packet[15] = 0x64;
    
    commandUtils.decodePacket(Buffer.from(packet)).then((result) => {
      const expected = [];
      expected['switch'] = 1;
      expected['white_temperature'] = 50;
      expected['white_brightness'] = 75;
      expected['color'] = 3093151;
      expected['color_brightness'] = 100;
      assert.deepEqual(result, expected, 'Invalid decoded message');
      done();
    }).catch((e) => {
      done('Should not have fail ' + e);
    });
  });
});