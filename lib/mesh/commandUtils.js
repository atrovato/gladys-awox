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

    let valueArray;
    if (typeof value === 'string') {
      valueArray = aesjs.utils.utf8.toBytes(value.toString('utf-8'));
    } else {
      valueArray = Array.from(value);
    }

    valueByteArray = new Array(16).fill(0x00);

    valueArray.forEach(function (val, i) {
      valueByteArray[i] = val;
    });

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
  },
  checksum: function (key, nonce, payload) {
    const base = Buffer.alloc(16, 0x00);
    const nLength = nonce.length;
    const pLength = payload.length;

    base.fill(nonce, 0, nLength);
    base.fill(pLength, nLength, nLength + 1);

    let checksum = this.encrypt(key, base);

    for (let i = 0; i < pLength; i += 16) {
      const checkPayload = Buffer.alloc(16, 0x00);
      checkPayload.fill(payload.slice(i, i + 16), 0, 16);
      checksum = checksum.map(function (nameC, i) {
        return nameC ^ checkPayload[i];
      });
      checksum = this.encrypt(key, checksum);
    }

    return checksum;
  },
  cryptPayload: function cryptPayload(key, nonce, payload) {
    const base = new Array(16).fill(0x00);
    nonce.forEach((element, i) => {
      base[i + 1] = element;
    });

    const result = [];

    const pLength = payload.length;
    for (let i = 0; i < pLength; i += 16) {
      const encBase = this.encrypt(key, base);
      payload.forEach(function (nameC, j) {
        result.push(nameC ^ encBase[j + i]);
      });
      base[0] += 1;
    }

    return Buffer.from(result);
  },
  generateCommandPacket: function (sessionKey, address, command, data) {
    // Sequence number, just need to be different, idea from https://github.com/nkaminski/csrmesh 
    const random = this.generateRandomBytes(3);

    // Build nonce
    const a = Buffer.concat(address.split(':').reverse().map(val => {
      return Buffer.from(val, 'hex');
    }));
    const nonce = Buffer.concat([a.slice(0, 4), Buffer.from([0x01]), random]);

    // Build paylod
    const destId = 0x00;
    let payload = Buffer.alloc(15, 0x00);
    payload.fill(destId, 0, 1);
    payload.fill(destId, 1, 2);
    payload.fill(command, 2, 3);
    payload.fill(0x60, 3, 4);
    payload.fill(0x01, 4, 5);
    payload.fill(data, 5, 5 + data.length);

    // Compute checksum
    const checksum = this.checksum(sessionKey, nonce, payload);

    // Encryt payload
    payload = this.cryptPayload(sessionKey, nonce, payload);

    // Command
    return Buffer.concat([random, checksum.slice(0, 2), payload]);
  }
};