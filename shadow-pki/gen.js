const openpgp = require('openpgp');
const fs = require('fs');

const { v4: uuidv4 } = require('uuid');

openpgp.config.show_version = false;
openpgp.config.show_comment = false;

const out = 'PPKI(O)/';
const N = 3;

let PKI = [];

(async () => {
  for (let i = 0; i < N; i++) {
    const { privateKeyArmored, publicKeyArmored } = await openpgp.generateKey({});

    PKI.push({
      ids: [uuidv4()],
      pks: [publicKeyArmored]
    });

    fs.writeFileSync('./' + out + i + '.key', privateKeyArmored);
  }

  fs.writeFileSync('./' + out + 'pki.json', JSON.stringify(PKI));
})();
