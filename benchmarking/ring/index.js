const Hasher = require('./hasher.js');
const PrivateKey = require('./private-key.js');
const PublicKey = require('./public-key.js');
const Prng = require('./prng.js');
const Signature = require('./signature.js');
const { performance } = require('perf_hooks')

const prng = new Prng.Prng();
const hasher = new Hasher.Hasher();
const key = new PrivateKey.PrivateKey(prng.random,hasher);

for (let n = 2; n <= 2 ** 7; n *= 2) {
  const start = performance.now()

  // Generate Keys
  const keys = []
  const pki = []
  for (let i = 0; i <= n; i++) {
    const kp = new PrivateKey.PrivateKey(prng.random,hasher)
    keys.push(kp)
    pki.push(kp.public_key)
  }

  // Generate Signatures
  const signatures = []
  for (let i = 0; i <= n; i++) {
    const sig = keys[i].sign('msg', pki)
    signatures.push(sig)
  }

  // Verify Signatures
  for (let i = 0; i <= n; i++) {
    signatures[i].verify('msg',signatures[i].public_keys)
  }

  const end = performance.now()
  console.log(n + ',' + (end - start))
}
