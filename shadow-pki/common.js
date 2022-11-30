const trs = require('trs-js');
const node = require('./node.js');
const channel = require('./channel.js');

module.exports.run = async (configs) => {
  var stopChannel = await channel(configs[0].peers, configs[0].broadcast);

  var startPromises = [];

  configs.forEach((config) => {
    startPromises.push(node(config));
  });

  var nodes = await Promise.all(startPromises);

  var runPromises = [];

  nodes.forEach((node) => {
    runPromises.push(node.run());
  });

  var results = await Promise.all(runPromises);

  stopChannel();

  return results;
}

module.exports.init = (N, issue, timeBound = 1000) => {
  var configs = [];
  var peers = [];
  var pki = [];

  for (let i = 0; i < N; i++) {
    let port = 20000 + i;
    let kp = trs.gen_keypair();
    let pk = trs.public_to_ascii(kp.public);
    let sk = trs.private_to_ascii(kp.private);
    configs.push({
      N: N,
      id: 'NODE' + i,
      port: port,
      key: {
        public: pk,
        private: sk
      },
      issue: issue,
      broadcast: 19999,
      timeBound: timeBound
    });
    peers.push({
      id: 'NODE' + i,
      endpoint: 'http://localhost:' + port,
      key: pk
    });
    pki.push(pk);
  }

  for (let i = 0; i < N; i++) {
    configs[i].peers = peers;
    configs[i].pki = pki;
  }

  return configs;
}
