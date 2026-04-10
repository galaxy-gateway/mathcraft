import { assertEquals } from "@std/assert";
import { lweDecrypt, lweEncrypt, lweKeygen } from "./mod.ts";

const params = { n: 16, q: 251, m: 32 };

Deno.test("LWE — encrypt/decrypt bit 0", () => {
  const { pk, sk } = lweKeygen(params, 42n);
  const ct = lweEncrypt(pk, 0, 100n);
  assertEquals(lweDecrypt(sk, ct), 0);
});

Deno.test("LWE — encrypt/decrypt bit 1", () => {
  const { pk, sk } = lweKeygen(params, 42n);
  const ct = lweEncrypt(pk, 1, 200n);
  assertEquals(lweDecrypt(sk, ct), 1);
});

Deno.test("LWE — multiple bits across seeds", () => {
  const { pk, sk } = lweKeygen(params, 1n);
  for (let i = 0; i < 50; i++) {
    const bit = (i % 2) as 0 | 1;
    const ct = lweEncrypt(pk, bit, BigInt(1000 + i));
    assertEquals(lweDecrypt(sk, ct), bit);
  }
});

Deno.test("LWE — deterministic given same seed", () => {
  const a = lweKeygen(params, 77n);
  const b = lweKeygen(params, 77n);
  assertEquals(a.sk.s, b.sk.s);
  assertEquals(a.pk.A, b.pk.A);
  assertEquals(a.pk.b, b.pk.b);
});

Deno.test("LWE — different seeds give different keys", () => {
  const a = lweKeygen(params, 1n);
  const b = lweKeygen(params, 2n);
  const different = a.sk.s.some((v, i) => v !== b.sk.s[i]);
  assertEquals(different, true);
});
