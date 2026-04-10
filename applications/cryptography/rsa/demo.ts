import { emit } from "@math/core/viz";
import { decrypt, encrypt, generateKeyPair, sign, verify } from "./mod.ts";

const { pub, priv } = generateKeyPair(64, 42n);
const plaintext = 42n;
const ciphertext = encrypt(pub, plaintext);
const recovered = decrypt(priv, ciphertext);

const hash = 999n;
const sig = sign(priv, hash);
const valid = verify(pub, hash, sig);

emit({
  kind: "scalar",
  title: "Textbook RSA — key generation, encryption, signing",
  description: "RSA composes modular exponentiation, extended Euclidean, and Miller–Rabin. " +
    "Encryption is m^e mod n; decryption is c^d mod n. Security rests on the " +
    "hardness of factoring n = p·q.",
  data: {
    value: {
      keySize: "~128 bits (2×64-bit primes)",
      publicKey: { n: pub.n.toString(), e: pub.e.toString() },
      encryption: {
        plaintext: plaintext.toString(),
        ciphertext: ciphertext.toString(),
        recovered: recovered.toString(),
        correct: recovered === plaintext,
      },
      signature: {
        hash: hash.toString(),
        signature: sig.toString(),
        valid,
      },
    },
  },
});
