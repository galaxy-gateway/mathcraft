import { emit } from "@math/core/viz";
import { persistentH0 } from "./mod.ts";

// Generate a noisy annulus (ring) — persistent H₀ should show 1 long-lived
// component and many short-lived ones.
const points: Array<[number, number]> = [];
for (let i = 0; i < 30; i++) {
  const angle = (2 * Math.PI * i) / 30;
  const r = 5 + 0.3 * Math.sin(i * 7); // slight noise
  points.push([r * Math.cos(angle), r * Math.sin(angle)]);
}

const bars = persistentH0(points);
const finite = bars.filter((b) => b.death < Infinity);
const persistence = finite.map((b) => b.death - b.birth);
persistence.sort((a, b) => b - a);

emit({
  kind: "point-cloud",
  title: "Persistent H₀ of a noisy annulus",
  description: `${points.length} points on a noisy ring. H₀ persistence barcode has ` +
    `${bars.length} bars. The most persistent finite bar (persistence = ` +
    `${persistence[0].toFixed(3)}) represents the scale at which the ring ` +
    `becomes connected.`,
  annotations: [
    { text: `Total bars: ${bars.length}` },
    { text: `Max finite persistence: ${persistence[0].toFixed(3)}` },
  ],
  data: {
    points,
    labels: points.map((_, i) => i),
  },
});
