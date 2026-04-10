/**
 * RSA encryption — textbook implementation.
 *
 * Composes number-theory primitives: modular exponentiation for encrypt/decrypt,
 * extended Euclidean for the private key, Miller–Rabin for prime generation.
 *
 * **Educational only.** Textbook RSA has no padding, which makes it
 * vulnerable to many attacks. Real implementations use OAEP (PKCS #1 v2).
 *
 * @example
 * ```ts
 * import { generateKeyPair, encrypt, decrypt } from "./mod.ts";
 * const { pub, priv } = generateKeyPair(512, 42n);
 * const ct = encrypt(pub, 42n);
 * decrypt(priv, ct); // 42n
 * ```
 */

import { mod } from "@math/core/numeric";
import { modPow } from "../../../domains/01-number-theory/modular-exponentiation/mod.ts";
import { modInverse } from "../../../domains/01-number-theory/extended-euclidean/mod.ts";
import { isProbablePrime } from "../../../domains/01-number-theory/miller-rabin/mod.ts";
import { pcg } from "@math/core/random";
import { bitLength } from "@math/core/numeric";

export interface RsaPublicKey {
  n: bigint;
  e: bigint;
}

export interface RsaPrivateKey {
  n: bigint;
  d: bigint;
}

/**
 * Generate an RSA key pair.
 *
 * @param bits Approximate bit length of each prime (n will be ~2×bits).
 * @param seed PRNG seed for deterministic generation.
 */
export function generateKeyPair(
  bits: number,
  seed: bigint,
): { pub: RsaPublicKey; priv: RsaPrivateKey } {
  const rng = pcg(seed);
  const e = 65537n;

  const p = randomPrime(bits, rng);
  let q = randomPrime(bits, rng);
  while (q === p) q = randomPrime(bits, rng);

  const n = p * q;
  const phi = (p - 1n) * (q - 1n);
  const d = modInverse(e, phi);

  return {
    pub: { n, e },
    priv: { n, d },
  };
}

/** Encrypt a plaintext `m` (as a BigInt < n). */
export function encrypt(pub: RsaPublicKey, m: bigint): bigint {
  if (m < 0n || m >= pub.n) {
    throw new RangeError("plaintext must be in [0, n)");
  }
  return modPow(m, pub.e, pub.n);
}

/** Decrypt a ciphertext `c`. */
export function decrypt(priv: RsaPrivateKey, c: bigint): bigint {
  return modPow(c, priv.d, priv.n);
}

/** Generate a random prime of approximately `bits` bit length. */
function randomPrime(
  bits: number,
  rng: ReturnType<typeof pcg>,
): bigint {
  while (true) {
    let n = 1n; // ensure high bit is set
    for (let i = 1; i < bits; i++) {
      n = (n << 1n) | BigInt(rng.nextInt(0, 1));
    }
    n |= 1n; // ensure odd
    if (bitLength(n) >= bits && isProbablePrime(n)) return n;
  }
}

/**
 * RSA digital signature (textbook).
 *
 * `sign(priv, hash)` = `hash^d mod n`.
 * `verify(pub, hash, sig)` = `sig^e mod n === hash`.
 */
export function sign(priv: RsaPrivateKey, hash: bigint): bigint {
  return modPow(mod(hash, priv.n), priv.d, priv.n);
}

export function verify(pub: RsaPublicKey, hash: bigint, sig: bigint): boolean {
  return modPow(sig, pub.e, pub.n) === mod(hash, pub.n);
}
