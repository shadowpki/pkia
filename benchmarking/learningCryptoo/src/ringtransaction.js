"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ring_crypto_1 = require("ring-crypto");
const ringSize = 20;
const ring = [];
for (let i = 0; i < ringSize - 1; i++) {
    const keyPair = await ring_crypto_1.Crypto.Sign.keyPair();
    ring.push(keyPair.s_public_key);
}
const secretKeyPair = await ring_crypto_1.Crypto.Sign.keyPair();
ring.push(secretKeyPair.s_public_key);
const msg = Buffer.from("ring sign me!");
const ringSig = await ring_crypto_1.Crypto.Ring.sign(msg, secretKeyPair, ring);
const valid = await ring_crypto_1.Crypto.Ring.verify(msg, ring, ringSig);
console.log(valid);
