const trs = require('trs-js')
const { performance } = require('perf_hooks')

for (let n = 2; n <= 2 ** 7; n *= 2) {
  const start = performance.now()

  // Generate Keys
  const keys = []
  const pki = []
  for (let i = 0; i <= n; i++) {
    const kp = trs.gen_keypair()
    const pk = kp.public
    const sk = kp.private
    keys.push({ pk: pk, sk: sk })
    pki.push(trs.public_to_ascii(pk))
  }

  // Generate Signatures
  const signatures = []
  for (let i = 0; i <= n; i++) {
    const sig = trs.generate_signature('msg', pki, 'test', keys[i].sk)
    signatures.push(sig)
  }

  // Verify Signatures
  for (let i = 0; i <= n; i++) {
    trs.verify_signature('msg', pki, 'test', signatures[i])
  }

  const end = performance.now()
  console.log(n + ',' + (end - start))
}
