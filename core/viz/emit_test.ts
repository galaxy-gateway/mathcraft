import { assertEquals, assertThrows } from "@std/assert";
import { buildDocument, SCHEMA_VERSION } from "./emit.ts";

Deno.test("buildDocument — attaches schema and fields", () => {
  const doc = buildDocument({
    kind: "scalar",
    title: "t",
    data: { value: 42 },
  });
  assertEquals(doc.schema, SCHEMA_VERSION);
  assertEquals(doc.kind, "scalar");
  assertEquals(doc.title, "t");
  assertEquals(doc.data, { value: 42 });
});

Deno.test("buildDocument — preserves annotations and frames", () => {
  const doc = buildDocument({
    kind: "curve",
    title: "curve",
    annotations: [{ text: "peak" }],
    frames: [{ step: 0, data: {} }],
    data: { series: [] },
  });
  assertEquals(doc.annotations?.length, 1);
  assertEquals(doc.frames?.length, 1);
});

Deno.test("buildDocument — rejects missing title", () => {
  assertThrows(() =>
    buildDocument({
      kind: "scalar",
      title: "",
      data: { value: 1 },
    })
  );
});
