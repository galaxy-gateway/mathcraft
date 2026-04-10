import { assertEquals } from "@std/assert";
import { isProbablePrime } from "./mod.ts";

const KNOWN_PRIMES = [
  2n,
  3n,
  5n,
  7n,
  11n,
  13n,
  17n,
  19n,
  23n,
  29n,
  31n,
  97n,
  101n,
  997n,
  1_000_003n,
  1_000_033n,
  1_000_037n,
  1_000_000_007n,
  1_000_000_009n,
  2n ** 31n - 1n, // Mersenne prime
  (1n << 61n) - 1n, // Mersenne prime
];

const KNOWN_COMPOSITES = [
  4n,
  6n,
  9n,
  15n,
  21n,
  25n,
  100n,
  999n,
  1_000_001n,
  // Carmichael numbers — fool Fermat tests but not Miller–Rabin.
  561n,
  1105n,
  1729n,
  2465n,
  2821n,
  6601n,
  8911n,
  10585n,
  15841n,
  // Strong liars case: 25326001 is the smallest composite that passes
  // the test for a = 2, 3, 5.
  25326001n,
];

Deno.test("isProbablePrime — known primes", () => {
  for (const p of KNOWN_PRIMES) {
    if (!isProbablePrime(p)) throw new Error(`${p} should be prime`);
  }
});

Deno.test("isProbablePrime — known composites", () => {
  for (const c of KNOWN_COMPOSITES) {
    if (isProbablePrime(c)) throw new Error(`${c} should be composite`);
  }
});

Deno.test("isProbablePrime — edge cases", () => {
  assertEquals(isProbablePrime(0n), false);
  assertEquals(isProbablePrime(1n), false);
  assertEquals(isProbablePrime(-5n), false);
});

Deno.test("isProbablePrime — matches naive trial division for small n", () => {
  const naive = (n: bigint): boolean => {
    if (n < 2n) return false;
    for (let i = 2n; i * i <= n; i++) {
      if (n % i === 0n) return false;
    }
    return true;
  };
  for (let n = 0n; n < 1000n; n++) {
    if (isProbablePrime(n) !== naive(n)) {
      throw new Error(`mismatch at ${n}`);
    }
  }
});
