/**
 * Learning With Errors (LWE) — toy encryption scheme.
 *
 * In LWE, a secret vector `s` is hidden in noisy inner products
 * `b = A·s + e (mod q)`, where `e` is a small error. Without knowing
 * `s`, recovering `s` from `(A, b)` is believed to be as hard as solving
 * worst-case lattice problems.
 *
 * This is a **toy** implementation for education. Do not use for real crypto.
 *
 * @example
 * ```ts
 * import { lweKeygen, lweEncrypt, lweDecrypt } from "./mod.ts";
 * const { pk, sk } = lweKeygen({ n: 16, q: 251, m: 32 }, 42n);
 * const ct = lweEncrypt(pk, 1, 42n);
 * lweDecrypt(sk, ct); // 1
 * ```
 */

import { pcg } from "@math/core/random";
import { mod } from "@math/core/numeric";

export interface LweParams {
  /** Dimension of the secret. */
  n: number;
  /** Modulus. Should be prime for simplicity. */
  q: number;
  /** Number of samples (rows of A). Should be ≥ n. */
  m: number;
}

export interface LwePublicKey {
  params: LweParams;
  A: number[][];
  b: number[];
}

export interface LweSecretKey {
  params: LweParams;
  s: number[];
}

export interface LweCiphertext {
  params: LweParams;
  u: number[];
  v: number;
}

/** Sample a small error in {-1, 0, 1}. */
function smallError(rng: ReturnType<typeof pcg>): number {
  return rng.nextInt(-1, 1);
}

/**
 * Generate an LWE key pair.
 *
 * @param params LWE parameters
 * @param seed Deterministic seed for the PRNG
 */
export function lweKeygen(
  params: LweParams,
  seed: bigint,
): { pk: LwePublicKey; sk: LweSecretKey } {
  const { n, q, m } = params;
  const rng = pcg(seed);

  // Secret: uniform random mod q.
  const s: number[] = Array.from({ length: n }, () => rng.nextInt(0, q - 1));

  // A: uniform random m × n matrix mod q.
  const A: number[][] = Array.from(
    { length: m },
    () => Array.from({ length: n }, () => rng.nextInt(0, q - 1)),
  );

  // b = A·s + e (mod q).
  const b: number[] = A.map((row) => {
    const dot = row.reduce((sum, aij, j) => sum + aij * s[j], 0);
    const e = smallError(rng);
    return Number(mod(BigInt(dot + e), BigInt(q)));
  });

  return { pk: { params, A, b }, sk: { params, s } };
}

/**
 * Encrypt a single bit (0 or 1).
 *
 * Picks a random subset of rows of (A, b) and sums them, then adds
 * `bit · ⌊q/2⌋` to the scalar component.
 */
export function lweEncrypt(
  pk: LwePublicKey,
  bit: 0 | 1,
  seed: bigint,
): LweCiphertext {
  const { params, A, b } = pk;
  const { n, q, m } = params;
  const rng = pcg(seed);

  // Random binary vector r ∈ {0, 1}^m.
  const r: number[] = Array.from({ length: m }, () => rng.nextInt(0, 1));

  // u = Aᵀ · r (mod q) — n-dimensional vector.
  const u: number[] = new Array(n).fill(0);
  for (let j = 0; j < n; j++) {
    let sum = 0;
    for (let i = 0; i < m; i++) {
      if (r[i]) sum += A[i][j];
    }
    u[j] = Number(mod(BigInt(sum), BigInt(q)));
  }

  // v = bᵀ · r + bit · ⌊q/2⌋ (mod q).
  let vSum = 0;
  for (let i = 0; i < m; i++) {
    if (r[i]) vSum += b[i];
  }
  vSum += bit * Math.floor(q / 2);
  const v = Number(mod(BigInt(vSum), BigInt(q)));

  return { params, u, v };
}

/**
 * Decrypt a ciphertext to recover the bit.
 *
 * Computes `v - ⟨s, u⟩ mod q` and rounds: if closer to 0 → bit=0,
 * if closer to ⌊q/2⌋ → bit=1.
 */
export function lweDecrypt(sk: LweSecretKey, ct: LweCiphertext): 0 | 1 {
  const { s, params } = sk;
  const { u, v } = ct;
  const { q } = params;

  let dot = 0;
  for (let j = 0; j < s.length; j++) dot += s[j] * u[j];
  const diff = Number(mod(BigInt(v - dot), BigInt(q)));

  // Round: closer to 0 or to q/2?
  const half = Math.floor(q / 2);
  const dist0 = Math.min(diff, q - diff);
  const distHalf = Math.abs(diff - half);
  return dist0 <= distHalf ? 0 : 1;
}
