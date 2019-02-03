const crypto = require('crypto');
const aesjs = require('aes-js');

module.exports = {
  generateRandomBytes: function (length) {
    return crypto.randomBytes(length);
  },
  generatePairCommand: function (meshName, meshPassword, sessionRandom) {
    const namePassByteArray = this.nameAndPasswordEncrypt(meshName, meshPassword);
    const packet = [0x0C];
    sessionRandom.forEach((element, i) => {
      packet[i + 1] = element;
    });

    const encrypted = this.encrypt(sessionRandom, namePassByteArray);

    for (let i = 0; i < 8; i++) {
      packet.push(encrypted[i]);
    }

    return packet;
  },
  generateSessionKey: function (meshName, meshPassword, sessionRandom, responseRandom) {
    const random = Buffer.concat([sessionRandom, responseRandom.slice(1, 9)]);
    const namePassByteArray = this.nameAndPasswordEncrypt(meshName, meshPassword);
    return this.encrypt(namePassByteArray, random);
  },
  encrypt: function (key, value) {
    const sessionRandomECB = new Array(16).fill(0x00);
    let valueByteArray;

    key.forEach((element, i) => {
      sessionRandomECB[i] = element;
    });

    if (!Buffer.isBuffer(value)) {
      const valueArray = Array.isArray(value) ? value : aesjs.utils.utf8.toBytes(value.toString('utf-8'));
      valueByteArray = new Array(16).fill(0x00);

      valueArray.forEach(function (val, i) {
        valueByteArray[i] = val;
      });
    } else {
      valueByteArray = value;
    }

    const aesEcb = new aesjs.ModeOfOperation.ecb(sessionRandomECB.reverse());
    const result = aesEcb.encrypt(valueByteArray.reverse());
    return result.reverse();
  },
  nameAndPasswordEncrypt: function (meshName, meshPassword) {
    const nameByteArray = aesjs.utils.utf8.toBytes(meshName);
    const passByteArray = aesjs.utils.utf8.toBytes(meshPassword);
    const namePassByteArray = new Array(16).fill(0x00);

    nameByteArray.forEach(function (nameC, i) {
      namePassByteArray[i] = nameC ^ passByteArray[i];
    });

    return namePassByteArray;
  }
};