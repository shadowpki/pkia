const crypto = require("ring-crypto").Crypto;
const { performance } = require('perf_hooks')

async function main () {
  for (let n = 2; n <= 2 ** 7; n *= 2) {
    const start = performance.now()

    // Generate Keys
    const keys = []
    const pki = []
    for (let i = 0; i <= n; i++) {
      const kp = await Crypto.Sign.keyPair()
      keys.push(kp)
      pki.push(kp.s_public_key)
    }

    // Generate Signatures
    const signatures = []
    for (let i = 0; i <= n; i++) {
      const sig = await Crypto.Ring.sign(Buffer.from('msg'), keys[i], pki)
      signatures.push(sig)
    }

    // Verify Signatures
    for (let i = 0; i <= n; i++) {
      console.log(await Crypto.Ring.verify(Buffer.from('msg'), pki, signatures[i]))
    }

    const end = performance.now()
    console.log(n + ',' + (end - start))
  }
}

main()
