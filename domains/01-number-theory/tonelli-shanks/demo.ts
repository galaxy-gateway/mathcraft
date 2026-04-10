import { emit } from "@math/core/viz";
import { sqrtMod } from "./mod.ts";

const p = 1_000_000_009n;
const samples = [2n, 3n, 5n, 7n, 11n, 42n, 123456789n];

const results = samples.map((a) => {
  const r = sqrtMod(a, p);
  return {
    a: a.toString(),
    root: r === null ? "non-residue" : r.toString(),
    verify: r === null ? "—" : `${r}² ≡ ${(r * r) % p} (mod p)`,
  };
});

emit({
  kind: "scalar",
  title: `Square roots mod ${p}`,
  description: "Tonelli–Shanks finds x with x² ≡ a (mod p) for an odd prime p, or " +
    "reports that a is a non-residue. For p ≡ 3 (mod 4) there's a closed " +
    "form; for p ≡ 1 (mod 4) the full algorithm is needed.",
  data: { value: { prime: p.toString(), samples: results } },
});
