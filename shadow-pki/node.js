const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const openpgp = require('openpgp');
const trs = require('trs-js');
openpgp.config.show_version = false;
openpgp.config.show_comment = false;

console.debug = () => {}

module.exports = (config) => {
  return new Promise((resolve, reject) => {
    const app = express();

    app.use(bodyParser.json());

    var sspks = [];
    var sspkss = [];

    function execute() {
      return new Promise(async (resolve, reject) => {
        const { privateKeyArmored, publicKeyArmored } = await openpgp.generateKey({});
        console.debug(`${config.id} - STEP 1 (generated anonymous key pair)`);

        const sk = trs.ascii_to_private(config.key.private);
        const sig = trs.generate_signature(publicKeyArmored, config.pki, config.issue, sk);
        const sig_ascii = trs.signature_to_ascii(sig);
        console.debug(`${config.id} - STEP 2 (generated traceable ring signature)`);

        axios.post('http://localhost:' + config.broadcast + '/sspk', {spk: publicKeyArmored, trs: sig_ascii});
        console.debug(`${config.id} - STEP 3 (broadcast traceable ring signature)`);

        await new Promise(resolve => setTimeout(resolve, config.timeBound));
        console.debug(`${config.id} - STEP 3a (wait for network time bound)`);

        axios.post('http://localhost:' + config.broadcast + '/sspks', sspks);
        await new Promise(resolve => setTimeout(resolve, config.timeBound));
        console.debug(`${config.id} - STEP 4 (broadcast received ring signatures)`);

        var sspksu = new Set();
        var pki = new Set();
        sspkss.forEach((set) => {
          set.forEach((sspk) => {
            if (!pki.has(sspk.spk)) {
              pki.add(sspk.spk);
              sspksu.add(sspk);
            }
          });
        });
        console.debug(`${config.id} - STEP 5 (compute union of ring signature sets)`);

        sspksu.forEach((sspk) => {
          sspk.trs = trs.ascii_to_signature(sspk.trs)
          if (!trs.verify_signature(sspk.spk, config.pki, config.issue, sspk.trs)) {
            sspksu.remove(sspk);
            pki.remove(sspk.spk);
          }
        });
        console.debug(`${config.id} - STEP 6 (verify traceable ring signatures)`);

        sspksu.forEach((sspka) => {
          sspksu.forEach((sspkb) => {
            if (sspka != sspkb) {
              if (trs.trace_signature(sspka.spk, sspka.trs, sspkb.spk, sspkb.trs, config.pki, config.issue) != "indep") {
                pki.remove(sspka.spk);
                pki.remove(sspkb.spk);
              }
            }
          });
        });
        console.debug(`${config.id} - STEP 7 (trace traceable ring signatures)`);

        server.close();
        console.debug(`${config.id} execution terminated successfully`);
        resolve({
          id: config.id,
          result: pki,
          represented: pki.has(publicKeyArmored)
        });
      });
    }

    app.post('/sspk', (req, res) => {
      console.debug(`${config.id} - got sspk`);
      res.sendStatus(200);
      sspks.push(req.body);
    });

    app.post('/sspks', (req, res) => {
      console.debug(`${config.id} - got sspks`);
      res.sendStatus(200);
      sspkss.push(req.body);
    });

    var server = app.listen(config.port, () => {
      console.debug(`${config.id} - listening at http://localhost:${config.port}`);
      resolve({
        id: config.id,
        app: app,
        run: execute
      });
    });
  });
}
