import { assertEquals } from "@std/assert";
import { factor } from "./mod.ts";

Deno.test("factor — small numbers", () => {
  assertEquals(factor(1n), []);
  assertEquals(factor(2n), [2n]);
  assertEquals(factor(12n), [2n, 2n, 3n]);
  assertEquals(factor(60n), [2n, 2n, 3n, 5n]);
});

Deno.test("factor — semiprimes", () => {
  assertEquals(factor(8051n), [83n, 97n]);
  assertEquals(factor(15_485_867n * 15_485_863n), [15_485_863n, 15_485_867n]);
});

Deno.test("factor — product is recovered", () => {
  const inputs = [
    100n,
    360n,
    1024n,
    1001n,
    9_999_991n,
    2n ** 32n - 5n,
    10n ** 12n + 39n,
  ];
  for (const n of inputs) {
    const factors = factor(n);
    const product = factors.reduce((a, b) => a * b, 1n);
    if (product !== n) {
      throw new Error(`product ${product} != ${n} for factors ${factors}`);
    }
  }
});

Deno.test("factor — prime powers", () => {
  assertEquals(factor(2n ** 10n), new Array(10).fill(2n));
  assertEquals(factor(3n ** 7n), new Array(7).fill(3n));
});
