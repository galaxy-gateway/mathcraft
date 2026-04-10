import { emit } from "@math/core/viz";
import { lweDecrypt, lweEncrypt, lweKeygen } from "./mod.ts";

const params = { n: 16, q: 251, m: 32 };
const { pk, sk } = lweKeygen(params, 42n);

const bits = [0, 1, 0, 1, 1, 0, 1, 0] as const;
const results = bits.map((bit, i) => {
  const ct = lweEncrypt(pk, bit, BigInt(100 + i));
  const recovered = lweDecrypt(sk, ct);
  return { sent: bit, recovered, correct: bit === recovered };
});

emit({
  kind: "scalar",
  title: "LWE toy encryption — 8-bit message",
  description: "Learning With Errors hides a secret in noisy inner products mod q. " +
    "The security of lattice-based post-quantum cryptography (Kyber, Dilithium) " +
    "rests on the hardness of LWE. This toy scheme encrypts bits one at a time.",
  data: {
    value: {
      params,
      secretDimension: params.n,
      modulus: params.q,
      samples: params.m,
      message: bits,
      results,
    },
  },
});
