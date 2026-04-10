import { assertEquals } from "@std/assert";
import { decrypt, encrypt, generateKeyPair, sign, verify } from "./mod.ts";

Deno.test("RSA — encrypt/decrypt round-trip", () => {
  const { pub, priv } = generateKeyPair(64, 42n);
  const plaintext = 12345678n;
  const ct = encrypt(pub, plaintext);
  assertEquals(decrypt(priv, ct), plaintext);
});

Deno.test("RSA — encrypt/decrypt many values", () => {
  const { pub, priv } = generateKeyPair(64, 1n);
  const values = [0n, 1n, 2n, 42n, 9999n, pub.n - 1n];
  for (const m of values) {
    assertEquals(decrypt(priv, encrypt(pub, m)), m);
  }
});

Deno.test("RSA — deterministic key generation", () => {
  const a = generateKeyPair(64, 42n);
  const b = generateKeyPair(64, 42n);
  assertEquals(a.pub.n, b.pub.n);
  assertEquals(a.priv.d, b.priv.d);
});

Deno.test("RSA — sign/verify", () => {
  const { pub, priv } = generateKeyPair(64, 77n);
  const hash = 123456n;
  const sig = sign(priv, hash);
  assertEquals(verify(pub, hash, sig), true);
  assertEquals(verify(pub, hash + 1n, sig), false);
});

Deno.test("RSA — larger key size", () => {
  const { pub, priv } = generateKeyPair(128, 99n);
  const m = 9999999999999n;
  assertEquals(decrypt(priv, encrypt(pub, m)), m);
});
