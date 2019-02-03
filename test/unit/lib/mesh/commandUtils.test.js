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

  it('Encrypt from buffer', function (done) {
    const key = [0x0C, 0xAA, 0xBB, 0xF1, 0xF2, 0xF3, 0xF4, 0xF5, 0xF6, 0xF7, 0xF8];
    const toBeEncrypted = Buffer.from([0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x10, 0x11, 0x12, 0x13, 0x14, 0x15, 0x16]);
    const encryption = commandUtils.encrypt(key, toBeEncrypted);

    const expected = [0xdd, 0x4d, 0x28, 0xd5, 0x72, 0x4a, 0xc1, 0x9d, 0x69, 0x33, 0xb3, 0x93, 0xde, 0x4f, 0xf0, 0xfc];
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
});