const lrs = require('lrs')
const { performance } = require('perf_hooks')

for (let n = 2; n <= 2 ** 7; n *= 2) {
  const start = performance.now()

  // Generate Keys
  const keys = []
  const pki = []
  for (let i = 0; i <= n; i++) {
    const kp = lrs.gen()
    keys.push(kp)
    pki.push(kp.publicKey)
  }

  // Generate Signatures
  const signatures = []
  for (let i = 0; i <= n; i++) {
    const sig = lrs.sign(pki, keys[i], 'msg')
    signatures.push(sig)
  }

  // Verify Signatures
  for (let i = 0; i <= n; i++) {
    lrs.verify(pki, signatures[i], 'msg')
  }

  const end = performance.now()
  console.log(n + ',' + (end - start))
}
